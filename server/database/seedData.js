// seedData.js - Initial Seeds for Ternakmart (Production-grade Realistic Data)
const bcrypt = require('bcryptjs');

const defaultPasswordHash = bcrypt.hashSync('Password123!', 10);
const now = new Date().toISOString();

const users = [
  {
    id: 'usr_admin_001',
    name: 'Super Admin Ternakmart',
    username: 'admin',
    email: 'admin@ternakmart.id',
    password_hash: defaultPasswordHash,
    phone_number: '+6281234567890',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    address: 'Kantor Pusat Ternakmart, Jl. Agrowisata No. 88, Menteng, Jakarta Pusat',
    latitude: -6.1954,
    longitude: 106.8285,
    role: 'ADMIN',
    created_at: now,
    updated_at: now
  },
  {
    id: 'usr_seller_001',
    name: 'H. Syamsul Bahri (Peternakan Barokah Farm)',
    username: 'barokahfarm',
    email: 'syamsul@barokahfarm.id',
    password_hash: defaultPasswordHash,
    phone_number: '+6281398765432',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    address: 'Kompleks Peternakan Barokah, Cijeruk, Bogor, Jawa Barat',
    latitude: -6.6895,
    longitude: 106.7869,
    role: 'SELLER',
    created_at: now,
    updated_at: now
  },
  {
    id: 'usr_seller_002',
    name: 'Bpk. Hendra Gunawan (Sentra Domba Priangan)',
    username: 'dombapriangan',
    email: 'hendra@dombapriangan.id',
    password_hash: defaultPasswordHash,
    phone_number: '+6281223344556',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    address: 'Kandang Utama Pasirwangi, Garut, Jawa Barat',
    latitude: -7.2278,
    longitude: 107.8284,
    role: 'SELLER',
    created_at: now,
    updated_at: now
  },
  {
    id: 'usr_buyer_001',
    name: 'Ahmad Fauzi Rahman',
    username: 'fauzirahman',
    email: 'fauzi@gmail.com',
    password_hash: defaultPasswordHash,
    phone_number: '+6285711223344',
    avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80',
    address: 'Jl. Tebet Barat Dalam VII No. 14, Jakarta Selatan',
    latitude: -6.2415,
    longitude: 106.8532,
    role: 'BUYER',
    created_at: now,
    updated_at: now
  },
  {
    id: 'usr_courier_001',
    name: 'Bambang Sudiro (Armada Khusus Ternak Express)',
    username: 'bambangcourier',
    email: 'bambang@logistikternak.id',
    password_hash: defaultPasswordHash,
    phone_number: '+6287899887766',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    address: 'Pool Logistik Ternakmart, Cibinong, Bogor',
    latitude: -6.4827,
    longitude: 106.8576,
    role: 'COURIER',
    created_at: now,
    updated_at: now
  }
];

const stores = [
  {
    id: 'store_001',
    user_id: 'usr_seller_001',
    store_name: 'Barokah Cattle & Goat Farm',
    store_slug: 'barokah-farm',
    description: 'Peternakan sapi potong pedaging unggulan & kambing perah berlisensi resmi dinas peternakan. Semua hewan bersertifikat SKKH & bebas PMK.',
    farm_address: 'Jl. Raya Cijeruk Km. 5, Bogor, Jawa Barat',
    latitude: -6.6895,
    longitude: 106.7869,
    farm_photo_url: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800&auto=format&fit=crop&q=80',
    nib_sku_number: 'NIB-9120304859218',
    bank_name: 'BCA',
    bank_account_number: '8830192841',
    bank_account_holder: 'H SYAMSUL BAHRI',
    tier: 'OFFICIAL',
    status: 'ACTIVE',
    rating_average: 4.95,
    total_reviews: 48,
    created_at: now,
    updated_at: now
  },
  {
    id: 'store_002',
    user_id: 'usr_seller_002',
    store_name: 'Sentra Domba & Kambing Priangan',
    store_slug: 'domba-priangan',
    description: 'Pusat pembibitan dan penggemukan domba garut jawara dan kambing etawa super. Berpengalaman 15 tahun menyediakan hewan qurban dan aqiqah.',
    farm_address: 'Kawasan Agrowisata Pasirwangi, Garut, Jawa Barat',
    latitude: -7.2278,
    longitude: 107.8284,
    farm_photo_url: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800&auto=format&fit=crop&q=80',
    nib_sku_number: 'NIB-3102948572019',
    bank_name: 'MANDIRI',
    bank_account_number: '1310029384910',
    bank_account_holder: 'HENDRA GUNAWAN',
    tier: 'PLATINUM',
    status: 'ACTIVE',
    rating_average: 4.88,
    total_reviews: 32,
    created_at: now,
    updated_at: now
  }
];

const animals = [
  {
    id: 'anm_001',
    store_id: 'store_001',
    title: 'Sapi Limosin Super Jumbo 850kg (Si Bima)',
    slug: 'sapi-limosin-super-jumbo-850kg-bima',
    category: 'SAPI',
    breed: 'Limosin Cross',
    weight_kg: 850.5,
    age_months: 32,
    gender: 'JANTAN',
    teeth_poel: 'POEL_2',
    vaccination_status: 'Lengkap (Vaksin PMK 1, PMK 2, Booster & Antraks)',
    skkh_certificate_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
    skkh_verification_status: true,
    price: 48500000,
    is_qurban_eligible: true,
    status: 'AVAILABLE',
    images: [
      'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=800&auto=format&fit=crop&q=80'
    ],
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    created_at: now,
    updated_at: now
  },
  {
    id: 'anm_002',
    store_id: 'store_001',
    title: 'Sapi Simental Super Gagah 720kg (Arjuna)',
    slug: 'sapi-simental-super-gagah-720kg-arjuna',
    category: 'SAPI',
    breed: 'Simental Murni',
    weight_kg: 720.0,
    age_months: 28,
    gender: 'JANTAN',
    teeth_poel: 'POEL_1',
    vaccination_status: 'Vaksin PMK Dosis 2 & Vitamin B Kompleks',
    skkh_certificate_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
    skkh_verification_status: true,
    price: 39500000,
    is_qurban_eligible: true,
    status: 'AVAILABLE',
    images: [
      'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800&auto=format&fit=crop&q=80'
    ],
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    created_at: now,
    updated_at: now
  },
  {
    id: 'anm_003',
    store_id: 'store_002',
    title: 'Domba Garut Tanduk Mewah Kelas A 65kg',
    slug: 'domba-garut-tanduk-mewah-kelas-a-65kg',
    category: 'DOMBA',
    breed: 'Garut Tanduk Meliuk',
    weight_kg: 65.2,
    age_months: 22,
    gender: 'JANTAN',
    teeth_poel: 'POEL_1',
    vaccination_status: 'Vaksinasi Lengkap & Obat Cacing Rutin',
    skkh_certificate_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
    skkh_verification_status: true,
    price: 6800000,
    is_qurban_eligible: true,
    status: 'AVAILABLE',
    images: [
      'https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800&auto=format&fit=crop&q=80'
    ],
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    created_at: now,
    updated_at: now
  },
  {
    id: 'anm_004',
    store_id: 'store_002',
    title: 'Kambing Etawa Ras Senduro Super 55kg',
    slug: 'kambing-etawa-ras-senduro-super-55kg',
    category: 'KAMBING',
    breed: 'Etawa Senduro',
    weight_kg: 55.0,
    age_months: 20,
    gender: 'JANTAN',
    teeth_poel: 'POEL_1',
    vaccination_status: 'Vaksin PMK Dosis 2 & Antirabies Ternak',
    skkh_certificate_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
    skkh_verification_status: true,
    price: 5200000,
    is_qurban_eligible: true,
    status: 'AVAILABLE',
    images: [
      'https://images.unsplash.com/photo-1524024973431-2ad916746881?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?w=800&auto=format&fit=crop&q=80'
    ],
    video_url: '',
    created_at: now,
    updated_at: now
  },
  {
    id: 'anm_005',
    store_id: 'store_001',
    title: 'Kerbau Rawa Sumbawa Gemuk Sehat 580kg',
    slug: 'kerbau-rawa-sumbawa-gemuk-sehat-580kg',
    category: 'KERBAU',
    breed: 'Kerbau Rawa Lokal',
    weight_kg: 580.0,
    age_months: 36,
    gender: 'JANTAN',
    teeth_poel: 'POEL_2',
    vaccination_status: 'SKKH Sehat Bebas Penyakit Menular Hewan',
    skkh_certificate_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
    skkh_verification_status: true,
    price: 32000000,
    is_qurban_eligible: true,
    status: 'AVAILABLE',
    images: [
      'https://images.unsplash.com/photo-1557008075-7f2c5efa4cfd?w=800&auto=format&fit=crop&q=80'
    ],
    video_url: '',
    created_at: now,
    updated_at: now
  }
];

const courier_fleets = [
  {
    id: 'fleet_001',
    user_id: 'usr_courier_001',
    vehicle_type: 'ENGKEL_TRUCK',
    plate_number: 'B 9482 TNA',
    driver_name: 'Bambang Sudiro',
    phone_number: '+6287899887766',
    is_active: true,
    created_at: now,
    updated_at: now
  }
];

const vouchers = [
  {
    id: 'vch_001',
    creator_id: 'usr_admin_001',
    store_id: null,
    voucher_code: 'QURBANBERKAH',
    discount_type: 'NOMINAL',
    discount_value: 500000,
    min_purchase: 5000000,
    max_discount_cap: 500000,
    is_shipping_subsidy: false,
    start_time: '2026-01-01T00:00:00.000Z',
    end_time: '2026-12-31T23:59:59.000Z',
    quota: 100,
    used_count: 8,
    created_at: now,
    updated_at: now
  },
  {
    id: 'vch_002',
    creator_id: 'usr_admin_001',
    store_id: null,
    voucher_code: 'GRATISONGKIRJABO',
    discount_type: 'NOMINAL',
    discount_value: 250000,
    min_purchase: 4000000,
    max_discount_cap: 250000,
    is_shipping_subsidy: true,
    start_time: '2026-01-01T00:00:00.000Z',
    end_time: '2026-12-31T23:59:59.000Z',
    quota: 200,
    used_count: 15,
    created_at: now,
    updated_at: now
  }
];

const system_settings = [
  {
    id: 'setting_001',
    key_name: 'platform_identity',
    value_json: {
      app_name: 'Ternakmart',
      tagline: 'Platform E-Commerce Peternakan & Logistik Armada Mandiri Terpercaya',
      app_logo_url: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=128&auto=format&fit=crop&q=80',
      app_favicon_url: 'https://cdn-icons-png.flaticon.com/512/616/616408.png',
      active_theme: 'emerald-agro',
      timezone_offset: 'Asia/Jakarta',
      timezone_label: 'WIB (UTC+7)',
      service_fee_nominal: 35000,
      min_free_shipping_nominal: 10000000,
      support_whatsapp: '+6281234567890',
      bank_accounts: [
        { bank: 'BCA', account_number: '8830192841', account_holder: 'PT TERNAKMART INDONESIA' },
        { bank: 'MANDIRI', account_number: '1310029384910', account_holder: 'PT TERNAKMART INDONESIA' },
        { bank: 'BRI', account_number: '034101000982301', account_holder: 'PT TERNAKMART INDONESIA' },
        { bank: 'BNI', account_number: '9928172635', account_holder: 'PT TERNAKMART INDONESIA' }
      ]
    },
    updated_at: now
  }
];

const carts = [
  {
    id: 'cart_001',
    user_id: 'usr_buyer_001',
    items_json: [],
    updated_at: now
  }
];

const orders = [
  {
    id: 'ord_demo_001',
    invoice_number: 'INV-TNK-202609-0001',
    buyer_id: 'usr_buyer_001',
    store_id: 'store_001',
    animal_id: 'anm_001',
    base_price: 48500000,
    store_discount: 0,
    admin_discount: 500000,
    shipping_fee: 450000,
    shipping_subsidy: 250000,
    service_fee: 35000,
    grand_total: 48235000,
    payment_method: 'MANUAL_TRANSFER',
    payment_status: 'PAID',
    payment_proof_url: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=600&auto=format&fit=crop&q=80',
    status: 'IN_TRANSIT',
    courier_id: 'usr_courier_001',
    logistics_type: 'OFFICIAL_COURIER',
    tracking_number: 'TRK-TNK-88912',
    delivery_address: 'Jl. Tebet Barat Dalam VII No. 14, Tebet, Jakarta Selatan',
    dest_lat: -6.2415,
    dest_lng: 106.8532,
    created_at: '2026-09-10T08:00:00.000Z',
    updated_at: now
  }
];

const order_tracking_logs = [
  {
    id: 'trklog_001',
    order_id: 'ord_demo_001',
    courier_id: 'usr_courier_001',
    latitude: -6.6895,
    longitude: 106.7869,
    status_label: 'Hewan dimuat ke truk di Kandang Barokah Farm',
    notes: 'Kondisi fisik sapi sehat, nafsu makan baik, SKKH telah diserahterimakan.',
    is_rest_stop: false,
    proof_photo_url: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=600&auto=format&fit=crop&q=80',
    recorded_at: '2026-09-10T10:30:00.000Z'
  },
  {
    id: 'trklog_002',
    order_id: 'ord_demo_001',
    courier_id: 'usr_courier_001',
    latitude: -6.5500,
    longitude: 106.8100,
    status_label: 'Rest Stop Checkpoint 1 (Tol Jagorawi KM 45)',
    notes: 'Pemberian pakan konsentrat & air minum gula merah. Suhu tubuh normal, hewan rileks.',
    is_rest_stop: true,
    proof_photo_url: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&auto=format&fit=crop&q=80',
    recorded_at: '2026-09-10T12:15:00.000Z'
  },
  {
    id: 'trklog_003',
    order_id: 'ord_demo_001',
    courier_id: 'usr_courier_001',
    latitude: -6.3800,
    longitude: 106.8350,
    status_label: 'Armada mendekati area Tebet, Jakarta Selatan',
    notes: 'Estimasi tiba dalam 35 menit. Driver menghubungi pihak penerima.',
    is_rest_stop: false,
    proof_photo_url: '',
    recorded_at: '2026-09-10T13:40:00.000Z'
  }
];

const order_audit_logs = [
  {
    id: 'aud_001',
    order_id: 'ord_demo_001',
    actor_id: 'usr_buyer_001',
    actor_role: 'BUYER',
    from_status: 'NONE',
    to_status: 'AWAITING_PAYMENT',
    notes: 'Checkout pesanan baru dengan metode Transfer Bank Manual BCA.',
    ip_address: '180.252.164.20',
    recorded_at: '2026-09-10T08:00:00.000Z'
  },
  {
    id: 'aud_002',
    order_id: 'ord_demo_001',
    actor_id: 'usr_buyer_001',
    actor_role: 'BUYER',
    from_status: 'AWAITING_PAYMENT',
    to_status: 'AWAITING_APPROVAL',
    notes: 'Pembeli mengunggah bukti transfer ATM BCA nominal Rp 48.235.000.',
    ip_address: '180.252.164.20',
    recorded_at: '2026-09-10T08:25:00.000Z'
  },
  {
    id: 'aud_003',
    order_id: 'ord_demo_001',
    actor_id: 'usr_admin_001',
    actor_role: 'ADMIN',
    from_status: 'AWAITING_APPROVAL',
    to_status: 'PAID',
    notes: 'Bukti transfer valid dan dana mutasi rekening terkonfirmasi.',
    ip_address: '103.111.201.8',
    recorded_at: '2026-09-10T09:00:00.000Z'
  },
  {
    id: 'aud_004',
    order_id: 'ord_demo_001',
    actor_id: 'usr_courier_001',
    actor_role: 'COURIER',
    from_status: 'HEALTH_INSPECTION',
    to_status: 'IN_TRANSIT',
    notes: 'Pemeriksaan kesehatan lolos dan hewan dalam perjalanan dengan armada TRK-TNK-88912.',
    ip_address: '36.88.12.94',
    recorded_at: '2026-09-10T10:30:00.000Z'
  }
];

const chats = [
  {
    id: 'chat_001',
    sender_id: 'usr_buyer_001',
    receiver_id: 'usr_seller_001',
    animal_context_id: 'anm_001',
    message: 'Halo Pak Haji Syamsul, apakah Sapi Limosin 850kg (Si Bima) ini siap dikirim ke Tebet H-3 Idul Adha?',
    negotiated_price: 47500000,
    is_read: true,
    created_at: '2026-09-09T14:10:00.000Z'
  },
  {
    id: 'chat_002',
    sender_id: 'usr_seller_001',
    receiver_id: 'usr_buyer_001',
    animal_context_id: 'anm_001',
    message: 'Waalaikumsalam Mas Fauzi, sangat siap. Free titip rawat di kandang kami sampai H-3, pakan konsentrat terjamin. Untuk harga pasnya Rp 48.000.000 ya.',
    negotiated_price: 48000000,
    is_read: true,
    created_at: '2026-09-09T14:25:00.000Z'
  }
];

const reviews = [
  {
    id: 'rev_001',
    order_id: 'ord_demo_001',
    user_id: 'usr_buyer_001',
    store_id: 'store_001',
    animal_id: 'anm_001',
    rating: 5,
    weight_match_rating: 5,
    comment: 'Luar biasa Barokah Farm! Sapi tiba tepat waktu, armada sangat nyaman dan tidak stres karena ada rest stop pakan. Timbangan riil akurat 851 kg.',
    media_urls: ['https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=600&auto=format&fit=crop&q=80'],
    created_at: now
  },
  {
    id: 'rev_002',
    order_id: 'ord_demo_002',
    user_id: 'usr_buyer_001',
    store_id: 'store_001',
    animal_id: 'anm_002',
    rating: 5,
    weight_match_rating: 5,
    comment: 'Tanduk dan postur domba garut sangat gagah. Surat SKKH karantina dinas lengkap dan timbangan ditimbang ulang di depan rumah pas 75 kg.',
    media_urls: ['https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?w=600&auto=format&fit=crop&q=80'],
    created_at: now
  },
  {
    id: 'rev_003',
    order_id: 'ord_demo_003',
    user_id: 'usr_buyer_001',
    store_id: 'store_002',
    animal_id: 'anm_003',
    rating: 5,
    weight_match_rating: 5,
    comment: 'Pengantaran dengan armada pendingin berjalan lancar dari Bandung ke Jakarta. Sopir kurir ramah dan hewan sangat sehat aktif.',
    media_urls: [],
    created_at: now
  }
];

module.exports = {
  users,
  stores,
  animals,
  carts,
  orders,
  order_tracking_logs,
  order_audit_logs,
  courier_fleets,
  chats,
  reviews,
  vouchers,
  system_settings
};
