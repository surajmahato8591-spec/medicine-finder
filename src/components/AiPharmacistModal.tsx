import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Pill, 
  Search, 
  Loader2, 
  Bot, 
  User, 
  Store, 
  Navigation,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { apiService, SmartSearchResponse, PrescriptionScanResponse } from '../services/api';
import { Medicine, Pharmacy } from '../types';

interface AiPharmacistModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicines: Medicine[];
  pharmacies: Pharmacy[];
  onSelectMedicine: (med: Medicine) => void;
  onSelectPharmacy: (pharmacy: Pharmacy) => void;
  onOpenDirections: (pharmacy: Pharmacy) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  structuredData?: any;
}

export const AiPharmacistModal: React.FC<AiPharmacistModalProps> = ({
  isOpen,
  onClose,
  medicines,
  pharmacies,
  onSelectMedicine,
  onSelectPharmacy,
  onOpenDirections,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'symptom' | 'prescription'>('chat');
  
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: `Hello! I am **MediFinder's Certified AI Pharmacist** powered by Gemini 3.7. 🌿\n\nHow can I assist you today? You can ask me about:\n- Active ingredients & affordable generic substitutes\n- Dosage instructions (adult vs pediatric)\n- Drug interactions & side effects\n- Or scan your prescription in the **Prescription Scanner** tab!`,
      timestamp: 'Just now',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  // Symptom smart search state
  const [symptomInput, setSymptomInput] = useState('');
  const [isAnalyzingSymptom, setIsAnalyzingSymptom] = useState(false);
  const [symptomResult, setSymptomResult] = useState<{
    aiAnalysis: SmartSearchResponse;
    matchedMedicines: Medicine[];
  } | null>(null);

  // Prescription scanner state
  const [prescriptionImage, setPrescriptionImage] = useState<string | null>(null);
  const [prescriptionText, setPrescriptionText] = useState('');
  const [isScanningPrescription, setIsScanningPrescription] = useState(false);
  const [prescriptionResult, setPrescriptionResult] = useState<PrescriptionScanResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle Send Chat
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim() || isLoadingChat) return;

    const userMsgText = inputQuery;
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoadingChat(true);

    try {
      const reply = await apiService.askAiPharmacist(userMsgText);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingChat(false);
    }
  };

  // Handle Symptom Search
  const handleAnalyzeSymptom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomInput.trim() || isAnalyzingSymptom) return;

    setIsAnalyzingSymptom(true);
    try {
      const res = await apiService.smartSymptomSearch(symptomInput);
      setSymptomResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzingSymptom(false);
    }
  };

  // Handle Image Upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPrescriptionImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Prescription Scan
  const handleScanPrescription = async () => {
    if (!prescriptionImage && !prescriptionText.trim()) return;

    setIsScanningPrescription(true);
    try {
      const res = await apiService.scanPrescription({
        imageBase64: prescriptionImage || undefined,
        rawText: prescriptionText.trim() || undefined,
      });
      setPrescriptionResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanningPrescription(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div 
        id="ai-pharmacist-modal-container"
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-150 relative max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold tracking-tight">AI Health & Pharmacist Assistant</h3>
                <span className="bg-emerald-400/30 text-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300/30 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                  Gemini 3.7
                </span>
              </div>
              <p className="text-xs text-emerald-100/90">Instant clinical guidance, dosage calculation & prescription reader</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('chat')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'chat'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Consult AI Pharmacist</span>
          </button>

          <button
            onClick={() => setActiveTab('symptom')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'symptom'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Symptom to Medicine Matcher</span>
          </button>

          <button
            onClick={() => setActiveTab('prescription')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'prescription'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Prescription Scanner (OCR)</span>
          </button>
        </div>

        {/* Tab 1: Chat Assistant */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col min-h-[420px] max-h-[500px]">
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'ai' && (
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 shadow-xs ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-xs'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
                    <div
                      className={`text-[10px] text-right font-medium ${
                        msg.sender === 'user' ? 'text-emerald-200' : 'text-slate-400'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isLoadingChat && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-3.5 flex items-center gap-2 text-xs text-slate-500 shadow-xs">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    <span>AI Pharmacist is reviewing clinical databases...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-[11px]">
              <span className="text-slate-500 font-semibold shrink-0">Suggestions:</span>
              <button
                type="button"
                onClick={() => setInputQuery('What are cheaper generic alternatives for Paracetamol 650mg?')}
                className="px-2.5 py-1 bg-white hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 rounded-full text-slate-600 shrink-0 transition-colors"
              >
                💊 Generic Substitutes
              </button>
              <button
                type="button"
                onClick={() => setInputQuery('Can I take Amoxicillin and Paracetamol together?')}
                className="px-2.5 py-1 bg-white hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 rounded-full text-slate-600 shrink-0 transition-colors"
              >
                ⚠️ Drug Interactions
              </button>
              <button
                type="button"
                onClick={() => setInputQuery('What is the safe daily dosage of Cetirizine for allergies?')}
                className="px-2.5 py-1 bg-white hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 rounded-full text-slate-600 shrink-0 transition-colors"
              >
                ⏱️ Dosage Guide
              </button>
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask about dosage, precautions, ingredients, or substitutes..."
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-900"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isLoadingChat}
                className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl shadow-md transition-all shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Natural Language Symptom Search */}
        {activeTab === 'symptom' && (
          <div className="p-5 overflow-y-auto max-h-[500px] space-y-5 flex-1">
            <form onSubmit={handleAnalyzeSymptom} className="space-y-3">
              <label className="block text-xs font-bold text-slate-800">
                Describe your symptoms or condition in natural language:
              </label>
              <div className="relative">
                <textarea
                  rows={3}
                  value={symptomInput}
                  onChange={(e) => setSymptomInput(e.target.value)}
                  placeholder="e.g., I have had a continuous dry cough, mild fever of 100°F, and body ache since yesterday evening."
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] text-slate-500">
                  Gemini analyzes symptoms to suggest matching OTC/prescription medications in local pharmacy stock.
                </p>
                <button
                  type="submit"
                  disabled={!symptomInput.trim() || isAnalyzingSymptom}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all shrink-0"
                >
                  {isAnalyzingSymptom ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Match Medications</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {symptomResult && (
              <div className="space-y-4 pt-4 border-t border-slate-200 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Primary Clinical Recommendation
                    </span>
                    <span className="text-[11px] font-bold bg-white text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
                      {symptomResult.aiAnalysis.genericAlternative}
                    </span>
                  </div>

                  <h4 className="text-base font-extrabold text-slate-900">
                    {symptomResult.aiAnalysis.primaryRecommendation}
                  </h4>

                  <p className="text-xs text-slate-700 leading-relaxed">
                    {symptomResult.aiAnalysis.reasoning}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-white rounded-xl border border-emerald-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Dosage Guideline</span>
                      <p className="font-semibold text-slate-800">{symptomResult.aiAnalysis.dosageGuideline}</p>
                    </div>

                    <div className="p-2.5 bg-amber-50/80 rounded-xl border border-amber-200">
                      <span className="text-[10px] uppercase font-bold text-amber-700 block">Warning & Precaution</span>
                      <p className="font-semibold text-amber-900">{symptomResult.aiAnalysis.warning}</p>
                    </div>
                  </div>
                </div>

                {/* Available in Stock Nearby */}
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-slate-800">Matching Medicines in Stock:</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {symptomResult.matchedMedicines.map((med) => (
                      <div
                        key={med.id}
                        className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between hover:border-emerald-500 transition-colors group cursor-pointer"
                        onClick={() => {
                          onSelectMedicine(med);
                          onClose();
                        }}
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">{med.name}</p>
                          <p className="text-[10px] text-slate-500">{med.genericName} • ₹{med.defaultPrice}</p>
                        </div>
                        <button className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Prescription Scanner */}
        {activeTab === 'prescription' && (
          <div className="p-5 overflow-y-auto max-h-[500px] space-y-5 flex-1 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Upload Image Box */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/30 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[160px]"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {prescriptionImage ? (
                  <div className="space-y-2 text-center">
                    <img src={prescriptionImage} alt="Uploaded prescription" className="h-28 mx-auto rounded-lg object-contain border border-slate-200" />
                    <p className="text-[11px] text-emerald-700 font-bold">Image Uploaded (Click to replace)</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="font-bold text-slate-800">Upload Prescription Photo</p>
                    <p className="text-[10px] text-slate-400">JPEG, PNG or Camera photo</p>
                  </div>
                )}
              </div>

              {/* Paste Text / Doctor Notes */}
              <div className="flex flex-col">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Or Paste Doctor's Prescription Text:
                </label>
                <textarea
                  rows={5}
                  value={prescriptionText}
                  onChange={(e) => setPrescriptionText(e.target.value)}
                  placeholder="Rx: Tab Augmentin 625mg 1-0-1 x 5 days, Tab Pan-D 1-0-0 before food..."
                  className="w-full flex-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400 resize-none"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleScanPrescription}
              disabled={(!prescriptionImage && !prescriptionText.trim()) || isScanningPrescription}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
            >
              {isScanningPrescription ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Gemini Vision is decoding handwriting & medicines...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Scan Prescription & Check Stock</span>
                </>
              )}
            </button>

            {/* Results */}
            {prescriptionResult && (
              <div className="space-y-4 pt-4 border-t border-slate-200 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">
                      Prescription from: {prescriptionResult.doctorOrClinic || 'Verified Doctor'}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                      OCR Success
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs">{prescriptionResult.summary}</p>
                </div>

                <div className="space-y-2">
                  <h5 className="font-bold text-slate-800">Extracted Medications:</h5>
                  <div className="space-y-2">
                    {prescriptionResult.medicines.map((m, idx) => (
                      <div key={idx} className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-extrabold text-slate-900 text-xs">{m.medicineName}</p>
                          <p className="text-[11px] text-slate-500">
                            {m.dosage} • {m.frequency} {m.duration ? `(${m.duration})` : ''}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            const match = medicines.find(med => med.name.toLowerCase().includes(m.medicineName.toLowerCase()));
                            if (match) onSelectMedicine(match);
                            onClose();
                          }}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-lg font-bold text-xs transition-colors"
                        >
                          Find In Stock →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {prescriptionResult.warnings && prescriptionResult.warnings.length > 0 && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-1">
                    <span className="font-bold text-[11px] flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Important Clinical Notes:
                    </span>
                    {prescriptionResult.warnings.map((w, i) => (
                      <p key={i} className="text-[11px]">• {w}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer Disclaimer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-500 text-center flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Information provided for educational assistance. Always follow licensed physician instructions.</span>
        </div>
      </div>
    </div>
  );
};
