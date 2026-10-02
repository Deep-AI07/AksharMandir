import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Akshar Mandir Database Seeding ---');

  // Clean existing data
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customOrderImage.deleteMany();
  await prisma.customOrder.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.address.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.websiteContent.deleteMany();
  await prisma.storeSetting.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleared existing records.');

  // 1. Create Admin & Customer Users
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const customerPassword = await bcrypt.hash('Customer@123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Akshar Mandir Admin',
      email: 'admin@aksharmandir.com',
      passwordHash: adminPassword,
      phone: '+91 98765 43210',
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: 'Sanctum Devotee',
      email: 'customer@aksharmandir.com',
      passwordHash: customerPassword,
      phone: '+91 98765 43210',
      role: 'CUSTOMER',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      preferredDeity: 'Radha Krishna & Lord Shiva',
    },
  });

  const customerDeepPassword = await bcrypt.hash('deep@123', 10);
  await prisma.user.create({
    data: {
      name: 'Deep Devotee',
      email: 'abc123@gmail.com',
      passwordHash: customerDeepPassword,
      phone: '+91 98765 43210',
      role: 'CUSTOMER',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      preferredDeity: 'Shree Swaminarayan & Radha Krishna',
    },
  });

  // Customer Addresses
  const address1 = await prisma.address.create({
    data: {
      userId: customer.id,
      fullName: 'Devkrishna Sharma',
      phone: '+91 98765 43210',
      streetAddress: 'Flat 402, Shanti Nilayam Apartments, 14th Cross',
      apartment: 'Near Temple Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      type: 'Home',
      isDefault: true,
    },
  });

  await prisma.address.create({
    data: {
      userId: customer.id,
      fullName: 'Devkrishna Sharma',
      phone: '+91 98765 43210',
      streetAddress: 'Plot 18, Heritage Enclave, Civil Lines',
      city: 'Jaipur',
      state: 'Rajasthan',
      pincode: '302006',
      type: 'Sanctum',
      isDefault: false,
    },
  });

  console.log('Created Users & Addresses.');

  // 2. Categories (Mandir Types)
  const catTraditional = await prisma.category.create({
    data: {
      name: 'Traditional Mandirs',
      slug: 'traditional',
      description: 'Rich Jaali carvings, brass bells & solid seasoned Sheesham wood.',
      image: '/images/mandirs/mandir_royal_sheesham.jpg',
      badge: 'Heritage Classic',
      orderIndex: 1,
      isActive: true,
    },
  });

  const catModern = await prisma.category.create({
    data: {
      name: 'Modern Mandirs',
      slug: 'modern',
      description: 'Clean architectural lines & integrated backlit warm aura lighting.',
      image: '/images/mandirs/mandir_aura_modern.jpg',
      badge: 'Contemporary',
      orderIndex: 2,
      isActive: true,
    },
  });

  const catHome = await prisma.category.create({
    data: {
      name: 'Home Mandirs',
      slug: 'home-mandirs',
      description: 'Space-conscious shrines thoughtfully crafted for modern urban homes.',
      image: '/images/mandirs/mandir_devi_sanctum.jpg',
      badge: 'Wall & Floor',
      orderIndex: 3,
      isActive: true,
    },
  });

  const catTemple = await prisma.category.create({
    data: {
      name: 'Temple Style Mandirs',
      slug: 'temple-style',
      description: 'Grand multi-tier Shikhar, hand-sculpted pillars and authentic Gopurams.',
      image: '/images/mandirs/mandir_grand_haveli.jpg',
      badge: 'Masterpiece',
      orderIndex: 4,
      isActive: true,
    },
  });

  const catDesigner = await prisma.category.create({
    data: {
      name: 'Designer Mandirs',
      slug: 'designer',
      description: 'Exclusive limited-edition sanctums with pure brass lotus inlays.',
      image: '/images/mandirs/mandir_lotus_brass.jpg',
      badge: 'Artisanal',
      orderIndex: 5,
      isActive: true,
    },
  });

  const catCompact = await prisma.category.create({
    data: {
      name: 'Compact Mandirs',
      slug: 'compact',
      description: 'Space-optimized wall mounted sanctuaries for apartments.',
      image: '/images/mandirs/mandir_wall_shrine.jpg',
      badge: 'Apartment Choice',
      orderIndex: 6,
      isActive: true,
    },
  });

  console.log('Created Categories.');

  // 3. Products
  const productsData = [
    {
      title: 'Royal Sheesham Wood Mandir',
      slug: 'royal-sheesham-wood-mandir',
      sku: 'AKM-TRD-089',
      categoryId: catTraditional.id,
      price: 45000,
      originalPrice: 50000,
      discountPercentage: 10,
      stockQuantity: 14,
      material: 'Sheesham Wood',
      dimensions: '36"W x 24"D x 48"H',
      mountingType: 'Floor Rested',
      colorFinish: 'Natural Teak Polish',
      availableFinishes: JSON.stringify(['Natural Teak Polish', 'Dark Walnut', 'Antique Honey', 'Heritage Rosewood']),
      weight: '42 kg',
      warranty: '5 Years Structural',
      shortDescription: 'Handcrafted from seasoned North Indian Sheesham wood with intricate floral jaali carvings, solid brass bells, and a pull-out prasad tray.',
      fullDescription: 'The Royal Sheesham Wood Mandir is a testament to timeless Vedic craftsmanship. Sourced from ethically harvested and seasoned Indian rosewood (Sheesham), every arch and jharokha is hand-chiseled by master artisans of Saharanpur. It features dual slide-out storage drawers lined in pure red velvet, a heavy-duty pull-out bhog/diya tray, and an illuminated dome spire (Shikhara) designed to channel auspicious energy.',
      features: JSON.stringify([
        '100% Solid Seasoned Sheesham (Dalbergia sissoo)',
        'Acoustic solid brass hanging bells',
        'Dual velvet-lined storage drawers for pooja samagri',
        'Slide-out heavy load Bhog & Diya tray',
        'Backlit warm LED amber dome cavity with concealed wire routing',
        'Hand-waxed moisture and termite resistant finish'
      ]),
      vastuNotes: 'Designed according to Vedic Shastra proportions. Best positioned in the North-East (Ishanya) corner of your living room or dedicated pooja room facing East.',
      tags: JSON.stringify(['Bestseller', 'Sheesham', 'Traditional', 'Floor Rested', 'Brass Bells']),
      isFeatured: true,
      isBestseller: true,
      isNew: false,
      status: 'ACTIVE',
      rating: 4.9,
      reviewsCount: 128,
      images: [
        '/images/mandirs/mandir_royal_sheesham.jpg',
        '/images/mandirs/mandir_detail_bells.jpg',
        '/images/mandirs/mandir_sanctum_aarti.jpg'
      ]
    },
    {
      title: 'Aura Backlit Minimalist Temple',
      slug: 'aura-backlit-minimalist-temple',
      sku: 'AKM-MOD-104',
      categoryId: catModern.id,
      price: 32900,
      originalPrice: 38000,
      discountPercentage: 13,
      stockQuantity: 9,
      material: 'Composite Marble',
      dimensions: '30"W x 18"D x 42"H',
      mountingType: 'Convertible (Floor/Wall)',
      colorFinish: 'Matte Ivory & Gold',
      availableFinishes: JSON.stringify(['Matte Ivory & Gold', 'Pure White PU', 'Dark Walnut']),
      weight: '34 kg',
      warranty: '5 Years Structural',
      shortDescription: 'Contemporary architectural home mandir featuring laser-cut Om back-illumination with warm LED gradient lighting and brushed gold inlays.',
      fullDescription: 'Merging sacred serenity with contemporary apartment aesthetics, the Aura Modern Temple features a luminous backlit acrylic-marble panel emitting a gentle 3000K warm glow. Sleek push-to-open soft-close drawers offer discreet storage for daily ritual essentials.',
      features: JSON.stringify([
        'High-grade water-resistant composite marble and teak accents',
        'Integrated dimmable 3000K warm aura glow with touch sensor',
        'Push-to-open silent soft-close concealed drawer',
        'Anti-flame heat resistant stone top for safe diya placement',
        'Reinforced wall-anchor kit included'
      ]),
      vastuNotes: 'Sleek geometric lines optimize airflow and light in modern living spaces while preserving North-East sacred orientation.',
      tags: JSON.stringify(['Modern', 'LED Backlit', 'Wall Mounted', 'Composite Marble']),
      isFeatured: true,
      isBestseller: false,
      isNew: true,
      status: 'ACTIVE',
      rating: 4.8,
      reviewsCount: 94,
      images: [
        '/images/mandirs/mandir_aura_modern.jpg',
        '/images/mandirs/mandir_white_marble.jpg',
        '/images/mandirs/mandir_sanctum_aarti.jpg'
      ]
    },
    {
      title: 'Grand Haveli Style Temple Mandir',
      slug: 'grand-haveli-style-temple-mandir',
      sku: 'AKM-TMP-012',
      categoryId: catTemple.id,
      price: 89000,
      originalPrice: 99000,
      discountPercentage: 10,
      stockQuantity: 4,
      material: 'Teak Wood',
      dimensions: '48"W x 28"D x 68"H',
      mountingType: 'Floor Rested',
      colorFinish: 'Antique Honey',
      availableFinishes: JSON.stringify(['Antique Honey', 'Natural Teak Polish', 'Heritage Rosewood']),
      weight: '86 kg',
      warranty: '10 Years Structural',
      shortDescription: 'Magnificent multi-tier Shikhar temple inspired by traditional Rajasthani Haveli architecture with dual carved pillars and ornate peacock arches.',
      fullDescription: 'For expansive homes seeking an authentic temple sanctuary, this Grand Haveli Mandir is sculpted from pure seasoned Burma Teak. Features multi-dome Gopurams, 4 hand-carved solid teak pillars with elephant capitals, triple bell arches, and extensive cabinet storage with brass lattice doors.',
      features: JSON.stringify([
        '100% Grade-A Seasoned Burmese Teak Wood',
        'Triple-tiered Gopuram with gold leaf Kalash spires',
        'Four hand-carved pillars with traditional Rajasthani motifs',
        'Spacious double-door storage cabinet with brass lock sets',
        'Dual deep drawers + fold-out extended aarti platform',
        'Includes cast bronze sanctum bells'
      ]),
      vastuNotes: 'Meets full temple dimensional ratios with elevated sanctum platform guaranteeing the idols are positioned above waist height.',
      tags: JSON.stringify(['Grand', 'Temple Style', 'Teak Wood', 'Carved Pillars']),
      isFeatured: true,
      isBestseller: true,
      isNew: false,
      status: 'ACTIVE',
      rating: 5.0,
      reviewsCount: 62,
      images: [
        '/images/mandirs/mandir_grand_haveli.jpg',
        '/images/mandirs/mandir_detail_bells.jpg',
        '/images/mandirs/mandir_sanctum_aarti.jpg'
      ]
    },
    {
      title: 'Compact Apartment Wall Shrine',
      slug: 'compact-apartment-wall-shrine',
      sku: 'AKM-HOM-045',
      categoryId: catHome.id,
      price: 16500,
      originalPrice: 19500,
      discountPercentage: 15,
      stockQuantity: 22,
      material: 'Sheesham Wood',
      dimensions: '22"W x 12"D x 30"H',
      mountingType: 'Wall Mounted',
      colorFinish: 'Antique Honey',
      availableFinishes: JSON.stringify(['Antique Honey', 'Natural Teak Polish', 'Dark Walnut']),
      weight: '16 kg',
      warranty: '5 Years Structural',
      shortDescription: 'Space-conscious wall mounted pooja unit crafted for urban apartments, equipped with folding jaali doors and incense tray.',
      fullDescription: 'Designed expressly for modern high-rise apartments where floor space is precious. This compact shrine mounts securely to any wall with heavy-duty hidden steel brackets. It features folding lattice doors that allow ventilation while providing sanctum privacy when desired.',
      features: JSON.stringify([
        'Space-saving 12-inch depth profile for easy wall mounting',
        'Bifold acoustic jaali doors with brass magnetic latch',
        'Bottom drawer for incense, matchboxes, and cotton wicks',
        'Heavy-duty expansion anchor hardware included',
        'Heat resistant brass tray base'
      ]),
      vastuNotes: 'Ideal for mounting at eye-level on East or North walls in apartments without a separate pooja room.',
      tags: JSON.stringify(['Compact', 'Apartment', 'Wall Mounted', 'Best Value']),
      isFeatured: false,
      isBestseller: true,
      isNew: false,
      status: 'ACTIVE',
      rating: 4.7,
      reviewsCount: 156,
      images: [
        '/images/mandirs/mandir_wall_shrine.jpg',
        '/images/mandirs/mandir_detail_bells.jpg',
        '/images/mandirs/mandir_sanctum_aarti.jpg'
      ]
    },
    {
      title: 'Lotus Brass Inlay Sanctum',
      slug: 'lotus-brass-inlay-sanctum',
      sku: 'AKM-MOD-202',
      categoryId: catDesigner.id,
      price: 38000,
      originalPrice: 42000,
      discountPercentage: 9,
      stockQuantity: 8,
      material: 'Brass Inlay Teak',
      dimensions: '32"W x 20"D x 44"H',
      mountingType: 'Floor Rested',
      colorFinish: 'Dark Walnut',
      availableFinishes: JSON.stringify(['Dark Walnut', 'Natural Teak Polish', 'Heritage Rosewood']),
      weight: '38 kg',
      warranty: '5 Years Structural',
      shortDescription: 'Solid teakwood mandir adorned with hand-hammered pure brass lotus blossom inlays and soft ambient spotlights.',
      fullDescription: 'An exquisite harmony of natural dark walnut polished teak and gleaming brass. The rear backboard showcases an intricately etched Sahasrara Lotus motif in real brass sheet inlay that reflects the warm overhead micro-spotlight.',
      features: JSON.stringify([
        'Solid Teak with genuine 18-gauge brass inlaid motifs',
        'Dual warm 2700K focus spotlights with concealed wiring',
        'Removable idol platform with felt padding',
        'Two accessory drawers with solid cast brass floral knobs',
        'Hand-buffed satin lacquer finish'
      ]),
      vastuNotes: 'The Lotus symbol represents divine purity and spiritual unfoldment, harmonizing cosmic vibrations.',
      tags: JSON.stringify(['Lotus', 'Brass Inlay', 'Modern Luxury', 'Spotlight']),
      isFeatured: true,
      isBestseller: false,
      isNew: true,
      status: 'ACTIVE',
      rating: 4.9,
      reviewsCount: 78,
      images: [
        '/images/mandirs/mandir_lotus_brass.jpg',
        '/images/mandirs/mandir_detail_bells.jpg',
        '/images/mandirs/mandir_sanctum_aarti.jpg'
      ]
    },
    {
      title: 'Gilded Gopuram Temple Mandir',
      slug: 'gilded-gopuram-temple-mandir',
      sku: 'AKM-TMP-099',
      categoryId: catTemple.id,
      price: 115000,
      originalPrice: 125000,
      discountPercentage: 8,
      stockQuantity: 3,
      material: 'Teak Wood',
      dimensions: '54"W x 30"D x 76"H',
      mountingType: 'Floor Rested',
      colorFinish: 'Heritage Rosewood',
      availableFinishes: JSON.stringify(['Heritage Rosewood', 'Antique Honey', 'Natural Teak Polish']),
      weight: '110 kg',
      warranty: '10 Years Structural',
      shortDescription: 'Monumental architectural home temple featuring gold-leaf embellished spire, multi-level sanctum steps, and 8 musical temple bells.',
      fullDescription: 'The pinnacle of Akshar Mandir master-craftsmanship. Crafted from massive planks of aged timber, this mandir evokes the sanctified grandeur of ancient South Indian and Western temple shrines.',
      features: JSON.stringify([
        'Master carver sculpted Gopuram with real 24k gold leaf accents',
        'Eight tuned harmonic brass hanging bells',
        'Three-tier tiered idol pedestal for multi-deity arrangements',
        'Four deep storage compartments with intricate carved shutters',
        'Triple slide-out heavy load offering trays'
      ]),
      vastuNotes: 'Constructed according to Shilpa Shastra grid measurements ensuring sacred symmetry and positive spiritual flow.',
      tags: JSON.stringify(['Monumental', 'Gopuram', 'Gold Leaf', 'Temple Style']),
      isFeatured: true,
      isBestseller: false,
      isNew: false,
      status: 'ACTIVE',
      rating: 5.0,
      reviewsCount: 39,
      images: [
        '/images/mandirs/mandir_gilded_gopuram.jpg',
        '/images/mandirs/mandir_detail_bells.jpg',
        '/images/mandirs/mandir_sanctum_aarti.jpg'
      ]
    },
    {
      title: 'Devi Sanctum Brass Bell Mandir',
      slug: 'devi-sanctum-brass-bell-mandir',
      sku: 'AKM-HOM-088',
      categoryId: catHome.id,
      price: 29000,
      originalPrice: 34000,
      discountPercentage: 14,
      stockQuantity: 11,
      material: 'Sheesham Wood',
      dimensions: '28"W x 16"D x 38"H',
      mountingType: 'Convertible (Floor/Wall)',
      colorFinish: 'Natural Teak Polish',
      availableFinishes: JSON.stringify(['Natural Teak Polish', 'Dark Walnut', 'Antique Honey']),
      weight: '26 kg',
      warranty: '5 Years Structural',
      shortDescription: 'Medium-sized versatile mandir with 12 brass bells suspended in carved archways and spacious pooja samagri drawer.',
      fullDescription: 'A customer-favorite mandir balancing rich detailing with versatile placement. Twelve resonant brass bells ring gently with natural room breezes, creating an aura of peace and divine presence.',
      features: JSON.stringify([
        '12 solid bell insets across front arch',
        'High-grade Sheesham construction with rich natural grain',
        'Smooth sliding drawer with partitioned brass dividers',
        'Pull-out aarti diya shelf with heat shield'
      ]),
      vastuNotes: 'Brass bell vibrations cleanse the environment of negative energies according to Agamic traditions.',
      tags: JSON.stringify(['Brass Bells', 'Sheesham', 'Popular', 'Convertible']),
      isFeatured: false,
      isBestseller: true,
      isNew: false,
      status: 'ACTIVE',
      rating: 4.8,
      reviewsCount: 112,
      images: [
        '/images/mandirs/mandir_devi_sanctum.jpg',
        '/images/mandirs/mandir_detail_bells.jpg',
        '/images/mandirs/mandir_sanctum_aarti.jpg'
      ]
    },
    {
      title: 'Vedic Sanctum Rosewood Mandir',
      slug: 'vedic-sanctum-rosewood-mandir',
      sku: 'AKM-TRD-150',
      categoryId: catTraditional.id,
      price: 58000,
      originalPrice: 65000,
      discountPercentage: 11,
      stockQuantity: 7,
      material: 'Rosewood',
      dimensions: '40"W x 24"D x 52"H',
      mountingType: 'Floor Rested',
      colorFinish: 'Heritage Rosewood',
      availableFinishes: JSON.stringify(['Heritage Rosewood', 'Dark Walnut']),
      weight: '56 kg',
      warranty: '10 Years Structural',
      shortDescription: 'Hand-sculpted pure Indian Rosewood temple featuring traditional elephant base feet and deep peacock relief carvings.',
      fullDescription: 'Carved from dense, heavy Indian Rosewood with naturally dark variegated grain. Standing atop four sculpted elephant heads symbolizing strength, wisdom, and auspiciousness.',
      features: JSON.stringify([
        'Solid Indian Rosewood (Sheesham Dalbergia)',
        'Hand-carved elephant base pedestals',
        'Elaborate peacock and kalash crest motifs',
        'Dual velvet-lined storage drawers with brass ring pulls',
        'Multi-coat protective hand-rubbed oil finish'
      ]),
      vastuNotes: 'Elephant symbols at the base provide grounding energy and invite prosperity into the household.',
      tags: JSON.stringify(['Rosewood', 'Elephant Carvings', 'Heritage', 'Traditional']),
      isFeatured: true,
      isBestseller: false,
      isNew: false,
      status: 'ACTIVE',
      rating: 4.9,
      reviewsCount: 88,
      images: [
        '/images/mandirs/mandir_rosewood_elephant.jpg',
        '/images/mandirs/mandir_detail_bells.jpg',
        '/images/mandirs/mandir_sanctum_aarti.jpg'
      ]
    }
  ];

  const createdProducts = [];
  for (const p of productsData) {
    const { images, ...productFields } = p;
    const createdProduct = await prisma.product.create({
      data: {
        ...productFields,
        images: {
          create: images.map((url, idx) => ({
            url,
            displayOrder: idx,
            isPrimary: idx === 0,
            altText: `${p.title} view ${idx + 1}`
          }))
        }
      },
      include: {
        images: true
      }
    });
    createdProducts.push(createdProduct);
  }

  console.log(`Created ${createdProducts.length} Products with gallery images.`);

  // 4. Coupons
  await prisma.coupon.create({
    data: {
      code: 'DIVINE10',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderAmount: 10000,
      maxDiscountAmount: 10000,
      usageLimit: 500,
      timesUsed: 42,
      isActive: true,
    },
  });

  await prisma.coupon.create({
    data: {
      code: 'SHANTI5000',
      discountType: 'FIXED',
      discountValue: 5000,
      minOrderAmount: 40000,
      usageLimit: 100,
      timesUsed: 18,
      isActive: true,
    },
  });

  console.log('Created Coupons.');

  // 5. Clean state for production: zero fake orders or dummy custom requests
  console.log('Skipping sample orders and custom requests for clean production deployment.');

  // 7. Initial Product Reviews
  await prisma.review.create({
    data: {
      productId: createdProducts[0].id,
      userId: customer.id,
      userName: 'Devkrishna Sharma',
      userEmail: 'devotee@aksharmandir.com',
      rating: 5,
      title: 'Sublime divinity and master craftsmanship',
      comment: 'The Sheesham wood grain is magnificent. The brass bells give off a sweet sacred chime whenever there is a morning breeze. Completely transformed our pooja room.',
      isApproved: true,
    }
  });

  await prisma.review.create({
    data: {
      productId: createdProducts[0].id,
      userName: 'Smt. Gayatri R.',
      rating: 5,
      title: 'Authentic Vastu dimensions',
      comment: 'We consulted our Panditji before purchasing. The dimensions perfectly follow Vedic Shastras. Highly recommended!',
      isApproved: true,
    }
  });

  // 8. Website Content & Brand Settings
  await prisma.storeSetting.create({
    data: {
      key: 'STORE_INFO',
      value: JSON.stringify({
        name: 'AKSHAR MANDIR',
        tagline: 'Sacred Sanctums, Masterfully Handcrafted',
        phone: '+91 98765 43210',
        email: 'care@aksharmandir.com',
        address: 'Artisan Works, Heritage Woodcraft Corridor, Saharanpur & Bengaluru, India',
        gstNumber: '29ABCDE1234F1Z5',
        currencySymbol: '₹',
        paymentMode: 'development'
      }),
      description: 'Primary Store Identity and Contact Details',
      isPublic: true,
    }
  });

  await prisma.storeSetting.create({
    data: {
      key: 'PAYMENT_CONFIG',
      value: JSON.stringify({
        enableUPI: true,
        enableQR: true,
        enableCard: true,
        enableCOD: true,
        upiId: 'aksharmandir@icici',
        merchantName: 'Akshar Mandir Sanctums',
        codExtraCharge: 0
      }),
      description: 'Accepted Payment Methods and Gateway Flags',
      isPublic: true,
    }
  });

  console.log('--- Database Seeding Completed Successfully! ---');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
