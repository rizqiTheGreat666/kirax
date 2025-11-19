// models/Transaction.js

const mongoose = require('mongoose');
const User = require('./userModel');

const TransactionSchema = new mongoose.Schema({
    // ... (Fields yang sudah ada: listing_id, provider_id, receiver_id, time_credit_amount, summary, status, transactionDate) ...
    listing_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SkillListing', required: true },
    provider_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Pemberi layanan (penambah saldo)
    receiver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Penerima layanan (pengurang saldo)
    time_credit_amount: { type: Number, required: true, min: 0.1 },
    summary: { type: String, maxlength: 300, trim: true },
    status: { type: String, enum: ['pending', 'completed', 'disputed'], default: 'pending' },
    transactionDate: { type: Date, default: Date.now },
});


// --- FUNGSI INTI BANK WAKTU ---
TransactionSchema.statics.completeTransaction = async function(transactionId) {
    const Transaction = this;

    // --- Langkah 1: Mulai Sesi Transaksi ---
    // Ini memastikan semua operasi (3 update) berhasil atau gagal semua.
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // A. Ambil Transaksi yang akan diselesaikan
        const transaction = await Transaction.findById(transactionId).session(session);

        if (!transaction) {
            throw new Error('Transaction not found.');
        }
        if (transaction.status === 'completed') {
            throw new Error('Transaction already completed.');
        }

        const amount = transaction.time_credit_amount;

        // B. Update Saldo Penerima (Receiver) - PENGURANGAN
        // Receiver (Penerima Layanan) membayar, saldonya berkurang
        const receiverUpdate = await User.updateOne(
            { _id: transaction.receiver_id },
            { $inc: { saldo_waktu: -amount } }, // Kurangi saldo
            { session }
        );

        // C. Update Saldo Pemberi (Provider) - PENAMBAHAN
        // Provider (Pemberi Layanan) menerima bayaran, saldonya bertambah
        const providerUpdate = await User.updateOne(
            { _id: transaction.provider_id },
            { $inc: { saldo_waktu: amount } }, // Tambahkan saldo
            { session }
        );
        
        // Cek apakah kedua update berhasil (nModified > 0)
        if (receiverUpdate.nModified === 0 || providerUpdate.nModified === 0) {
            // Jika salah satu gagal, batalkan transaksi.
            await session.abortTransaction();
            session.endSession();
            throw new Error('User update failed (user ID may be invalid or not found).');
        }

        // D. Update Status Transaksi
        transaction.status = 'completed';
        await transaction.save({ session });

        // --- Langkah 2: Selesaikan Sesi Transaksi ---
        await session.commitTransaction();
        session.endSession();

        return { success: true, message: `Transaction ID ${transactionId} successfully completed.` };

    } catch (error) {
        // Jika ada kesalahan, batalkan operasi di sesi
        await session.abortTransaction();
        session.endSession();
        throw new Error(`Transaction failed: ${error.message}`);
    }
};

module.exports = mongoose.model('Transaction', TransactionSchema);