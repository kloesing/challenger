export default Em.View.extend({
    classNames: ['select-item'],
    classNameBindings: ['content.selected:selected'],
    templateName: 'fingerprint-item',

    click: function(){
        this.toggleProperty('content.selected');
    }
});