/*global $, App, moment */

var Util = {
    /**
     * Converts UTC-Timestamp ( YYYY-MM-DD hh:mm:ss ) to JavaScript Date-Object.
     * @param {String} timestamp UTC-Timestamp
     * @returns {Date} converted date Object
     * @throws {String} will throw an error if the parsed timestamp is invalid
     */
    utcToDate: function(timestamp){
        var timeMoment = moment.utc(timestamp, 'YYYY-MM-DD HH:mm:ss');

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
            this.historyValuesFromNowUntil({
                history: bridges.history,
                timeAgo: App.NUMBERS.DAY * 3,
                sourceField: '1_week',
                destField: '3_days'
            });
            // add 3_days to periods array
            processedHistoryResponse.bridges.periods.unshift('3_days');
        }
        if (processedHistoryResponse.relays && processedHistoryResponse.relays.periods.length) {
            // compute relays 3_days
            this.historyValuesFromNowUntil({
                history: relays.history,
                timeAgo: App.NUMBERS.DAY * 3,
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
            if (history[historyField][source]) {
                // get first timestamp
                var sum = 0,
                    earliestValue = Infinity,
                    sourceValues = history[historyField][source].values,
                // get youngest dataset from source
                    now = moment.utc(),
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
            }
        });
    },

    nowMinusPeriod: function(period){
        var periodObject = App.OBJECTS.PERIOD_OBJECT[period];
        return moment.utc().subtract(periodObject[0], periodObject[1]);
    }
};

export default Util;