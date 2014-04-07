/*global $, Dygraph, GLOBE, Em */
export default Em.View.extend({
    title: 'GraphView',
    templateName: 'graph-item',
    timePeriod: '1_week',
    timePeriods: ['1_week'],
    legendPos: [],
    dateWindow: null,
    width: 0,
    height: 0,
    graphOpts: {},
    dygraph: null,
    hasGraph: false,

    click: function(e){
        // check if clicked element has save-as-png in classList
        if(e.target.classList.contains('save-as-png')){
            var dygraph = this.get('dygraph');

            var tmpImage = document.createElement('image');
            Dygraph.Export.asPNG(dygraph, tmpImage, {});

            window.open(tmpImage.src, 'Image', 'resizable');
        }
    },

    plot: function(){

        var dateWindow = this.get('dateWindow');
        var graphOpts = this.get('graphOpts');
        var selector = this.$()[0].id;
        var $graphCanvas = $('#' + selector).find('.graph-canvas');
        var data = this.get('data');
        var period = this.get('timePeriod');
        var graphs = this.get('graphs');
        var labels = this.get('labels');
        var dygraph;

        var histories = [];

        // dimension calculation
        var storedWidth = this.get('width');
        var storedHeight = this.get('height');

        var w = 0,
            h = 0;

        // check if view width/height are set and use these values, otherwise use computed and store them
        if(storedWidth === 0){
            w = $graphCanvas.width();
            this.set('width', w);
        }else{
            w = storedWidth;
        }
        if(storedHeight === 0){
            h = $graphCanvas.height() || 250;
            this.set('height', h);
        }else{
            h = storedHeight;
        }

        // check what histories data to use
        for(var i = 0, max = graphs.length; i < max; i++){
            var graph = graphs[i];
            if(data.hasOwnProperty(graph)){
                histories.push(data[graph]);
            }
        }


        // need to map all the graphs in relation to their time
        var dateValueMap = {};
        var countedHistory = 0;
        var maxVal = 0;

        for(var j = 0, max2 = histories.length; j < max2; j++){
            var history = histories[j];

            // get the data from the chosen period out of the chosen history object
            if(history && history[period] && history[period].values){

                for(var historyValueIndex = 0, historyValues = history[period].values.length; historyValueIndex < historyValues; historyValueIndex++){
                    var value = history[period].values[historyValueIndex];

                    // check if map has something in value[0] (timestamp)
                    if(dateValueMap.hasOwnProperty(value[0])){
                        // has already something @timestamp

                        // check if value has values.length that is plausible with the number of already history items
                        dateValueMap[value[0]][countedHistory] = value[1];
                    }else{
                        // has nothing for this timestamp
                        // example execution: dateValueMap[1373286150000] = [,,20234.072];
                        dateValueMap[value[0]] = [];
                        dateValueMap[value[0]][countedHistory] = value[1];
                    }
                    maxVal = Math.max(maxVal, value[1]);
                }
                countedHistory += 1;
            }
        }

        // merge everything into a dygraph format ( [timestamp, value1, value2, ...] )
        var dataset = [];
        for(var dateValue in dateValueMap){
            if(dateValueMap.hasOwnProperty(dateValue)){
                var dateValueItem = dateValueMap[dateValue];

                // create array with first position for timestamp
                var dateObj = new Date(parseInt(dateValue, 10));
                var dataForDataSet = [ dateObj ];

                dataForDataSet = dataForDataSet.concat(dateValueItem);
                dataset.push(dataForDataSet);
            }
        }


        if(!dataset.length){
            $graphCanvas.html('<div class="missing-data">No data available :(</div>');
            this.set('hasGraph', false);
            return;
        }else{
            this.set('hasGraph', true);
            // clear area that holds all the views content
            $graphCanvas.html('');
        }

        if (dateWindow && period && dateWindow[period]){
            graphOpts.dateWindow = [dateWindow[period].first, dateWindow[period].last];
        }

        dygraph = new Dygraph($graphCanvas[0],
            dataset,
            Em.$.extend({}, {
                width: w,
                height: h,
                gridLineColor: '#ccc',
                // d3.scale.category10()
                colors: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'],
                //fillGraph: true,
                labels: ['time'].concat(labels),
                showRangeSelector: true,
                includeZero: true,
                labelsDivStyles: {'display': 'block'}
            }, graphOpts)
        );
        this.set('dygraph', dygraph);
    },

    timePeriodChanged: function(){
        var selectedTimePeriod = this.get('period');
        if(selectedTimePeriod !== null){
            this.set('timePeriod', selectedTimePeriod);
            this.plot();
        }
    }.observes('timePeriods.length', 'period')

});