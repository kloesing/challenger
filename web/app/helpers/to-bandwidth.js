import Formatter from 'appkit/utils/globe-formatter';

export default Ember.Handlebars.makeBoundHelper(function(value) {
    var formatted = Formatter.bandwidth(value);
    return new Handlebars.SafeString(formatted);
});

