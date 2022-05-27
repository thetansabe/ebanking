const Wallet = require('../model/Wallet')

async function transferHandler(savedTransferHistory) {
    const {actor, receiver, money, transactionFee, isActor} = savedTransferHistory
    const filterForActor = {
        userId: actor,
    }

    const filterForReceiver = {
        userId: receiver,
    }
    
    const actorWallet = await Wallet.findOne(filterForActor);
    const receiverWallet = await Wallet.findOne(filterForReceiver)
    
    let accountBalanceOfActor = 0;
    let accountBalanceOfReceiver = 0;

    if (actorWallet) accountBalanceOfActor = actorWallet.accountBalance;
    if (receiverWallet) accountBalanceOfReceiver = receiverWallet.accountBalance;

    //nguoi gui tra phi
    if (isActor) {
        if (accountBalanceOfActor < (money + transactionFee)) {
            return new Promise((resolve, reject) => {
                const result = {
                    code: 1,
                    message: 'Số dư trong ví của quý khách không đủ để thực hiện giao dịch'
                }
                resolve(result)
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
                update = {
                    accountBalance: accountBalanceOfReceiver + money
                }
                return await Wallet.findOneAndUpdate(filterForReceiver, update, {
                    new: true,
                    upsert: true,
                })
                .then(savedWalletOfReceiver => {
                    return new Promise((resolve, reject) => {
                        const result = {
                            code: 0,
                            message: 'Chuyển tiền thành công',
                            actor: savedWalletOfActor,
                            receiver: savedWalletOfReceiver
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
            update = {
                accountBalance: accountBalanceOfReceiver + money - transactionFee
            }
            return await Wallet.findOneAndUpdate(filterForReceiver, update, {
                new: true,
                upsert: true,
            })
            .then(savedWalletOfReceiver => {
                return new Promise((resolve, reject) => {
                    const result = {
                        code: 0,
                        message: 'Chuyển tiền thành công',
                        actor: savedWalletOfActor,
                        receiver: savedWalletOfReceiver
                    }
                    resolve(result)
                })
            })
        })
    }
}

module.exports = transferHandler
