/*global $, moment, GLOBE, jsSHA */
/*eslint new-cap: 0 */

var Util = {
    /**
     * Checks if a given string is a 40 char hex string
     * @param {String} string String to check
     * @returns {Boolean} If the checked string is a 40 char hex
     */
    is40CharHex: function(string){
        var hex40CharRegex = /^[a-f0-9]{40}/i,
            result;

        result = string.match(hex40CharRegex);

        return result !== null;
    },

    /**
     * Creates an sha1 hashed string based on a given fingerprint.
     * @see {@link https://trac.torproject.org/projects/tor/ticket/6320#comment:1}
     * @param {String} fingerprint
     * @returns {String} hashed fingerprint
     */
    hashFingerprint: function(fingerprint){
        var fingerBin = new jsSHA(fingerprint, 'HEX'),
            hashed = fingerBin.getHash('SHA-1', 'HEX');
        return hashed.toUpperCase();
    },

    /**
     * Calculates the difference from now to a given utc time.
     * @param {String} value UTC Timestamp
     * @returns {{h: Number, m: Number, s: Number, d: Number}} hour, minute, second, day
     */
    UtcDiff: function(value){
        var momentDate = moment(value, 'YYYY-MM-DD HH:mm:ss'),
            diff,
        // default result
            result = {
                h:-1,
                m:-1,
                s:-1,
                d:-1
            },
            fl = Math.floor;

        if (momentDate.isValid()) {

            diff = moment().diff(momentDate);

            result.s = Math.round(diff / 1000);
            result.m = fl(result.s / 60);
            result.h = fl(result.m / 60);
            result.d = fl(result.h / 24);

            result.s %= 60;
            result.m %= 60;
            result.h %= 24;
        }

        return result;
    },

    /**
     * Calculates the uptime (Time difference between now and given timestamp) from a UTC-timestamp.
     * Result is an array with the first 2 full time units.
     *
     * @param {String} value UTC-Timestamp
     * @param {String} type "short" or something else
     * @returns {Array} first 2 full time units from uptime
     * @example
     * if uptime < days the function returns [ hours, minutes ]
     */
    UptimeCalculator: function(value, type){
        // if not a valid length return empty data message
        if (value.length !== 19) {
            return [GLOBE.static.messages.dataEmpty];
        }

        var beforeUnit = '<span>',
            afterUnit = '</span>';

        var diff = GLOBE.Util.UtcDiff(value),
            units = [diff.d, diff.h, diff.m, diff.s],
            digits = 0,
            shortVersion = type === 'short',
            pluralize = !shortVersion,
            labels = shortVersion ? ['d', 'h', 'm', 's'] : ['day', 'hour', 'minute', 'second'],
            uptimeArray = [];

        for(var i = 0, max = units.length; i < max; i++){
            if(labels[i] && labels[i].length && units[i] > 0){
                digits += 1;
                uptimeArray[i] = units[i] + beforeUnit + (pluralize && units[i] > 1 ? labels[i] + 's' : labels[i]) + afterUnit;

                if(digits > 1){
                    break;
                }
            }else{
                labels[i] = '';
            }
        }

        return uptimeArray;
    },
    /**
     * Converts UTC-Timestamp ( YYYY-MM-DD hh:mm:ss ) to JavaScript Date-Object.
     * @param {String} timestamp UTC-Timestamp
     * @returns {Date} converted date Object
     * @throws {String} will throw an error if the parsed timestamp is invalid
     */
    utcToDate: function(timestamp){
        var timeMoment = moment(timestamp, 'YYYY-MM-DD HH:mm:ss');

        if (!timeMoment.isValid()) {
            throw 'Are you sure this is a UTC timestamp? expected: YYYY-MM-DD hh:mm:ss got:' + timestamp;
        }

        return timeMoment.toDate();
    },

    /**
     * Generates history data
     * @param {Object} historyObject
     * @throws {String} throws an error if there is no interval or there is something wrong with start and end date
     * @returns {*}
     */
    buildTimeValuePairs: function(historyObject){
        if(historyObject.first && historyObject.last && historyObject.interval){
            var startDate = this.utcToDate(historyObject.first),
                endDate = this.utcToDate(historyObject.last);

            // check if Date creation was successfull
            if(!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())){
                // everything worked

                var sum = 0,
                    newValues = [],
                    values = historyObject.values,
                // interval is in seconds, multiply 1000 to get millisecs
                    interval = historyObject.interval * 1000,
                    currentTime = startDate.getTime();

                for(var i = 0, max = values.length; i < max; i++){
                    var realValue = values[i] * historyObject.factor;

                    newValues.push([
                        currentTime,
                        realValue
                    ]);

                    sum += realValue;
                    currentTime += interval;
                }

                historyObject.avg = (sum / values.length);
                historyObject.values = newValues;

            }else{
                throw 'There was an error parsing the history object timestamps. Check if ' + historyObject.first + ' or ' + historyObject.last + ' are correct.';
            }

        }else{
            throw 'Cannot generate time value pairs if there is no time interval given';
        }

        return historyObject;
    },
    /**
     *
     * @param history
     * @param {Object} toBuild
     * @returns {Array}
     */
    prepareHistoryItems: function(history, toBuild){
        var periods = [];
        for (var build in toBuild) {
            if(toBuild.hasOwnProperty(build)){

                var buildHistory = toBuild[build];
                for (var buildKey in buildHistory) {

                    if (buildHistory.hasOwnProperty(buildKey)) {

                        // push buildKey to periods if not already set
                        if ($.inArray(buildKey ,periods) === -1) {
                            periods.push(buildKey);
                        }

                        var keyObj = buildHistory[buildKey];
                        history[build][buildKey] = Util.buildTimeValuePairs(keyObj);
                    }
                }
            }
        }
        return periods;
    },

    /**
     * Function that takes a ip address and decides if it could be a ipv6 or ipv4 address.
     * Do not use this as validation for ip addresses.
     * @param {String} address
     * @return {undefined|String} 6, 4 or undefined (if address is no string).
     */
    looksLikeIpV: function(address) {
        var looksLike,
            v6Result,
            v4Result;

        if (typeof address === 'string') {
            // I used an assignment with boolean check because .match can return null
            if ((v6Result = address.match(/:/g)) && v6Result.length > 1) {
                looksLike = '6';
            } else if ((v4Result = address.match(/\./g)) && v4Result.length === 3) {
                looksLike = '4';
            }
        }

        return looksLike;
    },

    processHistoryResponse: function(fieldMapping, response){
        var result = {
                history: {},
                periods: []
            },
            toBuild = {},
            data = response ? response : undefined;

        if (response) {
            for (var field in fieldMapping) {
                if (fieldMapping.hasOwnProperty(field)) {
                    if (response) {
                        result.history[field] = {};
                        toBuild[field] = data[fieldMapping[field]];
                    }
                }
            }

            if (response) {
                console.log('preparing history items', result.history, toBuild);
                result.periods = Util.prepareHistoryItems(result.history, toBuild);
            }
        }

        return {
            periods: result.periods,
            history: result.history
        };
    },

    /**
     * This is a wrapper that calls historyValuesFromNowUntil with specific values.
     * It computed a 3_days field using the 1_week values and 3 days ago.
     * @param processedHistoryResponse
     */
    compute3DaysHistory: function(processedHistoryResponse) {
        var bridges = processedHistoryResponse.bridges,
            relays = processedHistoryResponse.relays;

        // compute 3_days period from 1_week
        if (bridges && bridges.periods.length) {
            // compute bridges 3_days
            GLOBE.Util.historyValuesFromNowUntil({
                history: bridges.history,
                timeAgo: GLOBE.static.numbers.DAY * 3,
                sourceField: '1_week',
                destField: '3_days'
            });
            // add 3_days to periods array
            processedHistoryResponse.bridges.periods.unshift('3_days');
        }
        if (processedHistoryResponse.relays && processedHistoryResponse.relays.periods.length) {
            // compute relays 3_days
            GLOBE.Util.historyValuesFromNowUntil({
                history: relays.history,
                timeAgo: GLOBE.static.numbers.DAY * 3,
                sourceField: '1_week',
                destField: '3_days'
            });

            // add 3_days to periods array
            processedHistoryResponse.relays.periods.unshift('3_days');
        }

        return processedHistoryResponse;
    },

    historyValuesFromNowUntil: function(cfg){
        var history = cfg.history,
            timeAgo = cfg.timeAgo,
            source = cfg.sourceField,
            dest = cfg.destField;

        Object.keys(history).forEach(function(historyField){
            // get first timestamp
            var sum = 0,
                earliestValue = Infinity,
                sourceValues = history[historyField][source].values,
            // get youngest dataset from source
                now = sourceValues[sourceValues.length - 1][0],
                timeFromComputedNowAgo = now - timeAgo,
                filteredSourceValues = sourceValues.filter(function(valuePair){
                    if (valuePair[0] > timeFromComputedNowAgo) {
                        if (valuePair[0] < earliestValue){
                            earliestValue = valuePair[0];
                        }
                        sum += valuePair[1];
                        return true;
                    }
                });

            // cut > 3 days from values array
            history[historyField][dest] = {
                first: earliestValue,
                last: now,
                values: filteredSourceValues,
                avg: sum / filteredSourceValues.length
            };
        });
    },

    getDateWindow: function(histories) {
        var periods = {},
            result = {};

        // get all periods with all values from each history
        histories.forEach(function(history){
            // loop through all types (advertisedBandwidth, ...)
            Object.keys(history).forEach(function(historyKey){
                var historyType = history[historyKey];

                // loop through all periods (3_days, ...)
                Object.keys(historyType).forEach(function(periodKey){
                    // create empty array if period doesn't exist
                    if (!periods[periodKey]) {
                        periods[periodKey] = [];
                    }

                    periods[periodKey].push({
                        first: moment(historyType[periodKey].first).valueOf(),
                        last: moment(historyType[periodKey].last).valueOf()
                    });
                });
            });
        });

        Object.keys(periods).forEach(function(periodKey){
            var
//                first = 0,
                last = 0,
                first = 0;
//                last = Infinity;

            // compare first and end
            periods[periodKey].forEach(function(obj){
                if (obj.first > first) {
                    first = obj.first;
                }
                if (obj.last > last) {
                    last = obj.last;
                }
            });

            result[periodKey] = {
                first: first,
                last: last
            };
        });

        return result;
    }
};

export default Util;