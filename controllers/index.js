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
            if (isValidYYYYMMDD(date)) {
                // Looping 24 jam dalam sehari
                for (let i = 0; i < 24; i++) {
                    const hour = i.toString().padStart(2, '0');
                    const hourlyKey = `unique_visitors:${host}:${date}-${hour}`;
                    console.log(hourlyKey);
                    const count = await req.redisClient.scard(hourlyKey);

                    hourlyData.push({
                        hour: `${hour}:00`,
                        unique_visitors: count
                    });
                }

                return res.status(200).send({
                    host: host,
                    date: date,
                    hourly_unique_visitors: hourlyData,
                });
            }
            let cumulativeByHour = {};
            if (isValidYYYYMM(date)) {
                let cache = await req.redisClient.type(`unique_visitors_cache:${host}:${date}`);
                const m = /^(\d{4})-(\d{2})$/.exec(date);
                console.log(m);
                const daysInMonth = new Date(m[1], m[2], 0).getDate();

                for (let y = 1; y <= daysInMonth; y++) {
                    console.log(y);
                    for (let i = 0; i < 24; i++) {
                        let day = y.toString().padStart(2, '0');
                        const hour = i.toString().padStart(2, '0');
                        const hourlyKey = `unique_visitors:${host}:${date}-${day}-${hour}`;
                        const count = await req.redisClient.scard(hourlyKey);
                        if (!cumulativeByHour[`${hour}`]) {
                            cumulativeByHour[`${hour}`] = 1;
                            cumulativeByHour[`${hour}:00`] = parseInt(count);
                            console.log(`${hour}:00`);
                            hourlyData.push({
                                hour: `${hour}:00`,
                                unique_visitors: parseInt(count)
                            });
                        }

                        // tambah ke cumulative jam ini
                        cumulativeByHour[`${hour}:00`] += count;
                        let data = hourlyData.find(item => item.hour === `${hour}:00`);
                        data.unique_visitors = cumulativeByHour[`${hour}:00`];
                    }
                }
                return res.status(200).send({
                    host: host,
                    date: date,
                    hourly_unique_visitors: hourlyData,

                });
            }
            if (isValidYYYY(date)) {
                const m = /^(\d{4})$/.exec(date);
                for (let i = 1; i <= 12; i++) {
                    const month = i.toString().padStart(2, '0');
                    const monthlyKey = `unique_visitors:${host}:${date}-${month}`;
                    console.log(monthlyKey);
                    const count = await req.redisClient.scard(monthlyKey);
                    hourlyData.push({
                        hour: `${date}-${month}`,
                        unique_visitors: count
                    });
                }
                return res.status(200).send({
                    host: host,
                    date: date,
                    hourly_unique_visitors: hourlyData,

                });
            }
            return res.status(200).send({
                host: host,
                date: date,
                hourly_unique_visitors: hourlyData

            });
            return res.status(400).send({ error: 'Parameter "date" tidak valid.' });

        } catch (error) {
            console.error('Error saat melacak pengunjung:', error);
            res.status(500).send({ error: 'Terjadi kesalahan pada server.' });
        }

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

function daysInMonth(year, month) {
    // month = 1..12
    return new Date(year, month, 0).getDate();
}
function isValidYYYYMMDD(s) {
    // format ketat: 4 digit year - 2 digit month - 2 digit day
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (!m) return false;

    const year = Number(m[1]);
    const month = Number(m[2]);
    const day = Number(m[3]);

    if (month < 1 || month > 12) return false;
    const dim = daysInMonth(year, month); // memperhitungkan leap year
    if (day < 1 || day > dim) return false;

    // Opsional: batasi rentang tahun (misal 0001..9999) jika diperlukan
    return true;
}

function isValidYYYYMM(s) {
    const m = /^(\d{4})-(\d{2})$/.exec(s);
    if (!m) return false;
    const year = Number(m[1]);
    const month = Number(m[2]);
    if (month < 1 || month > 12) return false;
    return true;
}
function isValidYYYY(s) {
    // ubah regex jika ingin menerima lebih dari 4 digit
    const m = /^(\d{4})$/.exec(s);
    if (!m) return false;
    const year = Number(m[1]);
    // contoh pembatasan: tahun minimal 1 dan maksimal 9999
    return year >= 1 && year <= 9999;
}