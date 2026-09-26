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
 * Extra fields shown per category.
 * Keyed by category name — must match the `name` column in the categories table.
 * Categories not listed here show no extra fields.
 */
export const categorySpecs: Record<string, SpecField[]> = {
  Phones: [
    { key: 'brand', label: 'Brand', type: 'text', placeholder: 'Apple, Samsung, Tecno' },
    { key: 'storage', label: 'Storage', type: 'text', placeholder: '128GB, 256GB' },
    { key: 'ram', label: 'RAM', type: 'text', placeholder: '8GB' },
    { key: 'battery_health', label: 'Battery health', type: 'text', placeholder: '96%' },
    { key: 'network', label: 'Network', type: 'select', options: ['Unlocked', 'Airtel', 'TNM', 'Dual SIM'] },
  ],
  Laptops: [
    { key: 'brand', label: 'Brand', type: 'text', placeholder: 'Apple, Dell, HP, Lenovo' },
    { key: 'processor', label: 'Processor', type: 'text', placeholder: 'Intel Core i5 11th gen' },
    { key: 'ram', label: 'RAM', type: 'text', placeholder: '16GB DDR4' },
    { key: 'storage', label: 'Storage', type: 'text', placeholder: '512GB SSD' },
    { key: 'gpu', label: 'GPU', type: 'text', placeholder: 'RTX 3050, Integrated' },
    { key: 'screen', label: 'Screen size', type: 'text', placeholder: '14", 15.6"' },
  ],
  'PC Parts': [
    {
      key: 'component_type',
      label: 'Component type',
      type: 'select',
      options: ['GPU', 'CPU', 'Motherboard', 'RAM', 'Power supply', 'Case', 'Cooler', 'Other'],
      required: true,
    },
    { key: 'brand', label: 'Brand', type: 'text', placeholder: 'MSI, Corsair, ASUS' },
    { key: 'model', label: 'Model', type: 'text', placeholder: 'RTX 4070 Ventus' },
    { key: 'spec', label: 'Key spec', type: 'text', placeholder: '12GB GDDR6X, 850W 80+ Gold' },
  ],
  Storage: [
    {
      key: 'storage_type',
      label: 'Type',
      type: 'select',
      options: ['SSD', 'HDD', 'NVMe', 'External', 'Memory card'],
      required: true,
    },
    { key: 'capacity', label: 'Capacity', type: 'text', placeholder: '1TB, 512GB' },
    {
      key: 'interface',
      label: 'Interface',
      type: 'select',
      options: ['SATA', 'NVMe Gen3', 'NVMe Gen4', 'USB-C', 'USB 3.0'],
    },
  ],
  Accessories: [
    { key: 'accessory_type', label: 'Type', type: 'text', placeholder: 'Mouse, keyboard, cable, stand' },
    { key: 'compatible_with', label: 'Compatible with', type: 'text', placeholder: 'Any laptop, iPhone 15' },
  ],
  Gaming: [
    {
      key: 'platform',
      label: 'Platform',
      type: 'select',
      options: ['PS5', 'PS4', 'Xbox Series X|S', 'Xbox One', 'Nintendo Switch', 'PC'],
      required: true,
    },
    { key: 'genre', label: 'Genre', type: 'text' },
  ],
  Networking: [
    { key: 'network_type', label: 'Type', type: 'text', placeholder: 'Router, switch, extender' },
    { key: 'speed', label: 'Speed / standard', type: 'text', placeholder: 'Wi-Fi 6, Gigabit' },
  ],
  'Other Electronics': [],
};

export function getSpecsForCategory(categoryName: string): SpecField[] {
  return categorySpecs[categoryName] ?? [];
}