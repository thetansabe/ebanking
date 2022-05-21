const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username : String,
    password : String,
    acc_status : Number,
    acc_info : String,
    phonenumber: String,
    hoten: String,
    email: String,
    birth: Date,
    id_front: String,
    id_back: String,
    wrongPassCount: {
        type: Number,
        default: 0
    },
    irRegularLogin: {
        type: Number,
        default: 0
    }
},{
    timestamps: true,
})

const Account = mongoose.model('accounts', userSchema)

module.exports = Account