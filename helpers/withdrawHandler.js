const Wallet = require('../model/Wallet')
const TransferHistory = require('../model/TransferHistory')

async function withdrawHandler(savedTransferHistory) {
    const { money, actor, transactionFee } = savedTransferHistory;
    const filter = { userId: actor}
    const userWallet = await Wallet.findOne(filter);
    let accountBalance = 0;
    if (userWallet) accountBalance = userWallet.accountBalance;
    if (accountBalance < (money + transactionFee)) {
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