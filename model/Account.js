const mongoose = require('mongoose')
const dotenv = require('dotenv').config({path: './.env'})

const opts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}

mongoose.connect(process.env.DATABASE_CONNECT_LINK, opts)

const userSchema = new mongoose.Schema({
    username : String,
    password : String,
    acc_status : Number,
    acc_info : String,
    phonenumber: String,
    hoten: String,
    email: String,
    birth: Date,
    address: String,
    id_front: String,
    id_back: String,
    wrongPassCount: {
        type: Number,
        default: 0
    },
    irregularLogin: {
        type: Number,
        default: 0
    }
},{
    timestamps: true,
})

const Account = mongoose.model('accounts', userSchema)

module.exports = Account