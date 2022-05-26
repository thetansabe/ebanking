const TransferHistory = require('../model/TransferHistory')
const Account = require('../model/Account')

const SiteController = {
    index(req, res, next) {
        res.render('admin_layout', {
            layout: 'admin_layout'
        })
    },

    activated(req, res, next) {
        res.render('activated', {
            layout: 'admin_layout'
        })
    },
    deactivated(req, res, next) {
        res.render('deactivated', {
            layout: 'admin_layout'
        })
    },

    waiting(req, res, next) {
        res.render('waiting', {
            layout: 'admin_layout'
        })
    },

    ban(req, res, next) {
        res.render('ban', {
            layout: 'admin_layout'
        })
    },

    async getAccount (req, res, next) {
        const id = req.params.id;
        const filter = {
            _id: id,
        }
        await Account.findOne(filter)
        .then(account => {
            res.status(200).json({
                code: 0,
                message: 'Đọc tài khoản thành công',
                data: account
            })
        })
        .catch(err => {
            return res.status(500).json({
                code: 1,
                message: 'Đọc tài khoản thất bại',
                err: err.message
            })
        })
    },

    async search(req, res, next) {
        const phone = req.params.phone;
        if (!phone) return res.status(200).json({
            code: 1,
        })
        await Account.find({
			phonenumber: {
				$regex: new RegExp(req.params.phone, 'i'),
				// $option: 'i'
			},
		})
        .then(data => {
            return res.status(200).json({
                code: 0,
                message: 'Tìm kiếm thành công',
                data: data
            })
        })
        .catch(err => {
            return res.status(500).json({
                code: 1,
                message: err.message,
            })
        })
    },

    transfer(req, res, next) {
        res.render('admin_transfer', {
            layout: 'admin_layout'
        })
    },

    withdraw (req, res, next) {
        res.render('admin_withdraw', {
            layout: 'admin_layout'
        })
    }
}

module.exports = SiteController;