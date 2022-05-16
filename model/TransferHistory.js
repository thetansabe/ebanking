const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const opts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}

mongoose.connect('mongodb://localhost:27017/ebanking', opts)

const TransferHistorySchema = new Schema({
    actor: {
        type: Schema.Types.ObjectId,
        ref: 'Account'
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: 'Account'
    },
    icon: {
        type: String,
        required: true
    },
    //1 - nap tiep
    //2 - rut tien
    //3 - chuyen tien
    //4 - mua the dien thoai
    transferType: {
        type: String,
        required: true
    },
    money: {
        type: Number,
        required: true
    },
    occurTime: {
        type: Date,
        required: true
    },
    // 0 - pending
    // 1 - full fill,
    // -1 - reject
    status: {
        type: String
    },
    transactionFee: {
        type: Number,
    },
    message: {
        type:String,
    },
    phoneCardNumber: {
        type: Array,
    },
    creditCardNumber: {
        type: Schema.Types.ObjectId,
        ref: 'CreditCard'
    }
}, {
    timestamps: true,
})

module.exports = mongoose.model('TransferHistory', TransferHistorySchema);
