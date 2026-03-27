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
