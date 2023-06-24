"use strict";

const {Array, Math, String, Function} = require("./extensions");
const meta = ["name","label","formatter"];
const registry = new WeakMap();
let defaultEventHandlers = [
    {eventName: "vector.value.added", filter: null, on: true, handler: function(event){
        
    }},
    {eventName: "vector.value.changed", filter: null, on: true, handler: function(event){
        
    }},
    {eventName: "vector.value.removed", filter: null, on: true, handler: function(event){
        
    }},
    {eventName: "vector.name.changed", filter: null, on: true, handler: function(event){
        
    }},
    {eventName: "vector.label.changed", filter: null, on: true, handler: function(event){
        
    }},
    {eventName: "vector.created", filter: null, on: true, handler: function(event){
        
    }},
    {eventName: "vector.sample.init", filter: null, on: true, handler: function(event){
        
    }},
    {eventName: "vector.sample.end", filter: null, on: true, handler: function(event){
        
    }},
    {eventName: "vector.order.changed", filter: null, on: true, handler: function(event){
        
    }}
];

function setRegistryProperty(parent, key, value) {    
    if(!registry.get(parent)) registry.set(parent, {});
    registry.get(parent)[key] = value;    
}

function getRegistryProperty(parent, key = null) {    
    return key ? registry.get(parent)[key] : registry.get(parent);
}

class Vector extends Array {
    constructor() {
        super();        
        registry.set(this, {id: String.fillRnd(16)});        
        setRegistryProperty(this, "eventHandlers", defaultEventHandlers);
        this.trigger("vector.created");
        if([...arguments].length > 0) this.push(...arguments);        
    }    
    //#region METADATA
    /**
     * Gets or sets the name of this vector. If the argument 'value' is empty, it returns the name of this vector (if set before). Otherwise the name of the vector is set and the vector itself is returned.
     * @param {string} value Optional: name of the vector.
     * @param {boolean} alwaysRetunSelf Default false. If set to true, will return the vector itself even if the name is blank/empty.
     * @returns {Vector | String} Either the name or the vector itself.
     */
    name(value, alwaysRetunSelf){        
        if(value) {          
            const old = this.name()  ;
            setRegistryProperty(this, "name", value);            
            if(value !== old) this.trigger("vector.name.changed", {old: old, new: value})
            return this;
        } else {
            if(alwaysRetunSelf) return this;
            else return registry.get(this).name;
        }
    }
    /**
     * Gets or sets the label for this vector. If the argument 'value' is empty, it returns the label of this vector (if set before). Otherwise the label of the vector is set and the vector itself is returned.
     * @param {string} value Optional: name of the vector.
     * @param {boolean} alwaysRetunSelf Default false. If set to true, will return the vector itself even if the label is blank/empty.
     * @returns {Vector | String} Either the label or the vector itself.
     */
    label(value, alwaysRetunSelf){
        if(value) {
            const old = getRegistryProperty(this, "label");
            setRegistryProperty(this, "label", value);
            if(value !== old) this.trigger("vector.label.changed", {old: old, new: value})
            return this;
        } else {
            if(alwaysRetunSelf) return this;
            else return registry.get(this).label || registry.get(this).name;
        }
    }
    /**
     * Gets or sets the formatter for this vector. If the argument 'value' is empty, it returns the formatter of this vector (if set before). Otherwise the formatter of the vector is set and the vector itself is returned.
     * @param {Function | Object} value Optional: either a function of an object.
     * @param {boolean} alwaysRetunSelf Default false. If set to true, will return the vector itself even if the label is blank/empty.
     * @returns {Vector | String} Either the formatter or the vector itself.
     */
    formatter(value, alwaysRetunSelf) {
        if(value) {
            const old = getRegistryProperty(this, "formatter");
            setRegistryProperty(this, "formatter", value);
            if(value !== old) this.trigger("vector.formatter.changed", {old: old, new: value})
            return this;
        } else {
            if(alwaysRetunSelf) return this;
            else return registry.get(this).formatter;
        }
    }
    /**
     * Copies the vector metadata (name, label etc.) from a source vector to this vector.
     * @param {Vector} source The vector from which to copy the vector metadata.
     * @returns Returns the vector itself.
     */
    getMeta(source, includeId) {
        if(!registry.get(source)) registry.set(source, {});
        if(!registry.get(this)) registry.set(this, {});
        let _meta = meta;
        if(includeId) _meta.push("id");
        for(let m of meta) {
            setRegistryProperty(this, m, registry.get(source)[m]);
        }
        return this;
    }    
    /**
     * Gets ID of this vector, generated while initializing. The value cannot be modified.
     * @returns {String} An ID of this vector.
     */
    id() {
        return getRegistryProperty(this, "id");
    }
    //#endregion
    /**
     * Reorder the vector values ascending.
     * @returns 
     */
    asc() {        
        var values = [...super.asc()].flat(1);              
        this.length = 0;
        super.push.call(this,...values);        
        this.trigger("vector.order.changed", {direction: "asc"});        
        return this;
    }
    /**
     * Returns an array of indexes of the values ordered ascending.
     * May serve as a key for sorting a matrix by a ceratin column.
     * @returns {Array}
     */
    ascIndex() {       
        return this.raw().asc().getRankIndexes();        
    }
    /**
     * Private method without validation. Removes existing values and replaces them with arguments.
     * @returns {self}
     */
    _with() {            
        this._flush()._push(...arguments);        
    }
    //#region OVERLOADS
    /**
     * Do not use this function yourself as it ignores the input data validation and may result in unexpected behaviour.
     */    
    _push(){
        super.push([...arguments]);        
    }
    concat() {
        return new this.constructor(...this, ...arguments).getMeta(this);
    }    
    desc() {
        var values = [...super.desc()].flat(1);              
        this.length = 0;
        super.push.call(this,...values);        
        this.trigger("vector.order.changed", {direction: "desc"});        
        return this;
    }
    /**
     * Returns an array of indexes of the values ordered descending.
     * May serve as a key for sorting a matrix by a ceratin column.
     * @returns {Array}
     */
    descIndex() {
        return this.raw().desc().getRankIndexes();
    }
    /**
     * Removes the values from this vector.
     */
    flush() {
        const length = this.length;
        while (this.length > 0) {
            super.pop.call(this);
        }
        this.trigger("vector.value.removed", {index: 0, length: length})
        return this;
    }    
    /**
     * Private flush method without events.
     * @returns {self}
     */
    _flush() {        
        while (this.length > 0) {
            super.pop.call(this);
        }        
        return this;
    }
    map() {
        return super.map.call(this, ...arguments);
    }
    push(){        
        let index = this.length;
        for(let i of [...arguments].flat(Infinity - 1)){
            if(this.parse) super.push(this.parse(i));
            else super.push(i);
        }
        this.trigger("vector.value.added", {index: index, count: this.length});
    }
    slice() {         
        var that = this.reload(super.slice.call(this.raw(), ...arguments));
    }
    toString() {
        return this.serialize(true);
    }
    //#endregion
    
    setLanguage(language) {
        locale.setDefault(language);
        return this;
    }
    
    
    /**
     * Returns the underlying values of this vector as a plain array of primitive values.
     */
    raw() {
        return [...this];
    }
    /**
     * 
     * @param  {...any} values An array or set of values delimited by comma.
     * @returns {self}
     */
    reload(...values) {        
        return new this.constructor(...values).getMeta(this, true);
    }
    _reload() {
        return this.flush()._push(...arguments);
    }
    /**
     * 
     * @returns {this} This vector filtered from the null values.
     */
    removeEmpty() {
        return new this.constructor([...this].filter(v => v !== null)).getMeta(this);
    }    
    /**
     * 
     * @returns Returns an array of the underlying values modified by the formatter meta property (if defined), otherwise returns the values as they are stored in the vector.
     */
    values() {
        var data = [];
        if(this.function()) {
            if(this.matrix()) {
                for(var i = 0; i < this.matrix().maxRows(); i++) {
                    data.push(this.parse(this.function()(this.matrix(),i)));
                }
            } else data = [];
        } else data = this;        
        if(this.formatter()) {
            if(typeof this.formatter() == "object") 
            {
                return data.map(e => e === null ? null : this.formatter()[e] || e);
            }
            else if(typeof this.formatter() == "function") {
                const f = this.formatter();
                return data.map(e => f(e));
            }
            else {
                const f = eval(`[${this.formatter()}][0]`);
                return data.map(e => f(e));
            }
        }
        else return data;
    }    
    /**
     * Returns a formatted value (if formatted property is defined). If the formatter is an object and the value is not found in its keys (e.g. the object key!s value s undefined), returns the original value.
     * @param {any} value Any value to be formatted.
     */
    format(value, index, parent) {
        const f = getRegistryProperty(this, "formatter");
        if(f)
        {
            if(typeof f == "object") return f[value] !== undefined ? f[value] : value;
            else if(typeof f == "function") return f(value, index, parent || this);
            else if(typeof f == "string") {
                return eval(`[${f}][0]`)(value, index, parent || this);
            }
        }
        else return value;
    }
    /**
     * Returns an object or a stringified object with this vector's values and attributes.
     * @param {boolean} stringify If set to true, returns a string instead of an object. Default false.
     * @param {object} config Specifies the output format (e.g. {beautify: true})
     * @returns {Object | string}
     */
    serialize(stringify = false, config = {beautify: false}) {
        var obj = {
            id: this.id(),
            values: this.raw(),
            name: this.name(),
            label: getRegistryProperty(this, "label") || null,
            type: this.type(),
            formatter: this.formatter() ? typeof this.formatter() == "function" ? this.formatter().toString() : this.formatter() : null            
        };
        return stringify ? JSON.stringify(obj, null, config?.beautify ? "\t" : "") : obj;
    }
    clone(flush = false) {
        var _ = (flush ? new this.constructor() : new this.constructor(...this).getMeta(this));
        log({class: "vector", what: this, data: {events: ["cloned"]}});
        return _;
    }    
    /**
    * Instead of values, this method extracts indexes of values matching the filter (see @param) and return an array of indexes. 
    * @param {function} filter A function or a strong type filter type (string). Strong type filters: notempty, empty.
    * @return {Array<integer>} Returns an array of indexes of values matching the given filter.
    */
    ifilter(filter = () => true) {

        return new Array(...this).map(function(v, i){
            if(filter(v)) return i;
            else return -1;
        }).filter(x => x > -1 );
    }
    
    filterByIndex(...indexes) {
        return new this.constructor(...this).filter((e,i) => [...indexes].indexOf(i) > -1).getMeta(this);
    }
    /**
     * Returns a clone of this vector with randomly choosen N items, where the N is defined by the "size" parameter. If greater than 1 then N = size; if 0 then returns the entire sample. If somewhere between, returns size*100% of the sample.
     * @param {*} size 
     * @returns {Vector}
     */
    sample(size = 0) {
        this.trigger("vector.sample.init", {});
        var clone = this.clone(true);
        if(size <= 0) {            
            this.trigger("vector.sample.end", {});
            return clone;
        }
        else if(size < 1) size = this.length * size;
        if(size > this.length) {            
            this.trigger("vector.sample.end", {});
            return clone;
        }
        else {
            var indexes = Math.getRandomIndexes(this.length, size);
            clone.push(...this.filter((v,i) => indexes.indexOf(i) > - 1));
            this.trigger("vector.sample.end", {});
            return clone;
        }
    }
    async trigger(eventName, data) {              
        this.eventHandler ? this.eventHandler({name: eventName, data: data || {}, who: this}) : false;
    }
    /**
     * Converts the vector to a destinated type. Returns an error if failed. If type type arguments is equal to this vector's type value, returns itself.
     * @param {integer} type The target type this vector should be converted to.
     * @param {*} fn Optional: A function that converts the underlying data to the appropriate type.
     * @returns {NumericVector | StringVector | BooleanVector} New converted vector or itself.
     */
    convert(type, fn) {
        if(this.type() == type) return this;
        else if(type == 1) {
            if(!fn) fn = (v,i,a) => v;
            return new NumericVector(...this.map(fn)).getMeta(this);
        }
        else if(type == 2) {
            if(!fn) fn = (v,i,a) => String(v);
            return new StringVector(...this.map(fn)).getMeta(this);
        }
        else if(type == 3) {
            if(!fn) fn = (v,i,a) => v === null ? null : v ? true : false;
            return new BooleanVector(...this.map(fn)).getMeta(this);
        } 
        else if(type == 4) {
            if(!fn) fn = (v,i,a) => v === null ? null : v;
            return new TimeVector(...this.map(fn)).getMeta(this);
        }
        else throw new Error(`Unrecognized vector type: ${type}. Possible types: 1,2,3,4.`);
    }
    fill(what, count, append) {
        var e = this.parse(what);
        if(append) super.push(...Array(count).fill(e));
        else this.reload(...Array(count).fill(e));
        return this;
    }
    append(what, count = 1)
    {
        var e = this.parse(what);
        super.push(...Array(count).fill(e));
        return this;
    }
    /**
     * A proxy function to the locale handler.
     * @param {String} code 
     * @param {Object | undefined} data 
     * @returns {String} Result of the localization.
     */
    localize(code,data = {}) {
        return $(code, data);
    }    
    // #region STATIC METHODS
    static deserialize(data) {
        if(typeof data != "object") {
            try {
                data = JSON.parse(data);
            } catch(e) {
                console.error("Failed to parse the vector data.")
                return null;
            }
        }
        if([1,2,3,4].indexOf(data.type) < 0) throw new Error("Unknown vector type: " + data.type);
        else {
            let vector = (data.type == 1 ? new NumericVector(...data.values) : data.type == 2 ? new StringVector(...data.values) : data.type == 3 ? new BooleanVector(...data.values) : data.type == 4 ? new TimeVector(...data.values) : new Error());
            if(data.id) setRegistryProperty(vector, "id", data.id);
            vector = vector.name(data.name).label(data.label);
            if(data.formatter) {
                try {
                    vector = vector.formatter(JSON.parse())
                } catch (e) {
                    try {   
                        vector = vector.formatter(data.formatter);
                    } catch(e) {
                        console.error("Failed to deserialize the formatter", e);
                    }
                }
            }
            if(data.function) {

            }
            return vector;            
        }
        
    }    
    /**
     * Creates a new Vector which type is defined by the arguments' types. Overloads the common array method.
     * @returns {Vector} 
     */
    static of() {
        return [...arguments].vectorify();
    }
    static ofType(type) {     
        return function() {
            if(type == 1) return new NumericVector(...arguments);
            else if(type == 2) return new StringVector(...arguments);
            if(type == 3) return new BooleanVector(...arguments);
            if(type == 4) return new TimeVector(...arguments);
            else throw new Error("Unknown vector type: " + type);
        }
    }    
    //#endregion 
}

/**
* Whenever you need to make sure an instance is a vector or any of its extended children, call this property.
*/
Vector.prototype.isVector = true;

const vectorParser = {
    numeric: function(value) {
        if(typeof value == "string") value = value.replace(/\,/g, ".").trim();
        if(value === 0 || value === "0" || value === false) return 0;
        else if(!value) return null;
        else if(!isNaN(value)) return Number(value);
        else throw new Error($("UyOj", {value:value}));
    },
    string: function(value) {
        if(value || value === false || value === 0) return String(value);
        else return null;
    },
    boolean: function(value) {
        if(value) return 1;
        else if(value === false || value === 0 || value === "0" || value === "false") return 0;
        else return null;
    },
    time: function(value) {
        if(value === false || value === null || value === undefined) return null;
        else if(Date.isDate(value)) return value;
        else if(Array.isArray(value)) {
            var _ = new Date(...value);
        }
        if(isNaN(new Date(value).getTime()))
        {
            throw new Error($("eZw1", {value: value}));
        }
        else return new Date(value);
    }
}

// #region VECTOR EXTENSIONS

class NumericVector extends Vector {
    constructor(){
        super(...arguments);
    }
    /**
     * Returns the type of this vector, either as an enumeration (integer) or as a class name.
     * @param {boolean} verbose If the argument is true, it returns the full class name of the vector (eg NominalVector). Otherwise, it returns an enumeration (eg 3).
     * @returns {number | string} Returns the type of this vector.
     */
    type(verbose) {
        if(verbose) return "NumericVector";
        else return 1;
    }
    /**
     * Generates a new numeric vector with 'total' randomly generated values ranging between 'min' and 'max' and with a 'nullprob' probability of null value occurrence.
     * @param {object} config Eg. {min: -50, max: 200, total: 1000, nullprob: 0.1}
     * @example var n = NumericVector.generate();
     * @example var n = NumericVector.generate({total: 1000});
     * @example var n = NumericVector.generate({total: 1000, min: 0});
     * @example var n = NumericVector.generate({total: 1000, min: 0, max: 200});
     * @example var n = NumericVector.generate({total: 100, min: 0, nullprob: 0.5});
     * Returns a new instance of the vector with random values.
     */
    static generate(config = {}) {
        var min = isNaN(config.min) ? - Number.MAX_SAFE_INTEGER : Number(config.min) < - Number.MAX_SAFE_INTEGER ? - Number.MAX_SAFE_INTEGER : Number(config.min);
        var max = isNaN(config.max) ? Number.MAX_SAFE_INTEGER : Number(config.max) > Number.MAX_SAFE_INTEGER ? Number.MAX_SAFE_INTEGER : Number(config.max);
        var nullprob = Number(config.nullprob) > 0 ? Number(config.nullprob) > 1 ? 1 : Number(config.nullprob) : 0;
        if(max < min){
            var _min = config.min;
            var _max = config.max
            min = _max;
            max = _min
        };
        var decimal = Number(config.decimal) > 0 ? Math.floor(config.decimal) : 0;
        var total = Number(config.total) > 0 ? Number(config.total) : 100;
        //var _new = new NumericVector();
        
        var _new = new NumericVector();
        for(var i = 0; i < total; i++) {
            if(nullprob > 0) {
                if(Math.random() <= nullprob) {
                    _new._push(null);
                } else _new._push(Math.rndNumber(min,max,decimal));
            } else _new._push(Math.rndNumber(min,max,decimal));
        };
        return _new;
    };
}
NumericVector.prototype.parse = vectorParser.numeric;

class StringVector extends Vector {
    constructor(){
        super(...arguments);
    }
    /**
     * Returns the type of this vector, either as an enumeration (integer) or as a class name.
     * @param {boolean} verbose If the argument is true, it returns the full class name of the vector (eg NominalVector). Otherwise, it returns an enumeration (eg 3).
     * @returns {number | string} Returns the type of this vector.
     */
    type(verbose) {
        if(verbose) return "StringVector";
        else return 2;
    }
    /**
     * Generates a string vector with 'total' of random text values selected from the 'list' of values. The list argument can be either an array of values or an integer. If the latter is provided, N values are randomly selected from a built-in list of nouns (max 1000 otems).
     * @param {object} config Eg. {total: 500, list: ["A","B","C"]} or {total: 500, list: 5}
     * @example var strings = StringVector.generate({list: ["A","B", "C"], total: 100000, nullprob: 0.5})
     * @example var strings = StringVector.generate({list: 4, total: 100000, nullprob: 0.2})
     * @example var strings = StringVector.generate({list: 5, nullprob: 0.175})
     * @example var strings = StringVector.generate({list: 5})
     * Returns a new instance of the vector with random values.
     */
    static generate(config = {}) {
        let list;
        var total = Number(config.total) > 0 ? Number(config.total) : 100;
        var nullprob = Number(config.nullprob) > 0 ? Number(config.nullprob) > 1 ? 1 : Number(config.nullprob) : 0;
        if(config?.list === undefined) {
            list = locale.getRandomWords(5);
        }
        else if(!isNaN(config.list)) {            
            //list = Math.rndSelect(rndWordList, Number(config.list), false);
            list = this.locale.getRandomWords(Number(config.list));
        } else list = config.list;
        var _new = new StringVector();
        for(var i = 0; i < total; i++) {
            if(nullprob > 0) {
                if(Math.random() <= nullprob) {
                    _new._push(null);
                } else _new._push(Math.rndSelectOne(list))
            } else _new._push(Math.rndSelectOne(list));
        }
        return _new;
    };
}
StringVector.prototype.parse = vectorParser.string;

class BooleanVector extends Vector {
    constructor(){
        super(...arguments);
    }
    /**
     * Returns the type of this vector, either as an enumeration (integer) or as a class name.
     * @param {boolean} verbose If the argument is true, it returns the full class name of the vector (eg NominalVector). Otherwise, it returns an enumeration (eg 3).
     * @returns {number | string} Returns the type of this vector.
     */
    type(verbose) {
        if(verbose) return "BooleanVector";
        else return 3;
    }
    /**
     * Generates a boolean vector with 'total' of random boolean (true/false) values.
     * @param {object} config Eg. {total: 500} or {total: 500, nullprob: 0.25}
     * @example var b = BooleanVector.generate({total: 10000, nullprob: 0.5});
     * @example var b = BooleanVector.generate({total: 10000});
     * @example var b = BooleanVector.generate({});
     * @example var b = BooleanVector.generate();
     * Returns a new instance of the vector with random values.
     */
    static generate(config = {}) {
        let list = [1,0];
        var total = Number(config.total) > 0 ? Number(config.total) : 100;
        var nullprob = Number(config.nullprob) > 0 ? Number(config.nullprob) > 1 ? 1 : Number(config.nullprob) : 0;
        var _new = new BooleanVector();
        for(var i = 0; i < total; i++) {
            if(nullprob > 0) {
                if(Math.random() <= nullprob) {
                    _new._push(null);
                } else _new._push(Math.rndSelectOne(list))
            } else _new._push(Math.rndSelectOne(list))
        }
        return _new;
    };
    format(value, index, parent) {
        if(this.formatter()) return this.format(value, index, parent);
        else return value === 1 ? true : value === 0 ? false : null;
    }
}
BooleanVector.prototype.parse = vectorParser.boolean;

class TimeVector extends Vector {
    constructor(){
        super();        
        if([...arguments].length > 0) this.push(...arguments);        
    }
    push(){
        for(let i of [...arguments]){
            if(this.parse) super.push(this.parse(i));
            else super.push(i);
        }
    }
    /**
     * 
     * @returns Returns values of this vector converted to integers.
     */
    raw() {
        return [...this].map(function(e){
            if(e !== null) return e.getTime();
            else return null;
        })
    }
    /**
     * Returns the type of this vector, either as an enumeration (integer) or as a class name.
     * @param {boolean} verbose If the argument is true, it returns the full class name of the vector (eg NominalVector). Otherwise, it returns an enumeration (eg 3).
     * @returns {number | string} Returns the type of this vector.
     */
    type(verbose) {
        if(verbose) return "TimeVector";
        else return 4;
    }
    /**
     * Generates a new time vector with 'total' randomly generated values ranging between 'min' and 'max' and with a 'nullprob' probability of null value occurrence.
     * @param {object} config Eg. {min: -50, max: 200, total: 1000, nullprob: 0.1}
     * @example var n = NumericVector.generate();
     * @example var n = NumericVector.generate({total: 1000});
     * @example var n = NumericVector.generate({total: 1000, min: 0});
     * @example var n = NumericVector.generate({total: 1000, min: 0, max: 200});
     * @example var n = NumericVector.generate({total: 100, min: 0, nullprob: 0.5});
     * Returns a new instance of the vector with random values.
     */
    static generate(config = {}) {
        var min = isNaN(new Date(config.min).getTime()) ? new Date("1000-01-01").getTime() : new Date(config.min).getTime();
        var max = isNaN(new Date(config.max).getTime()) ? new Date("2999-12-31").getTime() : new Date(config.max).getTime();
        var nullprob = Number(config.nullprob) > 0 ? Number(config.nullprob) > 1 ? 1 : Number(config.nullprob) : 0;
        if(max < min){
            var _min = config.min;
            var _max = config.max
            min = _max;
            max = _min
        };
        var total = Number(config.total) > 0 ? Number(config.total) : 100;
        var _new = new TimeVector();
        for(var i = 0; i < total; i++) {
            if(nullprob > 0) {
                if(Math.random() <= nullprob) {
                    _new._push(null);
                } else _new._push(Math.rndNumber(min,max,0));
            } else _new._push(Math.rndNumber(min,max,0));
        }
        return _new;
    };
    explode() {
        return [
            this.map(e => e !== null ? e.getFullYear() : null).numerify().name($("Mydr")),
            this.map(e => e !== null ? e.getMonth() + 1 : null).numerify().name($("v6qI")), 
            this.map(e => e !== null ? e.getDate() : null).numerify().name($("o3Mh")),
            this.map(e => e !== null ? e.getHours() : null).numerify().name($("FKmI")),
            this.map(e => e !== null ? e.getMinutes() : null).numerify().name($("Jk73")),
            this.map(e => e !== null ? e.getSeconds() : null).numerify().name($("46Ew")),
            this.map(e => e !== null ? e.getMilliseconds() : null).numerify().name($("2hXX"))
        ]
    }
}
TimeVector.prototype.parse = vectorParser.time;

Array.prototype.numerify = function(){
    return new NumericVector(...this);
}

Array.prototype.stringify = function(){
    return new StringVector(...this);
}

Array.prototype.boolify = function(){
    return new BooleanVector(...this);
}

Array.prototype.timefy = function(){
    return new TimeVector(...this);
}

Array.prototype.vectorify = function() {
    if(this.find(v => v !== true && v !==false && v !== null && v !==0 && v!==1))
    {
        try {
            return new NumericVector(...this)
        } catch (e) {
            return new StringVector(...this);
        }
    } else return new BooleanVector(...this);
}

// #endregion



let _exports = {
    Vector: Vector,
    NumericVector: NumericVector,    
    StringVector: StringVector,
    BooleanVector: BooleanVector,
    TimeVector: TimeVector,
    vector: function() {return [...arguments].vectorify()},
}
module.exports = _exports;


