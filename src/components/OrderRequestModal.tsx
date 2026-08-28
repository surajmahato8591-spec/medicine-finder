import React, { useState } from 'react';
import { 
  X, 
  Store, 
  CheckCircle2, 
  Upload, 
  MapPin, 
  Clock,
  ShieldCheck,
  Navigation,
  Phone,
  Pill,
  BookmarkCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Pharmacy, Medicine, PharmacyMedicineInventory, OrderRequest } from '../types';

interface OrderRequestModalProps {
  pharmacy: Pharmacy | null;
  medicine: Medicine | null;
  inventory?: PharmacyMedicineInventory;
  onClose: () => void;
  onSubmitOrder: (order: OrderRequest) => void;
}

export const OrderRequestModal: React.FC<OrderRequestModalProps> = ({
  pharmacy,
  medicine,
  inventory,
  onClose,
  onSubmitOrder,
}) => {
  if (!pharmacy || !medicine) return null;

  const unitPrice = inventory ? inventory.price : medicine.defaultPrice;
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('Suraj Mahato');
  const [customerPhone, setCustomerPhone] = useState('+91 98765 43210');
  const [notes, setNotes] = useState('');
  const [prescriptionUploaded, setPrescriptionUploaded] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdReservationId, setCreatedReservationId] = useState('');

  const totalAmount = unitPrice * quantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const reservationId = `MF${Math.floor(1000 + Math.random() * 9000)}`;
    setCreatedReservationId(reservationId);

    const newOrder: OrderRequest = {
      id: reservationId,
      pharmacyId: pharmacy.id,
      pharmacyName: pharmacy.name,
      pharmacyAddress: pharmacy.address,
      pharmacyArea: pharmacy.area,
      medicineName: medicine.name,
      packSize: medicine.packSize,
      quantity,
      pricePerUnit: unitPrice,
      totalAmount,
      type: 'Pickup',
      status: 'Reserved for Pickup',
      customerName,
      customerPhone,
      notes: notes.trim() || undefined,
      timestamp: 'Just now',
    };

    onSubmitOrder(newOrder);
    setIsSuccess(true);
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
  };

  return (
    <div className="fixed inset-0 z-[10000] overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div 
        id="order-request-modal-container"
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150 relative max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-teal-50/40 to-white flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Reserve Medicine for Store Pickup
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Hold stock at {pharmacy.name} before visiting
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-6 sm:p-8 text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-mono font-black text-xs">
                Reservation ID: #{createdReservationId}
              </span>
              <h3 className="text-xl font-black text-slate-900">Medicine Reserved for Pickup!</h3>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-700">
                <span className="font-bold">Medicine:</span>
                <span className="font-extrabold text-slate-900">{medicine.name} (Qty: {quantity})</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span className="font-bold">Pharmacy:</span>
                <span className="font-extrabold text-slate-900">{pharmacy.name}</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span className="font-bold">Address:</span>
                <span className="text-slate-600 text-right">{pharmacy.address}, {pharmacy.area}</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span className="font-bold">Pay at Counter:</span>
                <span className="font-extrabold text-emerald-700 text-sm">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Show this Reservation ID at the pharmacy counter. Your medicine will be kept on hold.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <a
                href={`tel:${pharmacy.phone}`}
                className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Call Pharmacy</span>
              </a>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${pharmacy.lat},${pharmacy.lng}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Get Directions</span>
              </a>
            </div>
            <button
              onClick={onClose}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold underline pt-2 block mx-auto cursor-pointer"
            >
              Done & Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
            {/* Medicine item summary */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{medicine.name}</h4>
                  <p className="text-[11px] text-slate-500">₹{unitPrice.toFixed(2)} per {medicine.packSize}</p>
                </div>
              </div>

              {/* Quantity stepper */}
              <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-black flex items-center justify-center cursor-pointer"
                >
                  -
                </button>
                <span className="font-extrabold text-slate-900 w-4 text-center">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-black flex items-center justify-center cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Pickup Information Notice */}
            <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-start gap-2.5">
              <Store className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div className="text-[11px] text-emerald-900 leading-relaxed">
                <span className="font-extrabold">Direct Pharmacy Counter Pickup: </span>
                Your medicine is reserved for hold at <strong>{pharmacy.name}</strong> ({pharmacy.address}, {pharmacy.area}). You can pay directly at the counter upon collection.
              </div>
            </div>

            {/* Contact details */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Pickup Notes / Estimated Arrival (Optional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Will arrive in 30 minutes"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
              />
            </div>

            {/* Prescription dropzone */}
            {medicine.requiresPrescription && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Doctor's Prescription (Rx) <span className="text-rose-500">*</span>
                </label>
                <div 
                  onClick={() => setPrescriptionUploaded(!prescriptionUploaded)}
                  className={`p-3.5 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-colors ${
                    prescriptionUploaded
                      ? 'border-emerald-500 bg-emerald-50/60 text-emerald-800'
                      : 'border-slate-300 hover:border-emerald-400 bg-slate-50 text-slate-500'
                  }`}
                >
                  <Upload className="w-5 h-5 mx-auto mb-1 text-slate-400" />
                  {prescriptionUploaded ? (
                    <span className="font-bold text-emerald-700">✓ Rx_Doctor_Prescription.pdf attached</span>
                  ) : (
                    <span>Click or Drag & Drop Doctor's Prescription</span>
                  )}
                </div>
              </div>
            )}

            {/* Price calculation bill */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-sm">
              <span className="font-bold text-slate-600">Payable at Pharmacy Counter:</span>
              <span className="font-black text-slate-900 text-lg">₹{totalAmount.toFixed(2)}</span>
            </div>

            <button
              id="reserve-pickup-submit-btn"
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all mt-2 cursor-pointer"
            >
              Confirm & Reserve for Pickup
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
