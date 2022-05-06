const mongoose = require('mongoose')

const opts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}

mongoose.connect('mongodb://localhost:27017/ebanking', opts)

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
    id_back: String
},{
    timestamps: true,
})

const Account = mongoose.model('accounts', userSchema)

module.exports = Account