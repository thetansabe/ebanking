const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PhoneCardSchema = new Schema({
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
