import HistoryGraphView from 'appkit/views/history-graph';

export default HistoryGraphView.extend({
    graphOpts: {
        axes: {
            y: {
                valueFormatter: function(y) {
                    return (y * 100).toFixed(2) + '%';
                },
                axisLabelFormatter: function(y) {
                    return (y * 100).toFixed(0) + '%';
                }
            }
        }
    },
    title: 'Uptime',
    graphs: ['uptime'],
    labels: ['uptime'],
    legendPos: [{x:60,y:25}]
});