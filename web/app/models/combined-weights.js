import ajax from 'appkit/utils/ajax';
import Util from 'appkit/utils/globe-util';

function useAll(){
    return new Em.RSVP.Promise(function(resolve, reject){
        var url = ENV.BASE_URL + 'combined-weights/all';
        // TODO: replace with api call
        url = ENV.BASE_URL + 'combined-weights.json';
        ajax({
            dataType: 'json',
            url: url
        }).then(function(result){
            resolve(Util.processHistoryResponse({
                advertisedBandwidth: 'advertised_bandwidth_fraction',
                consensusWeightFraction: 'consensus_weight_fraction',
                exitProbability: 'exit_probability',
                guardProbability: 'guard_probability'
            }, result));
        });
    });
}

var CombinedUptime = {
    useAll: useAll
};
export default CombinedUptime;