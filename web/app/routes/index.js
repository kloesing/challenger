export default Ember.Route.extend({
    setupController: function(ctrl, fingerprints){
        // TODO: async load fingerprints
        ctrl.set('content', [{
                fp: 'F2044413DAC2E02E3D6BCF4735A19BCA1DE97281'
            },{
                fp: '9695DFC35FFEB861329B9F1AB04C46397020CE31'
            }])
    }
});
