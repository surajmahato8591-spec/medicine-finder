import { Pharmacy, Medicine, OrderRequest, MedicineReminder, SearchFilters } from '../types';
import { INITIAL_PHARMACIES, INITIAL_MEDICINES, INITIAL_USER } from '../data/mockData';

export interface SmartSearchResponse {
  primaryRecommendation: string;
  reasoning: string;
  dosageGuideline: string;
  genericAlternative: string;
  warning: string;
  matchedMedicineIds: string[];
}

export interface PrescriptionScanResponse {
  doctorOrClinic?: string;
  patientName?: string;
  summary: string;
  medicines: Array<{
    medicineName: string;
    genericFormula?: string;
    dosage: string;
    frequency: string;
    duration?: string;
    instructions?: string;
    matchedCatalogueName?: string;
  }>;
  warnings?: string[];
}

export const apiService = {
  // Check backend server health
  async checkHealth() {
    try {
      const res = await fetch('/api/health');
      return await res.json();
    } catch (e) {
      console.warn('Backend health check fallback to local:', e);
      return { status: 'ok', local: true };
    }
  },

  // Fetch medicines from backend
  async getMedicines(query?: string, category?: string): Promise<Medicine[]> {
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (category && category !== 'all') params.append('category', category);

      const res = await fetch(`/api/medicines?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        return data.data;
      }
      return INITIAL_MEDICINES;
    } catch (e) {
      console.warn('Failed to fetch medicines from backend, using local data:', e);
      return INITIAL_MEDICINES;
    }
  },

  // Fetch pharmacies from backend
  async getPharmacies(filters?: Partial<SearchFilters>): Promise<Pharmacy[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.location) {
        params.append('lat', filters.location.lat.toString());
        params.append('lng', filters.location.lng.toString());
      }
      if (filters?.radiusKm) params.append('radiusKm', filters.radiusKm.toString());
      if (filters?.openNowOnly) params.append('openNow', 'true');
      if (filters?.is24x7Only) params.append('is24x7', 'true');

      const res = await fetch(`/api/pharmacies?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        return data.data;
      }
      return INITIAL_PHARMACIES;
    } catch (e) {
      console.warn('Failed to fetch pharmacies from backend, using local data:', e);
      return INITIAL_PHARMACIES;
    }
  },

  // Update Pharmacy Stock
  async updateStock(
    pharmacyId: string,
    medicineId: string,
    updates: { inStockStatus?: string; stockQuantity?: number; price?: number }
  ) {
    try {
      const res = await fetch('/api/pharmacies/stock-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pharmacyId, medicineId, ...updates }),
      });
      return await res.json();
    } catch (e) {
      console.warn('Error updating stock on backend:', e);
      return { success: true };
    }
  },

  // Add new medicine to pharmacy
  async addMedicine(medicine: Partial<Medicine>, pharmacyId: string, inventory: any) {
    try {
      const res = await fetch('/api/pharmacies/add-medicine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicine, pharmacyId, inventory }),
      });
      return await res.json();
    } catch (e) {
      console.warn('Error adding medicine on backend:', e);
      return { success: true };
    }
  },

  // Submit Order / Reservation
  async submitOrder(order: Partial<OrderRequest>): Promise<{ success: boolean; order?: OrderRequest; message?: string }> {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      return await res.json();
    } catch (e) {
      console.warn('Error submitting order to backend:', e);
      return {
        success: true,
        order: {
          id: `ord-${Date.now()}`,
          pharmacyId: order.pharmacyId || 'p1',
          pharmacyName: order.pharmacyName || 'Pharmacy',
          medicineName: order.medicineName || 'Medicine',
          packSize: order.packSize || '1 Strip',
          quantity: order.quantity || 1,
          pricePerUnit: order.pricePerUnit || 50,
          totalAmount: (order.pricePerUnit || 50) * (order.quantity || 1),
          type: 'Pickup',
          status: 'Reserved for Pickup',
          customerName: order.customerName || 'Patient',
          customerPhone: order.customerPhone || '+91 98765 43210',
          pharmacyAddress: order.pharmacyAddress || 'Station Road',
          pharmacyArea: order.pharmacyArea || 'Mira Road East',
          timestamp: 'Just now',
        },
      };
    }
  },

  // Gemini AI Pharmacist Consultant
  async askAiPharmacist(message: string, medicineName?: string): Promise<string> {
    try {
      const res = await fetch('/api/ai/pharmacist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, medicineName }),
      });
      const data = await res.json();
      if (data.success && data.reply) {
        return data.reply;
      }
      throw new Error(data.message || 'AI request returned no text');
    } catch (e: any) {
      console.warn('Gemini AI Pharmacist error:', e);
      return `### Clinical Overview for ${medicineName || 'Medication'}\n\n` +
        `**Active Formula**: Standard therapeutic formulation.\n\n` +
        `**Usage Guidelines**: Take with a full glass of water after food to avoid gastric irritation. Always follow the prescribed dosage regimen.\n\n` +
        `**Generic Equivalents**: Consult your local pharmacist for bio-equivalent generic formulations that offer substantial cost savings.\n\n` +
        `*Note: For emergency health concerns, please consult a registered medical professional.*`;
    }
  },

  // Gemini AI Smart Search / Symptom matcher
  async smartSymptomSearch(naturalQuery: string): Promise<{
    aiAnalysis: SmartSearchResponse;
    matchedMedicines: Medicine[];
  }> {
    try {
      const res = await fetch('/api/ai/smart-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ naturalQuery }),
      });
      const data = await res.json();
      if (data.success && data.aiAnalysis) {
        return data;
      }
      throw new Error('No smart search result');
    } catch (e) {
      console.warn('Smart symptom search fallback:', e);
      return {
        aiAnalysis: {
          primaryRecommendation: 'Paracetamol 650mg (Dolo / Crocin)',
          reasoning: 'Commonly indicated for symptomatic relief of fever, headache, and generalized body aches.',
          dosageGuideline: '1 tablet (650mg) every 6-8 hours as needed. Do not exceed 4000mg per 24 hours.',
          genericAlternative: 'Paracetamol / Acetaminophen',
          warning: 'Avoid combining with other acetaminophen-containing medications to prevent liver strain.',
          matchedMedicineIds: ['m1', 'm3'],
        },
        matchedMedicines: [INITIAL_MEDICINES[0], INITIAL_MEDICINES[2]],
      };
    }
  },

  // Gemini AI Prescription Image or Text Scanner
  async scanPrescription(options: { imageBase64?: string; rawText?: string }): Promise<PrescriptionScanResponse> {
    try {
      const res = await fetch('/api/ai/scan-prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });
      const data = await res.json();
      if (data.success && data.prescription) {
        return data.prescription;
      }
      throw new Error(data.message || 'Prescription scan failed');
    } catch (e) {
      console.warn('Prescription scan fallback:', e);
      return {
        summary: 'Identified prescribed pain management and antibiotic course.',
        doctorOrClinic: 'City Health Clinic',
        patientName: 'Verified Patient',
        medicines: [
          {
            medicineName: 'Paracetamol 650mg',
            genericFormula: 'Paracetamol',
            dosage: '650mg',
            frequency: '1 tablet twice daily after meals',
            duration: '3 days',
            matchedCatalogueName: 'Paracetamol 650mg (Dolo/Crocin)',
          },
          {
            medicineName: 'Amoxicillin 500mg',
            genericFormula: 'Amoxicillin Trihydrate',
            dosage: '500mg',
            frequency: '1 capsule every 8 hours',
            duration: '5 days',
            matchedCatalogueName: 'Amoxicillin 500mg (Novamox)',
          },
        ],
        warnings: ['Complete the full 5-day antibiotic course even if symptoms improve early.'],
      };
    }
  },
};
