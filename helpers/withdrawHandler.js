const Wallet = require('../model/Wallet')

async function withdrawHandler(savedTransferHistory) {
    const { money, actor, transactionFee } = savedTransferHistory;
    const filter = { userId: actor}
    const userWallet = await Wallet.findOne(filter);
    let accountBalance = 0;
    if (userWallet) accountBalance = userWallet.accountBalance;
    if (accountBalance < (money + transactionFee)) {
        return new Promise((resolve, reject) => {
            const result = {
                code: 1,
                message: 'Số dư trong ví của quý khách không đủ để thực hiện giao dịch'
            }
            resolve(result)
        })
    }
    else {
        const update = {
            accountBalance: accountBalance - (money + transactionFee),
        }

        return await Wallet.findOneAndUpdate(filter, update, {
            new: true,
            upsert: true,
        })
        .then(savedWallet => {
            return new Promise((resolve, reject) => {
                const result = {
                    code: 0,
                    message: 'Thực hiện rút tiền thành công',
                    data: savedWallet
                }
                resolve(result)
            })
        })
        .catch(()=> {
            return new Promise((resolve, reject) => {
                const result = {
                    code: 1,
                    message: 'Thực hiện rút tiền thất bại'
                }
                resolve(result)
            })
        })  
    }
}

module.exports = withdrawHandler;