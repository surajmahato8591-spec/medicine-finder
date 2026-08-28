import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { 
  INITIAL_PHARMACIES, 
  INITIAL_MEDICINES, 
  INITIAL_USER, 
  POPULAR_LOCATIONS,
  calculateDistance 
} from "./src/data/mockData";
import { 
  Pharmacy, 
  Medicine, 
  OrderRequest, 
  MedicineReminder,
  PharmacyMedicineInventory 
} from "./src/types";

// User provided API Key or Environment Variable
const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyDq4Fxse9nwSr9YD_NJPMzl-6uKn_OyVtI";

// Initialize Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// In-Memory Database State on the server
let serverPharmacies: Pharmacy[] = [...INITIAL_PHARMACIES];
let serverMedicines: Medicine[] = [...INITIAL_MEDICINES];
let serverOrders: OrderRequest[] = [...INITIAL_USER.orders];
let serverReminders: MedicineReminder[] = [...INITIAL_USER.reminders];

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser with 10mb limit for prescription image uploads
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // ----------------------------------------------------
  // API Routes
  // ----------------------------------------------------

  // Health check endpoint
  app.get("/api/health", (req: Request, res: Response) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      hasGeminiApiKey: Boolean(API_KEY),
      pharmaciesCount: serverPharmacies.length,
      medicinesCount: serverMedicines.length,
    });
  });

  // Get all medicines or search
  app.get("/api/medicines", (req: Request, res: Response) => {
    const q = ((req.query.q as string) || "").toLowerCase();
    const category = req.query.category as string;

    let results = serverMedicines;
    if (q) {
      results = results.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.genericName.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q) ||
          m.uses.some((u) => u.toLowerCase().includes(q))
      );
    }
    if (category && category !== "all") {
      results = results.filter((m) => m.category === category);
    }

    res.json({
      success: true,
      data: results,
      total: results.length,
    });
  });

  // Get all pharmacies or search with filters
  app.get("/api/pharmacies", (req: Request, res: Response) => {
    const {
      medicineId,
      lat,
      lng,
      radiusKm = "10",
      openNow,
      deliveryOnly,
      is24x7,
    } = req.query;

    let results = [...serverPharmacies];

    const userLat = lat ? parseFloat(lat as string) : undefined;
    const userLng = lng ? parseFloat(lng as string) : undefined;
    const radius = parseFloat(radiusKm as string);

    if (openNow === "true") {
      results = results.filter((p) => p.isOpenNow);
    }
    if (is24x7 === "true") {
      results = results.filter((p) => p.is24x7);
    }

    // Enrich with calculated distance & searched medicine stock
    const enriched = results.map((p) => {
      let distance = 0;
      if (userLat !== undefined && userLng !== undefined) {
        distance = calculateDistance(userLat, userLng, p.lat, p.lng);
      }

      let targetInventory: PharmacyMedicineInventory | undefined = undefined;
      if (medicineId) {
        targetInventory = p.inventory.find((i) => i.medicineId === medicineId);
      }

      return {
        ...p,
        calculatedDistance: distance,
        targetInventory,
      };
    });

    // If coordinates were passed, filter by radius & sort by distance
    let finalResults = enriched;
    if (userLat !== undefined && userLng !== undefined) {
      finalResults = enriched.filter((p) => p.calculatedDistance <= radius);
      finalResults.sort((a, b) => a.calculatedDistance - b.calculatedDistance);
    }

    res.json({
      success: true,
      data: finalResults,
      total: finalResults.length,
    });
  });

  // Update Pharmacy Inventory Stock
  app.post("/api/pharmacies/stock-update", (req: Request, res: Response) => {
    const { pharmacyId, medicineId, inStockStatus, stockQuantity, price } = req.body;

    if (!pharmacyId || !medicineId) {
      return res.status(400).json({ success: false, message: "pharmacyId and medicineId are required" });
    }

    let updated = false;
    serverPharmacies = serverPharmacies.map((pharmacy) => {
      if (pharmacy.id === pharmacyId) {
        const existingInvIndex = pharmacy.inventory.findIndex((i) => i.medicineId === medicineId);
        if (existingInvIndex >= 0) {
          const inv = pharmacy.inventory[existingInvIndex];
          pharmacy.inventory[existingInvIndex] = {
            ...inv,
            inStockStatus: inStockStatus || inv.inStockStatus,
            stockQuantity: stockQuantity !== undefined ? stockQuantity : inv.stockQuantity,
            price: price !== undefined ? price : inv.price,
            lastUpdated: "Just now",
          };
          updated = true;
        } else {
          pharmacy.inventory.push({
            medicineId,
            pharmacyId,
            inStockStatus: inStockStatus || "In Stock",
            stockQuantity: stockQuantity || 20,
            price: price || 50,
            lastUpdated: "Just now",
          });
          updated = true;
        }
      }
      return pharmacy;
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: "Pharmacy not found" });
    }

    res.json({
      success: true,
      message: "Inventory stock updated successfully",
      pharmacies: serverPharmacies,
    });
  });

  // Add new medicine to system & pharmacy
  app.post("/api/pharmacies/add-medicine", (req: Request, res: Response) => {
    const { medicine, pharmacyId, inventory } = req.body;

    if (!medicine || !pharmacyId) {
      return res.status(400).json({ success: false, message: "medicine and pharmacyId are required" });
    }

    const newMed: Medicine = {
      ...medicine,
      id: medicine.id || `med-${Date.now()}`,
    };

    // Check if medicine already exists
    if (!serverMedicines.find((m) => m.id === newMed.id)) {
      serverMedicines.unshift(newMed);
    }

    // Add to pharmacy inventory
    serverPharmacies = serverPharmacies.map((pharma) => {
      if (pharma.id === pharmacyId) {
        const newInv: PharmacyMedicineInventory = {
          medicineId: newMed.id,
          pharmacyId,
          inStockStatus: inventory?.inStockStatus || "In Stock",
          stockQuantity: inventory?.stockQuantity || 25,
          price: inventory?.price || newMed.defaultPrice || 30,
          lastUpdated: "Just now",
          expiryDate: inventory?.expiryDate || "2027-12-31",
        };
        return {
          ...pharma,
          inventory: [newInv, ...pharma.inventory],
        };
      }
      return pharma;
    });

    res.json({
      success: true,
      message: "Medicine added successfully",
      medicine: newMed,
      pharmacies: serverPharmacies,
      medicines: serverMedicines,
    });
  });

  // Orders: List and Create
  app.get("/api/orders", (req: Request, res: Response) => {
    res.json({
      success: true,
      data: serverOrders,
    });
  });

  app.post("/api/orders", (req: Request, res: Response) => {
    const orderData = req.body;
    if (!orderData.pharmacyId || !orderData.medicineName) {
      return res.status(400).json({ success: false, message: "Missing required order parameters" });
    }

    const newOrder: OrderRequest = {
      id: `ord-${Date.now()}`,
      pharmacyId: orderData.pharmacyId,
      pharmacyName: orderData.pharmacyName || "Local Pharmacy",
      pharmacyAddress: orderData.pharmacyAddress || "Station Road",
      pharmacyArea: orderData.pharmacyArea || "Mira Road East",
      medicineName: orderData.medicineName,
      packSize: orderData.packSize || "1 Strip (10 Tabs)",
      quantity: orderData.quantity || 1,
      pricePerUnit: orderData.pricePerUnit || 50,
      totalAmount: (orderData.pricePerUnit || 50) * (orderData.quantity || 1),
      type: "Pickup",
      status: "Reserved for Pickup",
      customerName: orderData.customerName || "Patient",
      customerPhone: orderData.customerPhone || "+91 98765 43210",
      notes: orderData.notes,
      timestamp: "Just now",
    };

    serverOrders.unshift(newOrder);

    res.json({
      success: true,
      message: "Order placed and confirmed with pharmacy!",
      order: newOrder,
    });
  });

  // Reminders endpoint
  app.get("/api/reminders", (req: Request, res: Response) => {
    res.json({ success: true, data: serverReminders });
  });

  app.post("/api/reminders", (req: Request, res: Response) => {
    const newRem: MedicineReminder = {
      ...req.body,
      id: req.body.id || `rem-${Date.now()}`,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
    };
    serverReminders.unshift(newRem);
    res.json({ success: true, reminder: newRem, reminders: serverReminders });
  });

  // ----------------------------------------------------
  // GEMINI AI POWERED CLINICAL ENDPOINTS
  // ----------------------------------------------------

  // AI Pharmacist Consultant: Ask questions about dosage, substitutes, interactions
  app.post("/api/ai/pharmacist", async (req: Request, res: Response) => {
    try {
      const { message, medicineName, userContext } = req.body;
      if (!message && !medicineName) {
        return res.status(400).json({ success: false, message: "Query message or medicineName is required" });
      }

      const ai = getGeminiClient();

      const systemPrompt = `You are MediFinder's Certified AI Clinical Pharmacist and Healthcare Assistant.
Your goal is to provide accurate, safe, empathetic, and scientifically grounded information on:
1. Active ingredients, generic equivalents, and cheaper generic alternatives.
2. Standard adult and pediatric dosage instructions, timings (before/after food).
3. Common vs. serious side effects, contraindications, and drug-drug interactions.
4. When to seek emergency in-person medical attention.
5. Important disclaimer: Always consult a licensed doctor or pharmacist for official diagnoses.

Format your responses with clear markdown sections:
- **Clinical Summary**: High level overview.
- **Dosage & Administration**: Recommended intake.
- **Generic Equivalents / Substitutes**: Affordable generic alternatives.
- **Precautions & Warnings**: Important safety advice.
- **Emergency Advice**: When to visit a physician.`;

      const prompt = `User Query: "${message || `Tell me all important clinical details and alternatives for ${medicineName}`}"
${userContext ? `User Context: ${JSON.stringify(userContext)}` : ''}
Available local catalogue medicines: ${serverMedicines.map(m => `${m.name} (${m.genericName}) - ₹${m.defaultPrice}`).join(', ')}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.4,
        },
      });

      res.json({
        success: true,
        reply: response.text,
      });
    } catch (error: any) {
      console.error("Gemini AI error in /api/ai/pharmacist:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate AI pharmacist response",
        error: error.message,
      });
    }
  });

  // AI Smart Natural Language Medicine & Symptom Search
  app.post("/api/ai/smart-search", async (req: Request, res: Response) => {
    try {
      const { naturalQuery, location } = req.body;
      if (!naturalQuery) {
        return res.status(400).json({ success: false, message: "naturalQuery is required" });
      }

      const ai = getGeminiClient();

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: `Analyze this user's medical or health symptom query: "${naturalQuery}".
Match it against our available catalogue and suggest the appropriate OTC or prescription medicines.

Catalogue:
${JSON.stringify(serverMedicines.map(m => ({ id: m.id, name: m.name, genericName: m.genericName, category: m.category, uses: m.uses })))}

Return a structured JSON with:
- "matchedMedicineIds": Array of IDs from catalogue that best match.
- "primaryRecommendation": Name of the best suited medicine.
- "reasoning": 1-2 sentence medical explanation.
- "dosageGuideline": Standard recommended dosage.
- "genericAlternative": Generic composition name.
- "warning": Crucial safety notice or prescription necessity.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              matchedMedicineIds: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "IDs of medicines matching from catalogue",
              },
              primaryRecommendation: {
                type: Type.STRING,
                description: "Name of recommended medicine",
              },
              reasoning: {
                type: Type.STRING,
                description: "Reasoning for the recommendation",
              },
              dosageGuideline: {
                type: Type.STRING,
                description: "Standard dosage guidance",
              },
              genericAlternative: {
                type: Type.STRING,
                description: "Active generic molecule name",
              },
              warning: {
                type: Type.STRING,
                description: "Precautions or red flags",
              },
            },
            required: ["matchedMedicineIds", "primaryRecommendation", "reasoning", "dosageGuideline", "warning"],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");

      // Find pharmacies that stock these matched medicines
      const matchedMeds = serverMedicines.filter((m) =>
        parsed.matchedMedicineIds?.includes(m.id)
      );

      res.json({
        success: true,
        aiAnalysis: parsed,
        matchedMedicines: matchedMeds.length > 0 ? matchedMeds : [serverMedicines[0]],
      });
    } catch (error: any) {
      console.error("Gemini AI smart-search error:", error);
      res.status(500).json({
        success: false,
        message: "Smart search analysis failed",
        error: error.message,
      });
    }
  });

  // AI Prescription Scanner & OCR Analysis (Image / Text)
  app.post("/api/ai/scan-prescription", async (req: Request, res: Response) => {
    try {
      const { imageBase64, mimeType = "image/jpeg", rawText } = req.body;
      const ai = getGeminiClient();

      let parts: any[] = [];
      if (imageBase64) {
        // Strip data URI prefix if present
        const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
        parts.push({
          inlineData: {
            data: cleanBase64,
            mimeType: mimeType,
          },
        });
        parts.push({
          text: `You are an expert clinical prescription reader. Analyze this prescription image:
1. Extract doctor name, clinic, patient details (if visible).
2. Extract all prescribed medicines, brand names, generic formulas, strengths (e.g., 500mg), dosage forms (tablet/syrup), and intake frequencies (e.g., 1-0-1 after food for 5 days).
3. Check for any severe interactions or warnings.
4. Match extracted medicines with our catalogue: ${serverMedicines.map(m => m.name).join(', ')}.

Return a structured JSON with:
- "doctorOrClinic": string
- "patientName": string
- "medicines": array of objects { medicineName, genericFormula, dosage, frequency, duration, instructions, matchedCatalogueName }
- "warnings": array of strings
- "summary": string`,
        });
      } else if (rawText) {
        parts.push({
          text: `Analyze this prescription text: "${rawText}".
Extract medicines, dosages, frequencies, warnings, and match with catalogue: ${serverMedicines.map(m => m.name).join(', ')}.
Return a structured JSON with:
- "doctorOrClinic": string
- "patientName": string
- "medicines": array of objects { medicineName, genericFormula, dosage, frequency, duration, instructions, matchedCatalogueName }
- "warnings": array of strings
- "summary": string`,
        });
      } else {
        return res.status(400).json({ success: false, message: "imageBase64 or rawText is required" });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: { parts },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              doctorOrClinic: { type: Type.STRING },
              patientName: { type: Type.STRING },
              summary: { type: Type.STRING },
              medicines: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    medicineName: { type: Type.STRING },
                    genericFormula: { type: Type.STRING },
                    dosage: { type: Type.STRING },
                    frequency: { type: Type.STRING },
                    duration: { type: Type.STRING },
                    instructions: { type: Type.STRING },
                    matchedCatalogueName: { type: Type.STRING },
                  },
                  required: ["medicineName", "dosage", "frequency"],
                },
              },
              warnings: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ["summary", "medicines"],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");

      res.json({
        success: true,
        prescription: parsed,
      });
    } catch (error: any) {
      console.error("Gemini prescription scanner error:", error);
      res.status(500).json({
        success: false,
        message: "Prescription scan failed",
        error: error.message,
      });
    }
  });

  // ----------------------------------------------------
  // Vite Integration & Static Fallback
  // ----------------------------------------------------
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MediFinder full-stack server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
