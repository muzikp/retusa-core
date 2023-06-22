var n = new Event()

class Log {
    constructor(sender, what, data) {
        return {
            sender: sender,
            what: what,
            data: data,
            /**
             * Checks if the data.events array includes an event named as eventName.
             * @param {string} eventName Name of the event to be sought, e.g. "changed".
             * @returns {boolean} True if it has, otherwise false.
             */
            hasEvent: function(eventName = ""){
                return data.events.indexOf(eventName) > -1;
            },
            hasTheseEvents: function() {
                var result = true;
                for(let a of [...arguments].flat(Infinity -1))
                {
                    if(this.data?.events?.indexOf(a) < 0) return false;
                }
                return result;
            },
            hasAnyEvent: function() {                
                for(let a of [...arguments].flat(Infinity -1))
                {
                    if(this.data?.events?.indexOf(a) > -1) return true;
                }
                return false;
            }
        }
    }
}