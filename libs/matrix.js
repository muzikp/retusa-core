"use strict";

var {NumericVector, StringVector, BooleanVector, TimeVector, Vector} = require("./vector");

require("./extensions");
const registry = new WeakMap();
let defaultEventHandlers = [
    {eventName: "matrix.vector.added", filter: null, on: true, handler: function(event){
        
    }},
    {eventName: "matrix.vector.removed", filter: null, on: true, handler: function(event){
        
    }},
    {eventName: "matrix.order.changed", filter: null, on: true, handler: function(event){
        
    }}
];

function setRegistryProperty(parent, key, value) {    
    if(!registry.get(parent)) registry.set(parent, {});
    registry.get(parent)[key] = value;    
}

function getRegistryProperty(parent, key = null) {    
    return key ? registry.get(parent)[key] : registry.get(parent);
}


// #region MATRIX

Array.prototype.matrify = function() {
    var M = new Matrix();
    for(var i = 0; i < this.length; i++) {
        M.push(!this[i]?.isVector ? this[i].vectorify() : this[i])
    }
    return M;
}

class Matrix extends Array {
    /**
     * Initializes a new instance of the Matrix class.
     */
    constructor(){        
        super();
        registry.set(this, {id: String.fillRnd(16)});        
        setRegistryProperty(this, "eventHandlers", defaultEventHandlers);
        this.trigger("matrix.created");
        this.push(...arguments);
    }
    id() {
        return getRegistryProperty(this, "id");
    }
    /**
     * Gets or sets the name of this matrix. If the argument 'value' is empty, it returns the name of this matrix (if set before). Otherwise the name of the matrix is set and the matrix itself is returned.
     * So far, there can be only one name for all possible matrices as WeakMap seems to not support array keys (matrix is an array in fact).
     * @param {string | empty} value Optional: name of the matrix.
     * @returns Either name or the matrix itself.
     */
    name(value, alwaysReturnSelf = false){
        const old = getRegistryProperty(this, "name");
        if(value !== undefined) {
            setRegistryProperty(this, "name", value);
            if(old !== "value") this.trigger("matrix.name.changed", {old: old, new: value});
            return this;
        } else {
            if(getRegistryProperty(this, "name") !== undefined) return getRegistryProperty(this, "name");
            else if(alwaysReturnSelf) return this;
            else return null;
        }
    }
    push() {
        const old = this.length;
        for(let a of [...arguments].filter(v => v)) {
            if(a?.isVector) {
                if(this.find(v => v.id() === a.id())) {
                    console.warn(`Vector ${a.name() || a.id()} is already a member of the matrix.`);
                } else super.push.call(this,a);
            }
            else if(Array.isArray(a)) {
                super.push.call(this, a.vectorify());
            }
            else {
                console.error(a);
                throw this.$("91ECQmAF", {type: typeof a});                
            }
        };
        if(this.length > old) this.trigger("matrix.value.added", {index: old, length: this.length - old});
        return this.length;
    }
    map(callbackFn, thisArg = this) {
        if(!callbackFn) return this;
        var isMatrix = true;
        var _m = [];
        var i = 0;
        for(let v of thisArg || this) {
            var e = callbackFn(v, i, thisArg);
            i++;
            if(!e?.isVector) isMatrix = false;
            _m.push(e);
        };
        if(isMatrix) {
            _m = new Matrix(..._m).name(this.name());
        }
        return _m;
    }    
    /**
     * Similar to a pivot table in Excel without aggregation. Converts a matrix of two vectors to a new matrix where the new factors are named after the unique values from the original factor. Nov vectors are filled with values that match the row filter in the original matrix.
     * @param {Vector identifier} target 
     * @param {Vector identifier} factor 
     * @param {Array} selectedKeys Optional. If you want to pivot only selected values from the factor vector, enlist them in the selectedKeys argument.
     * @returns {Matrix}
     */
    pivot(target, factor, selectedKeys = []) {
        target = this.item(target);
        factor = this.item(factor);
        const selection = this.select(target, factor);
        const pivot = new Matrix();        
        for(let key of factor.distinct().intersection(selectedKeys)) {
            var v = new target.constructor(...selection.filter(factor, (v) => v === key)[0]).name(key).label(factor.format(key)).formatter(target.formatter(), true);
            pivot.push(new target.constructor(...selection.filter(factor, (v) => v === key)[0]).name(key).label(factor.format(key)).formatter(target.formatter(), true));

        }
        return pivot;
    }
    clone(flush = false) {
        return new Matrix(...new Array(...this).map(v => v.clone())).name(this.name(), true);
    }
    /**
     * Returns a vector according to the specified identifier. The identifier argument is extremely flexible, it can be a number (the order of the vector), text (either the name or the id of the vector), an instance of the vector, or a filter function with which the vector is searched in the matrix.
     * @param {number | string | Vector | function} identifier 
     * @returns {Vector} Returns a Vector instance or (if not found) null.
     */
    item(identifier) {
        if(!identifier && identifier !== 0) return null;
        else if(!isNaN(identifier)) return this[Number(identifier)];
        else if(typeof identifier == "string") return this.find(v => (v.id() == identifier || v.name() == identifier));
        else if(identifier?.isVector) return this.find(v => v.id() === identifier.id());        
        else if(identifier.constructor?.name == "Function") return this.find(identifier);
        else return null;
    }
    /* removes a single vector from the matrix */
    remove(identifier) {        
        var id = this.item(identifier).id();
        return this.filter(e => e.id() != id);
        var clone = this.clone();        
        delete clone[index];
        return new Matrix(...clone);
    }
    select(...identifiers) {
        var clone = new Matrix().name(this.name(), true);
        for(let i of identifiers) {
            var v = this.item(i);
            if(v) clone.push(v);
        }
        return clone;
    }
    slice(from = 0, to = Infinity) {
        var M = new Matrix();
        for(let a = from < 0 ? 0 : from; a < (to >= this.length ? this.length : to); a++)
        {
            M.push(this[a]);

        };
        return M;
    }
    /** 
     * Attention! This method significantly extends the base method of the Array parent class. The method shows different behavior with respect to the number and type of arguments. If only one argument is given, the method behaves according to the following types:

       1) function: standard filtering as in Array
       2) Array: is taken as an array of row indices to be returned

    In the event that multiple filters of different vectors are to be considered at the same time, the arguments are given in a row as 1) vector identifier and 2) vector filter function. In this way, it is possible to sort the required number of identifier/function pairs one after the other, e.g. <Matrix>.filter(2, (v,i,arr) => v > 30, "B", (v,i,arr) = > in == 5).
     * @return {this | null} A filtered matrix.
    */
    filter() {
        if([...arguments].length === 0) return this;
        else if([...arguments].length === 1) {
            var arg = [...arguments][0];
            if(typeof arg == "function") return new Matrix(...new Array(...this).filter(arg));
            /* filters rows by indexes */
            else if(Array.isArray(arg)) {
                var target = this.clone().flush();
                for(var i = 0; i < arg.length; i++) {
                    target.appendRow(...this.row(arg[i]))
                }
                return target;
            }
            else return null;
        }
        else {
            var groups = [];
            if([...arguments].length % 2 !== 0) throw new Error("Odd number of arguments!!")
            for(var i = 0; i < [...arguments].length; i +=2) {
                groups.push({
                    v: this.item([...arguments][i]),
                    f: [...arguments][i + 1]
                });
            };
            var target = this.clone().flush();
            for(var r = 0; r < this.maxRows(); r++) {   
                if(groups.map(g => g.f(g.v[r], r, g.v)).filter(g => g).length === groups.length) {
                    target.appendRow(...this.row(r))
                }
            }
            return target;
        }
    }
    filterByIndex(...indexes) {
        var _ = new Matrix();
        for(let v of this) {
            _.push(v.filterByIndex(...indexes));
        }
        return _;
    }
    /** Removes rows with any null value across all values in the row. */
    removeEmpty() {
        var fs = new Array(...this).map((v,i) => [i, (v) => v !== null]).flat(Infinity);
        return this.filter(...fs);
    }
    /**
     * Returns an array of values across the indexed row.
     * @param {number} index Row index.
     * @returns {Array} An array of the row values.
     */
    row(index) {
        if(index > this.maxRows() - 1) return null;
        return new Array(...this).map(v => v[index] || null);
    }
    rows(asObject = false) {
        var rows = [];
        for(var r = 0; r < this.maxRows(); r++)
        {
            var row = [];
            for(var c = 0; c < this.length; c++ ) {
                row.push(this[c][r]);
            }
            rows.push(row);
        }
        return rows;
    }
    appendRow(...values) {
        for(var i = 0; i < values.length; i++) {
            (this[i] || []).push(values[i])
        }
        return this;
    }
    /**
     * Removes the vector values but leaves the matrix structure (in terms of vector types etc.) intact.
     * @returns {this}
     */
    flush() {
        for(var v of this) {
            v.flush();
        };
        return this;
    }
    /**
     * Returns the length of the vector with the largest number of elements.
     * @returns {number}
     */
    maxRows() {
        return Math.max(...new Array(...this).map(v => v.length));
    }
    minRows() {
        return Math.min(...new Array(...this).map(v => v.length));
    }
    /**
     * Randomly filters N of cases from the variable values.
     * @param {number} size If the argument is less than 1, it is considered the percentage of cases to be selected from among the values. If greater than or equal to 1, the argument is treated as the absolute number of cases to be selected.
     */
    sample(size) {
        var indexes = (size < 1 ? Math.getRandomIndexes(this.maxRows(), Math.round(size * this.maxRows())) : Math.getRandomIndexes(this.maxRows(), size > this.maxRows() ? this.maxRows() : Math.round(size))).sort();
        return this.filter(indexes);
    }
    analyze(method) {
        return new MatrixAnalysis(method, this);
    }
    serialize(stringify = false, config = {beautify: false}) {
        var _m = {
            id: this.id(),
            name: this.name(),
            vectors: []
        };
        for(var v of this) {
            _m.vectors.push(v.serialize());
        };
        if(stringify) _m = JSON.stringify(_m, config.beautify ? "\t" : null, config.beautify ? "\t" : null);
        return _m;
    }
    orderBy(identifier, direction) {
        var schema = direction == "asc" ? this.item(identifier)?.ascIndex() : direction == "desc" ? this.item(identifier)?.descIndex() : null;
        if(schema) {
            return this._with()
        }
    }
    _with() {
        return this.empty()._push(...arguments);
    }
    async trigger(eventName, data) {              
        this.eventHandler ? this.eventHandler({name: eventName, data: data || {}, who: this}) : false;
    }
    static deserialize(source) {
        if(typeof source != "object") {
            try {
                source = JSON.parse(source);
            } catch(e) {
                throw this.$("Rj0axQCr");                
            }
        }
        var M = new Matrix().name(source.name);
        source.vectors.forEach(v => M.push(Vector.deserialize(v)));
        return M;        
        
    }    
    /**
     * 
     * @returns {Array} Return an array of this matrix's vectors descriptions (index, name, label, length, formatter).
     * 
     */
    info() {
        return this.map((v,i) => ({index: i, name: v.name(), label: v.label(), length: v.length, formatter: v.formatter()}));
    }
}

Matrix.prototype.isMatrix = true;

module.exports = {
    Matrix: Matrix    
};