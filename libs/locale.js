"use strict";
require("./extensions");

const __default = "en-GB";
var factory = {
    "default": {
        "GSEH": "Dictionary data argument must be an object and cannot be empty.",
        "kaex": "Language ${value} not registered, switching to default (${default})."        
    }
};
var wordList = {
    "default": function() {
        return String.fillRnd(8);
    }
};

var _default = (function() {
    if(typeof window !== "undefined") return window?.localStorage?.getItem("language") || window.navigator?.language || window.navigator?.userLanguage || __default;
    else return Intl.DateTimeFormat().resolvedOptions().locale;
})();
if(!factory[_default]) _default = __default;

module.exports = {
    /**
     * Sets the locale data for either existing or non existing locale set and returns the module.
     * @param {string} language Intl language code
     * @param {object} data JSON object with key (random code) an value (text) elements
     * @param {boolean} overwriteExisting If true, keys present in the existing set will be overwriten with new values. Default true.
     * 
     */
    setData: function(language, data, overwriteExisting=true) {
        if(typeof data != "object") throw module.exports.call("GSEH");
        if(!factory[language]) factory[language] = {};
        Object.keys(data).forEach(function(key){
            if(!overwriteExisting && !factory[language][key]) factory[language][key] = data[key];
            else factory[language][key] = data[key];
        });
        return module.exports;
    },
    getDefault: function() {return _default},
    /**
     * Set the default language. If empty, the default value is reset to the local language default.
     * @param {string} value Language i18n or another code.
     * @returns {module.exports} Returns the module.
     */
    setDefault: function(value) {
        if(value === undefined) _default = __default;
        else if(!value) _default = Intl.DateTimeFormat().resolvedOptions().locale;
        else if(!factory[value]) 
        {
            console.warn(module.exports.call("kaex", {value: value, default:  __default}));            
            _default = __default;
        }
        else _default = value;
        return module.exports;
    },
    call: function(code, data = {}) {        
        let _ = factory[_default];
        if(!_) _ = factory["default"];
        if(!code) return "";
        else if(typeof code == "object") {
            var _text = _default ? code[_default] : Object.entries(code)[0][1];
            return _replace(_text, data)
        }
        var _text = _[code];        
        if(!_text) return _replace(code,{value: code});
        else {
            _text = _replace(_text, data)
            return _text;
        }
    },
    /**
     * 
     * @returns Returns a list of available languages, both built-in and custom.
     */
    listLanguages: function(){
        return Object.keys(factory);
    },
    /**
     * Sets the list of words that are used while generating a StringVector instances. It can either be an array of strings or a function generating the words.
     * @param {String} language 
     * @param {Array<String> | function} list
     * @returns Return the module.exports-
     */
    setWordList: function(language, list) {
        wordList[language] = list;
        return module.exports;
    },
    getRandomWord: function() {
        var g = wordList[_default] || wordList["default"];
        if(Array.isArray(g)) return Math.rndSelectOne(g);
        else return g(...arguments);        
    },
    getRandomWords: function(length) {
        var g = wordList[_default] || wordList["default"];                              
        if(Array.isArray(g)) return Math.rndSelect(g, length, false);
        else return Array(length).fill(0).map(e => g());       
    }
}

const _replace = function(text, data) {
    var keys = (text.match(/\$\{(.*?)\}/g) || []).map(i => i.match(/\$\{(.*)\}/)[1]);
    keys.forEach(function(k){
        text = text.replace("\$\{" + k + "\}", () => data[k])
    });
    return text;
}