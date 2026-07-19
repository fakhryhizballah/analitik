const Page = require('../models/Page');

module.exports = {

    postView: async (req, res) => {
        if (!req.body.url) {
            return res.status(400).json({
                message: 'Bad Request'
            });
        }
        let page = await Page.create({
            url: req.body.url,
            meta: {
                ip: req.body.ip, uid: req.body.uid ? req.body.uid : null,
                visitorInfo: req.body.visitorInfo
            }
        });
        return res.status(201).json({
            message: 'ok'
        });
    },
    getPageViews: async (req, res) => {
        console.log(req.query.url);
        if (!req.query.url) {
            return res.status(400).json({
                message: 'Bad Request'
            });
        }
        try {
            const page = await Page.countDocuments({
                url: req.query.url
            });
            return res.status(201).json({
                message: req.query.url,
                data: page
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: 'Internal Server Error'
            });
        }
    }

}
