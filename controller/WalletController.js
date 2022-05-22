const { validationResult } = require('express-validator');
const CreditCard = require('../model/CreditCard');
const TransferHistory = require('../model/TransferHistory');
const Wallet = require('../model/Wallet');
const OTP = require('../model/OTP');
const createRandomOTP = require('../helpers/createRandomOTP')
const createRandomCard = require('../helpers/createRandomCard')
const Account = require('../model/Account');
const transferEmail = require('../helpers/transfer')
const PhoneCard = require('../model/PhoneCard');
const global = {
    pinCode: 0,
}

const WalletController = {
    //@desc nạp tiền vào tài khoản
    async recharge(req, res) {
        let result = validationResult(req);
        if (result.errors.length === 0) {
            const { creditCardNumber, expirationDate, cvvCode, money } = req.body;
            let validCreditCard = undefined;

            let filter = {
                creditCardNumber,
            }
            //check credit card number
            try {
                const creditCard = await CreditCard.findOne(filter)
                if (!creditCard) {
                    return res.status(422).json({
                        code: 1,
                        message: 'Thẻ này không được hỗ trợ',
                    })
                }
            } catch (error) {
                return res.status(500).json({
                    code: 1,
                    message: error.message,
                })
            }

            //check expiration date
            try {
                filter = {
                    creditCardNumber,
                    expirationDate: new Date(expirationDate),
                }
                const creditCard = await CreditCard.findOne(filter);
                if (!creditCard) {
                    return res.status(422).json({
                        code:1,
                        message: 'Ngày hết hạn không trùng khớp với số thẻ',
                    })
                }
            } catch (error) {
                return res.status(500).json({
                    code: 1,
                    message: error.message,
                })
            }

            //check cvv code
            try {
                filter = {
                    creditCardNumber,
                    expirationDate: new Date(expirationDate),
                    cvvCode,
                }
                const creditCard = await CreditCard.findOne(filter);
                if (!creditCard) {
                    return res.status(422).json({
                        code: 1,
                        message: 'Mã CVV không trùng khớp với số thẻ'
                    })
                }
                validCreditCard = creditCard;
            } catch (error) {
                return res.status(500).json({
                    code: 1,
                    message: error.message,
                })
            }

            //this card cannot be used to recharge
            if (validCreditCard.status === -1) {
                return res.status(500).json({
                    code: 1,
                    message: 'Thẻ hết tiền'
                })
            }
            // this card can use to recharge up to 1 million each time
            else if (validCreditCard.status === 0) {
                const maximumRechargeMoney = 1000000;
                if (money > maximumRechargeMoney) {
                    return res.status(422).json({
                        code: 1,
                        message: 'Chỉ được nạp tối đa 1 triệu/ lần',
                    })
                }
            }
            filter = { userId: req.body.userId} // need userId to find user's wallet
            const userWallet = await Wallet.findOne(filter);
            let accountBalance = 0;
            if (userWallet) {
                accountBalance = userWallet.accountBalance;
            }
            const update = {
                accountBalance: accountBalance + money,
            }

            await Wallet.findOneAndUpdate(filter, update, {
                new: true,
                upsert: true,
            })
            .then(async savedWallet => {
                //credit card object id
                const creditCardObjectId = validCreditCard._id;
                const transferHistory = new TransferHistory({
                    actor: req.body.userId,
                    receiver: req.body.userId,
                    icon: '<i class="fa-light fa-money-bill-transfer"></i>',
                    transferType: '1', // recharge
                    money: money,
                    occurTime: Date.now(),
                    status: '1', // full fill 
                    transactionFee: 0, //recharge did not have transaction fee
                    message: '',//recharge did not have message
                    phoneCardNumber: [], // empty array = didn't buy phone card
                    creditCardNumber: creditCardObjectId
                })
                await transferHistory.save()
                .then(()=> {
                    return res.status(200).json({
                        code: 0,
                        message: 'Nạp tiền vào tài khoản thành công',
                        data: savedWallet,
                    })
                })
            })
            .catch(err => {
                return res.status(500).json({
                    code: 1,
                    message: 'Nạp tiền vào tài khoản thất bại',
                })
            })
        }
        else {
            let messages = result.mapped();
            let message = '';
            for (let m in messages) {
                message = messages[m].msg;
                break;
            }
            return res.json({
                code: 1,
                message: message,
            })
        }
    },

    //desc chuyển số tiền đang có trong ví vào thẻ tín dụng
    async withdraw(req, res) {
        let result = validationResult(req);
        if (result.errors.length === 0) {
            const supportFields = ['creditCardNumber', 'expirationDate', 'cvvCode', 'message', 'money'];
            const withdrawData = req.body;
            for (let field in withdrawData) {
                if (!supportFields.includes(field)) {
                    return res.status(403).json({
                        code: 1,
                        message: 'Thông tin thẻ không hợp lệ'
                    })
                }
            }
            const { creditCardNumber, expirationDate, cvvCode, message, money } = withdrawData;
            const validCreditCard = '111111';
            if (creditCardNumber !== validCreditCard) {
                return res.status(403).json({
                    code: 1,
                    message: 'Thẻ này không được hỗ trợ để rút tiền'
                })
            }
            const minimumWithdrawMoney = 50000;
            if (money % minimumWithdrawMoney !== 0) {
                const errMessage = `Số tiền rút phải là bội số của ${minimumWithdrawMoney.toLocaleString('vi', {
                    style: 'currency',
                    currency: 'VND'
                })} đồng`;

                return res.status(403).json({
                    code: 1,
                    message: errMessage
                })
            }
            const rate = 0.05;
            const transactionFee = rate * money; // transaction fee = 5% of withdraw money
            const filter = {
                creditCardNumber: creditCardNumber
            }
            const creditCardObject = await CreditCard.findOne(filter)
            const data = {
                actor: req.body.userId,
                receiver: req.body.userId,
                icon: '<i class="fa-solid fa-money-bill-transfer"></i>',
                transferType: '2', //withdraw
                money: money,
                occurTime: Date.now(),
                transactionFee: transactionFee,
                message: message,
                phoneCardNumber: [],
                creditCardNumber: creditCardObject._id
            }
            const maximumWithdrawMoney = 5000000;

            //need admin acceptance
            if (money > maximumWithdrawMoney) {
                data['status'] = '0'; // pending
                const transferHistory = new TransferHistory(data)
                await transferHistory.save()
                .then(savedTransferHistory => {
                    return res.status(200).json({
                        code: 0,
                        message: 'Giao dịch rút tiền đang đợi admin duyệt',
                        data: savedTransferHistory
                    })
                })
                .catch(err => {
                    return res.status(500).json({
                        code: 1,
                        message: 'Giao dịch rút tiền thất bại'
                    })
                })
            }
            else {
                data['status'] = '1';
                const transferHistory = new TransferHistory(data)
                await transferHistory.save()
                .then(async savedTransferHistory => {
                    const result = await withdrawHandler(savedTransferHistory)
                    if (result.code === 0) {
                        return res.status(200).json(result)
                    }
                    return res.status(404).json(result)
                })
            }
        }
        else {
            let messages = result.mapped();
            let message = '';
            for (let m in messages) {
                message = messages[m].msg;
                break;
            }
            return res.json({
                code: 1,
                message: message,
            })
        }
    },

    //desc chuyển tiền
    async transfer(req, res) {
        let result = validationResult(req);
        if (result.errors.length === 0) {
            const transferData = req.body;
            const result = transferEmail(transferData);
            console.log(result);
            if (result.code !== 0) {
                return res.status(500).json({
                    code: 1,
                    message: 'Gửi mail xác nhận không thành công'
                })
            }
            else {
                global['pinCode'] = result.data; //otp code
            }
        }
        else {
            let messages = result.mapped();
            let message = '';
            for (let m in messages) {
                message = messages[m].msg;
                break;
            }
            return res.json({
                code: 1,
                message: message,
            })
        }
    },

    async checkPin(req, res) {
        const { otpCode, actorId, receiverId, phonenumber, email, money, message, isActor } = req.body;
        
        if (otpCode != global['pinCode']) {
            return res.status(404).json({
                code: 1,
                message: 'Mã OTP không chính xác'
            })
        }
        const filter = {
            code: otpCode,
            actor: actorId,
        }
        const otp = await OTP.findOne(filter)
        if (!otp) {
            return res.status(404).json({
                code: 1,
                message: 'Mã OTP đã hết hiệu lực'
            })
        }
        
        const rate = 0.05;
        const transactionFee = rate * money;

        const maximumMoney = 5000000;
        const data = {
            actor: actorId,
            receiver: receiverId,
            icon: '<i class="fa-light fa-comments-dollar"></i>',
            transferType: '3',
            money: money,
            occurTime: Date.now(),
            transactionFee,
            message,
            isActor: isActor
        }
        //need admin acceptance
        if (money > maximumMoney) {
            data['status'] = '0'; //pending
            const transferHistory = new TransferHistory(data)
            await transferHistory.save()
            .then(savedTransferHistory => {
                return res.status(200).json({
                    code: 0,
                    message: 'Giao dịch chuyển tiền đang đợi admin duyệt',
                    data: savedTransferHistory
                })
            })
            .catch(err => {
                return res.status(500).json({
                    code: 1,
                    message: 'Giao dịch chuyển tiền thất bại'
                })
            })
        }
        else {
            data['status'] = '1';
            const transferHistory = new TransferHistory(data)
            await transferHistory.save()
            .then(async savedTransferHistory => {
                const result = await transferHandler(savedTransferHistory)
                if (result.code === 0) {
                    return res.status(200).json(result)
                }
                return res.status(404).json(result)
            })
        }
        
    },

    //mua thẻ điện thoại
    async purchasePhoneCard(req, res) {
        let result = validationResult(req);
        if (result.errors.length === 0) {
            const { internetService, quantity, cost, userId } = req.body;

            if (quantity > 5) {
                return res.status(403).json({
                    code: 1,
                    message: 'Tối đa 5 thẻ'
                })
            }
            
            let filter = {
                userId: userId
            }
            
            const userWallet = await Wallet.findOne(filter)
            const accountBalance = 0;
            if (userWallet) accountBalance = userWallet.accountBalance
            const totalCost = quantity * cost;
            if (accountBalance < totalCost) {
                return res.status(500).json({
                    code: 1,
                    message: 'Số dư trong tài khoản của quý khách không đủ để thực hiện thanh toán'
                })
            }

            filter = {
                internetService: internetService
            }

            let cards = createRandomCard(quantity) //random cards array
            await PhoneCard.findOne(filter)
            .then(async phoneCard => {
                cards = cards.map(card => {
                    return `${phoneCard.code}${card}`
                })
                const transactionFee = 0;
                const transferHistory = new TransferHistory({
                    actor: userId,
                    receiver: userId,
                    icon: '<i class="fa-light fa-cart-shopping"></i>',
                    transferType: '4', // buy phone card
                    money: totalCost,
                    occurTime: Date.now(),
                    status: '1', // fulfill
                    transactionFee: transactionFee,
                    message: '',
                    phoneCardNumber:cards
                })
                await transferHistory.save()
                .then(async saveTransferHistory => {
                    const filter = {
                        userId: saveTransferHistory.actor
                    }
                
                    const update = {
                        accountBalance: accountBalance - (totalCost + transactionFee),
                    }

                    await Wallet.findOneAndUpdate(filter, update, {
                        new: true,
                        upsert: true,
                    })
                    .then(savedWallet => {
                        return res.status(200).json({
                            code: 0,
                            message: 'Thực hiện mua thẻ điện thoại thành công',
                            data: savedWallet,
                            cards: saveTransferHistory.phoneCardNumber
                        })
                    }) 
                })
            })
        }
        else {
            let messages = result.mapped();
            let message = '';
            for (let m in messages) {
                message = messages[m].msg;
                break;
            }
            return res.json({
                code: 1,
                message: message,
            })
        }
    },

    async withDrawHandler(savedTransferHistory) {
        const { money, actor, transactionFee } = savedTransferHistory;
        const filter = { userId: actor}
        const userWallet = await Wallet.findOne(filter);
        let accountBalance = 0;
        if (userWallet) accountBalance = userWallet.accountBalance;
        if (accountBalance < (money + transactionFee)) {
            return {
                code: 1,
                message: 'Số dư trong ví của quý khách không đủ để thực hiện giao dịch'
            }
        }
        const update = {
            accountBalance: accountBalance - (money + transactionFee),
        }

        await Wallet.findOneAndUpdate(filter, update, {
            new: true,
            upsert: true,
        })
        .then(savedWallet => {
            return {
                code: 0,
                message: 'Thực hiện rút tiền thành công',
                data: savedWallet
            }
        }) 
        .catch(()=> {
            return {
                code: 1,
                message: 'Thực hiện rút tiền thất bại'
            }
        })
    },

    async transferHandler(savedTransferHistory) {
        const {actor, receiver, money, transactionFee, isActor} = savedTransferHistory
        const filterForActor = {
            userId: actor,
        }

        const filterForReceiver = {
            userId: receiver,
        }
        
        const actorWallet = await Wallet.findOne(filterForActor);
        const receiverWallet = await Wallet.findOne(filterForReceiver)

        
        const accountBalanceOfActor = 0;
        const accountBalanceOfReceiver = 0;

        if (actorWallet) accountBalanceOfActor = actorWallet.accountBalance;
        if (receiverWallet) accountBalanceOfReceiver = receiverWallet.accountBalance;

        //nguoi gui tra phi
        if (isActor) {
            if (accountBalanceOfActor < (money + transactionFee)) {
                return {
                    code: 1,
                    message: 'Số dư trong ví của quý khách không đủ để thực hiện giao dịch'
                }
            }
            let update = {
                accountBalance: accountBalanceOfActor - (money + transactionFee),
            }
            await Wallet.findOneAndUpdate(filterForActor, update, {
                new: true,
                upsert: true,
            })
            .then(async savedWalletOfActor => {
                update = {
                    accountBalance: accountBalanceOfReceiver + money
                }
                await Wallet.findOneAndUpdate(filterForReceiver, update, {
                    new: true,
                    upsert: true,
                })
                .then(savedWalletOfReceiver => {
                    return {
                        code: 0,
                        message: 'Chuyển tiền thành công',
                        actor: savedWalletOfActor,
                        receiver: savedWalletOfReceiver
                    }
                })
            })
        }
        else {
            let update = {
                accountBalance: accountBalanceOfActor - money,
            }
            await Wallet.findOneAndUpdate(filterForActor, update, {
                new: true,
                upsert: true,
            })
            .then(async savedWalletOfActor => {
                update = {
                    accountBalance: accountBalanceOfReceiver + money - transactionFee
                }
                await Wallet.findOneAndUpdate(filterForReceiver, update, {
                    new: true,
                    upsert: true,
                })
                .then(savedWalletOfReceiver => {
                    return {
                        code: 0,
                        message: 'Chuyển tiền thành công',
                        actor: savedWalletOfActor,
                        receiver: savedWalletOfReceiver
                    }
                })
            })
        }
    },



    //them vao database
    async add(req, res) {
        const {creditCardNumber, expirationDate, cvvCode, status} = req.body;
        console.log(new Date(expirationDate));

        const creditCard = new CreditCard({
            creditCardNumber,
            expirationDate: new Date(expirationDate),
            cvvCode,
            status
        })

        await creditCard.save()
        .then(savedCreditCard => {
            return res.json({data: savedCreditCard})
        })
    },

    async createOTP(req, res) {
        const code = createRandomOTP(6);
        const otp = new OTP({
            code
        })

        await otp.save()
        .then(savedOTP => {
            res.json({
                data: savedOTP
            })
        })
    }
}

module.exports = WalletController;
