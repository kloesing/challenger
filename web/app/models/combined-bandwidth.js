import json from 'appkit/utils/json';
import Util from 'appkit/utils/globe-util';

function useAll(){
    return new Em.RSVP.Promise(function(resolve){
        json('combined-bandwidth.json').then(function(result){
            resolve(Util.processHistoryResponse({
                readHistory: 'read_history',
                writeHistory: 'write_history'
            }, result));
        });
    });
}

var CombinedUptime = {
    useAll: useAll
};
export default CombinedUptime;