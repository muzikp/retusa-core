Array.prototype.hasOnlyVectorChildren = function() {
    return this.filter(e => !e?.isVector).length == 0;
}

Array.prototype.flush = function() {
    while (this.length > 0) {
        this.pop();
    }
}

Array.prototype.asc = function(){
    return this.sort((a,b) => a > b ? 1 : a < b ? -1 : 0);
}

Array.prototype.desc = function(){
    return this.sort((a,b) => a > b ? -1 : a < b ? 1 : 0);
}

Array.prototype.product = function(){
    return this.reduce((a, b) => a * b);
}

Array.prototype.distinct = function() {
    return this.filter((obj, index, self) => {
        return self.findIndex(t => JSON.stringify(t) === JSON.stringify(obj)) === index;
      }); 
}

Array.prototype.getRankIndexes = function() {
  const valueToIndexMap = new Map();  
  for (let i = 0; i < this.length; i++) {
    const value = this[i];    
    if (!valueToIndexMap.has(value)) valueToIndexMap.set(value, i);
  }  
  return this.map((value) => valueToIndexMap.get(value));
}

String.prototype.fill = function(what, repetition) {
    var x = "";
    for(var i = 0; i < repetition; i++) {
        x =+ what;
    }
    return x;
}


Math.getRandomIndexes = function(total_of_elements, samplesize) {
    var indexes = [];
    if(total_of_elements < samplesize) samplesize = total_of_elements;
    while (indexes.length < samplesize) {
        var v = Math.round(Math.random()*total_of_elements);
        if(indexes.indexOf(v) < 0) indexes.push(v);
    };
    return indexes;
}

Math.rndNumber = function(min,max,decimal = 2) {
    let multiplier = Math.pow(10, decimal || 0);
    return Math.floor(Math.random() * (max - min) * multiplier + min * multiplier) / multiplier;
}

Math.rndSelect = function(array, total = 1, allowDuplicates = false) {
    if(total >= array.length) return array;
    var _sample = [];
    while (_sample.length < total) {
        var index = Math.floor(Math.random() * array.length);
        if(!allowDuplicates) {
            if(_sample.indexOf(array[index] < 0)) _sample.push(array[index]);   
        } else _sample.push(array[index]);
    }
    return _sample;
}

Math.rndSelectOne = function(array) {
    return array[Math.floor(Math.random() * array.length)];
}

Math.sign = function(x) {
    if (x == 0)
        return 0;
    return x > 0 ? 1 : -1;
}

Function.prototype.stringify = function(indent = "\t") {
    var raw = this.toString().match(/function[^{]+\{([\s\S]*)\}$/)[1];
    var formatted = "";
    raw.split(/\n/g).forEach(l => formatted += l.trim() + "\n");
    return formatted.trim();
}

Date.isDate = function(date) {
    return (date instanceof Date && !isNaN(date.valueOf()))
}

String.fillRnd = function(length) {
    return generateRandomString(length);
}

Array.prototype.fillRnd = function() {
    return generateRandomString(this.length);
}

function generateRandomString(length=8) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

module.exports = {Array, Math, String, Function, Date};