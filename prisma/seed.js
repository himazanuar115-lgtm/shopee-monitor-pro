/* eslint-disable no-console */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function isoDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

async function main() {
  // Avoid reseeding on every run (best-effort)
  const existing = await prisma.user.findFirst({ where: { email: 'admin@shopee-monitor-pro.local' } });
  if (existing) {
    console.log('Seed: admin user already exists, skipping reseed');
    return;
  }

  const passwordHash = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@shopee-monitor-pro.local',
      name: 'Admin Shopee',
      password: passwordHash,
      role: 'ADMIN',
      isActive: true,
    },
  });

  const staff = await prisma.user.create({
    data: {
      email: 'staff@shopee-monitor-pro.local',
      name: 'Staff Shopee',
      password: passwordHash,
      role: 'STAFF',
      isActive: true,
    },
  });

  const viewer = await prisma.user.create({
    data: {
      email: 'viewer@shopee-monitor-pro.local',
      name: 'Viewer Shopee',
      password: passwordHash,
      role: 'VIEWER',
      isActive: true,
    },
  });

  const users = [admin, staff, viewer];

  const storeNames = [
    'Batik Nusantara',
    'Fashion Street',
    'Elektrik Jaya',
    'Healthy Market',
    'Smart Home',
    'Kuliner Rumahan',
    'Shoe Corner',
    'Bunda Store',
    'Tech Corner',
    'Garden & Home',
  ];

  const stores = [];
  for (let i = 0; i < 10; i++) {
    const owner = pick(users);
    const isConnected = i % 3 !== 2; // mostly connected
    const rating = Number((4 + Math.random() * 0.9).toFixed(2));

    const lastSyncAt = isConnected ? isoDaysAgo(randInt(0, 3)) : null;

    const conversionRate = Number((1 + Math.random() * 8).toFixed(2)); // percent

    const store = await prisma.store.create({
      data: {
        userId: owner.id,
        name: storeNames[i],
        shopeeId: `SHOP-${1000 + i}`,
        apiKey: `api_key_${i}`,
        apiSecret: `api_secret_${i}`,
        status: isConnected ? 'ACTIVE' : 'PENDING',
        rating,
        totalOrders: 0,
        totalRevenue: 0,
        totalProducts: 0,
        totalChats: 0,
        totalVisitors: randInt(800, 4000),
        conversionRate,
        lastSyncAt,
        isConnected,
      },
    });

    stores.push(store);
  }

  const productNames = [
    'Kemeja Pria',
    'Celana Jeans',
    'Botol Minum',
    'Tumbler Stainless',
    'Headset Wireless',
    'Adaptor USB-C',
    'Sandal Casual',
    'Makanan Ringan',
    'Panci Anti Lengket',
    'Lampu LED',
  ];

  const skuUsed = new Set();

  const products = [];
  for (let i = 0; i < 200; i++) {
    const store = pick(stores);
    const skuBase = `SKU-${store.shopeeId}-${i}`;
    const sku = skuUsed.has(skuBase) ? `${skuBase}-${randInt(1, 999)}` : skuBase;
    skuUsed.add(sku);

    const price = randInt(15000, 250000);
    const stock = randInt(0, 120);
    const sold = randInt(0, 300);
    const isLowStock = stock <= 10;

    const status = stock <= 0 ? 'OUT_OF_STOCK' : (Math.random() < 0.92 ? 'ACTIVE' : 'INACTIVE');

    const product = await prisma.product.create({
      data: {
        userId: store.userId,
        storeId: store.id,
        shopeeId: `SP-${20000 + i}`,
        name: pick(productNames) + ` #${i + 1}`,
        sku,
        description: 'Dummy data product untuk Shopee Monitor Pro',
        price,
        stock,
        sold,
        images: [],
        status,
        isLowStock,
      },
    });

    products.push(product);
  }

  const orderStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'];
  const paymentStatuses = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'];

  const buyerNames = [
    'Rizky',
    'Siti',
    'Andi',
    'Dewi',
    'Budi',
    'Nina',
    'Fajar',
    'Aulia',
    'Rama',
    'Putri',
  ];

  const orders = [];
  // 100 orders, each with 1-3 items
  for (let i = 0; i < 100; i++) {
    const store = pick(stores);
    const createdAt = isoDaysAgo(randInt(0, 30));

    const orderNumber = `ORD-${store.shopeeId}-${1000 + i}`;
    const status = pick(orderStatuses);
    const paymentStatus = pick(paymentStatuses);

    const itemCount = randInt(1, 3);

    const items = [];
    let totalAmount = 0;

    for (let j = 0; j < itemCount; j++) {
      const product = pick(products.filter((p) => p.storeId === store.id));
      const quantity = randInt(1, 5);
      totalAmount += product.price * quantity;
      items.push({
        productId: product.id,
        quantity,
        price: product.price,
      });
    }

    const order = await prisma.order.create({
      data: {
        userId: store.userId,
        storeId: store.id,
        orderNumber,
        buyerName: pick(buyerNames) + ` ${randInt(1, 99)}`,
        buyerPhone: `08${randInt(1000000000, 9999999999)}`,
        buyerAddress: 'Dummy address untuk seed',
        totalAmount,
        status,
        paymentStatus,
        items: {
          create: items.map((it) => ({
            productId: it.productId,
            quantity: it.quantity,
            price: it.price,
          })),
        },
        createdAt,
      },
      include: { items: true },
    });

    orders.push(order);
  }

  // Chats (50)
  const chatMessages = [
    'Barangnya masih tersedia? ',
    'Min, bisa COD?',
    'Kapan pengiriman?',
    'Apakah ada ukuran lain?',
    'Bisa diskon?',
    'Resi sudah ada?',
  ];

  for (let i = 0; i < 50; i++) {
    const store = pick(stores);
    const product = pick(products.filter((p) => p.storeId === store.id));

    const isReplied = Math.random() < 0.45;
    const status = isReplied ? 'REPLIED' : 'UNREAD';

    const message = pick(chatMessages) + ` (${randInt(10, 99)})`;

    const chat = await prisma.chat.create({
      data: {
        userId: store.userId,
        storeId: store.id,
        buyerName: pick(buyerNames) + ` ${randInt(1, 99)}`,
        buyerAvatar: null,
        productName: product.name,
        message,
        status,
        isReplied,
        reply: isReplied ? 'Terima kasih, sudah kami proses ya 🙏' : null,
        createdAt: isoDaysAgo(randInt(0, 10)),
        repliedAt: isReplied ? isoDaysAgo(randInt(0, 10)) : null,
      },
    });

    void chat;
  }

  // Notifications (derive some basics)
  for (let i = 0; i < 30; i++) {
    const store = pick(stores);
    const type = pick(['NEW_ORDER', 'NEW_CHAT', 'LOW_STOCK', 'RATING_DROP', 'STORE_OFFLINE']);

    await prisma.notification.create({
      data: {
        userId: store.userId,
        storeId: store.id,
        type,
        title: 'Notifikasi seed',
        message: `Seed notification ${type} untuk ${store.name}`,
        data: { seed: true },
        isRead: Math.random() < 0.5 ? false : true,
        createdAt: isoDaysAgo(randInt(0, 7)),
      },
    });
  }

  // Sample reports per owner
  const reportTemplates = [
    { title: 'Laporan Harian', type: 'DAILY', days: 1 },
    { title: 'Laporan Mingguan', type: 'WEEKLY', days: 7 },
    { title: 'Laporan Bulanan', type: 'MONTHLY', days: 30 },
  ];

  for (const user of users) {
    const userStores = stores.filter((store) => store.userId === user.id);
    const userOrders = orders.filter((order) => userStores.some((store) => store.id === order.storeId));

    for (const template of reportTemplates) {
      const startDate = isoDaysAgo(template.days);
      const endDate = new Date();
      const reportOrders = userOrders.filter((order) => order.createdAt >= startDate);
      const totalRevenue = reportOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      const totalProducts = products.filter((product) => userStores.some((store) => store.id === product.storeId)).length;
      const totalChats = await prisma.chat.count({
        where: {
          storeId: { in: userStores.map((store) => store.id) },
          createdAt: { gte: startDate },
        },
      });

      await prisma.report.create({
        data: {
          userId: user.id,
          title: template.title,
          description: `Ringkasan ${template.title.toLowerCase()} untuk toko Shopee Anda`,
          type: template.type,
          storeIds: userStores.map((store) => store.id),
          startDate,
          endDate,
          totalRevenue,
          totalOrders: reportOrders.length,
          totalProducts,
          totalChats,
          conversionRate: Number((Math.random() * 10 + 1).toFixed(2)),
          data: { generatedFromSeed: true },
        },
      });
    }
  }

  // Update derived store metrics (best-effort)
  for (const store of stores) {
    const storeProducts = products.filter((p) => p.storeId === store.id);
    const storeOrders = orders.filter((o) => o.storeId === store.id);
    const storeChats = await prisma.chat.count({ where: { storeId: store.id } });

    const totalRevenue = storeOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOrders = storeOrders.length;
    const totalProducts = storeProducts.length;

    await prisma.store.update({
      where: { id: store.id },
      data: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalChats: storeChats,
      },
    });
  }

  console.log('Seed: completed');
}

main()
  .then(() => {
    prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });


