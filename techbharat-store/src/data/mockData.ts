export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  badge?: string;
  inStock: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  productCount: number;
  subcategories: string[];
}

export const categories: Category[] = [
  { id: "arduino", name: "Arduino", icon: "🔧", productCount: 245, subcategories: ["Boards", "Shields", "Sensors", "Modules"] },
  { id: "raspberry-pi", name: "Raspberry Pi", icon: "🍓", productCount: 132, subcategories: ["Boards", "HATs", "Cases", "Accessories"] },
  { id: "drone-parts", name: "Drone Parts", icon: "🚁", productCount: 189, subcategories: ["Kits", "Motors", "Controllers", "Propellers", "ESCs"] },
  { id: "3d-printing", name: "3D Printing", icon: "🖨️", productCount: 97, subcategories: ["Printers", "Filaments", "Parts", "Tools"] },
  { id: "ev-parts", name: "EV Components", icon: "⚡", productCount: 156, subcategories: ["Motors", "Batteries", "Controllers", "Chargers"] },
  { id: "sensors", name: "Sensors", icon: "📡", productCount: 312, subcategories: ["Temperature", "Motion", "Proximity", "Gas", "Light"] },
  { id: "batteries", name: "Batteries", icon: "🔋", productCount: 178, subcategories: ["Li-Po", "Li-Ion", "NiMH", "Lead Acid"] },
  { id: "tools", name: "Tools & Equipment", icon: "🛠️", productCount: 143, subcategories: ["Soldering", "Multimeters", "Hand Tools", "Power Supply"] },
];

export const featuredProducts: Product[] = [
  { id: "1", name: "Arduino Mega 2560 Rev3", price: 2999, originalPrice: 3499, image: "https://images.unsplash.com/photo-1553406830-ef2513450d76?w=400&h=400&fit=crop", category: "Arduino", rating: 4.8, reviews: 342, badge: "Bestseller", inStock: true },
  { id: "2", name: "Raspberry Pi 5 - 8GB", price: 7499, image: "https://robocraze.com/cdn/shop/files/Raspberry_Pi_4_8GB_RAM_1000x.webp?v=1744783340", category: "Raspberry Pi", rating: 4.9, reviews: 218, badge: "New", inStock: true },
  { id: "3", name: "DJI F450 Drone Frame Kit", price: 4599, originalPrice: 5299, image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=400&h=400&fit=crop", category: "Drone Parts", rating: 4.6, reviews: 89, inStock: true },
  { id: "4", name: "Creality Ender 3 V3 SE", price: 18999, originalPrice: 22999, image: "https://images.unsplash.com/photo-1615286922420-c6b348ffbd62?w=400&h=400&fit=crop", category: "3D Printing", rating: 4.7, reviews: 156, badge: "Deal", inStock: true },
  { id: "5", name: "48V 20Ah Li-Ion Battery Pack", price: 12499, image: "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSHzYlfRPSAF1NG1jQg5yJkxq4iXnFgGSJMnr6DaLWIWfGRPpxgm9BacULRW5xW2onuijV1FB7rTRSd3UwREyLzNnLcyirsox2FmKL53LLij7DGSDkcCQoS", category: "EV Components", rating: 4.5, reviews: 67, inStock: true },
  { id: "6", name: "MPU6050 6-Axis Gyroscope", price: 299, originalPrice: 449, image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop", category: "Sensors", rating: 4.4, reviews: 523, inStock: true },
  { id: "7", name: "Hakko FX-888D Soldering Station", price: 8999, image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop", category: "Tools", rating: 4.9, reviews: 201, badge: "Top Rated", inStock: true },
  { id: "8", name: "ESP32 Dev Board (30-pin)", price: 549, originalPrice: 749, image: "https://images.unsplash.com/photo-1562408590-e32931084e23?w=400&h=400&fit=crop", category: "Arduino", rating: 4.7, reviews: 891, badge: "Hot", inStock: true },
];

export const megaMenuData = [
  {
    title: "Development Boards",
    items: [
      { name: "Arduino", href: "#" },
      { name: "Raspberry Pi", href: "#" },
      { name: "ESP32 / ESP8266", href: "#" },
      { name: "STM32", href: "#" },
      { name: "Teensy", href: "#" },
    ],
  },
  {
    title: "Robotics",
    items: [
      { name: "Robot Kits", href: "#" },
      { name: "Servo Motors", href: "#" },
      { name: "Motor Drivers", href: "#" },
      { name: "Wheels & Chassis", href: "#" },
      { name: "Grippers", href: "#" },
    ],
  },
  {
    title: "Drone Parts",
    items: [
      { name: "Drone Kits", href: "#" },
      { name: "Brushless Motors", href: "#" },
      { name: "Flight Controllers", href: "#" },
      { name: "Propellers", href: "#" },
      { name: "ESCs", href: "#" },
    ],
  },
  {
    title: "IoT & Connectivity",
    items: [
      { name: "WiFi Modules", href: "#" },
      { name: "Bluetooth", href: "#" },
      { name: "LoRa / Zigbee", href: "#" },
      { name: "GSM/GPS", href: "#" },
      { name: "RFID/NFC", href: "#" },
    ],
  },
];
