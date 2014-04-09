import PeriodsMixin from 'appkit/mixins/periods-mixin';

export default Em.ObjectController.extend(PeriodsMixin, {
    showParticipants: false,

    uptimeData: {},
    uptimePeriods: [],

    bandwidthData: {},
    bandwidthPeriods: [],

    weightData: {},
    weightPeriods: [],

    clientsData: {},
    clientsPeriods: []
});