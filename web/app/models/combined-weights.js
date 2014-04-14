import json from 'appkit/utils/json';
import Util from 'appkit/utils/globe-util';

function useAll(){
    return new Em.RSVP.Promise(function(resolve){
        json('combined-weights.json').then(function(result){
            resolve(Util.compute3DaysHistory(Util.processHistoryResponse({
                advertisedBandwidth: 'advertised_bandwidth_fraction',
                consensusWeightFraction: 'consensus_weight_fraction',
                exitProbability: 'exit_probability',
                guardProbability: 'guard_probability'
            }, result)));
        });
    });
}

var CombinedUptime = {
    useAll: useAll
};
export default CombinedUptime;