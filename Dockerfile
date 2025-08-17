# Gunakan base image Node.js yang ringan (Alpine Linux)
FROM node:18-alpine

# Set working directory di dalam container
WORKDIR /app

# Salin file package.json dan package-lock.json (jika ada) ke working directory
# Langkah ini dioptimalkan untuk caching Docker. Jika file ini tidak berubah,
# langkah npm install tidak perlu dijalankan lagi
COPY package*.json ./


# Instal semua dependensi
RUN npm install

# Salin semua file proyek Anda ke dalam container
COPY . .

# Beri tahu Docker bahwa container akan mendengarkan port 3000 saat runtime
EXPOSE 3000

# Perintah untuk menjalankan aplikasi saat container diluncurkan
CMD ["npm", "start"]