export default Em.Component.extend({
    classNames: ['graph-stats'],
    getAvgs: function(fields){
        var avgHistory = {},
            data = this.get('data'),
            period = this.get('period');

        fields.forEach(function(field){
            if (data && data[field] && data[field][period]){
                avgHistory[field + 'Avg'] = data[field][period].avg;
            }
        });

        return avgHistory;
    },
    avgShouldChange: function(){
        this.setProperties(this.getAvgs(this.get('avgFields')));
    }.observes('period', 'timePeriods')
})