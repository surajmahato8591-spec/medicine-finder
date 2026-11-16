import React, { useState, useRef, useEffect } from 'react';
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
  RefreshCw,
  Volume2,
  VolumeX,
  Plus,
  Trash2,
  Check,
  ShieldAlert,
  HelpCircle,
  Clock,
  ExternalLink,
  MapPin
} from 'lucide-react';
import { 
  apiService, 
  SmartSearchResponse, 
  PrescriptionScanResponse, 
  DrugInteractionsResponse,
  GroundedWebSource,
  MapsPlacesResponse
} from '../services/api';
import { Medicine, Pharmacy } from '../types';

// Helper component to cleanly render clinical markdown from Gemini
const FormattedClinicalMessage: React.FC<{ text: string }> = ({ text }) => {
  const sections = text.split(/(?=### )/g);

  const formatInline = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const renderBulletList = (lines: string[]) => {
    return (
      <ul className="space-y-1.5 my-1.5">
        {lines.map((line, idx) => {
          const cleanLine = line.replace(/^[\*\-\•]\s+/, '');
          return (
            <li key={idx} className="flex items-start gap-2 text-xs leading-relaxed text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
              <span>{formatInline(cleanLine)}</span>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="space-y-3 font-sans text-left">
      {sections.map((sec, sIdx) => {
        const trimmed = sec.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith('### ')) {
          const firstLineEnd = trimmed.indexOf('\n');
          const header = firstLineEnd !== -1 ? trimmed.slice(4, firstLineEnd).trim() : trimmed.slice(4).trim();
          const body = firstLineEnd !== -1 ? trimmed.slice(firstLineEnd + 1).trim() : '';
          const bodyLines = body.split('\n').filter((l) => l.trim().length > 0);

          const isWarning = header.toLowerCase().includes('emergency') || header.toLowerCase().includes('warning') || header.toLowerCase().includes('precaution') || header.toLowerCase().includes('contraindication');
          const isDosage = header.toLowerCase().includes('dosage') || header.toLowerCase().includes('directions') || header.toLowerCase().includes('administration');
          const isGeneric = header.toLowerCase().includes('generic') || header.toLowerCase().includes('equivalent') || header.toLowerCase().includes('substitute') || header.toLowerCase().includes('cost');
          const isFormula = header.toLowerCase().includes('formula') || header.toLowerCase().includes('mechanism') || header.toLowerCase().includes('class');

          return (
            <div
              key={sIdx}
              className={`rounded-xl p-3 border transition-colors ${
                isWarning
                  ? 'bg-amber-50/80 border-amber-200/90 text-amber-950'
                  : isGeneric
                  ? 'bg-teal-50/70 border-teal-200/80 text-teal-950'
                  : isDosage
                  ? 'bg-blue-50/70 border-blue-200/80 text-blue-950'
                  : isFormula
                  ? 'bg-indigo-50/60 border-indigo-200/70 text-indigo-950'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <h4 className="text-xs font-bold tracking-tight mb-1.5 flex items-center gap-1.5">
                {isWarning && <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                {isGeneric && <Pill className="w-3.5 h-3.5 text-teal-600 shrink-0" />}
                {isDosage && <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                {isFormula && <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                {!isWarning && !isGeneric && !isDosage && !isFormula && <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                <span>{header.replace(/\*\*/g, '')}</span>
              </h4>

              {bodyLines.some((l) => l.trim().startsWith('* ') || l.trim().startsWith('- ')) ? (
                renderBulletList(bodyLines)
              ) : (
                <div className="text-xs leading-relaxed space-y-1 text-slate-700">
                  {bodyLines.map((line, lIdx) => (
                    <p key={lIdx}>{formatInline(line)}</p>
                  ))}
                </div>
              )}
            </div>
          );
        }

        // Non-heading block (e.g. intro / direct summary / disclaimer)
        const lines = trimmed.split('\n').filter((l) => l.trim().length > 0);
        const isDisclaimer = trimmed.toLowerCase().includes('disclaimer') || trimmed.toLowerCase().includes('consult a doctor') || trimmed.toLowerCase().includes('not a doctor');

        if (isDisclaimer) {
          return (
            <div key={sIdx} className="p-2.5 rounded-lg bg-slate-100 border border-slate-200 text-[11px] text-slate-600 italic">
              {formatInline(trimmed.replace(/\*/g, ''))}
            </div>
          );
        }

        return (
          <div key={sIdx} className="space-y-1.5 text-xs leading-relaxed text-slate-800">
            {lines.map((line, lIdx) => {
              if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                    <span>{formatInline(line.replace(/^[\*\-]\s+/, ''))}</span>
                  </div>
                );
              }
              return <p key={lIdx}>{formatInline(line)}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
};

interface AiPharmacistModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicines: Medicine[];
  pharmacies: Pharmacy[];
  onSelectMedicine: (med: Medicine) => void;
  onSelectPharmacy: (pharmacy: Pharmacy) => void;
  onOpenDirections: (pharmacy: Pharmacy) => void;
  initialTab?: 'chat' | 'symptom' | 'prescription' | 'interactions' | 'maps-ai';
  initialMedicine?: Medicine | null;
  userLocation?: { name: string; lat: number; lng: number };
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  structuredData?: any;
  sources?: GroundedWebSource[];
}

export const AiPharmacistModal: React.FC<AiPharmacistModalProps> = ({
  isOpen,
  onClose,
  medicines,
  pharmacies,
  onSelectMedicine,
  onSelectPharmacy,
  onOpenDirections,
  initialTab = 'chat',
  initialMedicine = null,
  userLocation,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'symptom' | 'prescription' | 'interactions' | 'maps-ai'>(initialTab);
  
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: `Hello! I am **MediFinder's Certified AI Pharmacist** powered by Gemini 4 with live Google Search Grounding. 🌿\n\nHow can I assist you today? You can ask me about:\n- Active ingredients & affordable generic substitutes\n- Dosage instructions (adult vs pediatric)\n- Drug interactions & side effects\n- Or discover real pharmacies in the **Live Maps AI** tab!`,
      timestamp: 'Just now',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

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

  // Drug Interactions state
  const [selectedMedsForInteractions, setSelectedMedsForInteractions] = useState<string[]>(
    initialMedicine ? [initialMedicine.name] : ['Paracetamol 650mg', 'Amoxicillin 500mg']
  );
  const [customMedInput, setCustomMedInput] = useState('');
  const [isCheckingInteractions, setIsCheckingInteractions] = useState(false);
  const [interactionResult, setInteractionResult] = useState<DrugInteractionsResponse | null>(null);

  // Live Maps AI state (Google Maps Grounding)
  const [mapsAiQuery, setMapsAiQuery] = useState('24-hour pharmacies and medical stores nearby');
  const [isLoadingMapsAi, setIsLoadingMapsAi] = useState(false);
  const [mapsAiResult, setMapsAiResult] = useState<MapsPlacesResponse | null>(null);

  // Sync initial tab or medicine when props change
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (initialMedicine) {
      if (initialTab === 'chat') {
        setInputQuery(`Tell me clinical dosage, generic alternatives, and precautions for ${initialMedicine.name}`);
      } else if (initialTab === 'interactions') {
        setSelectedMedsForInteractions((prev) => 
          prev.includes(initialMedicine.name) ? prev : [...prev, initialMedicine.name]
        );
      }
    }
  }, [initialMedicine, initialTab]);

  // Audio speech synthesis helper
  const handleToggleSpeak = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown symbols for clearer speech
    const cleanText = text
      .replace(/[*_#`~]/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Stop speech when closing modal
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

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
      const { reply, sources } = await apiService.askAiPharmacist(userMsgText);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: reply,
        sources,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingChat(false);
    }
  };

  // Handle Live Maps AI Discovery
  const handleSearchMapsAi = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!mapsAiQuery.trim() || isLoadingMapsAi) return;
    setIsLoadingMapsAi(true);
    try {
      const res = await apiService.findGroundedPharmacies(
        mapsAiQuery,
        userLocation?.lat,
        userLocation?.lng
      );
      setMapsAiResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingMapsAi(false);
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

  // Handle Drug Interaction Check
  const handleCheckInteractions = async () => {
    if (selectedMedsForInteractions.length === 0 || isCheckingInteractions) return;
    setIsCheckingInteractions(true);
    try {
      const res = await apiService.checkDrugInteractions(selectedMedsForInteractions);
      setInteractionResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCheckingInteractions(false);
    }
  };

  const handleAddCustomMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMedInput.trim()) return;
    if (!selectedMedsForInteractions.includes(customMedInput.trim())) {
      setSelectedMedsForInteractions([...selectedMedsForInteractions, customMedInput.trim()]);
    }
    setCustomMedInput('');
  };

  const handleRemoveMedFromInteraction = (med: string) => {
    setSelectedMedsForInteractions(selectedMedsForInteractions.filter((m) => m !== med));
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
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-extrabold tracking-tight">AI Health & Pharmacist Assistant</h3>
                <span className="bg-emerald-400/30 text-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300/30 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                  Gemini 4
                </span>
              </div>
              <p className="text-xs text-emerald-100/90">Clinical dosage, Google Search & Maps grounding, drug interactions & prescription reader</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-emerald-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-3 sm:px-5 pt-3 gap-1 sm:gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('chat')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
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
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'symptom'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Symptom Matcher</span>
          </button>

          <button
            onClick={() => setActiveTab('prescription')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'prescription'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Prescription Scanner</span>
          </button>

          <button
            onClick={() => setActiveTab('interactions')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'interactions'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Drug Interactions</span>
          </button>

          <button
            onClick={() => setActiveTab('maps-ai')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'maps-ai'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Live Maps AI</span>
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
                    {msg.sender === 'user' ? (
                      <div className="whitespace-pre-wrap font-sans font-medium text-white">{msg.text}</div>
                    ) : (
                      <>
                        <FormattedClinicalMessage text={msg.text} />
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                              Verified Web Clinical Sources (Google Search)
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {msg.sources.map((src, idx) => (
                                <a
                                  key={`${src.uri}-${idx}`}
                                  href={src.uri}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-semibold transition-colors"
                                >
                                  <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                                  <span className="truncate max-w-[180px]">{src.title}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100/50 text-[10px]">
                      {msg.sender === 'ai' && 'speechSynthesis' in window && (
                        <button
                          type="button"
                          onClick={() => handleToggleSpeak(msg.id, msg.text)}
                          className="flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer"
                        >
                          {speakingMessageId === msg.id ? (
                            <>
                              <VolumeX className="w-3 h-3 text-red-500" />
                              <span>Stop Audio</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3" />
                              <span>Read Aloud</span>
                            </>
                          )}
                        </button>
                      )}
                      <div className={`ml-auto font-medium ${msg.sender === 'user' ? 'text-emerald-200' : 'text-slate-400'}`}>
                        {msg.timestamp}
                      </div>
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
                    <span>AI Pharmacist is reviewing clinical databases with Gemini 4...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-[11px]">
              <span className="text-slate-500 font-semibold shrink-0">Try asking:</span>
              <button
                type="button"
                onClick={() => setInputQuery('What are cheaper generic alternatives for Paracetamol 650mg?')}
                className="px-2.5 py-1 bg-white hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 rounded-full text-slate-600 shrink-0 transition-colors cursor-pointer"
              >
                💊 Generic Substitutes
              </button>
              <button
                type="button"
                onClick={() => setInputQuery('Can I take Amoxicillin and Paracetamol together?')}
                className="px-2.5 py-1 bg-white hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 rounded-full text-slate-600 shrink-0 transition-colors cursor-pointer"
              >
                ⚠️ Drug Interactions
              </button>
              <button
                type="button"
                onClick={() => setInputQuery('What is the standard dosage for Azithromycin 500mg?')}
                className="px-2.5 py-1 bg-white hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 rounded-full text-slate-600 shrink-0 transition-colors cursor-pointer"
              >
                📋 Dosage Instructions
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask about medications, dosages, generic switches..."
                className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500 focus:bg-white"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isLoadingChat}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Symptom to Medicine Matcher */}
        {activeTab === 'symptom' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[500px]">
            <form onSubmit={handleAnalyzeSymptom} className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">
                Describe your symptoms or health issue in everyday words:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={symptomInput}
                  onChange={(e) => setSymptomInput(e.target.value)}
                  placeholder="e.g., severe acidity and burning sensation after meals since yesterday"
                  className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!symptomInput.trim() || isAnalyzingSymptom}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {isAnalyzingSymptom ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>Analyze</span>
                </button>
              </div>
            </form>

            {/* Quick Symptom Chips */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-slate-400 text-[11px] font-medium">Quick examples:</span>
              {[
                'High fever and body ache',
                'Dry cough and itchy throat',
                'Hyperacidity and stomach burn',
                'Sneezing and running nose',
              ].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSymptomInput(s)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 text-[11px] rounded-lg border border-slate-200 cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Results Display */}
            {symptomResult && (
              <div className="space-y-4 pt-3 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      AI Clinical Recommendation
                    </span>
                    <span className="text-[10px] bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      Matched
                    </span>
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900">
                    {symptomResult.aiAnalysis.primaryRecommendation}
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {symptomResult.aiAnalysis.reasoning}
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs">
                    <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Dosage Guidance</span>
                      <span className="font-semibold text-slate-800">{symptomResult.aiAnalysis.dosageGuideline}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Generic Composition</span>
                      <span className="font-semibold text-slate-800">{symptomResult.aiAnalysis.genericAlternative}</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2 text-[11px] text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{symptomResult.aiAnalysis.warning}</span>
                  </div>
                </div>

                {/* Available In Inventory */}
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-slate-700">Available In Nearby Pharmacies:</h5>
                  <div className="space-y-2">
                    {symptomResult.matchedMedicines.map((med) => (
                      <div
                        key={med.id}
                        className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between hover:border-emerald-300 transition-colors"
                      >
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900 text-xs">{med.name}</p>
                          <p className="text-[11px] text-slate-500">
                            {med.genericName} • ₹{med.defaultPrice.toFixed(2)}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            onSelectMedicine(med);
                            onClose();
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <span>View Stock</span>
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
          <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[500px]">
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-emerald-500 transition-colors bg-slate-50/50">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
              
              {prescriptionImage ? (
                <div className="space-y-3">
                  <img
                    src={prescriptionImage}
                    alt="Prescription preview"
                    className="max-h-48 mx-auto rounded-xl shadow-md border border-slate-200"
                  />
                  <div className="flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 cursor-pointer"
                    >
                      Change Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrescriptionImage(null)}
                      className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-xs">Upload doctor prescription photo or PDF snapshot</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Gemini Vision AI extracts medicine names, dosages & frequencies</p>
                  </div>
                </div>
              )}
            </div>

            {/* Or Paste Raw Text */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 block">
                Or paste doctor prescription notes / text:
              </label>
              <textarea
                value={prescriptionText}
                onChange={(e) => setPrescriptionText(e.target.value)}
                placeholder="e.g. Rx: Tab Dolo 650 1-0-1 x 3 days, Cap Novamox 500 1-1-1 x 5 days after food..."
                rows={2}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500"
              />
            </div>

            {/* Scan Action Button */}
            <button
              type="button"
              disabled={(!prescriptionImage && !prescriptionText.trim()) || isScanningPrescription}
              onClick={handleScanPrescription}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isScanningPrescription ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Gemini Vision is decoding handwriting & medicines...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Scan Prescription & Match Local Stock</span>
                </>
              )}
            </button>

            {/* Results */}
            {prescriptionResult && (
              <div className="space-y-4 pt-4 border-t border-slate-200 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs">
                      Prescription from: {prescriptionResult.doctorOrClinic || 'Verified Doctor'}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                      OCR Success
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs">{prescriptionResult.summary}</p>
                </div>

                <div className="space-y-2">
                  <h5 className="font-bold text-slate-800 text-xs">Extracted Medications:</h5>
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
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-lg font-bold text-xs transition-colors cursor-pointer"
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

        {/* Tab 4: Drug Interactions Matrix */}
        {activeTab === 'interactions' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[500px]">
            <div>
              <h4 className="text-xs font-bold text-slate-800">Drug-to-Drug Interaction & Food Safety Checker</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Add 2 or more medicines to check whether they can be safely co-administered, timing intervals, and food contraindications.
              </p>
            </div>

            {/* Selected Medicines Badges */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-600 block">Selected Medicines to Compare:</label>
              <div className="flex flex-wrap gap-2">
                {selectedMedsForInteractions.map((med) => (
                  <span
                    key={med}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold"
                  >
                    <Pill className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{med}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMedFromInteraction(med)}
                      className="text-emerald-600 hover:text-red-600 transition-colors ml-0.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
                {selectedMedsForInteractions.length === 0 && (
                  <span className="text-xs text-slate-400 italic">No medicines selected. Add some below.</span>
                )}
              </div>
            </div>

            {/* Add Custom Medicine */}
            <form onSubmit={handleAddCustomMed} className="flex gap-2">
              <input
                type="text"
                value={customMedInput}
                onChange={(e) => setCustomMedInput(e.target.value)}
                placeholder="Type a medicine name (e.g., Ibuprofen 400mg, Omeprazole 20mg)..."
                className="flex-1 px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>

            {/* Quick Catalog Chips */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick add from local catalog:</span>
              <div className="flex flex-wrap gap-1.5">
                {medicines.slice(0, 6).map((med) => (
                  <button
                    key={med.id}
                    type="button"
                    onClick={() => {
                      if (!selectedMedsForInteractions.includes(med.name)) {
                        setSelectedMedsForInteractions([...selectedMedsForInteractions, med.name]);
                      }
                    }}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 text-[11px] rounded-lg transition-colors cursor-pointer"
                  >
                    + {med.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Check Button */}
            <button
              type="button"
              disabled={selectedMedsForInteractions.length < 2 || isCheckingInteractions}
              onClick={handleCheckInteractions}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              {isCheckingInteractions ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Checking clinical contraindications with Gemini 4...</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  <span>Analyze {selectedMedsForInteractions.length} Medications for Interactions</span>
                </>
              )}
            </button>

            {/* Interaction Results */}
            {interactionResult && (
              <div className="space-y-3 pt-3 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-200">
                {/* Overall Safety Rating Card */}
                <div
                  className={`p-4 rounded-2xl border flex items-start gap-3 ${
                    interactionResult.overallSafetyLevel.toLowerCase().includes('severe')
                      ? 'bg-red-50 border-red-200 text-red-900'
                      : interactionResult.overallSafetyLevel.toLowerCase().includes('moderate') || interactionResult.overallSafetyLevel.toLowerCase().includes('caution')
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm uppercase">Overall Safety: {interactionResult.overallSafetyLevel}</span>
                    </div>
                    <p className="text-xs leading-relaxed">{interactionResult.summary}</p>
                  </div>
                </div>

                {/* Specific Interaction Pairs */}
                {interactionResult.interactions && interactionResult.interactions.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-slate-800">Interaction Breakdown:</h5>
                    <div className="space-y-2">
                      {interactionResult.interactions.map((pair, idx) => (
                        <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{pair.pair}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              pair.severity === 'High' ? 'bg-red-100 text-red-800' : pair.severity === 'Moderate' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {pair.severity} Severity
                            </span>
                          </div>
                          <p className="text-slate-600">{pair.description}</p>
                          <p className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 p-2 rounded-lg mt-1">
                            💡 Recommended Action: {pair.clinicalAction}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Food, Alcohol & Timing Guidelines */}
                {interactionResult.foodAndAlcoholWarnings && interactionResult.foodAndAlcoholWarnings.length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                    <span className="font-bold text-slate-700 block">Food & Alcohol Cautions:</span>
                    {interactionResult.foodAndAlcoholWarnings.map((warn, i) => (
                      <p key={i} className="text-slate-600 text-[11px]">• {warn}</p>
                    ))}
                    {interactionResult.timingRecommendations && (
                      <p className="text-[11px] text-slate-700 font-semibold pt-1">
                        ⏰ Timing: {interactionResult.timingRecommendations}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Live Maps AI (Google Maps Grounding) */}
        {activeTab === 'maps-ai' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[500px]">
            <div>
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Live Google Maps Pharmacy Discovery</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Powered by Gemini 4 &amp; Google Maps Grounding near{' '}
                <strong className="text-slate-700">{userLocation?.name || 'Mira Bhayandar'}</strong>.
              </p>
            </div>

            <form onSubmit={handleSearchMapsAi} className="flex gap-2">
              <input
                type="text"
                value={mapsAiQuery}
                onChange={(e) => setMapsAiQuery(e.target.value)}
                placeholder="e.g., 24-hour medical stores, Jan Aushadhi Kendra nearby..."
                className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500"
              />
              <button
                type="submit"
                disabled={!mapsAiQuery.trim() || isLoadingMapsAi}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                {isLoadingMapsAi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                <span>Discover</span>
              </button>
            </form>

            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-slate-400 text-[11px] font-medium">Quick searches:</span>
              {[
                '24-hour pharmacies open now nearby',
                'Jan Aushadhi Kendra generic stores nearby',
                'Apollo Pharmacy or Wellness Forever nearby',
              ].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setMapsAiQuery(q)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 text-[11px] rounded-lg border border-slate-200 cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>

            {mapsAiResult && (
              <div className="space-y-4 pt-3 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                  <FormattedClinicalMessage text={mapsAiResult.reply} />
                </div>

                {mapsAiResult.mapsPlaces && mapsAiResult.mapsPlaces.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Grounded Google Maps Places &amp; Reviews</span>
                    </h5>
                    <div className="space-y-2">
                      {mapsAiResult.mapsPlaces.map((place, idx) => (
                        <div
                          key={`${place.uri}-${idx}`}
                          className="p-3 bg-emerald-50/50 border border-emerald-200/80 rounded-xl space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-900">{place.title}</span>
                            <a
                              href={place.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shrink-0"
                            >
                              <span>View on Google Maps</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                          {place.reviewSnippets && place.reviewSnippets.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {place.reviewSnippets.map((rev, rIdx) => (
                                <a
                                  key={`${rev.uri}-${rIdx}`}
                                  href={rev.uri}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-md text-[10px] font-medium text-slate-700"
                                >
                                  <ExternalLink className="w-2.5 h-2.5 text-emerald-600" />
                                  <span>{rev.title}</span>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer Disclaimer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-500 text-center flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Information generated with Google Gemini 4 for educational assistance. Always follow licensed physician instructions.</span>
        </div>
      </div>
    </div>
  );
};
