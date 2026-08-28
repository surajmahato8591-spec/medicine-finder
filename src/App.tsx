import React, { useState, useEffect } from 'react';
import { 
  INITIAL_PHARMACIES, 
  INITIAL_MEDICINES, 
  INITIAL_USER, 
  DEMO_USERS,
  POPULAR_LOCATIONS 
} from './data/mockData';
import { 
  Pharmacy, 
  Medicine, 
  SearchFilters, 
  UserProfile, 
  UserRole,
  MedicineReminder, 
  PharmacyMedicineInventory, 
  OrderRequest,
  MedicineStockAlert 
} from './types';
import { apiService } from './services/api';

// Navigation & Global
import { Navbar, NavTabType } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages & Views
import { LandingPage } from './components/LandingPage';
import { HeroSection } from './components/HeroSection';
import { HowItWorks } from './components/HowItWorks';
import { SearchMedicinePage } from './components/SearchMedicinePage';
import { SearchResultsPage } from './components/SearchResultsPage';
import { NearbyPharmaciesPage } from './components/NearbyPharmaciesPage';
import { UserDashboard } from './components/UserDashboard';
import { PharmacyDashboardPage } from './components/PharmacyDashboardPage';
import { AdminDashboard } from './components/AdminDashboard';
import { AboutSection } from './components/AboutSection';

// Modals
import { PharmacyDetailsModal } from './components/PharmacyDetailsModal';
import { MedicineDetailsModal } from './components/MedicineDetailsModal';
import { PharmacyPortalModal } from './components/PharmacyPortalModal';
import { AuthModal } from './components/AuthModal';
import { OrderRequestModal } from './components/OrderRequestModal';
import { StockNotificationModal } from './components/StockNotificationModal';
import { DirectionsModal } from './components/DirectionsModal';
import { AiPharmacistModal } from './components/AiPharmacistModal';

export default function App() {
  // Navigation active tab - always starts at 'home'
  const [activeTab, setActiveTab] = useState<NavTabType>('home');

  // Authenticated User state - null by default unless restored from localStorage
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('medifinder_user_session');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not restore user session:', e);
    }
    return null;
  });

  // Core Data state
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>(INITIAL_PHARMACIES);
  const [medicines, setMedicines] = useState<Medicine[]>(INITIAL_MEDICINES);

  // Global Orders state (aggregates orders from all demo accounts and user sessions)
  const [allOrders, setAllOrders] = useState<OrderRequest[]>(() => {
    const combined: OrderRequest[] = [];
    Object.values(DEMO_USERS).forEach((usr) => {
      if (usr.orders && usr.orders.length > 0) {
        usr.orders.forEach((ord) => {
          if (!combined.some((o) => o.id === ord.id)) {
            combined.push(ord);
          }
        });
      }
    });
    return combined;
  });

  // Search Filters state
  const [filters, setFilters] = useState<SearchFilters>({
    query: 'Paracetamol 650mg',
    location: POPULAR_LOCATIONS[0], // Mira Bhayandar, Maharashtra
    radiusKm: 5,
    stockFilter: 'all',
    openNowOnly: false,
    deliveryOnly: false,
    is24x7Only: false,
    sortBy: 'distance',
  });

  // Selected Entities state
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(INITIAL_PHARMACIES[0]);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(INITIAL_MEDICINES[0]);

  // Modals & Auth state
  const [showPharmacyDetailsModal, setShowPharmacyDetailsModal] = useState(false);
  const [showMedicineDetailsModal, setShowMedicineDetailsModal] = useState(false);
  const [showDirectionsModal, setShowDirectionsModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showStockNotificationModal, setShowStockNotificationModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalRegister, setAuthModalRegister] = useState(false);
  const [authModalRole, setAuthModalRole] = useState<UserRole>('patient');
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [pendingTargetTab, setPendingTargetTab] = useState<NavTabType | null>(null);
  const [pendingSearchQuery, setPendingSearchQuery] = useState<string | null>(null);
  const [showPharmacyPortalModal, setShowPharmacyPortalModal] = useState(false);
  const [showAiPharmacistModal, setShowAiPharmacistModal] = useState(false);

  // Active Order Context
  const [orderPharmacy, setOrderPharmacy] = useState<Pharmacy | null>(null);
  const [orderMedicine, setOrderMedicine] = useState<Medicine | null>(null);
  const [orderInventory, setOrderInventory] = useState<PharmacyMedicineInventory | undefined>(undefined);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync user changes to localStorage when currentUser changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('medifinder_user_session', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('medifinder_user_session');
    }
  }, [currentUser]);

  // Load live data from full-stack backend on initial mount
  useEffect(() => {
    async function loadData() {
      try {
        const [backendMeds, backendPharmacies] = await Promise.all([
          apiService.getMedicines(),
          apiService.getPharmacies(filters),
        ]);
        if (backendMeds && backendMeds.length > 0) setMedicines(backendMeds);
        if (backendPharmacies && backendPharmacies.length > 0) setPharmacies(backendPharmacies);
      } catch (err) {
        console.warn('Initial data fetch notice:', err);
      }
    }
    loadData();
  }, []);

  // Synchronize active medicine when filters query changes
  useEffect(() => {
    if (filters.query) {
      const match = medicines.find(
        (m) =>
          m.name.toLowerCase().includes(filters.query.toLowerCase()) ||
          m.genericName.toLowerCase().includes(filters.query.toLowerCase())
      );
      if (match) {
        setSelectedMedicine(match);
      }
    }
  }, [filters.query, medicines]);

  // Protected Route Guard
  const handleNavigate = (tab: NavTabType) => {
    // Public tabs accessible without login
    const publicTabs: NavTabType[] = ['home', 'how-it-works', 'about'];

    if (!currentUser && !publicTabs.includes(tab)) {
      setPendingTargetTab(tab);
      setAuthModalRegister(false);
      setAuthNotice(`Please log in or register to access ${tab.replace('-', ' ').toUpperCase()}.`);
      setShowAuthModal(true);
      return;
    }

    // Role restrictions for logged in users
    const protectedRoles: Record<string, UserRole[]> = {
      'dashboard': ['patient'],
      'pharmacy-dashboard': ['pharmacy_owner', 'admin'],
      'admin-dashboard': ['admin'],
    };

    const allowed = protectedRoles[tab];
    if (currentUser && allowed && !allowed.includes(currentUser.role)) {
      showToast(`Access Restricted: Your role (${currentUser.role}) does not have permissions for this page.`);
      return;
    }

    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Auth Dialog with optional custom options
  const handleOpenAuth = (isRegister = false, role: UserRole = 'patient', notice: string | null = null) => {
    setAuthModalRegister(isRegister);
    setAuthModalRole(role);
    setAuthNotice(notice);
    setShowAuthModal(true);
  };

  // Successful Login Handler
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('medifinder_user_session', JSON.stringify(user));
    showToast(`Logged in successfully as ${user.name}`);

    // 1. If user initiated a search from Home page while unauthenticated
    if (pendingSearchQuery) {
      setFilters((prev) => ({ ...prev, query: pendingSearchQuery }));
      setActiveTab('search-results');
      setPendingSearchQuery(null);
      setPendingTargetTab(null);
      setAuthNotice(null);
      return;
    }

    // 2. If user attempted to access a protected page
    if (pendingTargetTab) {
      setActiveTab(pendingTargetTab);
      setPendingTargetTab(null);
      setAuthNotice(null);
      return;
    }

    // 3. Otherwise navigate to role-based dashboard/page
    if (user.role === 'admin') {
      setActiveTab('admin-dashboard');
    } else if (user.role === 'pharmacy_owner') {
      setActiveTab('pharmacy-dashboard');
    } else {
      // Patient
      if (filters.query && filters.query.trim().length > 0) {
        setActiveTab('search-results');
      } else {
        setActiveTab('search');
      }
    }
    setAuthNotice(null);
  };

  // Logout Handler
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('medifinder_user_session');
    setActiveTab('home');
    setPendingSearchQuery(null);
    setPendingTargetTab(null);
    showToast('Logged out successfully. Returned to Home.');
  };

  // Handle Home Search Initiation (Requirement 3: Preserve query and prompt login if unauthenticated)
  const handleInitiateSearchFromHome = (queryOverride?: string) => {
    const q = queryOverride !== undefined ? queryOverride : filters.query;
    if (queryOverride !== undefined) {
      setFilters((prev) => ({ ...prev, query: queryOverride }));
    }

    const searchQuery = q || filters.query || 'Paracetamol 650mg';

    if (!currentUser) {
      // Save entered search temporarily
      setPendingSearchQuery(searchQuery);
      handleOpenAuth(
        false, 
        'patient', 
        `Please login or register to continue your search for "${searchQuery}".`
      );
    } else {
      setActiveTab('search-results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Change Search from Results Page
  const handleChangeSearch = () => {
    setActiveTab('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // New Search: Clear search query and open fresh search form
  const handleNewSearch = () => {
    setFilters((prev) => ({ ...prev, query: '' }));
    setSelectedMedicine(null);
    setActiveTab('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Pharmacy Selection
  const handleSelectPharmacy = (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setShowPharmacyDetailsModal(true);
  };

  // Handle Medicine Selection
  const handleSelectMedicine = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setFilters((prev) => ({ ...prev, query: medicine.name }));
  };

  // Handle Directions Modal Trigger
  const handleOpenDirections = (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setShowDirectionsModal(true);
  };

  // Handle Order / Reserve Trigger
  const handleOpenOrder = (
    pharmacy: Pharmacy,
    medicine: Medicine,
    inventory?: PharmacyMedicineInventory
  ) => {
    if (!currentUser) {
      setAuthNotice('Please login to reserve medicine for store counter pickup.');
      setShowAuthModal(true);
      return;
    }
    setOrderPharmacy(pharmacy);
    setOrderMedicine(medicine);
    setOrderInventory(inventory);
    setShowOrderModal(true);
  };

  // Handle "Notify Me When In Stock"
  const handleOpenStockNotification = (medicine: Medicine) => {
    if (!currentUser) {
      setAuthNotice('Please login to set up stock restock notifications.');
      setShowAuthModal(true);
      return;
    }
    setSelectedMedicine(medicine);
    setShowStockNotificationModal(true);
  };

  // Handle Bookmark toggle
  const handleToggleBookmark = (pharmacyId: string) => {
    if (!currentUser) {
      setAuthNotice('Please login to bookmark pharmacies to your dashboard.');
      setShowAuthModal(true);
      return;
    }
    setCurrentUser((prev) => {
      if (!prev) return null;
      const isSaved = prev.savedPharmacyIds.includes(pharmacyId);
      const updatedSaved = isSaved
        ? prev.savedPharmacyIds.filter((id) => id !== pharmacyId)
        : [...prev.savedPharmacyIds, pharmacyId];
      
      showToast(isSaved ? 'Removed pharmacy from bookmarks' : 'Pharmacy bookmarked to your dashboard');
      return {
        ...prev,
        savedPharmacyIds: updatedSaved,
      };
    });
  };

  // Handle Reminder Actions
  const handleAddReminder = (newRem: Omit<MedicineReminder, 'id'>) => {
    if (!currentUser) return;
    const reminder: MedicineReminder = {
      ...newRem,
      id: `rem-${Date.now()}`,
    };
    setCurrentUser((prev) => prev ? ({
      ...prev,
      reminders: [reminder, ...prev.reminders],
    }) : null);
    showToast(`Added dose reminder for ${reminder.medicineName}`);
  };

  const handleToggleReminder = (id: string) => {
    if (!currentUser) return;
    setCurrentUser((prev) => prev ? ({
      ...prev,
      reminders: prev.reminders.map((r) =>
        r.id === id ? { ...r, isActive: !r.isActive } : r
      ),
    }) : null);
  };

  const handleDeleteReminder = (id: string) => {
    if (!currentUser) return;
    setCurrentUser((prev) => prev ? ({
      ...prev,
      reminders: prev.reminders.filter((r) => r.id !== id),
    }) : null);
    showToast('Reminder deleted');
  };

  // Handle Order Submit
  const handleSubmitOrder = async (order: OrderRequest) => {
    setAllOrders((prev) => [order, ...prev]);
    if (currentUser) {
      setCurrentUser((prev) => prev ? ({
        ...prev,
        orders: [order, ...prev.orders],
      }) : null);
    }
    showToast(`Reservation #${order.id} sent to ${order.pharmacyName}!`);
    try {
      await apiService.submitOrder(order);
    } catch (e) {
      console.warn('Backend order submission notice:', e);
    }
  };

  // Handle Order Status Update (from Pharmacy portal)
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderRequest['status']) => {
    setAllOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    if (currentUser) {
      setCurrentUser((prev) => prev ? ({
        ...prev,
        orders: prev.orders.map((o) =>
          o.id === orderId ? { ...o, status: newStatus } : o
        ),
      }) : null);
    }
  };

  // Handle Subscribing to stock alert
  const handleSubscribeAlert = (alert: MedicineStockAlert) => {
    if (!currentUser) return;
    setCurrentUser((prev) => prev ? ({
      ...prev,
      stockAlerts: [alert, ...(prev.stockAlerts || [])],
      lowStockAlerts: (prev.lowStockAlerts || 0) + 1,
    }) : null);
    showToast(`Notification active for ${alert.medicineName}`);
  };

  // Handle Admin Pharmacy Verification Toggle
  const handleTogglePharmacyVerification = (pharmacyId: string) => {
    setPharmacies((prev) =>
      prev.map((p) =>
        p.id === pharmacyId ? { ...p, isVerified: !p.isVerified } : p
      )
    );
  };

  // Handle Admin Adding New Master Medicine
  const handleAddMasterMedicine = (newMed: Medicine) => {
    setMedicines((prev) => [newMed, ...prev]);
  };

  // Handle Pharmacy Owner adding medicine
  const handleAddMedicineFromPortal = async (
    newMed: Medicine,
    requestedPharmacyId: string,
    initialInventory: Omit<PharmacyMedicineInventory, 'medicineId' | 'pharmacyId'>
  ) => {
    // ENFORCE PHARMACY OWNER DATA ISOLATION:
    const targetPharmacyId = (currentUser?.role === 'pharmacy_owner' && currentUser.managedPharmacyId)
      ? currentUser.managedPharmacyId
      : requestedPharmacyId;

    setMedicines((prev) => [newMed, ...prev]);
    setPharmacies((prev) =>
      prev.map((pharma) => {
        if (pharma.id === targetPharmacyId) {
          return {
            ...pharma,
            inventory: [
              {
                ...initialInventory,
                medicineId: newMed.id,
                pharmacyId: targetPharmacyId,
              },
              ...pharma.inventory.filter((i) => i.medicineId !== newMed.id),
            ],
          };
        }
        return pharma;
      })
    );
    try {
      await apiService.addMedicine(newMed, targetPharmacyId, initialInventory);
    } catch (e) {
      console.warn('Backend add medicine notice:', e);
    }
  };

  // Handle Pharmacy Owner updating stock
  const handleUpdateStockFromPortal = async (
    requestedPharmacyId: string,
    medId: string,
    updates: Partial<PharmacyMedicineInventory>
  ) => {
    // ENFORCE PHARMACY OWNER DATA ISOLATION:
    const targetPharmacyId = (currentUser?.role === 'pharmacy_owner' && currentUser.managedPharmacyId)
      ? currentUser.managedPharmacyId
      : requestedPharmacyId;

    setPharmacies((prev) =>
      prev.map((pharma) => {
        if (pharma.id === targetPharmacyId) {
          return {
            ...pharma,
            inventory: pharma.inventory.map((inv) =>
              inv.medicineId === medId ? { ...inv, ...updates } : inv
            ),
          };
        }
        return pharma;
      })
    );
    try {
      await apiService.updateStock(targetPharmacyId, medId, updates);
    } catch (e) {
      console.warn('Backend stock update notice:', e);
    }
  };

  // Fallback user object for patient views if user is patient
  const activeUser = currentUser || DEMO_USERS.patient;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white font-sans">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[10000] bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in slide-in-from-bottom-4 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Main Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleNavigate}
        currentUser={currentUser}
        onOpenAuth={(isReg, role) => handleOpenAuth(isReg, role)}
        onLogout={handleLogout}
        onOpenAiPharmacist={() => setShowAiPharmacistModal(true)}
        savedCount={currentUser?.savedPharmacyIds.length || 0}
      />

      {/* Main App Content Views */}
      <main className="flex-1">
        {/* VIEW 1: Public Home Landing Page */}
        {activeTab === 'home' && (
          <LandingPage
            filters={filters}
            setFilters={setFilters}
            onInitiateSearch={(q) => handleInitiateSearchFromHome(q)}
            medicines={medicines}
            pharmacies={pharmacies}
            selectedMedicine={selectedMedicine}
            selectedPharmacy={selectedPharmacy}
            onSelectPharmacy={handleSelectPharmacy}
            onOpenDirections={handleOpenDirections}
            onSelectMedicine={(med) => {
              handleSelectMedicine(med);
            }}
            onOpenAuth={(isReg, role, notice) => handleOpenAuth(isReg, role, notice)}
            onNavigate={(tab) => handleNavigate(tab)}
            onOpenAiPharmacist={() => setShowAiPharmacistModal(true)}
          />
        )}

        {/* VIEW 2: Dedicated Search Medicine Page */}
        {activeTab === 'search' && (
          <SearchMedicinePage
            filters={filters}
            setFilters={setFilters}
            medicines={medicines}
            pharmacies={pharmacies}
            selectedMedicine={selectedMedicine}
            onSelectMedicine={handleSelectMedicine}
            onExecuteSearch={() => {
              if (!currentUser) {
                setPendingSearchQuery(filters.query || 'Paracetamol 650mg');
                handleOpenAuth(
                  false, 
                  'patient', 
                  `Please login or register to view live stock availability for "${filters.query || 'Paracetamol 650mg'}".`
                );
              } else {
                setActiveTab('search-results');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            onOpenAiPharmacist={() => setShowAiPharmacistModal(true)}
          />
        )}

        {/* VIEW 2B: Dedicated Search Results Availability Page */}
        {activeTab === 'search-results' && (
          <SearchResultsPage
            filters={filters}
            setFilters={setFilters}
            pharmacies={pharmacies}
            medicines={medicines}
            selectedMedicine={selectedMedicine}
            selectedPharmacy={selectedPharmacy}
            onSelectPharmacy={handleSelectPharmacy}
            onSelectMedicine={handleSelectMedicine}
            onOpenDirections={handleOpenDirections}
            onOpenOrder={handleOpenOrder}
            onToggleBookmark={handleToggleBookmark}
            savedPharmacyIds={currentUser ? currentUser.savedPharmacyIds : []}
            onOpenAiPharmacist={() => setShowAiPharmacistModal(true)}
            onNotifyMe={handleOpenStockNotification}
            onChangeSearch={handleChangeSearch}
            onNewSearch={handleNewSearch}
          />
        )}

        {/* VIEW 3: Dedicated Nearby Pharmacies Directory Page */}
        {activeTab === 'nearby-pharmacies' && (
          <NearbyPharmaciesPage
            pharmacies={pharmacies}
            filters={filters}
            setFilters={setFilters}
            selectedPharmacy={selectedPharmacy}
            onSelectPharmacy={handleSelectPharmacy}
            onOpenDirections={handleOpenDirections}
            onToggleBookmark={handleToggleBookmark}
            savedPharmacyIds={currentUser ? currentUser.savedPharmacyIds : []}
            onOpenSearchForPharmacy={(pharma) => {
              setSelectedPharmacy(pharma);
              handleInitiateSearchFromHome();
            }}
          />
        )}

        {/* VIEW 4: User Patient Dashboard */}
        {activeTab === 'dashboard' && currentUser && (
          <UserDashboard
            user={currentUser}
            pharmacies={pharmacies}
            onSearchQuery={(query) => {
              handleInitiateSearchFromHome(query);
            }}
            onSelectPharmacy={handleSelectPharmacy}
            onOpenDirections={handleOpenDirections}
            onAddReminder={handleAddReminder}
            onToggleReminder={handleToggleReminder}
            onDeleteReminder={handleDeleteReminder}
            onToggleBookmark={handleToggleBookmark}
            onOpenOrderModal={() => {
              setOrderPharmacy(pharmacies[0]);
              setOrderMedicine(medicines[0]);
              setShowOrderModal(true);
            }}
          />
        )}

        {/* VIEW 5: Pharmacy Owner Dashboard */}
        {activeTab === 'pharmacy-dashboard' && currentUser && (
          <PharmacyDashboardPage
            currentUser={currentUser}
            pharmacies={pharmacies}
            medicines={medicines}
            orders={allOrders}
            onAddMedicine={handleAddMedicineFromPortal}
            onUpdateStock={handleUpdateStockFromPortal}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onShowToast={showToast}
          />
        )}

        {/* VIEW 6: System Administrator Dashboard */}
        {activeTab === 'admin-dashboard' && currentUser && (
          <AdminDashboard
            pharmacies={pharmacies}
            medicines={medicines}
            orders={allOrders}
            onTogglePharmacyVerification={handleTogglePharmacyVerification}
            onAddMasterMedicine={handleAddMasterMedicine}
            onShowToast={showToast}
          />
        )}

        {/* VIEW 7: How It Works Educational Guide */}
        {activeTab === 'how-it-works' && <HowItWorks />}

        {/* VIEW 8: About & Compliance Disclaimers */}
        {activeTab === 'about' && <AboutSection />}
      </main>

      {/* Footer */}
      <Footer 
        onNavigate={(tab) => handleNavigate(tab as NavTabType)} 
        onOpenAuth={(isReg, role) => handleOpenAuth(isReg, role)}
      />

      {/* Global Interactive Modals */}
      {showPharmacyDetailsModal && (
        <PharmacyDetailsModal
          pharmacy={selectedPharmacy}
          onClose={() => setShowPharmacyDetailsModal(false)}
          searchedMedicine={selectedMedicine}
          allMedicines={medicines}
          onOpenDirections={handleOpenDirections}
          onOpenOrder={handleOpenOrder}
          onToggleBookmark={handleToggleBookmark}
          isSaved={currentUser && selectedPharmacy ? currentUser.savedPharmacyIds.includes(selectedPharmacy.id) : false}
          onSelectMedicine={(med) => {
            handleSelectMedicine(med);
            setShowPharmacyDetailsModal(false);
            handleInitiateSearchFromHome(med.name);
          }}
        />
      )}

      {showMedicineDetailsModal && (
        <MedicineDetailsModal
          medicine={selectedMedicine}
          pharmacies={pharmacies}
          filters={filters}
          onClose={() => setShowMedicineDetailsModal(false)}
          onSelectPharmacy={handleSelectPharmacy}
          onOpenOrder={handleOpenOrder}
        />
      )}

      {showDirectionsModal && (
        <DirectionsModal
          pharmacy={selectedPharmacy}
          filters={filters}
          onClose={() => setShowDirectionsModal(false)}
        />
      )}

      {showOrderModal && orderPharmacy && orderMedicine && (
        <OrderRequestModal
          pharmacy={orderPharmacy}
          medicine={orderMedicine}
          inventory={orderInventory}
          onClose={() => setShowOrderModal(false)}
          onSubmitOrder={handleSubmitOrder}
        />
      )}

      {showStockNotificationModal && selectedMedicine && (
        <StockNotificationModal
          medicine={selectedMedicine}
          userLocation={filters.location}
          onClose={() => setShowStockNotificationModal(false)}
          onSubscribeAlert={handleSubscribeAlert}
        />
      )}

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => {
            setShowAuthModal(false);
            setAuthNotice(null);
          }}
          onLoginSuccess={handleLoginSuccess}
          initialRegister={authModalRegister}
          initialRole={authModalRole}
          notice={authNotice}
        />
      )}

      {showPharmacyPortalModal && (
        <PharmacyPortalModal
          pharmacies={pharmacies}
          medicines={medicines}
          onClose={() => setShowPharmacyPortalModal(false)}
          onAddMedicine={handleAddMedicineFromPortal}
          onUpdateStock={handleUpdateStockFromPortal}
        />
      )}

      {showAiPharmacistModal && (
        <AiPharmacistModal
          isOpen={showAiPharmacistModal}
          onClose={() => setShowAiPharmacistModal(false)}
          medicines={medicines}
          pharmacies={pharmacies}
          onSelectMedicine={(med) => {
            handleSelectMedicine(med);
            handleInitiateSearchFromHome(med.name);
          }}
          onSelectPharmacy={handleSelectPharmacy}
          onOpenDirections={handleOpenDirections}
        />
      )}
    </div>
  );
}
