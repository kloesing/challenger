import PeriodsMixin from 'appkit/mixins/periods-mixin';

export default Em.ObjectController.extend(PeriodsMixin, {
    needs: ['application'],

    showParticipants: false,

    uptimeData: {},
    uptimePeriods: [],

    bandwidthData: {},
    bandwidthPeriods: [],

    weightData: {},
    weightPeriods: [],

    clientsData: {},
    clientsPeriods: [],

    actions: {
        toggleShowParticipants: function(){
            this.toggleProperty('showParticipants');
        }
    }
});