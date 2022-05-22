const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CreditCardSchema = new Schema({
    creditCardNumber: {
        type:  String,
        required: true,
        min: 6,
        max: 6,
    },
    expirationDate: {
        type: Date,
        required: true,
    },
    cvvCode: {
        type: String,
        required: true,
        min: 3,
        max: 3
    },
    status: {
        type: Number,
        required: true,
    }
}, {
    timestamps: true,
})

module.exports = mongoose.model('CreditCard', CreditCardSchema);
