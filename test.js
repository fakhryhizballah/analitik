require('dotenv').config();
const { InfluxDB, Point } = require('@influxdata/influxdb-client')

const token = process.env.INFLUXDB_TOKEN
const url = process.env.INFLUXDB_URL

const client = new InfluxDB({ url, token })

let org = `rs`
let bucket = `new`

let writeClient = client.getWriteApi(org, bucket, 'ns')

// for (let i = 0; i < 5; i++) {
//     let point = new Point('measurement1')
//         .tag('tagname1', 'tagvalue1')
//         .intField('field1', i)

//     void setTimeout(() => {
//         writeClient.writePoint(point)
//     }, i * 1000) // separate points by 1 second

//     void setTimeout(() => {
//         writeClient.flush()
//     }, 5000)
// }

// Fungsi untuk mengirim data
function logMemoryUsage() {
    const used = process.memoryUsage().heapUsed / 1024 / 1024; // MB

    // Membuat satu titik data (Point)
    const point = new Point('memory_usage')
        .tag('server_id', 'node-app-02') // Tag untuk filtering cepat
        .floatField('used_mb', used);    // Field untuk nilai numerik
        // .intField('used_mb', used);    // Field untuk nilai numerik
        
    writeClient.writePoint(point);
    console.log(`Data terkirim: ${used.toFixed(2)} MB`);
}

// Jalankan setiap 5 detik
setInterval(logMemoryUsage, 5000);

// Flush data sebelum aplikasi mati
process.on('SIGINT', () => {
    writeClient.close().then(() => {
        console.log('Koneksi ditutup.');
        process.exit();
    });
});