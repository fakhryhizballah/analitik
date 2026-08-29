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
        const { url, date } = req.query;

        if (!url) {
            return res.status(400).json({ message: 'Bad Request: url is required' });
        }

        // Base query
        const query = { url };

        // Dynamic date handling
        if (date) {
            const parts = date.split('-');
            let start, end;

            try {
                if (parts.length === 1) {
                    // Format: YYYY
                    start = new Date(parts[0], 0, 1);
                    end = new Date(Number(parts[0]) + 1, 0, 1);
                } else if (parts.length === 2) {
                    // Format: YYYY-MM
                    start = new Date(parts[0], Number(parts[1]) - 1, 1);
                    end = new Date(parts[0], Number(parts[1]), 1);
                } else if (parts.length === 3) {
                    // Format: YYYY-MM-DD
                    start = new Date(parts[0], Number(parts[1]) - 1, Number(parts[2]));
                    end = new Date(parts[0], Number(parts[1]) - 1, Number(parts[2]) + 1);
                } else {
                    return res.status(400).json({ message: 'Invalid date format. Use YYYY, YYYY-MM, or YYYY-MM-DD' });
                }

                // Validasi apakah instansiasi date berhasil (mencegah NaN)
                if (isNaN(start.getTime())) throw new Error('Invalid Date object');

                query.viewedAt = { $gte: start, $lt: end };
            } catch (e) {
                return res.status(400).json({ message: 'Invalid date value provided' });
            }
        }

        try {
            // Catatan: Pada schema Anda mengekspor 'Logger' tapi di kode awal menggunakan 'Page'
            const count = await Page.countDocuments(query);

            // Diubah menjadi 200 (OK) karena ini adalah operasi GET, bukan POST (201 Created)
            return res.status(200).json({
                message: url,
                data: count
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },
    getPageViewsAnalytics: async (req, res) => {
        const { url, date } = req.query;

        if (!url) {
            return res.status(400).json({ message: 'Bad Request: url is required' });
        }

        const queryMatch = { url };
        let groupId = {};
        let sortId = {};

        if (date) {
            const parts = date.split('-');
            let start, end;

            if (parts.length === 3) {
                // HARIAN (YYYY-MM-DD) -> Group per Jam (0-23)
                start = new Date(parts[0], Number(parts[1]) - 1, Number(parts[2]));
                end = new Date(parts[0], Number(parts[1]) - 1, Number(parts[2]) + 1);

                groupId = { $hour: { date: "$viewedAt", timezone: "Asia/Jakarta" } };
                sortId = { "_id": 1 };

            } else if (parts.length === 2) {
                // BULANAN (YYYY-MM) -> Group per Tanggal (1-31)
                start = new Date(parts[0], Number(parts[1]) - 1, 1);
                end = new Date(parts[0], Number(parts[1]), 1);

                groupId = { $dayOfMonth: { date: "$viewedAt", timezone: "Asia/Jakarta" } };
                sortId = { "_id": 1 };

            } else if (parts.length === 1) {
                // TAHUNAN (YYYY) -> Group per Bulan (1-12)
                start = new Date(parts[0], 0, 1);
                end = new Date(Number(parts[0]) + 1, 0, 1);

                groupId = { $month: { date: "$viewedAt", timezone: "Asia/Jakarta" } };
                sortId = { "_id": 1 };
            }

            queryMatch.viewedAt = { $gte: start, $lt: end };
        }

        try {
            const analytics = await Page.aggregate([
                { $match: queryMatch },
                {
                    $group: {
                        _id: groupId,
                        unique_visitors: { $sum: 1 } // Atau $addToSet jika menghitung unique IP/User
                    }
                },
                { $sort: sortId }
            ]);

            // Formatting label response agar siap dipakai Chart.js
            const formattedData = analytics.map(item => {
                let label = `${item._id}`;
                if (typeof groupId === 'object' && groupId.$hour !== undefined) {
                    label = `${String(item._id).padStart(2, '0')}:00`;
                } else if (typeof groupId === 'object' && groupId.$dayOfMonth !== undefined) {
                    label = `Tgl ${item._id}`;
                } else if (typeof groupId === 'object' && groupId.$month !== undefined) {
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
                    label = monthNames[item._id - 1] || `${item._id}`;
                }

                return {
                    label: label,
                    unique_visitors: item.unique_visitors
                };
            });

            return res.status(200).json({
                url: url,
                analytics: formattedData
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }

}
