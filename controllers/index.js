module.exports = {
    trackUniqueVisitor: async (req, res) => {
        const { host, visitorId } = req.body;

        if (!host || !visitorId) {
            return res.status(400).send({ error: 'Parameter "host" and "visitorId" are required.' });
        }

        try {
            const today = new Date();
            const year = today.getFullYear();
            const month = (today.getMonth() + 1).toString().padStart(2, '0');
            const day = today.getDate().toString().padStart(2, '0');
            const hour = today.getHours().toString().padStart(2, '0');

            // Menentukan kunci untuk harian, bulanan, dan tahunan
            const hourKey = `unique_visitors:${host}:${year}-${month}-${day}-${hour}`;
            const dailyKey = `unique_visitors:${host}:${year}-${month}-${day}`;
            const monthlyKey = `unique_visitors:${host}:${year}-${month}`;
            const yearlyKey = `unique_visitors:${host}:${year}`;
            const allKeys = `unique_visitors:${host}`;

            // Menambahkan visitorId ke semua kunci SET
            // Perintah SADD akan mengembalikan 1 jika elemen baru, 0 jika sudah ada
            const addedToDaily = await req.redisClient.sadd(dailyKey, visitorId);
            await req.redisClient.sadd(monthlyKey, visitorId);
            await req.redisClient.sadd(yearlyKey, visitorId);
            await req.redisClient.sadd(allKeys, visitorId);
            await req.redisClient.sadd(hourKey, visitorId);

            res.status(200).send({
                message: 'Pengunjung berhasil dilacak.',
                isNewVisitorToday: addedToDaily === 1,
            });
        } catch (error) {
            console.error('Error saat melacak pengunjung:', error);
            res.status(500).send({ error: 'Terjadi kesalahan pada server.' });
        }
    },
    trackVisitor: async (req, res) => {
        // Implementasi logika untuk melacak pengunjung
        const { host, date } = req.params; // format date: YYYY-MM-DD;
        console.log(host, date);
        try {
            const hourlyData = [];

            // Looping 24 jam dalam sehari
            for (let i = 0; i < 24; i++) {
                const hour = i.toString().padStart(2, '0');
                const hourlyKey = `unique_visitors:${host}:${date}-${hour}`;
                const count = await req.redisClient.scard(hourlyKey);

                hourlyData.push({
                    hour: `${hour}:00`,
                    unique_visitors: count
                });
            }

            res.status(200).send({
                host: host,
                date: date,
                hourly_unique_visitors: hourlyData,
            });
        } catch (error) {
            console.error('Error saat melacak pengunjung:', error);
            res.status(500).send({ error: 'Terjadi kesalahan pada server.' });
        }
       return res.status(200).send({ message: 'Pengunjung berhasil dilacak.' });

    },
    analyticsUniqueVisitors: async (req, res) => {
        // Implementasi logika untuk mendapatkan analitik pengunjung
        const { host } = req.params;

        try {
            const today = new Date();
            const year = today.getFullYear();
            const month = (today.getMonth() + 1).toString().padStart(2, '0');
            const day = today.getDate().toString().padStart(2, '0');

            const dailyKey = `unique_visitors:${host}:${year}-${month}-${day}`;
            const monthlyKey = `unique_visitors:${host}:${year}-${month}`;
            const yearlyKey = `unique_visitors:${host}:${year}`;
            const allKeys = `unique_visitors:${host}`;

            // Menggunakan SCARD untuk mendapatkan jumlah elemen di setiap SET
            const dailyCount = await req.redisClient.scard(dailyKey);
            const monthlyCount = await req.redisClient.scard(monthlyKey);
            const yearlyCount = await req.redisClient.scard(yearlyKey);
            const allCount = await req.redisClient.scard(allKeys);

            res.status(200).send({
                host: host,
                daily_unique_visitors: dailyCount,
                monthly_unique_visitors: monthlyCount,
                yearly_unique_visitors: yearlyCount,
                all_unique_visitors: allCount
            });
        } catch (error) {
            console.error('Error saat mengambil data analitik:', error);
            res.status(500).send({ error: 'Terjadi kesalahan pada server.' });
        }
    }
}