var eventHandler = async function() {return false};
const locale = require('./libs/locale');
Array.prototype.eventHandler = eventHandler;
Object.prototype.eventHandler = eventHandler;
Array.eventHandler = eventHandler;
Object.eventHandler = eventHandler;
Array.prototype.locale = locale;
Object.prototype.locale = locale;
Array.prototype.$ = locale.call;
Object.prototype.$ = locale.call;
Array.$ = locale.call;
Object.$ = locale.call;

module.exports = {
    /**
     * Allows external function to access the module exports.      
     * @returns Return the module.exports content.
     */
    use: function() {
        for(let p of [...arguments]) {
            p(module.exports);
        };
        return module.exports;
    },    
    register: function() {
        return module.exports;
    },
    addDictionary: function(language, data, overwriteExisting) {
        locale.setData(language, data, overwriteExisting);
        return module.exports;
    },
    setLanguage: function(language) {
        locale.setDefault(language);
        return module.exports;
    },
    setListener: function(listenerFunction) {
        module.exports.call = listenerFunction;
        return module.exports;
    },
    listen: function(fn){
        eventHandler = fn;
        Array.prototype.eventHandler = eventHandler;
        Object.prototype.eventHandler = eventHandler;
        Array.eventHandler = eventHandler;
        Object.eventHandler = eventHandler;
        return module.exports;
    },
    toLocale: locale.call,
    ...(require("./libs/vector")),
    ...(require("./libs/matrix"))
}

