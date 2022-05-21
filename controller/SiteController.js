const SiteController = {
    index(req, res, next) {
        res.render('admin', {
            layout: 'admin'
        })
    },
    activated(req, res, next) {
        res.render('activated', {
            layout: 'admin'
        })
    },
    deactivated(req, res, next) {
        res.render('deactivated', {
            layout: 'admin'
        })
    },

    waiting(req, res, next) {
        res.render('waiting', {
            layout: 'admin'
        })
    },
    ban(req, res, next) {
        res.render('ban', {
            layout: 'admin'
        })
    }
}

module.exports = SiteController;