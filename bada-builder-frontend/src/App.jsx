import { useState, useEffect, lazy } from 'react'
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css'
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import LeadModal from './components/LeadModal/LeadModal';
import Chatbot from './components/Chatbot/Chatbot';
import ScrollToTop from './components/ScrollToTop';
import { useAuth } from './context/AuthContext';
import { PreloaderProvider, usePreloader } from './context/PreloaderContext';

import HeroSection from './components/HeroSection/HeroSection';
import RecommendedProjects from './components/RecommendedProjects/RecommendedProjects';

import Projects from './pages/Projects';
import Login from './pages/Login';
import RegisterWithOTP from './pages/RegisterWithOTP';
import ForgotPassword from './pages/ForgotPassword';
import Connect from './pages/Connect';
import SearchResults from './pages/SearchResults';
import ProjectDetails from './pages/ProjectDetails';
import BookSiteVisit from './pages/BookSiteVisit';
import PropertyDetails from './pages/PropertyDetails';
import Investments from './pages/Investments';
import InvestmentDetails from './pages/InvestmentDetails';
import InvestmentListing from './pages/InvestmentListing';
import Exhibition from './pages/Exhibition';
import Working from './pages/Working';
import Services from './pages/Services';
import Marketing from './pages/Marketing/Marketing';
import MarketingTerms from './pages/Marketing/MarketingTerms';
import MarketingRules from './pages/Marketing/MarketingRules';
import MarketingPackageDetails from './pages/Marketing/MarketingPackageDetails';
import SubscriptionPlans from './pages/SubscriptionPlans';
import DeveloperPlan from './pages/DeveloperPlan';
import IndividualPlan from './pages/IndividualPlan';
import PostProperty from './pages/PostProperty';
import ByIndividual from './pages/Exhibition/ByIndividual';
import ByDeveloper from './pages/Exhibition/ByDeveloper';
import ByBadaBuilder from './pages/Exhibition/ByBadaBuilder';
import LiveGrouping from './pages/Exhibition/LiveGrouping';
import LiveGroupingDetails from './pages/Exhibition/LiveGroupingDetails';
import ThreeDView from './pages/Exhibition/ThreeDView';
import ShortStayLanding from './pages/ShortStay/ShortStayLanding';
import ListShortStay from './pages/ShortStay/ListShortStay';
const ShortStayTrips = lazy(() => import('./pages/ShortStay/ShortStayTrips'));
import ShortStayDetails from './pages/ShortStay/ShortStayDetails';
import ShortStayReserve from './pages/ShortStay/ShortStayReserve';
import ShortStayTerms from './pages/ShortStay/ShortStayTerms';
import HostingDashboard from './pages/ShortStay/HostingDashboard';

import HomeLoans from './pages/HomeLoans/HomeLoans';
import AdminLiveGrouping from './pages/Admin/AdminLiveGrouping';
import LongLiveBrowse from './pages/LongLive/LongLiveBrowse';
import LongLivePost from './pages/LongLive/LongLivePost';
import HundredMonths from './pages/PaymentPlans/HundredMonths';
import GoGlobal from './pages/Global/GoGlobal';
import DataCentres from './pages/Investments/DataCentres';
import DataCentreDetails from './pages/Investments/DataCentreDetails';
import RegisterComplaint from './pages/Complaints/RegisterComplaint';
import MyComplaints from './pages/Complaints/MyComplaints';
import ProfilePage from './pages/ProfilePage';
import JoinedLiveGroups from './pages/JoinedLiveGroups';
import MessagesPage from './pages/MessagesPage';
import MyInvestments from './pages/MyInvestments';
import MyProperties from './pages/MyProperties';
import MyBookings from './pages/MyBookings';
import About from './pages/About';
import LAM from './pages/Report Data/LAM';
import MarketInvestmentAnalysis from './pages/Report Data/MarketInvestmentAnalysis';
import RealEstateFinancialModelling from './pages/Report Data/RealEstateFinancialModelling';
import RADD from './pages/Report Data/RADD';
import RealEstateReport from './pages/Report Data/RealEstateReport';
import REITValuationCompliance from './pages/Report Data/REITValuationCompliance';
import REITStakeholderCommunication from './pages/Report Data/REITStakeholderCommunication';
import REITTaxation from './pages/Report Data/REITTaxation';
import TypesOfREITs from './pages/Report Data/TypesOfREITs';
import REITJobProfiles from './pages/Report Data/REITJobProfiles';
import JobProfilesWork from './pages/Report Data/JobProfilesWork';
import FFOCalculator from './pages/calculator/FFOCalculator';
import AFFOCalculator from './pages/calculator/AFFOCalculator';
import NOICalculator from './pages/calculator/NOICalculator';
import CapRateCalculator from './pages/calculator/CapRateCalculator';
import NAVCalculator from './pages/calculator/NAVCalculator';
import LTVCalculator from './pages/calculator/LTVCalculator';
import DividendYieldCalculator from './pages/calculator/DividendYieldCalculator';
import PayoutRatioCalculator from './pages/calculator/PayoutRatioCalculator';
import DSCRCalculator from './pages/calculator/DSCRCalculator';
import IRRCalculator from './pages/calculator/IRRCalculator';
import TotalReturnCalculator from './pages/calculator/TotalReturnCalculator';
import OccupancyRateCalculator from './pages/calculator/OccupancyRateCalculator';
import EBITDAreCalculator from './pages/calculator/EBITDAreCalculator';
import PFFOCalculator from './pages/calculator/PFFOCalculator';
import DCFCalculator from './pages/calculator/DCFCalculator';
import NPVCalculator from './pages/calculator/NPVCalculator';
import ReferEarn from './components/Refer & Earn/ReferEarn';
import ReferEarnResult from './components/Refer & Earn/ReferEarnResult';
import PropertyShowcase from './components/Refer & Earn/PropertyShowcase';



// New Admin Panel Components
import NewAdminLayout from './pages/Admin/AdminLayout';
import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';
import UserManagement from './pages/Admin/UserManagement';
import PropertyApproval from './pages/Admin/PropertyApproval';
import AuditLogs from './pages/Admin/AuditLogs';
import PropertiesManagement from './pages/Admin/PropertiesManagement';
import LiveGroupingManagement from './pages/Admin/LiveGroupingManagement';
import BadaBuilderManagement from './pages/Admin/BadaBuilderManagement';
import AdminRedirect from './pages/AdminRedirect';
import AdminDebug from './pages/AdminDebug';
import AdminReviews from './pages/Admin/AdminReviews';
import SiteVisitBookings from './pages/Admin/SiteVisitBookings';
import ReferEarnManagement from './pages/Admin/ReferEarnManagement';

// Preloader Components
import Preloader from './components/Preloader/Preloader';
import InitialPreloader from './components/Preloader/InitialPreloader';
import PageTransition from './components/Motion/PageTransition';

import BookmarkedProperties from './pages/BookmarkedProperties';
import { FavoritesProvider } from './context/FavoritesContext';

function AppContent() {
  const [showLeadModal, setShowLeadModal] = useState(false);
  const { currentUser } = useAuth();
  const { initialLoading } = usePreloader();
  const location = useLocation();
  const isMessagesPage = location.pathname === '/messages';
  const isAdminPanel = location.pathname.startsWith('/admin-panel') || location.pathname.startsWith('/admin');

  useEffect(() => {
    // Hide modal if user logs in or navigates away from Home page
    if (currentUser || location.pathname !== '/') {
      setShowLeadModal(false);
      return;
    }

    // Show lead modal after 2 seconds for guest users on Home page only
    const timer = setTimeout(() => {
      setShowLeadModal(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [location.pathname, currentUser]);

  // Define allowed paths for Chatbot visibility
  const allowedChatbotPaths = [
    '/',
    '/exhibition',
    '/exhibition/individual',
    '/exhibition/developer',
    '/exhibition/live-grouping',
    '/exhibition/badabuilder',
    '/short-stay',
    '/services',
    '/long-live/browse',
    '/long-live/post',
    '/investments',
    '/contact',
    '/about',
    '/post-property',
    '/profile'
  ];

  const showChatbot = allowedChatbotPaths.includes(location.pathname);

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <ScrollToTop />
      <InitialPreloader />
      <Preloader />

      <div style={{
        opacity: initialLoading ? 0 : 1,
        transition: 'opacity 0.8s ease',
        visibility: initialLoading ? 'hidden' : 'visible'
      }}>
        {!isMessagesPage && !isAdminPanel && <Header />}
        <LeadModal isOpen={showLeadModal} onClose={() => setShowLeadModal(false)} />
        {showChatbot && <Chatbot />}
        {(location.pathname === '/' || location.pathname === '/search') && <HeroSection />}
        <main style={{ minHeight: '100vh' }}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              {/* Admin Panel Login Route */}
              <Route path="/admin-panel" element={<AdminLogin />} />

              {/* Admin Panel Routes */}
              <Route path="/admin" element={<NewAdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="properties" element={<PropertiesManagement />} />
                <Route path="live-grouping" element={<LiveGroupingManagement />} />
                <Route path="bada-builder" element={<BadaBuilderManagement />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="bookings" element={<SiteVisitBookings />} />
                <Route path="refer-earn" element={<ReferEarnManagement />} />
                <Route path="analytics" element={<AuditLogs />} />
                <Route path="settings" element={<AuditLogs />} />
                <Route path="live-grouping-management" element={<AdminLiveGrouping />} />
              </Route>

              <Route path="/" element={<RecommendedProjects />} />
              {/* <Route path="/projects" element={<Projects />} /> */}
              <Route path="/services" element={<Services />} />
              <Route path="/services/marketing" element={<Marketing />} />
              <Route path="/services/marketing/package/:id" element={<MarketingPackageDetails />} />
              <Route path="/services/marketing/terms-conditions" element={<MarketingTerms />} />
              <Route path="/services/marketing/rules-regulations" element={<MarketingRules />} />
              <Route path="/investments" element={<Investments />} />
              <Route path="/exhibition" element={<Exhibition />} />
              <Route path="/exhibition/individual" element={<ByIndividual />} />
              <Route path="/exhibition/developer" element={<ByDeveloper />} />
              <Route path="/exhibition/live-grouping" element={<LiveGrouping />} />
              <Route path="/exhibition/live-grouping/:id" element={<LiveGroupingDetails />} />
              <Route path="/exhibition/3d-view" element={<ThreeDView />} />
              <Route path="/short-stay" element={<ShortStayLanding />} />
              <Route path="/short-stay/trips" element={<ShortStayTrips />} />
              <Route path="/short-stay/list-property" element={<ListShortStay />} />
              <Route path="/short-stay/:id" element={<ShortStayDetails />} />
              <Route path="/short-stay/reserve/:id" element={<ShortStayReserve />} />
              <Route path="/short-stay/terms-conditions" element={<ShortStayTerms />} />
              <Route path="/hosting" element={<HostingDashboard />} />

              <Route path="/home-loans" element={<HomeLoans />} />
              <Route path="/long-live/browse" element={<LongLiveBrowse />} />
              <Route path="/long-live/post" element={<LongLivePost />} />
              <Route path="/100-months" element={<HundredMonths />} />
              <Route path="/go-global" element={<GoGlobal />} />
              <Route path="/investments/data-centres" element={<DataCentres />} />
              <Route path="/investments/data-centres/:id" element={<DataCentreDetails />} />
              <Route path="/register-complaint" element={<RegisterComplaint />} />
              <Route path="/exhibition/badabuilder" element={<ByBadaBuilder />} />
              <Route path="/report" element={<Working />} />
              <Route path="/subscription-plans" element={<SubscriptionPlans />} />
              <Route path="/developer-plan" element={<DeveloperPlan />} />
              <Route path="/individual-plan" element={<IndividualPlan />} />
              <Route path="/post-property" element={<PostProperty />} />
              <Route path="/properties" element={<Projects />} />
              <Route path="/refer-earn" element={<ReferEarn />} />
              <Route path="/refer-earn/eligibility-result" element={<ReferEarnResult />} />
              <Route path="/refer-and-earn/property-showcase" element={<PropertyShowcase />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/joined-live-groups" element={<JoinedLiveGroups />} />
              <Route path="/my-complaints" element={<MyComplaints />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/profile/favorites" element={<BookmarkedProperties />} />
              <Route path="/profile/investments" element={<MyInvestments />} />
              <Route path="/my-properties" element={<MyProperties />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/investments/:type" element={<InvestmentListing />} />
              <Route path="/investment-details/:id" element={<InvestmentDetails />} />
              <Route path="/about" element={<About />} />

              {/* Legacy admin routes redirect */}
              <Route path="/admin-panel/*" element={<AdminRedirect />} />

              {/* Debug route */}
              <Route path="/admin-debug" element={<AdminDebug />} />

              {/* Learn */}
              <Route path="/learn/lease-and-asset-management" element={<LAM />}></Route>
              <Route path="/learn/market-and-investment-analysis" element={<MarketInvestmentAnalysis />} />
              <Route path="/learn/real-estate-financial-modelling" element={<RealEstateFinancialModelling />} />
              <Route path="/learn/risk-assessment-due-diligence" element={<RADD />} />
              <Route path="/learn/real-estate-market-research" element={<RealEstateReport />} />
              <Route path="/learn/reit-valuation-and-compliance" element={<REITValuationCompliance />} />
              <Route path="/learn/stakeholder-communication" element={<REITStakeholderCommunication />} />
              <Route path="/learn/taxation-in-reits" element={<REITTaxation />} />
              <Route path="/learn/job-profiles-in-reits" element={<REITJobProfiles />} />
              <Route path="/learn/types-of-reits-india" element={<TypesOfREITs />} />
              <Route path="/learn/work-of-job-profiles" element={<JobProfilesWork />} />

              {/* Calculator  */}
              <Route path="/calculator/FFO" element={<FFOCalculator />} />
              <Route path="/calculator/AFFO" element={<AFFOCalculator />} />
              <Route path="/calculator/NOI" element={<NOICalculator />} />
              <Route path="/calculator/CapRate" element={<CapRateCalculator />} />
              <Route path="/calculator/NAV" element={<NAVCalculator />} />
              <Route path="/calculator/LTV" element={<LTVCalculator />} />
              <Route path="/calculator/DividendYield" element={<DividendYieldCalculator />} />
              <Route path="/calculator/PayoutRatio" element={<PayoutRatioCalculator />} />
              <Route path="/calculator/DSCR" element={<DSCRCalculator />} />
              <Route path="/calculator/IRR" element={<IRRCalculator />} />
              <Route path="/calculator/TotalReturn" element={<TotalReturnCalculator />} />
              <Route path="/calculator/OccupancyRate" element={<OccupancyRateCalculator />} />
              <Route path="/calculator/EBITDAre" element={<EBITDAreCalculator />} />
              <Route path="/calculator/PFFO" element={<PFFOCalculator />} />
              <Route path="/calculator/DCF" element={<DCFCalculator />} />
              <Route path="/calculator/NPV" element={<NPVCalculator />} />

              <Route path="/contact" element={<Connect />} />
              {/* <Route path="/calculator" element={<Calculator />} /> */}

              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<RegisterWithOTP />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/book-visit" element={<BookSiteVisit />} />
              <Route path="/property-details/:id" element={<PropertyDetails />} />
              <Route path="/projects/:id" element={<ProjectDetails />} />
            </Routes>
          </AnimatePresence>
        </main>
        {!isMessagesPage && !isAdminPanel && <Footer />}
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <PreloaderProvider>
        <FavoritesProvider>
          <AppContent />
        </FavoritesProvider>
      </PreloaderProvider>
    </Router >
  );
}

export default App;
