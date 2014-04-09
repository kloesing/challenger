export default Em.ArrayController.extend({
    showFingerprints: false,

    // computed properties
    selectedItems: Em.computed.filterBy('content', 'selected', true),
    graphsUrlPayload: function(){
        return this.get('selectedItems').map(function(item){
            return item.fp;
        }).join('+');
    }.property('selectedItems.length'),


    actions: {
        'show-fingerprints': function(){
            this.toggleProperty('showFingerprints');
        }
    }
});