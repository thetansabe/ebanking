const { validationResult } = require('express-validator');
const CreditCard = require('../model/CreditCard');
const TransferHistory = require('../model/TransferHistory');
const Wallet = require('../model/Wallet');
const Account = require('../model/Account');
const transferEmail = require('../helpers/transfer')
const PhoneCard = require('../model/PhoneCard');

function createRandomCard(n) {
    let cards = [];
    for (let i = 0; i < n; i++) {
        let card = ``;
        for (let j = 0; j < 5; j++) {
            card += Math.floor(Math.random() * 10)
        }
        cards.push(card);
    }
    return cards;
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

            try {
                filter = {
                    creditCardNumber: creditCardNumber,
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

            try {
                filter = {
                    creditCardNumber: creditCardNumber,
                    expirationDate: new Date(expirationDate),
                    cvvCode: cvvCode,
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

            if (validCreditCard.status === 1) {
                const filter = { userId: req.body.userId}
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
                    const creditCardObjectId = '627e1c5a2607c36d765ac38a';
                    const transferHistory = new TransferHistory({
                        actor: req.body.userId,
                        icon: '<i class="fa-light fa-money-bill-transfer"></i>',
                        transferType: '1',
                        money: money,
                        occurTime: Date.now(),
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
            else if (validCreditCard.status === 0) {
                if (money > 1000000) {
                    return res.status(422).json({
                        code: 1,
                        message: 'Chỉ được nạp tối đa 1 triệu/ lần',
                    })
                }
                const filter = { userId: req.body.userId}
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
                    const creditCardObjectId = '627e1c682607c36d765ac38c';
                    const transferHistory = new TransferHistory({
                        actor: req.body.userId,
                        icon: '<i class="fa-light fa-money-bill-transfer"></i>',
                        transferType: '1',
                        money: money,
                        occurTime: Date.now(),
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
                return res.status(500).json({
                    code: 1,
                    message: 'Thẻ hết tiền'
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
            const minimumMoney = 50000;
            if (money % minimumMoney !== 0) {
                const message = `Số tiền rút phải là bội số của ${minimumMoney.toLocaleString('vi', {
                    style: 'currency',
                    currency: 'VND'
                })} đồng`;

                return res.status(403).json({
                    code: 1,
                    message
                })
            }
            const rate = 0.05;
            const transactionFee = rate * money;
            const maximumMoney = 5000000;
            const transferHistory = new TransferHistory({
                actor: req.body.userId,
                icon: '<i class="fa-solid fa-money-bill-transfer"></i>',
                transferType: '2',
                money: money,
                occurTime: Date.now(),
                transactionFee,
                message,
            })
            //need admin acceptance
            if (money > maximumMoney) {
                const creditCardObjectId = '627e1c5a2607c36d765ac38a';
                transferHistory['creditCardNumber'] = creditCardObjectId;
                transferHistory['status'] = '0';
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
                const creditCardObjectId = '627e1c5a2607c36d765ac38a';
                transferHistory['creditCardNumber'] = creditCardObjectId;
                transferHistory['status'] = '1';
                await transferHistory.save()
                .then(async savedTransferHistory => {
                    const filter = { userId: savedTransferHistory.actor}
                    const userWallet = await Wallet.findOne(filter);
                    let accountBalance = 0;
                    if (userWallet) accountBalance = userWallet.accountBalance;
                    const { withdrawMoney, transactionFee } = savedTransferHistory;
                    if (accountBalance < (withdrawMoney + transactionFee)) {
                        return res.status(403).json({
                            code: 1,
                            message: 'Số dư trong ví của quý khách không đủ để thực hiện giao dịch'
                        })
                    }
                    const update = {
                        accountBalance: accountBalance - (withdrawMoney + transactionFee),
                    }
    
                    await Wallet.findOneAndUpdate(filter, update, {
                        new: true,
                        upsert: true,
                    })
                    .then(savedWallet => {
                        return res.status(200).json({
                            code: 0,
                            message: 'Thực hiện rút tiền thành công'
                        })
                    }) 
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
            const result = await transferEmail(transferData);
            if (result.code !== 0) {
                return res.status(500).json({
                    code: 1,
                    message: 'Gửi mail xác nhận không thành công'
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

    async something(req, res) {
        const transferData = req.transferData;
        const { actorId, receiverId, phonenumber, email, money, message, isActor } = transferData.data;
        
        const rate = 0.05;
        const transactionFee = rate * money;

        const maximumMoney = 5000000;
        const transferHistory = new TransferHistory({
            actor: actorId,
            receiver: receiverId,
            icon: '<i class="fa-light fa-comments-dollar"></i>',
            transferType: '3',
            money: money,
            occurTime: Date.now(),
            transactionFee,
            message,
        })
        //need admin acceptance
        if (money > maximumMoney) {
            transferHistory['status'] = '0';
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
            transferHistory['status'] = '1';
            await transferHistory.save()
            .then(async savedTransferHistory => {
                const filterForActor = {
                    userId: actorId,
                }
        
                const filterForReceiver = {
                    userId: receiverId,
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
                        return res.status(403).json({
                            code: 1,
                            message: 'Số dư trong ví của quý khách không đủ để thực hiện giao dịch'
                        })
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
                            return res.status(200).json({
                                code: 0,
                                message: 'Chuyển tiền thành công',
                                actor: savedWalletOfActor,
                                receiver: savedWalletOfReceiver
                            })
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
                            return res.status(200).json({
                                code: 0,
                                message: 'Chuyển tiền thành công',
                                actor: savedWalletOfActor,
                                receiver: savedWalletOfReceiver
                            })
                        })
                    })
                }
            })
        }
        
    },

    //mua thẻ điện thoại
    async purchasePhoneCard(req, res) {
        let result = validationResult(req);
        if (result.errors.length === 0) {
            const { internetService, quantity, cost, actorId } = req.body;
            
            let filter = {
                userId: actorId
            }
            
            const actorWallet = await Wallet.findOne(filter)
            const accountBalance = 0;
            if (actorWallet) accountBalance = actorWallet.accountBalance
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

            let cards = createRandomCard(quantity)
            await PhoneCard.findOne(filter)
            .then(async phoneCard => {
                cards = cards.map(card => {
                    return `${phoneCard.code}${card}`
                })
                const transferHistory = new TransferHistory({
                    actor: actorId,
                    icon: '<i class="fa-light fa-cart-shopping"></i>',
                    transferType: '4',
                    money: totalCost,
                    occurTime: Date.now(),
                    transactionFee: 0,
                    phoneCardNumber:cards
                })
                await transferHistory.save()
                .then(()=>{
                    return res.status(200).json({
                        code: 0, 
                        message: 'Mua thẻ điện thoại thành công',
                        data: cards
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

    async add(req, res) {
        const {creditCardNumber, expirationDate, cvvCode, status} = req.body;

        const creditCard = new CreditCard({
            creditCardNumber,
            expirationDate,
            cvvCode,
            status
        })

        await creditCard.save()
        .then(savedCreditCard => {
            return res.json({data: savedCreditCard})
        })
    },

    async createOTP(req, res) {
        
    }
}

module.exports = WalletController;
