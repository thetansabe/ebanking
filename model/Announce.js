const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AnnounceSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId
    },
    message: {
        type: String
    }
}, {
    timestamps: true,
})

module.exports = mongoose.model('Announce', AnnounceSchema);
