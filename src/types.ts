export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: 'Pain Relief' | 'Antibiotics' | 'Fever & Cold' | 'Diabetes' | 'Cardiac' | 'Vitamins & Supplements' | 'Allergy' | 'Gastrointestinal' | 'First Aid';
  form: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Ointment' | 'Inhaler' | 'Drops';
  dosage: string;
  packSize: string;
  defaultPrice: number;
  description: string;
  uses: string[];
  sideEffects: string[];
  requiresPrescription: boolean;
  image?: string;
}

export interface PharmacyMedicineInventory {
  medicineId: string;
  pharmacyId: string;
  inStockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock';
  stockQuantity: number;
  price: number;
  lastUpdated: string;
  expiryDate?: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  tagline?: string;
  address: string;
  area: string;
  city: string;
  pincode: string;
  lat: number;
  lng: number;
  phone: string;
  email?: string;
  ownerName?: string;
  rating: number;
  reviewCount: number;
  openHours: string;
  isOpenNow: boolean;
  is24x7: boolean;
  isQualityAssured: boolean;
  hasGenuineMedicines: boolean;
  hasWheelchairAccess?: boolean;
  colorTag: string; // hex or tailwind class for marker pin
  inventory: PharmacyMedicineInventory[];
  licenseNumber?: string;
  isVerified?: boolean;
  verificationStatus?: 'verified' | 'pending' | 'rejected';
  registrationDate?: string;
}

export interface SearchFilters {
  query: string;
  location: {
    name: string;
    lat: number;
    lng: number;
  };
  radiusKm: number;
  stockFilter: 'all' | 'in_stock_only' | 'low_stock_ok';
  openNowOnly: boolean;
  is24x7Only: boolean;
  sortBy: 'distance' | 'price_low_high' | 'rating' | 'stock';
  category?: string;
}

export interface MedicineReminder {
  id: string;
  medicineName: string;
  dosage: string;
  time: string; // "08:00 AM"
  frequency: 'Once Daily' | 'Twice Daily' | 'Thrice Daily' | 'As Needed';
  instructions: 'Before Food' | 'After Food' | 'With Water';
  isActive: boolean;
  startDate: string;
}

export interface OrderRequest {
  id: string;
  pharmacyId: string;
  pharmacyName: string;
  pharmacyAddress?: string;
  pharmacyArea?: string;
  medicineName: string;
  packSize: string;
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
  type: 'Pickup';
  status: 'Reserved for Pickup' | 'Ready for Pickup' | 'Completed' | 'Cancelled';
  customerName: string;
  customerPhone: string;
  notes?: string;
  timestamp: string;
}

export interface MedicineStockAlert {
  id: string;
  userId?: string;
  medicineId: string;
  medicineName: string;
  location: string;
  status: 'Waiting' | 'In Stock Now';
  notifiedPharmacyName?: string;
  timestamp: string;
}

export type UserRole = 'patient' | 'pharmacy_owner' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: UserRole;
  managedPharmacyId?: string;
  searchesThisMonth: number;
  savedPharmacyIds: string[];
  orders: OrderRequest[];
  reminders: MedicineReminder[];
  stockAlerts: MedicineStockAlert[];
  recentSearches: { query: string; location: string; timestamp: string }[];
  lowStockAlerts: number;
}

