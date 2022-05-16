const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const opts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}

mongoose.connect('mongodb://localhost:27017/ebanking', opts)
const WalletSchema = new Schema({
    userId: {
        type:  mongoose.Schema.Types.ObjectId,
        ref: 'accounts',
    },
    accountBalance: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true,
})

module.exports = mongoose.model('Wallet', WalletSchema);
