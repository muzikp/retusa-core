const locale = require('./libs/locale');

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
        module.exports.raise = listenerFunction;
        return module.exports;
    },
    raise: function(event){        
    },
    toLocale: locale.call,
    ...require("./libs/vector")
}

