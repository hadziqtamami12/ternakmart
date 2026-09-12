// App.jsx - Root Application Router with Clean URL Sync & Isolated /admin & /demo Paths
import React, { useState, useEffect } from 'react';
import { AppConfigProvider } from './context/AppConfigContext';
import { ThemeProvider } from './context/ThemeContext';
import { TimezoneProvider } from './context/TimezoneContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';

// Navigation Components
import DesktopNav from './components/common/DesktopNav';
import MobileHeader from './components/common/MobileHeader';
import FloatingBottomDock from './components/common/FloatingBottomDock';
import CartDrawer from './components/common/CartDrawer';

// Pages
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import AnimalDetailPage from './pages/AnimalDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import BuyerOrdersPage from './pages/BuyerOrdersPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import ChatPage from './pages/ChatPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import RegisterStorePage from './pages/RegisterStorePage';
import DemoPage from './pages/DemoPage';

// Role-specific Dashboards
import SellerDashboardPage from './pages/seller/SellerDashboardPage';
import ManageLivestockPage from './pages/seller/ManageLivestockPage';
import CourierDashboardPage from './pages/courier/CourierDashboardPage';
import AdminPortalWrapper from './pages/admin/AdminPortalWrapper';

function parseUrlPath() {
  const pathname = window.location.pathname.toLowerCase();
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/demo')) return 'demo';
  if (pathname.startsWith('/catalog')) return 'catalog';
  if (pathname.startsWith('/cart')) return 'cart';
  if (pathname.startsWith('/checkout')) return 'checkout';
  if (pathname.startsWith('/orders')) return 'orders';
  if (pathname.startsWith('/tracking')) return 'tracking';
  if (pathname.startsWith('/chat')) return 'chat';
  if (pathname.startsWith('/seller') || pathname.startsWith('/toko')) return 'seller-dashboard';
  if (pathname.startsWith('/manage-livestock')) return 'manage-livestock';
  if (pathname.startsWith('/courier')) return 'courier-dashboard';
  if (pathname.startsWith('/profile')) return 'profile';
  if (pathname.startsWith('/auth')) return 'auth';
  if (pathname.startsWith('/register-store')) return 'register-store';
  return 'home';
}

function getPathForPage(page, params = {}) {
  switch (page) {
    case 'admin': return '/admin';
    case 'demo': return '/demo';
    case 'catalog': return '/catalog';
    case 'cart': return '/cart';
    case 'checkout': return '/checkout';
    case 'orders': return '/orders';
    case 'tracking': return params.newOrderId ? `/tracking/${params.newOrderId}` : '/tracking';
    case 'chat': return '/chat';
    case 'seller-dashboard': return '/seller';
    case 'manage-livestock': return '/manage-livestock';
    case 'courier-dashboard': return '/courier';
    case 'profile': return '/profile';
    case 'auth': return '/auth';
    case 'register-store': return '/register-store';
    case 'home':
    default:
      return '/';
  }
}

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState(() => parseUrlPath());
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState('ord_demo_001');
  const [chatTargetUserId, setChatTargetUserId] = useState(null);
  const [chatAnimalContext, setChatAnimalContext] = useState(null);
  const [checkoutAnimalId, setCheckoutAnimalId] = useState(null);
  const [checkoutAnimalIds, setCheckoutAnimalIds] = useState([]);
  const [catalogInitialCategory, setCatalogInitialCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Handle browser Back / Forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(parseUrlPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (page, params = {}) => {
    // If opening register-store while not authenticated, redirect to auth
    let targetPage = page;
    if (page === 'register-store' && !isAuthenticated) {
      targetPage = 'auth';
    }

    if (params.category) setCatalogInitialCategory(params.category);
    if (params.animalId) setCheckoutAnimalId(params.animalId);
    if (params.animalIds) setCheckoutAnimalIds(params.animalIds);
    if (params.newOrderId) setActiveTrackingOrderId(params.newOrderId);

    const path = getPathForPage(targetPage, params);
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }

    setCurrentPage(targetPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectAnimal = (animal) => {
    setSelectedAnimal(animal);
    setCurrentPage('animal-detail');
    window.history.pushState({}, '', `/animal/${animal.slug || animal.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenTracking = (orderId) => {
    setActiveTrackingOrderId(orderId);
    setCurrentPage('tracking');
    window.history.pushState({}, '', `/tracking?order_id=${orderId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartChat = ({ targetUserId, animalContext }) => {
    if (targetUserId) setChatTargetUserId(targetUserId);
    if (animalContext) setChatAnimalContext(animalContext);
    setCurrentPage('chat');
    window.history.pushState({}, '', '/chat');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ISOLATED ADMIN PORTAL (ONLY AT /admin)
  if (currentPage === 'admin') {
    return (
      <AdminPortalWrapper
        onNavigateHome={() => navigateTo('home')}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-theme-bg text-theme-text transition-colors duration-200 w-full max-w-full">
      {/* Top Navbars (Customer E-Commerce Experience) */}
      <DesktopNav
        onNavigate={navigateTo}
        currentPage={currentPage}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSelectAnimal={handleSelectAnimal}
      />
      <MobileHeader
        onNavigate={navigateTo}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSelectAnimal={handleSelectAnimal}
      />

      {/* Main Routed Page Content */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={navigateTo}
            onSelectAnimal={handleSelectAnimal}
          />
        )}

        {currentPage === 'catalog' && (
          <CatalogPage
            initialCategory={catalogInitialCategory}
            searchQuery={searchQuery}
            onNavigate={navigateTo}
            onSelectAnimal={handleSelectAnimal}
          />
        )}

        {currentPage === 'animal-detail' && (
          <AnimalDetailPage
            animal={selectedAnimal}
            onBack={() => navigateTo('catalog')}
            onNavigate={navigateTo}
            onStartChat={handleStartChat}
          />
        )}

        {currentPage === 'cart' && (
          <CartPage onNavigate={navigateTo} onSelectAnimal={handleSelectAnimal} />
        )}

        {currentPage === 'checkout' && (
          <CheckoutPage
            animalId={checkoutAnimalId || selectedAnimal?.id}
            animalIds={checkoutAnimalIds}
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'orders' && (
          <BuyerOrdersPage
            onNavigate={navigateTo}
            onOpenTracking={handleOpenTracking}
          />
        )}

        {currentPage === 'tracking' && (
          <OrderTrackingPage
            orderId={activeTrackingOrderId}
            onBack={() => navigateTo('orders')}
            onNavigate={navigateTo}
            onStartChat={handleStartChat}
          />
        )}

        {currentPage === 'chat' && (
          <ChatPage
            targetUserId={chatTargetUserId}
            initialAnimal={chatAnimalContext}
            onBack={() => navigateTo('home')}
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'auth' && (
          <AuthPage onNavigate={navigateTo} />
        )}

        {currentPage === 'profile' && (
          <ProfilePage onNavigate={navigateTo} />
        )}

        {currentPage === 'register-store' && (
          <RegisterStorePage
            onBack={() => navigateTo('profile')}
            onSuccess={() => navigateTo('seller-dashboard')}
            onNavigate={navigateTo}
          />
        )}

        {/* Dedicated Testing & QA Sandbox at /demo */}
        {currentPage === 'demo' && (
          <DemoPage onNavigate={navigateTo} />
        )}

        {/* Seller & Courier Portals */}
        {currentPage === 'seller-dashboard' && (
          <SellerDashboardPage
            onNavigate={navigateTo}
            onEditLivestock={(animal) => {
              setSelectedAnimal(animal);
              navigateTo('manage-livestock');
            }}
          />
        )}

        {currentPage === 'manage-livestock' && (
          <ManageLivestockPage
            onBack={() => navigateTo('seller-dashboard')}
            onSaveSuccess={() => navigateTo('seller-dashboard')}
          />
        )}

        {currentPage === 'courier-dashboard' && (
          <CourierDashboardPage
            onOpenTracking={handleOpenTracking}
          />
        )}
      </main>

      {/* Floating Bottom Dock for Mobile */}
      <FloatingBottomDock
        currentPage={currentPage}
        onNavigate={navigateTo}
        activeOrdersCount={1}
      />

      {/* Slide-out Cart Drawer Sidebar */}
      <CartDrawer
        onNavigate={navigateTo}
        onSelectAnimal={handleSelectAnimal}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppConfigProvider>
      <ThemeProvider>
        <TimezoneProvider>
          <AuthProvider>
            <CartProvider>
              <NotificationProvider>
                <AppContent />
              </NotificationProvider>
            </CartProvider>
          </AuthProvider>
        </TimezoneProvider>
      </ThemeProvider>
    </AppConfigProvider>
  );
}
