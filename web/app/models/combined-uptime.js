import ajax from 'appkit/utils/ajax';
import Util from 'appkit/utils/globe-util';

function useAll(){
    return new Em.RSVP.Promise(function(resolve, reject){
        var url = ENV.BASE_URL + 'combined-uptime/all';
        // TODO: replace with api call
        url = ENV.BASE_URL + 'combined-uptime.json';
        ajax({
            dataType: 'json',
            url: url
        }).then(function(result){
            resolve(Util.processHistoryResponse({
                uptime: 'uptime'
            }, result));
        });
    });
}

var CombinedUptime = {
    useAll: useAll
};
export default CombinedUptime;