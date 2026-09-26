import type { Product } from './types';

export const mockProducts: Product[] = [
  {
    id: '1',
    slug: 'iphone-15-pro-256gb',
    title: 'iPhone 15 Pro 256GB',
    subtitle: 'Titanium · Unlocked',
    price: 1650000,
    currency: 'MWK',
    condition: 'new',
    category: 'Phones',
    location: 'Blantyre',
    imageUrl:
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=500&fit=crop&auto=format&q=75',
    seller: { name: 'TechHub Malawi', verified: true },
  },
  {
    id: '2',
    slug: 'macbook-air-m2-13',
    title: 'MacBook Air M2 13"',
    subtitle: '8GB RAM · 256GB SSD',
    price: 1250000,
    currency: 'MWK',
    condition: 'like-new',
    category: 'Laptops',
    location: 'Blantyre',
    imageUrl:
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=500&fit=crop&auto=format&q=75',
    seller: { name: 'TechHub Malawi', verified: true },
  },
  {
    id: '3',
    slug: 'msi-rtx-4070-ventus',
    title: 'MSI GeForce RTX 4070',
    subtitle: '12GB GDDR6X',
    price: 1180000,
    currency: 'MWK',
    condition: 'new',
    category: 'PC Parts',
    location: 'Lilongwe',
    imageUrl:
      'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600&h=500&fit=crop&auto=format&q=75',
    seller: { name: 'PC Planet MW', verified: true },
  },
  {
    id: '4',
    slug: 'samsung-990-pro-2tb',
    title: 'Samsung 990 Pro 2TB',
    subtitle: 'NVMe M.2 · 7450MB/s',
    price: 580000,
    currency: 'MWK',
    condition: 'new',
    category: 'Storage',
    location: 'Blantyre',
    imageUrl:
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&h=500&fit=crop&auto=format&q=75',
    seller: { name: 'Digital Solutions MW', verified: true },
  },
  {
    id: '5',
    slug: 'corsair-vengeance-rgb-16gb',
    title: 'Corsair Vengeance RGB Pro',
    subtitle: '16GB (2×8GB) DDR4 3200MHz',
    price: 220000,
    currency: 'MWK',
    condition: 'new',
    category: 'PC Parts',
    location: 'Lilongwe',
    imageUrl:
      'https://images.unsplash.com/photo-1541029071515-84cc54f84dc5?w=600&h=500&fit=crop&auto=format&q=75',
    seller: { name: 'Dyte2me Malawi', verified: true },
  },
  {
    id: '6',
    slug: 'dell-latitude-5400-i5',
    title: 'Dell Latitude 5400',
    subtitle: 'i5 8GB · 256GB SSD · 14"',
    price: 450000,
    currency: 'MWK',
    condition: 'used',
    category: 'Laptops',
    location: 'Blantyre',
    imageUrl:
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=500&fit=crop&auto=format&q=75',
    seller: { name: 'Mai Malawi Tech', verified: false },
  },
  {
    id: '7',
    slug: 'asus-rog-strix-g15',
    title: 'ASUS ROG Strix G15',
    subtitle: 'i5 · RTX 3050 · 16GB RAM',
    price: 1450000,
    currency: 'MWK',
    condition: 'used',
    category: 'Laptops',
    location: 'Blantyre',
    imageUrl:
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&h=500&fit=crop&auto=format&q=75',
    seller: { name: 'TechHub Malawi', verified: true },
  },
  {
    id: '8',
    slug: 'samsung-galaxy-s24-5g',
    title: 'Samsung Galaxy S24 5G',
    subtitle: '8GB RAM · 256GB · New',
    price: 1090000,
    currency: 'MWK',
    condition: 'new',
    category: 'Phones',
    location: 'Lilongwe',
    imageUrl:
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&h=500&fit=crop&auto=format&q=75',
    seller: { name: 'TechHub Malawi', verified: true },
  },
  {
    id: '9',
    slug: 'logitech-mx-master-3s',
    title: 'Logitech MX Master 3S',
    subtitle: 'Wireless · Bluetooth',
    price: 180000,
    currency: 'MWK',
    condition: 'new',
    category: 'Accessories',
    location: 'Mzuzu',
    imageUrl:
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=500&fit=crop&auto=format&q=75',
    seller: { name: 'Northern Tech', verified: false },
  },
  {
    id: '10',
    slug: 'anker-powerbank-20000',
    title: 'Anker Power Bank 20000mAh',
    subtitle: '65W · USB-C PD',
    price: 95000,
    currency: 'MWK',
    condition: 'new',
    category: 'Accessories',
    location: 'Zomba',
    imageUrl:
      'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&h=500&fit=crop&auto=format&q=75',
    seller: { name: 'Zomba Gadgets', verified: true },
  },
  {
    id: '11',
    slug: 'hp-elitebook-840-g8',
    title: 'HP EliteBook 840 G8',
    subtitle: 'i7 · 16GB RAM · 512GB SSD',
    price: 1150000,
    currency: 'MWK',
    condition: 'like-new',
    category: 'Laptops',
    location: 'Mzuzu',
    imageUrl:
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&h=500&fit=crop&auto=format&q=75',
    seller: { name: 'Northern Tech', verified: false },
  },
  {
    id: '12',
    slug: 'wd-black-sn850x-1tb',
    title: 'WD Black SN850X 1TB',
    subtitle: 'NVMe Gen4 · 7300MB/s',
    price: 320000,
    currency: 'MWK',
    condition: 'new',
    category: 'Storage',
    location: 'Lilongwe',
    imageUrl:
      'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=600&h=500&fit=crop&auto=format&q=75',
    seller: { name: 'PC Planet MW', verified: true },
  },
];

export const categories = Array.from(
  new Set(mockProducts.map((p) => p.category))
).sort();

export const locations = Array.from(
  new Set(mockProducts.map((p) => p.location))
).sort();