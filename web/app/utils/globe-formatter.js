var Formatter = {
    percent: function(val, precision) {
        var fixed = 'n/a';
        precision = precision | 2;
        if (!isNaN(val) && typeof val === 'number') {
            fixed = (val * 100).toFixed(precision) + '%';
        }
        return fixed;
    },
    bandwidth: function(value){
        var formatted = 'n/a';

        value = parseInt(value, 10);
        if(value !== -1 && !isNaN(value)){
            var bandwidthKB = value / 1000;
            var bandwidthMB = bandwidthKB / 1000;

            if (bandwidthMB >= 1) {
                formatted = Math.round(bandwidthMB * 100) / 100 + ' MB/s';
            } else {
                if (bandwidthKB >= 1) {
                    formatted = Math.round(bandwidthKB * 100) / 100 + ' kB/s';
                } else {
                    formatted = value + ' B/s';
                }
            }
        }

        return formatted;
    }
};

export default Formatter;