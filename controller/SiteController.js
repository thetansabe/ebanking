const SiteController = {
    index(req, res, next) {
        res.render('admin', {
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
    }
}

module.exports = SiteController;