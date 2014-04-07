import HistoryGraphView from 'appkit/views/history-graph';

export default HistoryGraphView.extend({
    graphOpts: {
    },
    title: 'Clients',
    graphs: ['averageClients'],
    labels: ['concurrent users'],
    legendPos: [{x:60,y:25}]
});