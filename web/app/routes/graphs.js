import CombinedUptime from 'appkit/models/combined-uptime';
import CombinedBandwidth from 'appkit/models/combined-bandwidth';
import CombinedWeights from 'appkit/models/combined-weights';
import CombinedClients from 'appkit/models/combined-clients';

export default Ember.Route.extend({
    model: function (params) {
        return params.fp_query;
    },
    setupController: function (ctrl, query) {
        if (query === 'all') {
            // TODO: api all request
            console.log('using all');
            Em.RSVP.hash({
                uptime: CombinedUptime.useAll(),
                bandwidth: CombinedBandwidth.useAll(),
                weights: CombinedWeights.useAll(),
                clients: CombinedClients.useAll()
            }).then(processResult);
        } else {
            var fingerprints = query.split('+');
            console.log('using', fingerprints);
            Em.RSVP.hash({
                uptime: CombinedUptime.useFingerprints(fingerprints),
                bandwidth: CombinedBandwidth.useFingerprints(fingerprints),
                weights: CombinedWeights.useFingerprints(fingerprints),
                clients: CombinedClients.useFingerprints(fingerprints)
            }).then(processResult);
        }

        function processResult(result) {
            console.log('processing', result);
            ctrl.set('uptimeData', result.uptime.history);
            ctrl.set('uptimePeriods', result.uptime.periods);

            ctrl.set('bandwidthData', result.bandwidth.history);
            ctrl.set('bandwidthPeriods', result.bandwidth.periods);

            ctrl.set('weightData', result.weights.history);
            ctrl.set('weightPeriods', result.weights.periods);

            ctrl.set('clientsData', result.clients.history);
            ctrl.set('clientsPeriods', result.clients.periods);
        }
    }
});
