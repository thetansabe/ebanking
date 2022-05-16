const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const opts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}

mongoose.connect('mongodb://localhost:27017/ebanking', opts)

const PhoneCardSchema = new Schema({
    phoneCardNumber: {
        type:  String,
        required: true,
        min: 10,
        max: 10,
    },
    internetService: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
        min: 5,
        max: 5
    }
}, {
    timestamps: true,
})

module.exports = mongoose.model('PhoneCard', PhoneCardSchema);
