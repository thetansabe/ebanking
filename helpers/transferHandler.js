const Wallet = require('../model/Wallet')
const Account = require('../model/Account')
const Announce = require('../model/Announce')
const TransferHistory = require('../model/TransferHistory')
const {mailing2} = require('../helpers/transfer')

async function transferHandler(savedTransferHistory, receiverEmail) {
    const {actor, receiver, money, transactionFee, isActor} = savedTransferHistory
    const filterForActor = {
        userId: actor,
    }
    
    const actorWallet = await Wallet.findOne(filterForActor);
    
    let accountBalanceOfActor = 0;
    if (actorWallet) accountBalanceOfActor = actorWallet.accountBalance;

    //nguoi gui tra phi
    if (isActor) {
        if (accountBalanceOfActor < (money + transactionFee)) {
            const filter = {
                _id: savedTransferHistory._id
            }
            const update = {
                status: '-1'
            }
            return await TransferHistory.findOneAndUpdate(filter, update, {
                new: true,
            })
            .then(() => {
                return new Promise((resolve, reject) => {
                    const result = {
                        code: 1,
                        message: 'Số dư trong ví của quý khách không đủ để thực hiện giao dịch'
                    }
                    resolve(result)
                })
            })
        }
        else {
            let update = {
                accountBalance: accountBalanceOfActor - (money + transactionFee),
            }
            return await Wallet.findOneAndUpdate(filterForActor, update, {
                new: true,
                upsert: true,
            })
            .then(async savedWalletOfActor => {
                const filterForReceiver = {
                    userId: receiver,
                }
                const receiverWallet = await Wallet.findOne(filterForReceiver)
    
                let accountBalanceOfReceiver = 0;
            
                if (receiverWallet) accountBalanceOfReceiver = receiverWallet.accountBalance;

                update = {
                    accountBalance: accountBalanceOfReceiver + money
                }
                return await Wallet.findOneAndUpdate(filterForReceiver, update, {
                    new: true,
                    upsert: true,
                })
                .then(async savedWalletOfReceiver => {
                    await Account.findOne({_id: actor})
                    .then((acc) => {
                        mailing2(receiverEmail, money, savedWalletOfReceiver.accountBalance, transactionFee, acc.username, savedTransferHistory.message)
                    })
                    return new Promise((resolve, reject) => {
                        const data = (actor.equals(receiver)) ? savedWalletOfReceiver : savedWalletOfActor
                        const result = {
                            code: 0,
                            message: 'Chuyển tiền thành công',
                            data: data,
                        }
                        resolve(result)
                    })
                })
            })
        }
    }
    else {
        let update = {
            accountBalance: accountBalanceOfActor - money,
        }
        return await Wallet.findOneAndUpdate(filterForActor, update, {
            new: true,
            upsert: true,
        })
        .then(async savedWalletOfActor => {
            const filterForReceiver = {
                userId: receiver,
            }
            const receiverWallet = await Wallet.findOne(filterForReceiver)

            let accountBalanceOfReceiver = 0;
        
            if (receiverWallet) accountBalanceOfReceiver = receiverWallet.accountBalance;

            update = {
                accountBalance: accountBalanceOfReceiver + money - transactionFee
            }
            return await Wallet.findOneAndUpdate(filterForReceiver, update, {
                new: true,
                upsert: true,
            })
            .then(async savedWalletOfReceiver => {
                await Account.findOne({_id: actor})
                .then((acc) => {
                    mailing2(receiverEmail, money, savedWalletOfReceiver.accountBalance, transactionFee, acc.username, savedTransferHistory.message)
                })
                return new Promise((resolve, reject) => {
                    const data = (actor.equals(receiver)) ? savedWalletOfReceiver : savedWalletOfActor
                    const result = {
                        code: 0,
                        message: 'Chuyển tiền thành công',
                        data: data,
                    }
                    resolve(result)
                })
            })
        })
    }
}

module.exports = transferHandler
