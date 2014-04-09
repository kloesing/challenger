import Formatter from 'appkit/utils/globe-formatter';

export default Ember.Handlebars.makeBoundHelper(function(value, precision) {
    return new Handlebars.SafeString(Formatter.percent(value, precision));
});

