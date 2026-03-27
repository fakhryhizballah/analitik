require('dotenv').config();
const { InfluxDB, Point } = require('@influxdata/influxdb-client')
const Redis = require('ioredis');

const token = process.env.INFLUXDB_TOKEN
const url = process.env.INFLUXDB_URL
let org = process.env.INFLUXDB_ORG
let bucket = process.env.INFLUXDB_BUCKET

const clientInfluxDB = new InfluxDB({ url, token })

const redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    db: process.env.REDIS_DB
});
async function findBucket() {
    const today = new Date();
    const hour = today.getHours().toString().padStart(2, '0');
    const menit = today.getMinutes().toString().padStart(2, '0');
    let data = await redisClient.keys('views:*')
    console.log(data);
    let writeClient = clientInfluxDB.getWriteApi(org, bucket)
    for (let x of data) {
        let url = x.replace('views:', '')
        console.log(url);

        let value = await redisClient.get(`time:${hour}:${menit}:${url}`)
        if (value == null) {
            value = 0
        }

        const point = new Point('counter_views')
            .tag('url', url)
            .intField('views', value);
        writeClient.writePoint(point);

    }
    writeClient.close().then(() => {
        console.log('WRITE FINISHED')
    })

}
setInterval(findBucket, 30000);
