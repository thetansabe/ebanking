const Account = require('../model/Account')
const Card = require('../model/CreditCard')
const TransferHistory = require('../model/TransferHistory')
const walletController = require('./WalletController')

const AdminController = {
    async requireCertificate(req, res, next) {
        const id = req.body.id;
        console.log('body: ', req.body)
        console.log(id)
        const filter = {
            _id: id,
        }

        const update = {
            acc_status: 3,
            acc_info: 'pending (require update ID images)'
        }
        await Account.findOneAndUpdate(filter, update, {
            new: true
        })
        .then(doc => {

            req.session.flash = {
                type: 'success',
                intro: 'Update Successfully',
                message: 'Request user to update their ID image'
            }
            return res.status(200).json({
                code: 0,
                message: 'Admin yêu cầu bỏ sung chứng minh nhân dân cho tài khoản thành công',
                data: doc
            })
        })
        .catch(err => {
            return res.status(500).json({
                code: 1,
                message: 'Admin yêu cầu bổ sung chứng minh nhân dân cho tài khoản thất bại',
                err: err.message
            })
        })
    },

    async deactivateAccount(req, res, next) {
        const id = req.body.id;
        const filter = {
            _id: id,
        }

        const update = {
            acc_status: -1,
            acc_info: 'inactivated'
        }
        await Account.findOneAndUpdate(filter, update, {
            new: true
        })
        .then(doc => {
            req.session.flash = {
                type: 'success',
                intro: 'Update Successfully',
                message: 'Deactivated a user'
            }

            res.status(200).json({
                code: 0,
                message: 'Admin hủy xác minh tài khoản thành công',
                data: doc
            })
        })
        .catch(err => {
            res.status(500).json({
                code: 1,
                message: 'Admin hủy xác minh tài khoản thất bại',
                err: err.message
            })
        })
    },
    
    async activateAccount(req, res, next) {
        const id = req.body.id;
        const filter = {
            _id: id,
        }

        const update = {
            acc_status: 2,
            acc_info: 'authorized'
        }

        await Account.findOneAndUpdate(filter, update, {
            new: true
        })
        .then(doc => {
            req.session.flash = {
                type: 'success',
                intro: 'Update Successfully',
                message: 'Authorized a user'
            }

            res.status(200).json({
                code: 0,
                message: 'Admin xác minh tài khoản thành công',
                data: doc
            })
        })
        .catch(err => {
            res.status(500).json({
                code: 1,
                message: 'Admin xác minh tài khoản thất bại',
                err: err.message
            })
        })
    },

    //DESC pending accounts
    async pendingAccounts(req, res, next) {
        Account.find({acc_status: 1}).sort({
            updatedAt: 'descending'
        })
        .exec((err, accounts) => {
            if (err) {
                return res.status(500).json({
                    code: 1,
                    message: 'Đọc danh sách tài khoản đang chờ kích hoạt thất bại',
                    error: err
                })
            }
            res.status(200).json({
                code: 0,
                message: 'Đọc danh sách tài khoản đang chờ kích hoạt thành công',
                data: accounts
            })
        })
    },

    //DESC fulfilled accounts
    async fulfilledAccounts(req, res, next) {
        Account.find({acc_status: 2}).sort({
            updatedAt: 'descending'
        })
        .exec((err, accounts) => {
            if (err) {
                return res.status(500).json({
                    code: 1,
                    message: 'Đọc danh sách tài khoản đã kích hoạt thất bại',
                    error: err
                })
            }
            res.status(200).json({
                code: 0,
                message: 'Đọc danh sách tài khoản đã kích hoạt thành công',
                data: accounts
            })
        })
    },

    //DESC rejected accounts
    async rejectedAccounts(req, res, next) {
        Account.find({acc_status: -1}).sort({
            updatedAt: 'descending'
        })
        .exec((err, accounts) => {
            if (err) {
                return res.status(500).json({
                    code: 1,
                    message: 'Đọc danh sách tài khoản đang chờ kích hoạt thất bại',
                    error: err
                })
            }
            res.status(200).json({
                code: 0,
                message: 'Đọc danh sách tài khoản đang chờ kích hoạt thành công',
                data: accounts
            })
        })
    },

    //DESC infinite lock account
    async lockedAccounts(req, res, next) {
        Account.find({acc_status: -99}).sort({
            updatedAt: 'descending'
        })
        .exec((err, accounts) => {
            if (err) {
                return res.status(500).json({
                    code: 1,
                    message: 'Đọc danh sách tài khoản đang bị khóa vô thời hạn thất bại',
                    error: err
                })
            }
            res.status(200).json({
                code: 0,
                message: 'Đọc danh sách tài khoản đang bị khóa vô thời hạn thành công',
                data: accounts
            })
        })
    },

    //DESC specified account
    async getAccount(req, res, next) {
        const id = req.params.id
        const filter = {
            _id: id
        }

        await Account.findOne(filter)
        .then(account => {
            return res.status(200).json({
                code: 0,
                message: 'Đọc chi tiết tài khoản thành công',
                data: account
            })
        })
    },

    //DESC withdraw list
    async getWithdrawList(req, res, next) {
        const filter = {
            transferType: '2',
            status: '0'
        }
        await TransferHistory.find(filter)
        .then(transferHistories => {
            return res.status(200).json({
                code: 0,
                message: 'Đọc danh sách giao dịch rút tiền thành công',
                data: transferHistories
            })
        })
        .catch(err => {
            return res.status(500).json({
                code: 1,
                message: 'Đọc danh sách giao dịch rút tiền thất bại'
            })
        })
    },

    //DESC transfer list
    async getTransferList(req, res, next) {
        const filter = {
            transferType: '3',
            status: '0'
        }
        await TransferHistory.find(filter)
        .then(transferHistories => {
            return res.status(200).json({
                code: 0,
                message: 'Đọc danh sách giao dịch chuyển tiền thành công',
                data: transferHistories
            })
        })
        .catch(err => {
            return res.status(500).json({
                code: 1,
                message: 'Đọc danh sách giao dịch chuyển tiền thất bại'
            })
        })
    },

    //DESC approve withdraw
    async approveWithdraw(req, res, next) {
        const id = req.params.id;
        const { isApproved } = req.body;
        const filter = {
            _id: id
        }

        const transferHistory = await TransferHistory.findOne(filter)
        if (!transferHistory) {
            return res.status(404).json({
                code: 1,
                message: 'Không tìm thấy lịch sử giao dịch trùng khớp'
            })
        }

        //khong dong y
        if (!isApproved) {
            const update = {
                status: '-1'
            }
            await TransferHistory.findOneAndUpdate(filter, update, {
                new: true,
            })
            .then(doc => {
                return res.status(200).json({
                    code: 0,
                    message: 'Phê duyệt giao dịch rút tiền thành công',
                    data: doc
                })
            })
        }
        else {
            const result = walletController.withdrawHandler(transferHistory)
            if (result.code !== 0) {
                return res.status(404).json(result)
            }
            const update = {
                status: '1',
            }
            await TransferHistory.findOneAndUpdate(filter, update, {
                new: true,
            }) 
            .then(doc => {
                return res.status(200).json({
                    code: 0,
                    message: 'Phê duyệt giao dịch rút tiền thành công',
                    data: doc,
                })
            })
        }
    },

    async approveTransfer(req, res, next) {
        const id = req.params.id;
        const { isApproved } = req.body;
        const filter = {
            _id: id
        }

        const transferHistory = await TransferHistory.findOne(filter)
        if (!transferHistory) {
            return res.status(404).json({
                code: 1,
                message: 'Không tìm thấy lịch sử giao dịch trùng khớp'
            })
        }

        //khong dong y
        if (!isApproved) {
            const update = {
                status: '-1'
            }
            await TransferHistory.findOneAndUpdate(filter, update, {
                new: true,
            })
            .then(doc => {
                return res.status(200).json({
                    code: 0,
                    message: 'Phê duyệt giao dịch chuyển tiền thành công',
                    data: doc
                })
            })
        }
        else {
            const result = walletController.transferHandler(transferHistory)
            if (result.code !== 0) {
                return res.status(404).json(result)
            }
            const update = {
                status: '1',
            }
            await TransferHistory.findOneAndUpdate(filter, update, {
                new: true,
            }) 
            .then(doc => {
                return res.status(200).json({
                    code: 0,
                    message: 'Phê duyệt giao dịch chuyển tiền thành công',
                    data: doc,
                })
            })
        }
    },
}

module.exports = AdminController
