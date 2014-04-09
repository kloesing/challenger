export default Em.View.extend({
    classNames: ['pure-u-1-2'],
    classNameBindings: ['content.selected:selected'],
    templateName: 'fingerprint-item',
    fingerprint: '',
    atlasUrl: '',
    globeUrl: '',
    blutmagieUrl: '',

    click: function(){
        this.toggleProperty('content.selected');
    },

    init: function(){
        this._super();
        var fingerprint = this.get('content.fingerprint');
        this.setProperties({
            atlasUrl: 'https://atlas.torproject.org/#details/' + fingerprint,
            globeUrl: 'https://globe.torproject.org/#/relay/' + fingerprint,
            blutmagieUrl: 'http://torstatus.blutmagie.de/router_detail.php?FP=' + fingerprint
        });
    }
});