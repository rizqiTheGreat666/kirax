# KiraX - Setup Guide

## MongoDB Configuration

Aplikasi KiraX menggunakan MongoDB untuk menyimpan data user dan transaksi.

### Setup MongoDB Atlas (Cloud)

1. **Buka .env file di root folder project**
   
2. **Ganti bagian `<db_password>` dengan password MongoDB Atlas Anda:**
   ```
   MONGODB_URI=mongodb+srv://rizqipc1306_db_user:web1@cluster0.u7hardw.mongodb.net/?appName=Cluster0
   ```

3. **Pastikan IP Address Anda sudah di-whitelist di MongoDB Atlas:**
   - Login ke MongoDB Atlas
   - Go to: Security → Network Access
   - Click "Add IP Address"
   - Add your IP atau pilih "Allow access from anywhere" (0.0.0.0/0) untuk development

4. **Pastikan database sudah dibuat:**
   - Dalam MongoDB Atlas, database akan otomatis dibuat pada first write
   - Atau buat database manual dengan nama: `kirakiraDB`

5. **Jalankan server:**
   ```bash
   npm start
   ```

6. **Cek di terminal apakah sudah connected:**
   ```
   ✓ MongoDB connected successfully.
   ```

### Troubleshooting

**Error: "connect timed out"**
- Pastikan password sudah benar di .env
- Pastikan IP Anda sudah di-whitelist di MongoDB Atlas

**Error: "authentication failed"**
- Pastikan username dan password sudah benar
- Username harus encode jika ada karakter khusus (gunakan: https://www.urlencoder.org/)

**Error: "database not found"**
- Database akan dibuat otomatis saat first write
- Atau buat manual di MongoDB Atlas

## Testing Login

1. Buka http://localhost:3000/id/gabung
2. Register akun baru
3. Login dengan akun tersebut
4. Seharusnya bisa akses dashboard

## Default Admin User

Username: `roro_admin`
Password: `RorowasAdmin`

Admin user akan dibuat otomatis saat server pertama kali start (jika belum ada).
