import { BoutiqueProduct } from '../types';

export const BOUTIQUE_PRODUCTS: BoutiqueProduct[] = [
  {
    id: 'prod-1',
    name: 'Sentia Executive Smart Pack',
    tagline: 'Carbon Emerald Ballistic Weave with Biometric Lock',
    priceUsd: 380,
    priceInr: 29999,
    category: 'smart_pack',
    image: require('../../assets/brand/image1.png'),
    rating: 4.9,
    reviewsCount: 128,
    inStock: true,
    badge: 'FLAGSHIP',
    bag3DModelId: 'bag-01',
    description:
      'The definitive smart travel companion. Integrated 4-point load cell weight sensing, magnetic water-seal zippers, biometric lock, and ambient BLE beacon locator.',
    specs: [
      { label: 'Exterior Material', value: 'IPX5 Ballistic Emerald Weave' },
      { label: 'Weight Sensing', value: 'Dual 4-Gauge Load Cells (±50g accuracy)' },
      { label: 'Security', value: 'TSA Biometric Fingerprint & BLE Lock' },
      { label: 'Laptop Sleeve', value: 'Shock-Absorbing Memory Foam up to 16"' },
      { label: 'Battery Capacity', value: 'Integrated 15,000mAh Lithium-Polymer' },
    ],
    howToUseSteps: [
      'Charge the central power hub using the reinforced USB-C port inside the quick-access pocket.',
      'Pair to your phone via Bluetooth: hold the interior pairing button for 3 seconds until Senti pulses.',
      'Calibrate load cell: place empty bag on flat ground, open Sentia app, and tap Calibrate Zero.',
      'Register your fingerprint: tap Lock Settings in the app and rest your finger on the biometric scanner 3 times.',
    ],
    faq: [
      {
        question: 'Is the lithium-polymer battery airline and TSA carry-on approved?',
        answer: 'Yes, 100%. The 15,000mAh capacity complies with FAA, EASA, and ICAO regulations (under 100Wh) for carry-on baggage.',
      },
      {
        question: 'How water-resistant is the emerald ballistic weave?',
        answer: 'The bag is rated IPX5. It resists heavy monsoon rain, high-pressure splashes, and water ingress through its coated zippers.',
      },
      {
        question: 'Can I track the bag if my phone Bluetooth is switched off?',
        answer: 'Yes. The bag stores its last known GPS coordinates on your device, and nearby Sentia Circle friends will securely relay encrypted proximity pings.',
      },
    ],
    reviews: [
      {
        id: 'r1',
        userName: 'Vikram R.',
        rating: 5,
        date: '3 days ago',
        comment: 'The weight sensor saved me at Heathrow terminal check-in. The craft and stitching are comparable to Hermès.',
        verifiedPurchase: true,
      },
      {
        id: 'r2',
        userName: 'Sarah Jenkins',
        rating: 5,
        date: '1 week ago',
        comment: 'The zipper lock and Senti companion make business travel effortless. Truly an executive luxury item.',
        verifiedPurchase: true,
      },
    ],
  },
  {
    id: 'prod-2',
    name: 'Sentia Smart Hydration Vessel',
    tagline: 'OLED Temp Display with Magnetic Pocket Telemetry',
    priceUsd: 65,
    priceInr: 4999,
    category: 'hydration',
    image: require('../../assets/brand/image6.png'),
    rating: 4.8,
    reviewsCount: 94,
    inStock: true,
    badge: 'ESSENTIAL',
    description:
      'Engineered specifically to dock inside Sentia side pockets. Magnetic hall-effect sensors broadcast water level and sip telemetry directly to your Senti companion.',
    specs: [
      { label: 'Capacity', value: '750 ml / 25 fl oz' },
      { label: 'Thermal Insulation', value: '24h Cold / 12h Piping Hot' },
      { label: 'Sterilization', value: 'Built-in 280nm UV-C Cap Sterilizer' },
      { label: 'Material', value: 'Food-Grade 18/8 Pro-Grade Stainless Steel' },
    ],
    howToUseSteps: [
      'Fill with water and tighten the smart cap to activate the temperature display.',
      'Dock into your Sentia bag side pocket: Senti will chime to confirm connection.',
      'Tap the cap twice to initiate a 60-second UV-C self-cleaning sterilization cycle.',
    ],
    faq: [
      {
        question: 'How long does the bottle battery last on a single charge?',
        answer: 'The cap battery lasts up to 30 days under normal daily use and recharges in 90 minutes via magnetic USB snap.',
      },
      {
        question: 'Is the bottle dishwasher safe?',
        answer: 'The stainless steel vessel is 100% dishwasher safe. We recommend hand-washing the electronic UV-C cap with a damp cloth.',
      },
    ],
    reviews: [
      {
        id: 'r3',
        userName: 'Aanya S.',
        rating: 5,
        date: '4 days ago',
        comment: 'Senti nudges me when it is warm outside and reminds me to sip. The UV-C sterilizer keeps water tasting pure.',
        verifiedPurchase: true,
      },
    ],
  },
  {
    id: 'prod-3',
    name: 'Cycle Care Thermal Pouch',
    tagline: 'Discreet Sanitary Organizer with 48h Advance Sync',
    priceUsd: 45,
    priceInr: 2499,
    category: 'cycle_care',
    image: require('../../assets/brand/image3.png'),
    rating: 5.0,
    reviewsCount: 82,
    inStock: true,
    badge: 'HEALTH ALLY',
    description:
      'Artisanal satin-lined care organizer with discreet thermal insulation. Interlocks seamlessly with the Sentia Cycle Care health module to prompt packing 48h in advance.',
    specs: [
      { label: 'Lining', value: 'Antibacterial Microfiber & Thermal Satin' },
      { label: 'Closure', value: 'Silent Magnetic Soft-Snap' },
      { label: 'Compatibility', value: 'Fits into all Sentia interior organizer docks' },
    ],
    howToUseSteps: [
      'Place your menstrual and wellness essentials inside the designated thermal compartments.',
      'Snap into the interior dedicated dock inside your Sentia pack or purse.',
      'The Cycle Care screen will automatically verify that your pouch is docked 48h prior to predicted cycle.',
    ],
    faq: [
      {
        question: 'Is any private health data visible on the bag or exterior?',
        answer: 'Never. Health telemetry is 100% encrypted on-device. The bag only verifies physical presence via NFC soft-snap.',
      },
    ],
    reviews: [
      {
        id: 'r4',
        userName: 'Meera K.',
        rating: 5,
        date: '2 weeks ago',
        comment: 'Finally a brand that respects women’s practical realities. Elegant, completely private, and so thoughtful.',
        verifiedPurchase: true,
      },
    ],
  },
  {
    id: 'prod-4',
    name: 'Sentia Proximity Beacon Tag',
    tagline: 'Ultra-Wideband Tracker for Keys, Passports & Tech',
    priceUsd: 30,
    priceInr: 1999,
    category: 'radar_tag',
    image: require('../../assets/brand/image4.png'),
    rating: 4.7,
    reviewsCount: 65,
    inStock: true,
    description:
      'Ultra-thin precision beacon tag that clips to keys, camera bags, or passports. Feeds directly into your Sentia Radar screen with sub-meter proximity precision.',
    specs: [
      { label: 'Range', value: 'Up to 60 meters (BLE 5.3 + UWB)' },
      { label: 'Battery Life', value: '18 months (Replaceable CR2032)' },
      { label: 'Water Rating', value: 'IP67 Submersible' },
    ],
    howToUseSteps: [
      'Pull the protective battery tab to power on the tag.',
      'Hold the tag against your Sentia bag emblem until haptic chime sounds.',
      'Name your tag in the Radar tab (e.g. House Keys, Passport Pouch).',
    ],
    faq: [
      {
        question: 'Can I ring the tag from the Sentia app?',
        answer: 'Yes! Tapping "Chime" on the Radar tab sounds an 85dB acoustic chime on the beacon tag.',
      },
    ],
    reviews: [
      {
        id: 'r5',
        userName: 'David C.',
        rating: 5,
        date: '3 weeks ago',
        comment: 'The sub-meter direction arrow is unmatched. Found my keys inside a crowded hotel lobby in seconds.',
        verifiedPurchase: true,
      },
    ],
  },
  {
    id: 'prod-crb-03',
    name: 'Sentia Leather Crossbody Purse',
    tagline: 'Saddle Tan Tuscan Napa Leather with Anti-Theft Gyro',
    priceUsd: 295,
    priceInr: 22999,
    category: 'smart_pack',
    image: require('../../assets/brand/image3.png'),
    rating: 4.9,
    reviewsCount: 76,
    inStock: true,
    badge: 'LUXURY SILHOUETTE',
    bag3DModelId: 'bag-03',
    description:
      'Artisanal saddle tan napa leather evening purse. Features integrated biometric NFC closure, internal discreet pouch dock, and micro BLE proximity tracking.',
    specs: [
      { label: 'Exterior Material', value: 'Full-Grain Tuscan Saddle Tan Leather' },
      { label: 'Hardware', value: 'Brushed Brass Magnetic Lock' },
      { label: 'Security', value: 'Anti-Theft Gyro & BLE Proximity Tag' },
      { label: 'Battery Capacity', value: 'Ultra-Slim 5,000mAh Power Core' },
    ],
    howToUseSteps: [
      'Connect via Bluetooth in the Sentia app: tap Pair New Device and choose Model CRB-03.',
      'Tap your smartphone against the brass emblem to unlock or calibrate proximity.',
      'Dock your Cycle Care thermal pouch into the discreet satin-lined organizer slot.',
    ],
    faq: [
      {
        question: 'How do I care for the saddle tan napa leather?',
        answer: 'Wipe gently with a dry microfiber cloth. Treat periodically with organic beeswax leather balm.',
      },
    ],
    reviews: [
      {
        id: 'r-crb-1',
        userName: 'Elena V.',
        rating: 5,
        date: '5 days ago',
        comment: 'The leather grain is sublime and the anti-theft gyro gives total peace of mind in crowded bistros.',
        verifiedPurchase: true,
      },
    ],
  },
];
