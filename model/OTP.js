const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OTPSchema = new Schema({
    code: {
        type: String,
        required: true
    },
    actor: {
        type: Schema.Types.ObjectId,
        ref: 'Account'
    },
    createdAt: {
        type: Date,
        expires: '1m',
        default: Date.now()
    }
})

module.exports = mongoose.model('OTP', OTPSchema);
