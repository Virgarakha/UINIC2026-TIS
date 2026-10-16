-- ==============================================================================
-- SISTEM SAMPAH & EARLY WARNING BANJIR - POSTGRESQL PRODUCTION DDL
-- Workspace: uinic08 / database
-- Desain: Hybrid Relational + JSONB + Modular Micro-Tables
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- 2. DOMAIN ENUMS (Untuk status teknis yang sangat jarang berubah)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('warga', 'pengepul', 'petugas_dinas', 'admin');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE tipe_transaksi_poin AS ENUM (
        'laporan_terverifikasi_ai', -- +50 poin: Cair otomatis hanya jika AI verifikasi foto valid & confidence >= 70%
        'bonus_sampah_terangkut',   -- +25 poin: Bonus saat sampah yang dilaporkan berhasil diangkut pengepul
        'reward_pengepul',          -- +100 poin: Reward bagi pengepul atas kontribusi daur ulang
        'tanggapan_valid',          -- +10 poin: Warga mengonfirmasi laporan sekitar
        'tukar_hadiah',             -- Pengurangan poin saat klaim hadiah
        'penyesuaian_admin'         -- Koreksi poin oleh sistem/admin
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE status_klaim_hadiah AS ENUM (
        'menunggu_konfirmasi',
        'diproses',
        'dikirim',
        'selesai',
        'dibatalkan'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE tingkat_bahaya_banjir AS ENUM ('waspada', 'siaga', 'awas');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ==============================================================================
-- 3. MICRO-TABLES (MASTER / LOOKUP REFERENCE TABLES)
-- Menggantikan enum statis agar kategori, status, dan jenis sampah bisa
-- ditambah/diedit secara fleksibel lewat Admin Dashboard tanpa migrasi DDL.
-- ==============================================================================

-- 3.1. MICRO-TABLE: KATEGORI_SAMPAH (Kategori Titik Kasus / Masalah)
CREATE TABLE IF NOT EXISTS kategori_sampah (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(50) UNIQUE NOT NULL,       -- e.g. 'sumbatan_sungai', 'tps_liar'
    nama VARCHAR(100) NOT NULL,             -- e.g. 'Sumbatan Sungai'
    icon VARCHAR(50) NOT NULL DEFAULT '🗑️', -- e.g. '🌊', '⚠️', '🍂', '🏖️'
    warna_badge VARCHAR(20) NOT NULL DEFAULT '#ef4444', -- Warna pin & badge di peta
    deskripsi TEXT,
    urutan INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3.2. MICRO-TABLE: STATUS_LAPORAN (Status Alur Progres Laporan)
CREATE TABLE IF NOT EXISTS status_laporan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(50) UNIQUE NOT NULL,       -- e.g. 'menunggu_analisis', 'terverifikasi_ai'
    nama VARCHAR(100) NOT NULL,             -- e.g. 'Menunggu Analisis AI'
    warna_badge VARCHAR(20) NOT NULL DEFAULT '#64748b',
    urutan INT NOT NULL DEFAULT 0,
    deskripsi TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3.3. MICRO-TABLE: KATEGORI_HADIAH (Kategori Reward untuk Gamifikasi)
CREATE TABLE IF NOT EXISTS kategori_hadiah (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(50) UNIQUE NOT NULL,       -- e.g. 'barang_fisik', 'voucher_digital'
    nama VARCHAR(100) NOT NULL,             -- e.g. 'Merchandise Fisik', 'Voucher & Pulsa'
    icon VARCHAR(50) NOT NULL DEFAULT '🎁',
    deskripsi TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3.4. MICRO-TABLE: MASTER_JENIS_SAMPAH (Katalog Material Daur Ulang & Taksiran Harga Riil)
CREATE TABLE IF NOT EXISTS master_jenis_sampah (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(50) UNIQUE NOT NULL,       -- e.g. 'plastik_pet', 'kardus', 'logam'
    nama VARCHAR(100) NOT NULL,             -- e.g. 'Plastik PET (Botol Bening)', 'Kardus Box'
    harga_per_kg_estimasi NUMERIC(10, 2) NOT NULL DEFAULT 0.00, -- Taksiran harga beli pengepul/kg
    satuan VARCHAR(20) NOT NULL DEFAULT 'kg',
    is_daur_ulang BOOLEAN NOT NULL DEFAULT TRUE,
    icon VARCHAR(50) NOT NULL DEFAULT '♻️',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3.5. MICRO-TABLE: MASTER_TIPE_TANGGAPAN (Opsi Validasi "100 Orang Menanggapi")
CREATE TABLE IF NOT EXISTS master_tipe_tanggapan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(50) UNIQUE NOT NULL,       -- e.g. 'konfirmasi_ada', 'kondisi_memburuk'
    label VARCHAR(100) NOT NULL,            -- e.g. 'Saya Juga Melihat Ini', 'Air Mulai Meluap'
    icon VARCHAR(50) NOT NULL DEFAULT '👍',
    bobot_urgensi INT NOT NULL DEFAULT 1,   -- Bobot penentu kenaikan prioritas di peta
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- SEED DATA DEFAULT UNTUK SELURUH MICRO-TABLES
INSERT INTO kategori_sampah (slug, nama, icon, warna_badge, deskripsi, urutan)
VALUES 
    ('sumbatan_sungai', 'Sumbatan Sungai', '🌊', '#ef4444', 'Sampah menyumbat aliran air sungai & pilar jembatan', 1),
    ('tps_liar', 'TPS Liar / Ilegal', '⚠️', '#f59e0b', 'Tumpukan sampah liar di lahan kosong atau tepi jalan', 2),
    ('saluran_drainase', 'Saluran Drainase / Parit', '🍂', '#ea580c', 'Endapan sampah di parit perumahan warga', 3),
    ('tumpukan_jalan', 'Tumpukan Jalan / Trotoar', '🛣️', '#84cc16', 'Sampah berserakan di trotoar atau bahu jalan raya', 4),
    ('pantai_pesisir', 'Pesisir Pantai / Danau', '🏖️', '#06b6d4', 'Limbah sampah di sempadan perairan atau pesisir', 5),
    ('lainnya', 'Kategori Lainnya', '🗑️', '#64748b', 'Titik tumpukan sampah kondisi khusus lainnya', 6)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO status_laporan (slug, nama, warna_badge, urutan, deskripsi)
VALUES
    ('menunggu_analisis', 'Menunggu Analisis AI', '#64748b', 1, 'Laporan baru dibuat warga, sedang diproses model AI'),
    ('terverifikasi_ai', 'Terverifikasi AI', '#3b82f6', 2, 'Laporan lolos validasi AI (foto sampah valid & keyakinan >= 70%)'),
    ('dalam_penanganan', 'Dalam Penanganan', '#f59e0b', 3, 'Laporan sedang ditindaklanjuti oleh pengepul atau dinas'),
    ('siap_diambil_pengepul', 'Siap Diambil Pengepul', '#10b981', 4, 'Material memiliki nilai jual daur ulang dan siap dijemput'),
    ('selesai', 'Selesai / Bersih', '#059669', 5, 'Sampah telah tuntas diangkut dengan bukti foto bersih'),
    ('ditolak', 'Ditolak / Foto Tidak Valid', '#dc2626', 6, 'Laporan ditolak oleh AI karena foto palsu, buram, atau spam')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO kategori_hadiah (slug, nama, icon, deskripsi)
VALUES
    ('barang_fisik', 'Merchandise & Alat Ramah Lingkungan', '🥤', 'Tumbler, tas belanja daur ulang, kaos relawan'),
    ('voucher_digital', 'Voucher & Pulsa / Token Listrik', '🎟️', 'Pulsa seluler, token PLN, e-wallet GoPay/OVO'),
    ('sembako', 'Bahan Pokok & Sembako', '🍚', 'Beras, minyak goreng, gula pasir untuk warga')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO master_jenis_sampah (slug, nama, harga_per_kg_estimasi, icon, is_daur_ulang)
VALUES
    ('plastik_pet', 'Plastik PET (Botol Bening)', 3500.00, '🍾', TRUE),
    ('plastik_campur', 'Plastik Campuran / Kresek', 1200.00, '🛍️', TRUE),
    ('kardus_kertas', 'Kardus & Kertas Bekas', 1800.00, '📦', TRUE),
    ('logam_kaleng', 'Logam & Kaleng Aluminium', 8500.00, '🥫', TRUE),
    ('organik_kayu', 'Ranting Kayu & Daun Organik', 0.00, '🍂', FALSE),
    ('sampah_campuran', 'Sampah Residu Campuran', 0.00, '🗑️', FALSE)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO master_tipe_tanggapan (slug, label, icon, bobot_urgensi)
VALUES
    ('konfirmasi_ada', 'Saya Juga Melihat Ini (Konfirmasi)', '👁️', 1),
    ('kondisi_memburuk', 'Kondisi Memburuk (Air Mulai Naik)', '⚠️', 3),
    ('sudah_bersih', 'Sudah Dibersihkan / Bersih', '✅', 1),
    ('dukung', 'Dukung Penanganan Cepat (Upvote)', '👍', 2)
ON CONFLICT (slug) DO NOTHING;

-- ==============================================================================
-- 4. TABEL UTAMA / OPERASIONAL SISTEM
-- ==============================================================================

-- 4.1. TABEL: USERS
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    phone_number VARCHAR(20),
    role user_role NOT NULL DEFAULT 'warga',
    total_points INT NOT NULL DEFAULT 0 CHECK (total_points >= 0),       -- Saldo poin aktif untuk ditukar
    lifetime_points INT NOT NULL DEFAULT 0 CHECK (lifetime_points >= 0), -- Total akumulasi poin (untuk tier/badge)
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4.2. TABEL: ALAMAT_PENGGUNA (Buku Alamat Warga untuk Pengiriman Hadiah)
CREATE TABLE IF NOT EXISTS alamat_pengguna (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label_alamat VARCHAR(50) NOT NULL DEFAULT 'Rumah', -- 'Rumah', 'Kantor', 'Kost'
    nama_penerima VARCHAR(100) NOT NULL,
    nomor_telepon VARCHAR(20) NOT NULL,
    alamat_lengkap TEXT NOT NULL,
    kelurahan VARCHAR(100),
    kecamatan VARCHAR(100),
    kota_kabupaten VARCHAR(100) NOT NULL,
    provinsi VARCHAR(100) NOT NULL,
    kode_pos VARCHAR(10) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4.3. TABEL: KATALOG_HADIAH (Daftar Hadiah yang Dapat Ditukar dengan Poin)
CREATE TABLE IF NOT EXISTS katalog_hadiah (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kategori_id UUID REFERENCES kategori_hadiah(id) ON DELETE SET NULL, -- Relasi ke Micro-Table
    nama_hadiah VARCHAR(150) NOT NULL,
    deskripsi TEXT,
    foto_url TEXT,
    poin_dibutuhkan INT NOT NULL CHECK (poin_dibutuhkan > 0),
    stok INT NOT NULL DEFAULT 0 CHECK (stok >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4.4. TABEL: LAPORAN_SAMPAH
CREATE TABLE IF NOT EXISTS laporan_sampah (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    title VARCHAR(150) NOT NULL,
    photo_url TEXT NOT NULL,
    description TEXT,
    latitude DECIMAL(10, 7) NOT NULL CHECK (latitude BETWEEN -90 AND 90),
    longitude DECIMAL(10, 7) NOT NULL CHECK (longitude BETWEEN -180 AND 180),
    address TEXT NOT NULL,
    -- Relasi ke Micro-Tables (Kategori & Status)
    kategori_id UUID REFERENCES kategori_sampah(id) ON DELETE RESTRICT,
    status_id UUID REFERENCES status_laporan(id) ON DELETE RESTRICT,
    -- Kolom slug sekunder untuk backward compatibility
    category VARCHAR(50) NOT NULL DEFAULT 'sumbatan_sungai',
    status VARCHAR(50) NOT NULL DEFAULT 'menunggu_analisis',
    parent_id UUID REFERENCES laporan_sampah(id) ON DELETE CASCADE, -- NULL = Laporan Induk; NOT NULL = Update Warga B di tempat yg sama
    total_tanggapan INT NOT NULL DEFAULT 0 CHECK (total_tanggapan >= 0), -- Counter agregat respon warga
    total_update_laporan INT NOT NULL DEFAULT 0 CHECK (total_update_laporan >= 0), -- Jumlah foto & update lanjutan warga lain
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4.5. TABEL: TANGGAPAN_LAPORAN (Crowdsourced Responses / "100 Orang Menanggapi")
CREATE TABLE IF NOT EXISTS tanggapan_laporan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    laporan_id UUID NOT NULL REFERENCES laporan_sampah(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    tipe_id UUID REFERENCES master_tipe_tanggapan(id) ON DELETE SET NULL, -- Relasi ke Micro-Table
    tipe VARCHAR(50) NOT NULL DEFAULT 'konfirmasi_ada',
    komentar TEXT,
    photo_url TEXT, -- Bukti foto update kondisi saat ini (opsional)
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_laporan_user_tanggapan UNIQUE (laporan_id, user_id)
);

-- 4.6. TABEL: DATA_LINGKUNGAN (Snapshot Cuaca & Hidrologi saat Laporan Dibuat)
CREATE TABLE IF NOT EXISTS data_lingkungan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    laporan_id UUID NOT NULL UNIQUE REFERENCES laporan_sampah(id) ON DELETE CASCADE,
    observed_at TIMESTAMPTZ NOT NULL,
    weather_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    season_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    geographic_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    historical_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    source_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4.7. TABEL: ANALISIS_AI (Hasil Inferensi Multimodal Vision & Reasoning)
CREATE TABLE IF NOT EXISTS analisis_ai (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    laporan_id UUID NOT NULL UNIQUE REFERENCES laporan_sampah(id) ON DELETE CASCADE,
    jenis_kasus JSONB NOT NULL DEFAULT '{}'::jsonb,
    temuan_visual JSONB NOT NULL DEFAULT '{}'::jsonb,
    kondisi_lingkungan JSONB NOT NULL DEFAULT '{}'::jsonb,
    faktor_penyebab JSONB NOT NULL DEFAULT '[]'::jsonb,
    analisis_dampak JSONB NOT NULL DEFAULT '[]'::jsonb,
    analisis_risiko JSONB NOT NULL DEFAULT '{}'::jsonb,
    prediksi JSONB NOT NULL DEFAULT '{}'::jsonb,
    rekomendasi JSONB NOT NULL DEFAULT '[]'::jsonb,
    confidence_score NUMERIC(5, 2) CHECK (confidence_score BETWEEN 0.00 AND 100.00),
    data_quality JSONB NOT NULL DEFAULT '{}'::jsonb,
    analyzed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4.8. TABEL: PENJEMPUTAN_SAMPAH (Proof of Pickup & Penimbangan Riil oleh Pengepul)
CREATE TABLE IF NOT EXISTS penjemputan_sampah (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    laporan_id UUID NOT NULL UNIQUE REFERENCES laporan_sampah(id) ON DELETE CASCADE,
    pengepul_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    photo_bukti_bersih TEXT NOT NULL, -- Foto bukti lokasi setelah dibersihkan (After-Photo)
    berat_plastik_kg NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    berat_kardus_kg NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    berat_logam_kg NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    total_berat_kg NUMERIC(6, 2) NOT NULL CHECK (total_berat_kg > 0),
    nilai_ekonomi_rp NUMERIC(12, 2) NOT NULL DEFAULT 0.00, -- Nilai uang tebus/penjualan riil
    catatan TEXT,
    dijemput_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4.9. TABEL: PERINGATAN_DINI (Automated Early Warning Flood Broadcast)
CREATE TABLE IF NOT EXISTS peringatan_dini (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    laporan_id UUID NOT NULL REFERENCES laporan_sampah(id) ON DELETE CASCADE,
    tingkat_bahaya tingkat_bahaya_banjir NOT NULL DEFAULT 'waspada',
    pesan_peringatan TEXT NOT NULL,
    radius_peringatan_meter INT NOT NULL DEFAULT 500,
    estimasi_warga_terdampak INT NOT NULL DEFAULT 0,
    is_broadcast_sent BOOLEAN NOT NULL DEFAULT FALSE,
    broadcast_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4.10. TABEL: PENUKARAN_HADIAH (Klaim Hadiah & Snapshot Alamat Pengiriman)
CREATE TABLE IF NOT EXISTS penukaran_hadiah (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    hadiah_id UUID NOT NULL REFERENCES katalog_hadiah(id) ON DELETE RESTRICT,
    poin_terpotong INT NOT NULL CHECK (poin_terpotong > 0),
    status_klaim status_klaim_hadiah NOT NULL DEFAULT 'menunggu_konfirmasi',
    nama_penerima VARCHAR(100) NOT NULL,
    nomor_telepon VARCHAR(20) NOT NULL,
    alamat_pengiriman TEXT NOT NULL,
    kota_kabupaten VARCHAR(100) NOT NULL,
    kode_pos VARCHAR(10) NOT NULL,
    ekspedisi VARCHAR(50),
    nomor_resi VARCHAR(100),
    catatan_pengiriman TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4.11. TABEL: RIWAYAT_POIN (Buku Besar Transaksi / Ledger Mutasi Poin Warga)
CREATE TABLE IF NOT EXISTS riwayat_poin (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    laporan_id UUID REFERENCES laporan_sampah(id) ON DELETE SET NULL,
    klaim_id UUID REFERENCES penukaran_hadiah(id) ON DELETE SET NULL,
    jumlah_poin INT NOT NULL, -- Positif (+) perolehan, Negatif (-) penukaran
    tipe_transaksi tipe_transaksi_poin NOT NULL,
    deskripsi TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4.12. TABEL: RIWAYAT_STATUS_LAPORAN (Audit Trail Penanganan / Aksi Pengepul)
CREATE TABLE IF NOT EXISTS riwayat_status_laporan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    laporan_id UUID NOT NULL REFERENCES laporan_sampah(id) ON DELETE CASCADE,
    changed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 5. TRIGGERS & PROSEDUR OTOMATIS
-- ==============================================================================

-- A. TRIGGER ANTI-FRAUD POIN: Poin hanya cair jika AI verifikasi foto valid & confidence >= 70%
CREATE OR REPLACE FUNCTION fn_proses_validasi_ai_dan_poin()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_title VARCHAR(150);
    v_foto_valid BOOLEAN := FALSE;
    poin_cair INT := 50;
    v_status_terverifikasi_id UUID;
    v_status_ditolak_id UUID;
    v_risiko_text TEXT;
BEGIN
    SELECT user_id, title INTO v_user_id, v_title
    FROM laporan_sampah WHERE id = NEW.laporan_id;

    SELECT id INTO v_status_terverifikasi_id FROM status_laporan WHERE slug = 'terverifikasi_ai';
    SELECT id INTO v_status_ditolak_id FROM status_laporan WHERE slug = 'ditolak';

    IF NEW.data_quality ? 'foto_tersedia' THEN
        v_foto_valid := (NEW.data_quality->>'foto_tersedia')::boolean;
    END IF;

    -- Evaluasi Anti-Fraud
    IF NEW.confidence_score >= 70.00 AND v_foto_valid = TRUE THEN
        -- 1. Update status laporan (relasi ke micro table & kolom string)
        UPDATE laporan_sampah 
        SET status_id = v_status_terverifikasi_id,
            status = 'terverifikasi_ai',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.laporan_id;

        -- 2. Cairkan poin ke user (+50 Poin)
        UPDATE users 
        SET total_points = total_points + poin_cair,
            lifetime_points = lifetime_points + poin_cair,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = v_user_id;

        -- 3. Catat transaksi sah ke riwayat_poin
        INSERT INTO riwayat_poin (user_id, laporan_id, jumlah_poin, tipe_transaksi, deskripsi)
        VALUES (
            v_user_id,
            NEW.laporan_id,
            poin_cair,
            'laporan_terverifikasi_ai',
            'Poin reward verifikasi AI valid (Keyakinan ' || NEW.confidence_score || '%): ' || v_title
        );

        -- 4. Deteksi Otomatis Early Warning Banjir
        v_risiko_text := COALESCE(NEW.analisis_risiko->>'risiko_banjir', '');
        IF v_risiko_text ILIKE '%tinggi%' OR NEW.prediksi->>'tinggi_banjir_cm' IS NOT NULL THEN
            INSERT INTO peringatan_dini (laporan_id, tingkat_bahaya, pesan_peringatan, radius_peringatan_meter, is_broadcast_sent)
            VALUES (
                NEW.laporan_id,
                'siaga',
                'PERINGATAN DINI: Sumbatan sampah di ' || v_title || ' berpotensi memicu luapan air setinggi ' || 
                COALESCE(NEW.prediksi->>'tinggi_banjir_cm', '30-50') || ' cm jika hujan lebat berlanjut.',
                500,
                TRUE
            );
        END IF;

    ELSE
        -- Foto tidak valid / Spam / Confidence rendah (< 70%) -> Tolak laporan & Poin 0
        UPDATE laporan_sampah 
        SET status_id = v_status_ditolak_id,
            status = 'ditolak',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.laporan_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validasi_ai_poin ON analisis_ai;
CREATE TRIGGER trg_validasi_ai_poin
AFTER INSERT ON analisis_ai
FOR EACH ROW EXECUTE FUNCTION fn_proses_validasi_ai_dan_poin();

-- B. TRIGGER PENJEMPUTAN SAMPAH: Menyelesaikan laporan, catat audit, dan beri bonus
CREATE OR REPLACE FUNCTION fn_selesaikan_penjemputan_sampah()
RETURNS TRIGGER AS $$
DECLARE
    v_pelapor_id UUID;
    v_title VARCHAR(150);
    v_status_selesai_id UUID;
BEGIN
    SELECT user_id, title INTO v_pelapor_id, v_title
    FROM laporan_sampah WHERE id = NEW.laporan_id;

    SELECT id INTO v_status_selesai_id FROM status_laporan WHERE slug = 'selesai';

    -- 1. Update status laporan menjadi selesai
    UPDATE laporan_sampah 
    SET status_id = v_status_selesai_id,
        status = 'selesai',
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.laporan_id;

    -- 2. Catat riwayat audit
    INSERT INTO riwayat_status_laporan (laporan_id, changed_by_user_id, previous_status, new_status, note)
    VALUES (
        NEW.laporan_id,
        NEW.pengepul_id,
        'dalam_penanganan',
        'selesai',
        'Sampah berhasil diangkut (' || NEW.total_berat_kg || ' kg) dengan bukti foto bersih.'
    );

    -- 3. Beri bonus apresiasi ke warga pelapor awal (+25 poin)
    UPDATE users 
    SET total_points = total_points + 25,
        lifetime_points = lifetime_points + 25,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = v_pelapor_id;

    INSERT INTO riwayat_poin (user_id, laporan_id, jumlah_poin, tipe_transaksi, deskripsi)
    VALUES (
        v_pelapor_id,
        NEW.laporan_id,
        25,
        'bonus_sampah_terangkut',
        'Bonus penyelesaian: Sampah pada ' || v_title || ' telah tuntas diangkut oleh pengepul!'
    );

    -- 4. Beri reward kontribusi ke pengepul (+100 poin)
    UPDATE users 
    SET total_points = total_points + 100,
        lifetime_points = lifetime_points + 100,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.pengepul_id;

    INSERT INTO riwayat_poin (user_id, laporan_id, jumlah_poin, tipe_transaksi, deskripsi)
    VALUES (
        NEW.pengepul_id,
        NEW.laporan_id,
        100,
        'reward_pengepul',
        'Reward daur ulang: Berhasil mengangkut ' || NEW.total_berat_kg || ' kg sampah di ' || v_title
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_selesai_penjemputan ON penjemputan_sampah;
CREATE TRIGGER trg_selesai_penjemputan
AFTER INSERT ON penjemputan_sampah
FOR EACH ROW EXECUTE FUNCTION fn_selesaikan_penjemputan_sampah();

-- C. Trigger Counter Tanggapan & Update Laporan
CREATE OR REPLACE FUNCTION fn_update_total_tanggapan()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE laporan_sampah 
        SET total_tanggapan = total_tanggapan + 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.laporan_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE laporan_sampah 
        SET total_tanggapan = GREATEST(0, total_tanggapan - 1), updated_at = CURRENT_TIMESTAMP
        WHERE id = OLD.laporan_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tanggapan_counter ON tanggapan_laporan;
CREATE TRIGGER trg_tanggapan_counter
AFTER INSERT OR DELETE ON tanggapan_laporan
FOR EACH ROW EXECUTE FUNCTION fn_update_total_tanggapan();

CREATE OR REPLACE FUNCTION fn_update_total_update_laporan()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.parent_id IS NOT NULL THEN
        UPDATE laporan_sampah 
        SET total_update_laporan = total_update_laporan + 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.parent_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' AND OLD.parent_id IS NOT NULL THEN
        UPDATE laporan_sampah 
        SET total_update_laporan = GREATEST(0, total_update_laporan - 1), updated_at = CURRENT_TIMESTAMP
        WHERE id = OLD.parent_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_laporan_counter ON laporan_sampah;
CREATE TRIGGER trg_update_laporan_counter
AFTER INSERT OR DELETE ON laporan_sampah
FOR EACH ROW EXECUTE FUNCTION fn_update_total_update_laporan();

-- D. Trigger Potong Poin Klaim Hadiah
CREATE OR REPLACE FUNCTION fn_proses_klaim_hadiah()
RETURNS TRIGGER AS $$
DECLARE
    v_stok INT;
    v_poin_user INT;
    v_nama_hadiah VARCHAR(150);
BEGIN
    SELECT stok, nama_hadiah INTO v_stok, v_nama_hadiah
    FROM katalog_hadiah WHERE id = NEW.hadiah_id FOR UPDATE;

    IF v_stok < 1 THEN
        RAISE EXCEPTION 'Stok hadiah tidak mencukupi untuk diklaim.';
    END IF;

    SELECT total_points INTO v_poin_user
    FROM users WHERE id = NEW.user_id FOR UPDATE;

    IF v_poin_user < NEW.poin_terpotong THEN
        RAISE EXCEPTION 'Saldo poin tidak mencukupi (% poin) untuk klaim (% poin).', v_poin_user, NEW.poin_terpotong;
    END IF;

    UPDATE users 
    SET total_points = total_points - NEW.poin_terpotong, updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.user_id;

    UPDATE katalog_hadiah 
    SET stok = stok - 1, updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.hadiah_id;

    INSERT INTO riwayat_poin (user_id, klaim_id, jumlah_poin, tipe_transaksi, deskripsi)
    VALUES (
        NEW.user_id,
        NEW.id,
        -NEW.poin_terpotong,
        'tukar_hadiah',
        'Penukaran hadiah: ' || v_nama_hadiah
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_klaim_hadiah ON penukaran_hadiah;
CREATE TRIGGER trg_klaim_hadiah
BEFORE INSERT ON penukaran_hadiah
FOR EACH ROW EXECUTE FUNCTION fn_proses_klaim_hadiah();

-- ==============================================================================
-- 6. INDEXING STRATEGY
-- ==============================================================================

-- B-Tree Indexes
CREATE INDEX IF NOT EXISTS idx_laporan_user_id ON laporan_sampah(user_id);
CREATE INDEX IF NOT EXISTS idx_laporan_kategori_id ON laporan_sampah(kategori_id);
CREATE INDEX IF NOT EXISTS idx_laporan_status_id ON laporan_sampah(status_id);
CREATE INDEX IF NOT EXISTS idx_laporan_parent_id ON laporan_sampah(parent_id);
CREATE INDEX IF NOT EXISTS idx_laporan_created_at ON laporan_sampah(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_laporan_tanggapan ON laporan_sampah(total_tanggapan DESC);

CREATE INDEX IF NOT EXISTS idx_penjemputan_laporan_id ON penjemputan_sampah(laporan_id);
CREATE INDEX IF NOT EXISTS idx_penjemputan_pengepul_id ON penjemputan_sampah(pengepul_id);
CREATE INDEX IF NOT EXISTS idx_peringatan_laporan_id ON peringatan_dini(laporan_id);

CREATE INDEX IF NOT EXISTS idx_tanggapan_laporan_id ON tanggapan_laporan(laporan_id);
CREATE INDEX IF NOT EXISTS idx_tanggapan_tipe_id ON tanggapan_laporan(tipe_id);
CREATE INDEX IF NOT EXISTS idx_tanggapan_user_id ON tanggapan_laporan(user_id);

CREATE INDEX IF NOT EXISTS idx_alamat_user_id ON alamat_pengguna(user_id);
CREATE INDEX IF NOT EXISTS idx_riwayat_poin_user_id ON riwayat_poin(user_id);
CREATE INDEX IF NOT EXISTS idx_penukaran_hadiah_user_id ON penukaran_hadiah(user_id);
CREATE INDEX IF NOT EXISTS idx_penukaran_hadiah_status ON penukaran_hadiah(status_klaim);

-- Spatial B-Tree / GiST Index untuk Koordinat
CREATE INDEX IF NOT EXISTS idx_laporan_coords ON laporan_sampah USING gist (
    box(point(longitude, latitude), point(longitude, latitude))
);

-- GIN Indexes untuk Query Dokumen JSONB
CREATE INDEX IF NOT EXISTS idx_analisis_jenis_kasus ON analisis_ai USING gin (jenis_kasus jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_analisis_risiko ON analisis_ai USING gin (analisis_risiko jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_analisis_temuan_visual ON analisis_ai USING gin (temuan_visual jsonb_path_ops);

-- ==============================================================================
-- 7. OPTIMIZED VIEW UNTUK PETA INTERAKTIF (JOIN MICRO-TABLES)
-- ==============================================================================
CREATE OR REPLACE VIEW view_peta_interaktif AS
SELECT 
    l.id AS laporan_id,
    l.title,
    l.photo_url,
    l.latitude,
    l.longitude,
    l.address,
    -- Data Kategori dari Micro-Table
    COALESCE(k.slug, l.category) AS category_slug,
    COALESCE(k.nama, 'Lainnya') AS category_name,
    COALESCE(k.icon, '🗑️') AS category_icon,
    COALESCE(k.warna_badge, '#ef4444') AS category_color,
    -- Data Status dari Micro-Table
    COALESCE(s.slug, l.status) AS status_slug,
    COALESCE(s.nama, 'Menunggu Analisis') AS status_name,
    COALESCE(s.warna_badge, '#64748b') AS status_color,
    l.total_tanggapan,       -- Angka tanggapan/upvote warga
    l.total_update_laporan,  -- Jumlah laporan/foto update warga lain di titik ini
    l.created_at,
    u.username AS pelapor_username,
    u.total_points AS pelapor_points,
    -- Metrik AI Pop-up Card
    a.temuan_visual->'estimasi_volume_m3'->>'nilai' AS volume_m3,
    a.temuan_visual->>'estimasi_sumbatan_persen' AS sumbatan_persen,
    a.analisis_risiko->>'risiko_banjir' AS tingkat_risiko_banjir,
    a.prediksi->>'tinggi_banjir_cm' AS estimasi_tinggi_banjir_cm,
    a.confidence_score,
    a.analyzed_at,
    d.weather_data->>'curah_hujan_24_jam_mm' AS curah_hujan_24_jam_mm,
    -- Data Penjemputan Pengepul & Early Warning
    p.total_berat_kg AS berat_sampah_terangkut_kg,
    p.photo_bukti_bersih,
    w.tingkat_bahaya AS status_early_warning_banjir
FROM laporan_sampah l
LEFT JOIN users u ON l.user_id = u.id
LEFT JOIN kategori_sampah k ON l.kategori_id = k.id
LEFT JOIN status_laporan s ON l.status_id = s.id
LEFT JOIN analisis_ai a ON l.id = a.laporan_id
LEFT JOIN data_lingkungan d ON l.id = d.laporan_id
LEFT JOIN penjemputan_sampah p ON l.id = p.laporan_id
LEFT JOIN peringatan_dini w ON l.id = w.laporan_id
WHERE l.parent_id IS NULL;
