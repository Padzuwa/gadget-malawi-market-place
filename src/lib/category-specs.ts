export type SpecFieldType = 'text' | 'number' | 'select';

export type SpecField = {
  key: string;
  label: string;
  type: SpecFieldType;
  placeholder?: string;
  options?: string[];
  required?: boolean;
};

/**
 * Extra fields shown per category in the sell form.
 * Keyed by category name — must match the `name` column exactly.
 * Categories not listed here show no extra fields.
 *
 * Add a new category: 1 SQL insert into `categories`,
 * 1 new entry here. No other code changes.
 */
export const categorySpecs: Record<string, SpecField[]> = {
  Phones: [
    { key: 'brand', label: 'Brand', type: 'text', placeholder: 'Apple, Samsung, Tecno' },
    { key: 'storage', label: 'Storage', type: 'text', placeholder: '128GB, 256GB' },
    { key: 'ram', label: 'RAM', type: 'text', placeholder: '8GB' },
    { key: 'battery_health', label: 'Battery health', type: 'text', placeholder: '96%' },
    {
      key: 'network',
      label: 'Network',
      type: 'select',
      options: ['Unlocked', 'Airtel', 'TNM', 'Dual SIM'],
    },
  ],

  Tablets: [
    { key: 'brand', label: 'Brand', type: 'text', placeholder: 'Apple, Samsung, Lenovo' },
    { key: 'storage', label: 'Storage', type: 'text', placeholder: '64GB, 128GB, 256GB' },
    { key: 'ram', label: 'RAM', type: 'text', placeholder: '4GB' },
    {
      key: 'connectivity',
      label: 'Connectivity',
      type: 'select',
      options: ['Wi-Fi only', 'Wi-Fi + Cellular'],
    },
    { key: 'screen_size', label: 'Screen size', type: 'text', placeholder: '10.9"' },
    { key: 'stylus_included', label: 'Stylus included', type: 'select', options: ['Yes', 'No'] },
  ],

  Laptops: [
    { key: 'brand', label: 'Brand', type: 'text', placeholder: 'Apple, Dell, HP, Lenovo' },
    { key: 'processor', label: 'Processor', type: 'text', placeholder: 'Intel Core i5 11th gen' },
    { key: 'ram', label: 'RAM', type: 'text', placeholder: '16GB DDR4' },
    { key: 'storage', label: 'Storage', type: 'text', placeholder: '512GB SSD' },
    { key: 'gpu', label: 'GPU', type: 'text', placeholder: 'RTX 3050, Integrated' },
    { key: 'screen_size', label: 'Screen size', type: 'text', placeholder: '14", 15.6"' },
  ],

  Desktops: [
    { key: 'brand', label: 'Brand', type: 'text', placeholder: 'Dell, HP, Custom build' },
    { key: 'processor', label: 'Processor', type: 'text', placeholder: 'Intel Core i7 12th gen' },
    { key: 'ram', label: 'RAM', type: 'text', placeholder: '32GB DDR4' },
    { key: 'storage', label: 'Storage', type: 'text', placeholder: '1TB SSD + 2TB HDD' },
    { key: 'gpu', label: 'GPU', type: 'text', placeholder: 'RTX 3060, Integrated' },
    {
      key: 'form_factor',
      label: 'Form factor',
      type: 'select',
      options: ['Tower', 'Small form factor', 'All-in-one', 'Mini PC'],
    },
    { key: 'os', label: 'Operating system', type: 'text', placeholder: 'Windows 11, Ubuntu' },
  ],

  Monitors: [
    { key: 'brand', label: 'Brand', type: 'text', placeholder: 'Samsung, LG, Dell, HP' },
    { key: 'screen_size', label: 'Screen size', type: 'text', placeholder: '24", 27", 32"' },
    { key: 'resolution', label: 'Resolution', type: 'text', placeholder: '1080p, 1440p, 4K' },
    {
      key: 'refresh_rate',
      label: 'Refresh rate',
      type: 'select',
      options: ['60Hz', '75Hz', '120Hz', '144Hz', '165Hz', '240Hz'],
    },
    {
      key: 'panel_type',
      label: 'Panel type',
      type: 'select',
      options: ['IPS', 'VA', 'TN', 'OLED'],
    },
    { key: 'ports', label: 'Ports', type: 'text', placeholder: 'HDMI, DisplayPort, USB-C' },
  ],

  'PC Parts': [
    {
      key: 'component_type',
      label: 'Component type',
      type: 'select',
      options: [
        'GPU',
        'CPU',
        'Motherboard',
        'RAM',
        'Power supply',
        'Case',
        'Cooler',
        'Other',
      ],
      required: true,
    },
    { key: 'brand', label: 'Brand', type: 'text', placeholder: 'MSI, Corsair, ASUS' },
    { key: 'model', label: 'Model', type: 'text', placeholder: 'RTX 4070 Ventus' },
    { key: 'key_spec', label: 'Key spec', type: 'text', placeholder: '12GB GDDR6X, 850W 80+ Gold' },
  ],

  Storage: [
    {
      key: 'storage_type',
      label: 'Type',
      type: 'select',
      options: ['SSD', 'HDD', 'NVMe', 'External', 'Memory card', 'Flash drive'],
      required: true,
    },
    { key: 'capacity', label: 'Capacity', type: 'text', placeholder: '1TB, 512GB, 128GB' },
    {
      key: 'interface',
      label: 'Interface',
      type: 'select',
      options: ['SATA', 'NVMe Gen3', 'NVMe Gen4', 'USB-C', 'USB 3.0', 'microSD'],
    },
    { key: 'brand', label: 'Brand', type: 'text', placeholder: 'Samsung, WD, SanDisk' },
  ],

  Networking: [
    {
      key: 'network_type',
      label: 'Type',
      type: 'select',
      options: [
        'Router',
        'Mesh system',
        'Extender',
        'Switch',
        'Access point',
        'Modem',
        'SIM router',
        'Cabling',
      ],
      required: true,
    },
    { key: 'brand', label: 'Brand', type: 'text', placeholder: 'TP-Link, Ubiquiti, Huawei' },
    { key: 'speed', label: 'Speed / standard', type: 'text', placeholder: 'Wi-Fi 6, Gigabit' },
    { key: 'ports', label: 'Ports', type: 'text', placeholder: '4x LAN, 1x WAN' },
  ],

  'Printers & Scanners': [
    {
      key: 'device_type',
      label: 'Device type',
      type: 'select',
      options: ['Inkjet', 'Laser', 'All-in-one', 'Scanner only', 'Plotter', 'Label printer'],
      required: true,
    },
    { key: 'brand', label: 'Brand', type: 'text', placeholder: 'HP, Canon, Epson, Brother' },
    {
      key: 'color',
      label: 'Color',
      type: 'select',
      options: ['Color', 'Monochrome'],
    },
    {
      key: 'connectivity',
      label: 'Connectivity',
      type: 'select',
      options: ['USB', 'Wi-Fi', 'Ethernet', 'USB + Wi-Fi', 'USB + Wi-Fi + Ethernet'],
    },
    { key: 'ink_included', label: 'Ink / toner included', type: 'select', options: ['Yes', 'No'] },
  ],

  Audio: [
    {
      key: 'audio_type',
      label: 'Type',
      type: 'select',
      options: [
        'Headphones',
        'Earbuds',
        'Speaker',
        'Soundbar',
        'Microphone',
        'Amplifier',
        'Mixer',
        'Audio interface',
      ],
      required: true,
    },
    { key: 'brand', label: 'Brand', type: 'text', placeholder: 'JBL, Sony, Bose, Logitech' },
    {
      key: 'connectivity',
      label: 'Connectivity',
      type: 'select',
      options: ['Wired', 'Bluetooth', 'Wi-Fi', 'USB', 'XLR', 'Multiple'],
    },
    {
      key: 'features',
      label: 'Features',
      type: 'text',
      placeholder: 'Noise cancelling, Waterproof, RGB',
    },
  ],

  Cameras: [
    {
      key: 'camera_type',
      label: 'Type',
      type: 'select',
      options: ['DSLR', 'Mirrorless', 'Point-and-shoot', 'Action', 'Drone', 'Webcam', 'Lens'],
      required: true,
    },
    { key: 'brand', label: 'Brand', type: 'text', placeholder: 'Canon, Nikon, Sony, GoPro' },
    { key: 'megapixels', label: 'Megapixels', type: 'text', placeholder: '24MP' },
    { key: 'lens_included', label: 'Lens included', type: 'text', placeholder: '18-55mm kit lens' },
    { key: 'video_quality', label: 'Video', type: 'text', placeholder: '4K 60fps, 1080p' },
  ],

  Gaming: [
    {
      key: 'platform',
      label: 'Platform',
      type: 'select',
      options: [
        'PS5',
        'PS4',
        'Xbox Series X|S',
        'Xbox One',
        'Nintendo Switch',
        'PC',
        'Retro',
      ],
      required: true,
    },
    { key: 'genre', label: 'Genre', type: 'text', placeholder: 'Action, Sports, RPG' },
    { key: 'condition_notes', label: 'Notes', type: 'text', placeholder: 'Disc in good condition' },
  ],

  Accessories: [
    {
      key: 'accessory_type',
      label: 'Type',
      type: 'text',
      placeholder: 'Mouse, keyboard, cable, stand, bag',
    },
    { key: 'brand', label: 'Brand', type: 'text', placeholder: 'Logitech, Anker, Razer' },
    {
      key: 'compatible_with',
      label: 'Compatible with',
      type: 'text',
      placeholder: 'Any laptop, iPhone 15, PS5',
    },
  ],

  'Power & Solar': [
    {
      key: 'power_type',
      label: 'Type',
      type: 'select',
      options: [
        'Inverter',
        'Battery (lead-acid)',
        'Battery (lithium)',
        'Solar panel',
        'Charge controller',
        'Voltage stabilizer',
        'UPS',
        'Generator',
        'Solar kit',
      ],
      required: true,
    },
    { key: 'brand', label: 'Brand', type: 'text', placeholder: 'Must, Felicity, Victron, Schneider' },
    {
      key: 'capacity',
      label: 'Capacity / rating',
      type: 'text',
      placeholder: '3kVA, 5kWh, 450W, 100Ah',
    },
    {
      key: 'voltage',
      label: 'Voltage',
      type: 'select',
      options: ['12V', '24V', '48V', '220V', 'Not applicable'],
    },
    { key: 'warranty', label: 'Warranty', type: 'text', placeholder: '1 year, 2 years' },
  ],

  'Other Electronics': [
    { key: 'details', label: 'Details', type: 'text', placeholder: 'Short description of the item' },
  ],
};

export function getSpecsForCategory(categoryName: string): SpecField[] {
  return categorySpecs[categoryName] ?? [];
}