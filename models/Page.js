const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema(
    {
        url: { type: String, required: true, index: true },
        viewedAt: { type: Date, default: Date.now, index: true },
        meta: { type: mongoose.Schema.Types.Mixed },
    },
    // Opsi schema digabung ke dalam satu object
    {
        timeseries: {
            timeField: 'viewedAt',
            metaField: 'url',
            granularity: 'hours'
        }
    }
);

const Logger = mongoose.model('Page', pageSchema);
module.exports = Logger;