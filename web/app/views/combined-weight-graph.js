import HistoryGraphView from 'appkit/views/history-graph';

export default HistoryGraphView.extend({
    title: 'Weights',
    graphs: ['advertisedBandwidth', 'consensusWeightFraction', 'guardProbability', 'exitProbability'],
    labels: ['advertised bandwidth fraction', 'consensus weight fraction','guard probability', 'exit probability'],
    legendPos: [{x:80,y:35},{x:80,y:15},{x:270,y:15}, {x:270,y:35}]
});