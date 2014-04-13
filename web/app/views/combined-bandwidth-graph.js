import HistoryGraphView from 'appkit/views/history-graph';

export default HistoryGraphView.extend({
    graphOpts: {
        labelsKMG2: true
    },
    title: 'Bandwidth',
    graphs: ['readHistory', 'writeHistory'],
    labels: ['written bytes per second', 'read bytes per second'],
    legendPos: [{x:60,y:25}, {x:270,y:25}]
});