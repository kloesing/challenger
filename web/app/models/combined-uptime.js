import json from 'appkit/utils/json';
import Util from 'appkit/utils/globe-util';

function useAll(){
    return new Em.RSVP.Promise(function(resolve){
        json('combined-uptime.json').then(function(result){
            resolve(Util.compute3DaysHistory(Util.processHistoryResponse({
                uptime: 'uptime'
            }, result)));
        });
    });
}

var CombinedUptime = {
    useAll: useAll
};
export default CombinedUptime;