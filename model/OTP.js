const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const opts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}

mongoose.connect('mongodb://localhost:27017/ebanking', opts)

const OTPSchema = new Schema({
    code: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        expires: '1m',
        default: Date.now()
    }
})

module.exports = mongoose.model('OTP', OTPSchema);
