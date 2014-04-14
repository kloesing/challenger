import json from 'appkit/utils/json';
import Util from 'appkit/utils/globe-util';

function useAll(){
    return new Em.RSVP.Promise(function(resolve){
        json('combined-clients.json').then(function(result){
            resolve(Util.compute3DaysHistory(Util.processHistoryResponse({
                averageClients: 'average_clients'
            }, result)));
        });
    });
}

var CombinedUptime = {
    useAll: useAll
};
export default CombinedUptime;