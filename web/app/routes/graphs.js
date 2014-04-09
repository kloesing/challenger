import CombinedUptime from 'appkit/models/combined-uptime';
import CombinedBandwidth from 'appkit/models/combined-bandwidth';
import CombinedWeights from 'appkit/models/combined-weights';
import CombinedClients from 'appkit/models/combined-clients';

export default Ember.Route.extend({
    model: function (params) {
        return params.fp_query;
    },
    setupController: function (ctrl, query) {
        Em.RSVP.hash({
            uptime: CombinedUptime.useAll(),
            bandwidth: CombinedBandwidth.useAll(),
            weights: CombinedWeights.useAll(),
            clients: CombinedClients.useAll()
        }).then(function processResult(result){
            console.log('processing', result);
            ctrl.set('uptimeData', result.uptime.history);
            ctrl.set('uptimePeriods', result.uptime.periods);

            ctrl.set('bandwidthData', result.bandwidth.history);
            ctrl.set('bandwidthPeriods', result.bandwidth.periods);

            ctrl.set('weightData', result.weights.history);
            ctrl.set('weightPeriods', result.weights.periods);

            ctrl.set('clientsData', result.clients.history);
            ctrl.set('clientsPeriods', result.clients.periods);

            ctrl.updatePeriods(['weightData', 'bandwidthData', 'uptimeData', 'clientsData']);
        });
    }
});
