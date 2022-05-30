const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TemporaryBanAccountSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        expires: '1m',
        default: Date.now()
    }
})

module.exports = mongoose.model('TemporaryBanAccount', TemporaryBanAccountSchema);
