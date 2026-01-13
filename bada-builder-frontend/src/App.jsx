import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css'
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import LeadModal from './components/LeadModal/LeadModal';
import GlobalSearchBar from './components/GlobalSearchBar/GlobalSearchBar';
import Chatbot from './components/Chatbot/Chatbot';
import ScrollToTop from './components/ScrollToTop';
import { useAuth } from './context/AuthContext';

import HeroSection from './components/HeroSection/HeroSection';
import RecommendedProjects from './components/RecommendedProjects/RecommendedProjects';

import Projects from './pages/Projects';
import Login from './pages/Login';
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



import AdminLogin from './pages/AdminPanel/AdminLogin';
import AdminLayout from './pages/AdminPanel/AdminLayout';
import AdminPostProperty from './pages/AdminPanel/PostProperty';
import AdminManageProperties from './pages/AdminPanel/ManageProperties';

// Preloader Imports
import { PreloaderProvider } from './context/PreloaderContext';
import Preloader from './components/Preloader/Preloader';

function AppContent() {
  const [showLeadModal, setShowLeadModal] = useState(false);
  const { currentUser } = useAuth();
  const location = useLocation();
  const isMessagesPage = location.pathname === '/messages';

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

  return (
    <>
      <ScrollToTop />
      <Preloader />
      {!isMessagesPage && <Header />}
      {!isMessagesPage && <GlobalSearchBar />}
      <LeadModal isOpen={showLeadModal} onClose={() => setShowLeadModal(false)} />
      {!isMessagesPage && <Chatbot />}
      <main style={{ minHeight: isMessagesPage ? '100vh' : '60vh' }}>
        <Routes>
          <Route path="/" element={
            <>
              <HeroSection />
              <RecommendedProjects />
            </>
          } />
          {/* <Route path="/projects" element={<Projects />} /> */}
          <Route path="/services" element={<Services />} />
          <Route path="/investments" element={<Investments />} />
          <Route path="/exhibition" element={<Exhibition />} />
          <Route path="/exhibition/individual" element={<ByIndividual />} />
          <Route path="/exhibition/developer" element={<ByDeveloper />} />
          <Route path="/exhibition/live-grouping" element={<LiveGrouping />} />
          <Route path="/exhibition/live-grouping/:id" element={<LiveGroupingDetails />} />
          <Route path="/exhibition/3d-view" element={<ThreeDView />} />
          <Route path="/short-stay" element={<ShortStayLanding />} />
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
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/my-complaints" element={<MyComplaints />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/profile/investments" element={<MyInvestments />} />
          <Route path="/my-properties" element={<MyProperties />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/admin/live-grouping" element={<AdminLiveGrouping />} />
          <Route path="/investments/:type" element={<InvestmentListing />} />
          <Route path="/investment-details/:id" element={<InvestmentDetails />} />
          <Route path="/about" element={<About />} />

          {/* Admin Panel Routes */}
          <Route path="/admin-panel/login" element={<AdminLogin />} />
          <Route path="/admin-panel" element={<AdminLayout />}>
            <Route index element={<AdminPostProperty />} /> {/* Default to Post Property */}
            <Route path="post-property" element={<AdminPostProperty />} />
            <Route path="manage-properties" element={<AdminManageProperties />} />
          </Route>

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
          <Route path="/search" element={<SearchResults />} />
          <Route path="/book-visit" element={<BookSiteVisit />} />
          <Route path="/property-details/:id" element={<PropertyDetails />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
        </Routes>
      </main>
      {!isMessagesPage && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <PreloaderProvider>
        <AppContent />
      </PreloaderProvider>
    </Router >
  );
}

export default App;
