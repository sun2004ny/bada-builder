import React, { useState, useEffect, Fragment } from 'react';
import toast from 'react-hot-toast';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import LocationPicker from '../../components/Map/LocationPicker';

import {
  Plus, Search, TowerControl as Tower, Building2,
  Trash2, Edit, Eye, Save, X, ChevronRight, ChevronDown,
  ChevronLeft, LayoutGrid, List, CheckCircle2, AlertCircle,
  ArrowLeft, Lock, DollarSign, Home, Map as MapIcon, Store, Briefcase, ShoppingBag, Box, Car, RefreshCw
} from 'lucide-react';
import { liveGroupDynamicAPI } from '../../services/api';
import TwoDView from '../../pages/Exhibition/TwoDView'; // Import the 2D View component
import AdminUnitEditModal from './AdminUnitEditModal';
import './AdminLiveGrouping.css';

const PROPERTY_TYPES = [
  { id: 'Apartment', label: 'Flat / Apartments', icon: Building2, desc: 'Multi-story residential buildings' },
  { id: 'Bungalow', label: 'Bungalow', icon: Home, desc: 'Individual luxury houses' },
  { id: 'Plot', label: 'Land / Plot', icon: MapIcon, desc: 'Open land and sectors' },
  { id: 'MixedUse', label: 'Mixed Use Complex', icon: LayoutGrid, desc: 'Commercial + Residential projects' },
  { id: 'Commercial', label: 'Commercial', icon: Store, desc: 'Shops, Offices & Showrooms' }
];

const AdminLiveGrouping = () => {

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // View Mode State
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'detail'
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectHierarchy, setProjectHierarchy] = useState(null);

  // Admin Action Modal State
  const [showUnitActionModal, setShowUnitActionModal] = useState(false);
  const [showUnitEditModal, setShowUnitEditModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [editingUnit, setEditingUnit] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form State
  const [projectData, setProjectData] = useState({
    title: '',
    developer: '',
    location: '',
    latitude: null,
    longitude: null,
    map_address: '',
    description: '',
    original_price: '',
    group_price: '',
    discount: '',
    savings: '',
    type: '', // Empty to force selection in Step 1
    min_buyers: 5,
    area: '',
    possession: '',
    rera_number: ''
  });

  const [towers, setTowers] = useState([
    { name: 'Tower A', floors: 10, unitsPerFloor: 4 }
  ]);



  // Mixed Use / Detailed Unit configuration
  // Structure: { [towerIndex]: { [floorNumber]: [ { unit_number, unit_type, area, price } ] } }
  const [towerUnits, setTowerUnits] = useState({});
  // Structure: { [towerIdx]: { [floorNum]: { regular: price_sqft, discount: discount_sqft } } }


  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [brochureFile, setBrochureFile] = useState(null);
  const [brochurePreview, setBrochurePreview] = useState('');

  // -- Global Defaults Enhancement --
  const [globalUnitDefaults, setGlobalUnitDefaults] = useState({
    unitType: 'Flat',
    sbua: 1500,
    carpetArea: 1200,
    baseRate: 5000,
    discountRate: 4500
  });

  // Collapsible Sections State
  const [collapsedTowers, setCollapsedTowers] = useState([]); // Array of tower indices
  const [collapsedFloors, setCollapsedFloors] = useState({}); // Object keyed by "towerIdx-floorNum"
  const [isGlobalDefaultsCollapsed, setIsGlobalDefaultsCollapsed] = useState(false);

  const toggleTowerCollapse = (towerIdx) => {
    setCollapsedTowers(prev =>
      prev.includes(towerIdx) ? prev.filter(idx => idx !== towerIdx) : [...prev, towerIdx]
    );
  };

  const toggleFloorCollapse = (towerIdx, floorNum) => {
    const key = `${towerIdx}-${floorNum}`;
    setCollapsedFloors(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const generateFlatLabels = (count) => {
    const labels = [];
    for (let i = 0; i < count; i++) {
      labels.push(`Flat ${String.fromCharCode(65 + i)}`);
    }
    return labels;
  };

  useEffect(() => {
    fetchProjects();
  }, []);



  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await liveGroupDynamicAPI.getAll();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Fetch projects error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (locData) => {
    setProjectData(prev => ({
      ...prev,
      location: locData.address,
      latitude: locData.lat,
      longitude: locData.lng,
      map_address: locData.address
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleBrochureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBrochureFile(file);
      setBrochurePreview(file.name);
    }
  };

  const handleCreateProject = async () => {
    try {
      setSaving(true);

      // --- ATOMIC SAVE LOGIC ---
      // 1. Construct Full Hierarchy Object (Towers + Nested Units)
      const hierarchy = towers.map((tower, idx) => {
        const towerConfig = towerUnits[idx] || {};
        const compiledUnits = [];

        Object.keys(towerConfig).forEach(floorNum => {
          if (!towerConfig[floorNum]) return;

          towerConfig[floorNum].forEach(unit => {
            // Sanitize numeric fields before sending
            const sanitizedUnit = {
              ...unit,
              floor_number: parseInt(floorNum),
              area: parseFloat(unit.area) || 0,
              carpet_area: parseFloat(unit.carpet_area) || 0,
              super_built_up_area: parseFloat(unit.super_built_up_area) || 0,
              price: parseFloat(unit.price) || 0,
              price_per_sqft: parseFloat(unit.price_per_sqft) || 0,
              discount_price_per_sqft: (unit.discount_price_per_sqft) ? parseFloat(unit.discount_price_per_sqft) : null
            };
            compiledUnits.push(sanitizedUnit);
          });
        });

        return {
          tower_name: tower.name, // API expects snake_case usually? Check addTower payload: { tower_name }
          total_floors: parseInt(tower.floors) || (projectData.type === 'Bungalow' ? 1 : 0),
          units: compiledUnits
        };
      });

      console.log('🚀 Submitting Partial Hierarchy:', hierarchy);

      // 2. Send Single Bulk Request
      await liveGroupDynamicAPI.createProjectWithHierarchy(projectData, hierarchy, imageFiles, brochureFile);

      toast.success('Project and complete hierarchy created successfully!');
      setShowWizard(false);
      setWizardStep(1);
      fetchProjects();
    } catch (error) {
      console.error('Wizard submission error:', error);
      alert('Failed to create project: ' + (error.response?.data?.error || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project and all its towers/units? This cannot be undone.')) return;
    try {
      await liveGroupDynamicAPI.deleteProject(id);
      fetchProjects();
    } catch (error) {
      alert('Delete failed: ' + error.message);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await liveGroupDynamicAPI.updateProjectStatus(id, status);
      fetchProjects();
    } catch (error) {
      alert('Status update failed: ' + error.message);
    }
  };

  // --- NEW: View Project Hierarchy ---
  const handleViewProject = async (project) => {
    try {
      setLoading(true);
      const data = await liveGroupDynamicAPI.getFullHierarchy(project.id);
      setProjectHierarchy(data.project); // Assuming API returns { project: ... } with nested towers/units
      setSelectedProject(project);
      setViewMode('detail');
    } catch (error) {
      console.error("Failed to load project details:", error);
      alert("Could not load project details.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedProject(null);
    setProjectHierarchy(null);
  };

  // --- NEW: Unit Action Handler ---
  const handleUnitClick = (unit) => {
    setSelectedUnit(unit);
    setShowUnitActionModal(true);
  };

  const handleEditClick = (unit) => {
    setEditingUnit(unit);
    setShowUnitEditModal(true);
  };

  const handleUnitUpdate = () => {
    // Refresh the whole project to ensure full hierarchy is in sync
    if (selectedProject) {
      handleViewProject(selectedProject);
    }
    toast.success('Unit updated successfully');
  };

  const handleAdminAction = async (action) => {
    if (!selectedUnit) return;
    setActionLoading(true);
    try {
      if (action === 'lock') {
        await liveGroupDynamicAPI.lockUnit(selectedUnit.id);
      } else if (action === 'book') {
        // Mock payment data for admin booking
        await liveGroupDynamicAPI.bookUnit(selectedUnit.id, {
          amount: 50000,
          currency: 'INR',
          userName: 'Admin Booking'
        });
      } else if (action === 'release') {
        // Release / Unbook Unit
        await liveGroupDynamicAPI.updateUnit(selectedUnit.id, {
          status: 'available',
          booked_by: null, // Clear booking data
          payment_id: null
        });
        toast.success('Unit released successfully');
      }

      // Refresh data
      const data = await liveGroupDynamicAPI.getFullHierarchy(selectedProject.id);
      setProjectHierarchy(data.project);
      setShowUnitActionModal(false);
    } catch (error) {
      console.error(`Failed to ${action} unit:`, error);
      alert(`Failed to ${action} unit: ` + error.message);
    } finally {
      setActionLoading(false);
    }
  };


  const addTowerRow = () => {
    setTowers([...towers, { name: `Tower ${String.fromCharCode(65 + towers.length)}`, floors: 10, unitsPerFloor: 4 }]);
  };

  const removeTowerRow = (index) => {
    setTowers(towers.filter((_, i) => i !== index));
  };

  const updateTowerRow = (index, field, value) => {
    setTowers(prevTowers => {
      const newTowers = [...prevTowers];
      const updatedTower = { ...newTowers[index] };

      // Handle number inputs specifically to prevent NaN
      if (field === 'floors' || field === 'unitsPerFloor') {
        updatedTower[field] = value === '' ? '' : parseInt(value);
      } else {
        updatedTower[field] = value;
      }

      newTowers[index] = updatedTower;
      return newTowers;
    });

    // Initialize towerUnits if empty for this tower
    if (!towerUnits[index]) {
      setTowerUnits(prev => ({ ...prev, [index]: {} }));
    }
  };

  const addUnitToConfig = (towerIdx, floorNum) => {
    setTowerUnits(prev => {
      const towerConfig = { ...(prev[towerIdx] || {}) };
      const floorUnits = [...(towerConfig[floorNum] || [])];

      const nextIdx = floorUnits.length;
      const label = `Flat ${String.fromCharCode(65 + nextIdx)}`;

      floorUnits.push({
        unit_number: label,
        flat_label: label,
        unit_type: globalUnitDefaults.unitType,
        area: globalUnitDefaults.sbua,
        carpet_area: globalUnitDefaults.carpetArea,
        price_per_sqft: globalUnitDefaults.baseRate,
        discount_price_per_sqft: globalUnitDefaults.discountRate,
        isCustom: false,
        price: globalUnitDefaults.sbua * (globalUnitDefaults.discountRate || globalUnitDefaults.baseRate)
      });

      towerConfig[floorNum] = floorUnits;
      return { ...prev, [towerIdx]: towerConfig };
    });
  };

  const removeUnitFromConfig = (towerIdx, floorNum, unitIdx) => {
    setTowerUnits(prev => {
      const towerConfig = { ...prev[towerIdx] };
      const floorUnits = towerConfig[floorNum].filter((_, i) => i !== unitIdx);
      towerConfig[floorNum] = floorUnits;
      return { ...prev, [towerIdx]: towerConfig };
    });
  };

  const updateUnitConfig = (towerIdx, floorNum, unitIdx, field, value) => {
    setTowerUnits(prev => {
      // Defensive: Check if path exists
      if (!prev[towerIdx] || !prev[towerIdx][floorNum] || !prev[towerIdx][floorNum][unitIdx]) {
        console.warn('Attempted to update non-existent unit:', { towerIdx, floorNum, unitIdx });
        return prev;
      }

      // Deep clone only the necessary parts or full object for safety
      const nextState = structuredClone(prev);
      const unit = nextState[towerIdx][floorNum][unitIdx];

      if (field === 'sync_floor') {
        // Special logic for sync if needed, otherwise ignore
        return prev;
      }

      // Update Field
      // If updating numeric fields, ensure we don't set NaN? 
      // User might want to type empty string, so allow string if needed, 
      // but calculations need valid numbers.
      unit[field] = value;

      // Auto-mark as Custom if user manually edits it
      if (!unit.isCustom) {
        unit.isCustom = true;
      }

      // Recalculate Price Logic
      let calcArea = parseFloat(unit.area) || 0;
      if (projectData.type === 'Bungalow') {
        // For Bungalow, usually Plot Area (area) or SBUA is used? 
        // Let's stick to 'area' if that's the primary, or SBUA.
        // The wizard initialized 'area' as 2500 (Plot Area).
        calcArea = parseFloat(unit.area) || parseFloat(unit.super_built_up_area) || 0;
      }

      const reg = parseFloat(unit.price_per_sqft) || 0;
      const disc = (unit.discount_price_per_sqft !== '' && unit.discount_price_per_sqft !== null && unit.discount_price_per_sqft !== undefined)
        ? parseFloat(unit.discount_price_per_sqft)
        : null;

      const effectiveRate = disc !== null ? disc : reg;

      // Update Price ONLY if it's not a manually overridden fixed price (unless we want auto-calc)
      // Usually in this wizard, we auto-calc.
      unit.price = calcArea * effectiveRate;

      return nextState;
    });
  };

  const copyFloorConfig = (towerIdx, fromFloor, toFloor) => {
    setTowerUnits(prev => {
      const towerConfig = { ...prev[towerIdx] };
      towerConfig[toFloor] = (towerConfig[fromFloor] || []).map(u => ({ ...u }));
      return { ...prev, [towerIdx]: towerConfig };
    });
  };



  const prepopulateTowerUnits = (towerIdx) => {
    const tower = towers[towerIdx];
    const newConfig = {};

    const unitsPerFloor = parseInt(tower.unitsPerFloor) || 4;
    const floors = parseInt(tower.floors) || 0;

    const generateUnitsForFloor = () => {
      const units = [];
      for (let j = 0; j < unitsPerFloor; j++) {
        const label = `Flat ${String.fromCharCode(65 + j)}`;

        units.push({
          unit_number: label,
          flat_label: label,
          unit_type: globalUnitDefaults.unitType,
          area: globalUnitDefaults.sbua,
          carpet_area: globalUnitDefaults.carpetArea,
          price_per_sqft: globalUnitDefaults.baseRate,
          discount_price_per_sqft: globalUnitDefaults.discountRate,
          isCustom: false,
          price: globalUnitDefaults.sbua * (globalUnitDefaults.discountRate || globalUnitDefaults.baseRate)
        });
      }
      return units;
    };

    if (projectData.type === 'Bungalow') {
      const totalBungalows = parseInt(tower.total_bungalows) || 1;
      const bungUnits = [];

      for (let k = 0; k < totalBungalows; k++) {
        bungUnits.push({
          unit_number: `B-${k + 1}`,
          unit_type: tower.bungalow_type || 'Villa',
          area: 2500, // Plot Area
          super_built_up_area: 2000,
          carpet_area: 1500,
          price: 0,
          discount_price: null,
          price_per_sqft: 0, // Unused for Bungalow but kept for consistency
          discount_price_per_sqft: null
        });
      }
      // Store all bungalows under a dummy floor '0' or '1', let's use '0'
      newConfig[0] = bungUnits;
    } else {
      if (tower.hasBasement) newConfig[-1] = generateUnitsForFloor();
      if (tower.hasGroundFloor) newConfig[0] = generateUnitsForFloor();
      for (let f = 1; f <= floors; f++) {
        newConfig[f] = generateUnitsForFloor();
      }
    }

    setTowerUnits(prev => ({ ...prev, [towerIdx]: newConfig }));
  };

  const getLabel = (type, context) => {
    switch (type) {
      case 'Apartment':
        return context === 'parent' ? 'Tower' : 'Unit';
      case 'Bungalow':
        return context === 'parent' ? 'Block' : 'Bungalow';
      case 'Plot':
        return context === 'parent' ? 'Sector' : 'Plot';
      case 'MixedUse':
        return context === 'parent' ? 'Building' : 'Unit / Shop / Flat';
      case 'Commercial':
        return context === 'parent' ? 'Block' : 'Unit';
      default:
        return context === 'parent' ? 'Group' : 'Item';
    }
  };

  return (
    <div className="admin-live-grouping overhaul">
      {/* LOADING OVERLAY */}
      <AnimatePresence>
        {saving && (
          <motion.div
            className="loading-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="loader-content">
              <div className="spinner large"></div>
              <h3>Generating Project...</h3>
              <p>Creating towers, units, and 3D data.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="admin-header-v2">
        <div className="header-content">
          <h1>Live Grouping <span className="badge">Data Driven</span></h1>
          <p>Create and manage projects with dynamic tower and unit hierarchies.</p>
        </div>
        {viewMode === 'list' && (
          <button className="primary-btn" onClick={() => setShowWizard(true)}>
            <Plus size={20} /> New Project Wizard
          </button>
        )}
      </div>

      {loading ? (
        <div className="admin-loader">
          <div className="spinner"></div>
          <p>Loading projects...</p>
        </div>
      ) : (
        <>
          {viewMode === 'list' ? (
            // LIST VIEW
            <div className="projects-grid-v2">
              {projects.map(project => (
                <motion.div
                  className="project-card-v2"
                  key={project.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="card-image">
                    <img src={project.image || '/placeholder-property.jpg'} alt={project.title} />
                    <div className={`status-pill ${project.status}`}>{project.status}</div>
                  </div>
                  <div className="card-body">
                    <h3>{project.title}</h3>
                    <p className="location"><Building2 size={14} /> {project.location}</p>
                    <div className="stat">
                      <span className="label">Type</span>
                      <span className="value font-medium text-blue-600">{project.type}</span>
                    </div>
                    <div className="stat">
                      <span className="label">{getLabel(project.type, 'parent')}s</span>
                      <span className="value">{project.tower_count || 'N/A'}</span>
                    </div>
                    <div className="stat">
                      <span className="label">{getLabel(project.type, 'child')}s</span>
                      <span className="value">{project.total_slots}</span>
                    </div>
                    <div className="actions">
                      <button className="icon-btn primary" title="Manage Units" onClick={() => handleViewProject(project)}>
                        <LayoutGrid size={20} />
                      </button>
                      <select
                        className="status-dropdown"
                        value={project.status}
                        onChange={(e) => handleStatusChange(project.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="live">Live</option>
                        <option value="closed">Closed</option>
                      </select>
                      <button className="icon-btn delete" title="Delete Project" onClick={() => handleDeleteProject(project.id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            // DETAIL/2D VIEW
            <div className="detail-view-container relative h-[calc(100vh-140px)] w-full flex flex-col">
              <div className="flex items-center gap-4 mb-4 px-4">
                <button onClick={handleBackToList} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium">
                  <ArrowLeft size={18} /> Back to Projects
                </button>
                <h2 className="text-xl font-bold text-slate-800">{selectedProject?.title} - Unit Management</h2>
              </div>

              {/* 2D View Container - Dark Mode Wrapper */}
              <div className="flex-1 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-700 relative">
                {projectHierarchy ? (
                  <TwoDView
                    project={projectHierarchy}
                    onUnitClick={handleUnitClick}
                    onEditClick={handleEditClick}
                    isAdminView={true}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400">Loading hierarchy...</div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* MULTI-STEP WIZARD MODAL */}
      <AnimatePresence>
        {showWizard && (
          <motion.div
            className="wizard-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="wizard-modal"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
            >
              <div className="wizard-header">
                <h2>Create Live Grouping Project</h2>
                <button className="close-btn" onClick={() => setShowWizard(false)}><X /></button>
              </div>

              <div className="wizard-stepper">
                <div className={`step ${wizardStep >= 1 ? 'active' : ''} ${wizardStep > 1 ? 'completed' : ''}`}>
                  <div className="node">1</div>
                  <span>Type</span>
                </div>
                <div className="line"></div>
                <div className={`step ${wizardStep >= 2 ? 'active' : ''} ${wizardStep > 2 ? 'completed' : ''}`}>
                  <div className="node">2</div>
                  <span>Basics</span>
                </div>
                <div className="line"></div>
                <div className={`step ${wizardStep >= 3 ? 'active' : ''} ${wizardStep > 3 ? 'completed' : ''}`}>
                  <div className="node">3</div>
                  <span>Hierarchy</span>
                </div>
                <div className="line"></div>
                <div className={`step ${wizardStep >= 4 ? 'active' : ''} ${wizardStep > 4 ? 'completed' : ''}`}>
                  <div className="node">4</div>
                  <span>Summary</span>
                </div>
              </div>

              <div className="wizard-content">
                {wizardStep === 1 && (
                  <div className="step-pane">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-slate-800">Select Property Type</h3>
                      <p className="text-slate-500">Choose the type of property for this project to customize the creation flow.</p>
                    </div>
                    <div className="property-type-grid">
                      {PROPERTY_TYPES.map((type) => {
                        const Icon = type.icon;
                        return (
                          <div
                            key={type.id}
                            className={`type-card ${projectData.type === type.id ? 'active' : ''}`}
                            onClick={() => setProjectData({ ...projectData, type: type.id })}
                          >
                            <div className="type-icon">
                              <Icon size={32} />
                            </div>
                            <div className="type-info">
                              <h4>{type.label}</h4>
                              <p>{type.desc}</p>
                            </div>
                            <div className="selection-indicator">
                              <CheckCircle2 size={20} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {wizardStep === 2 && (
                  <div className="step-pane">
                    <h3>Project Information</h3>
                    <div className="form-grid">
                      <div className="input-group">
                        <label>Project Title</label>
                        <input type="text" value={projectData.title} onChange={e => setProjectData({ ...projectData, title: e.target.value })} placeholder="e.g. Skyline Residency" />
                      </div>
                      <div className="input-group">
                        <label>Location</label>
                        <input type="text" value={projectData.location} onChange={e => setProjectData({ ...projectData, location: e.target.value })} placeholder="e.g. Sector 45, Gurgaon" />
                      </div>
                      
                      {/* Location Picker Integration */}
                      <div className="input-group full">
                          <label>Pin Precise Location</label>
                          <div style={{ height: '300px', width: '100%', marginBottom: '1rem' }}>
                            <LocationPicker
                                onLocationSelect={handleLocationSelect}
                                initialLat={projectData.latitude}
                                initialLng={projectData.longitude}
                                initialAddress={projectData.map_address}
                            />
                          </div>
                      </div>
                      <div className="input-group full">
                        <label>Images</label>
                        <input type="file" multiple onChange={handleImageChange} accept="image/*" />
                        <div className="previews">
                          {imagePreviews.map((p, i) => <img key={i} src={p} alt="" />)}
                        </div>
                      </div>
                      <div className="input-group full">
                        <label>Brochure (PDF)</label>
                        <input type="file" onChange={handleBrochureChange} accept=".pdf" />
                        {brochurePreview && <p className="text-sm text-green-600 mt-1">✓ {brochurePreview}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {wizardStep === 3 && (
                  <div className="step-pane">
                    <div className="pane-header">
                      <h3>{getLabel(projectData.type, 'parent')} Configuration</h3>
                      <button className="add-btn" onClick={addTowerRow}><Plus size={16} /> Add {getLabel(projectData.type, 'parent')}</button>
                    </div>
                    <table className="wizard-table">
                      <thead>
                        <tr>
                          <th>{getLabel(projectData.type, 'parent')} Name</th>
                          {projectData.type === 'Bungalow' ? (
                            <>
                              <th>Total Bungalows</th>
                              <th>Type</th>
                            </>
                          ) : (
                            <>
                              <th>{projectData.type === 'Plot' ? 'Size/Variant' : 'Floors'}</th>
                              <th>Units per Floor</th>
                              <th>Extra Levels</th>
                            </>
                          )}
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {towers.map((t, idx) => (
                          <Fragment key={idx}>
                            <tr>
                              <td><input type="text" value={t.name} onChange={e => updateTowerRow(idx, 'name', e.target.value)} /></td>

                              {projectData.type === 'Bungalow' ? (
                                <>
                                  <td>
                                    <input
                                      type="number"
                                      value={t.total_bungalows || ''}
                                      onChange={e => updateTowerRow(idx, 'total_bungalows', e.target.value)}
                                      placeholder="e.g. 10"
                                    />
                                  </td>
                                  <td>
                                    <select
                                      value={t.bungalow_type || 'Villa'}
                                      onChange={e => updateTowerRow(idx, 'bungalow_type', e.target.value)}
                                      className="w-full p-2 border rounded"
                                    >
                                      <option value="Villa">Villa</option>
                                      <option value="Bungalow">Bungalow</option>
                                      <option value="Row House">Row House</option>
                                      <option value="Twin Villa">Twin Villa</option>
                                      <option value="Plot">Plot</option>
                                    </select>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td><input type="number" value={t.floors} onChange={e => updateTowerRow(idx, 'floors', e.target.value)} placeholder="" /></td>
                                  <td>
                                    <input
                                      type="number"
                                      value={t.unitsPerFloor || ''}
                                      onChange={e => updateTowerRow(idx, 'unitsPerFloor', e.target.value)}
                                      placeholder="e.g. 4"
                                    />
                                  </td>
                                  <td>
                                    <div className="flex flex-col gap-1">
                                      <label className="text-xs flex items-center gap-1 cursor-pointer">
                                        <input type="checkbox" checked={t.hasGroundFloor || false} onChange={e => updateTowerRow(idx, 'hasGroundFloor', e.target.checked)} /> GF
                                      </label>
                                      <label className="text-xs flex items-center gap-1 cursor-pointer">
                                        <input type="checkbox" checked={t.hasBasement || false} onChange={e => updateTowerRow(idx, 'hasBasement', e.target.checked)} /> Basement
                                      </label>
                                    </div>
                                  </td>
                                </>
                              )}
                              <td><button className="remove-btn" onClick={() => removeTowerRow(idx)}><Trash2 size={16} /></button></td>
                            </tr>
                          </Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {wizardStep === 4 && (
                  <div className="step-pane">
                    <div className="pane-header">
                      <h3>Building Units Configurator</h3>
                      <div className="flex gap-2">
                        <span className="badge bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                          Mixed Use Ready
                        </span>
                      </div>
                    </div>

                    <div className="unit-configurator-container">
                      <div className="global-defaults-wrapper mb-8">
                        {/* GLOBAL DEFAULTS SECTION */}
                        <div className={`global-defaults-panel bg-white border border-blue-100 rounded-xl overflow-hidden shadow-sm transition-all duration-300 ${isGlobalDefaultsCollapsed ? 'max-h-14' : 'max-h-96'}`}>
                          <div
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                            onClick={() => setIsGlobalDefaultsCollapsed(!isGlobalDefaultsCollapsed)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <Tower size={20} />
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-800 text-sm">Default Unit Configuration (Global)</h4>
                                {!isGlobalDefaultsCollapsed && <p className="text-[10px] text-slate-500 uppercase font-semibold">Applied to all default units</p>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {isGlobalDefaultsCollapsed && (
                                <div className="hidden md:flex gap-3 mr-4">
                                  <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold">{globalUnitDefaults.unitType}</span>
                                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold">{globalUnitDefaults.sbua} SqFt</span>
                                  <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-1 rounded font-bold">₹{globalUnitDefaults.baseRate}</span>
                                </div>
                              )}
                              <button className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                                {isGlobalDefaultsCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                              </button>
                            </div>
                          </div>

                          {!isGlobalDefaultsCollapsed && (
                            <div className="p-6 pt-2 bg-gradient-to-r from-white to-blue-50/30">
                              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <div className="input-field-group">
                                  <label>Default Type</label>
                                  <select
                                    className="text-xs border rounded p-2 w-full"
                                    value={globalUnitDefaults.unitType}
                                    onChange={e => setGlobalUnitDefaults({ ...globalUnitDefaults, unitType: e.target.value })}
                                  >
                                    <option value="Flat">Flat</option>
                                    <option value="Shop">Shop</option>
                                    <option value="Office">Office</option>
                                    <option value="Showroom">Showroom</option>
                                  </select>
                                </div>
                                <div className="input-field-group">
                                  <label>SBUA (SQFT)</label>
                                  <input
                                    type="number"
                                    className="text-xs border rounded p-2 w-full"
                                    value={globalUnitDefaults.sbua}
                                    onChange={e => setGlobalUnitDefaults({ ...globalUnitDefaults, sbua: parseFloat(e.target.value) || 0 })}
                                  />
                                </div>
                                <div className="input-field-group">
                                  <label>Carpet (SQFT)</label>
                                  <input
                                    type="number"
                                    className="text-xs border rounded p-2 w-full"
                                    value={globalUnitDefaults.carpetArea}
                                    onChange={e => setGlobalUnitDefaults({ ...globalUnitDefaults, carpetArea: parseFloat(e.target.value) || 0 })}
                                  />
                                </div>
                                <div className="input-field-group">
                                  <label>Base Rate (₹)</label>
                                  <input
                                    type="number"
                                    className="text-xs border rounded p-2 w-full"
                                    value={globalUnitDefaults.baseRate}
                                    onChange={e => setGlobalUnitDefaults({ ...globalUnitDefaults, baseRate: parseFloat(e.target.value) || 0 })}
                                  />
                                </div>
                                <div className="input-field-group">
                                  <label>Discount Rate (₹)</label>
                                  <input
                                    type="number"
                                    className="text-xs border rounded p-2 w-full"
                                    value={globalUnitDefaults.discountRate}
                                    onChange={e => setGlobalUnitDefaults({ ...globalUnitDefaults, discountRate: parseFloat(e.target.value) || 0 })}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      {towers.map((tower, towerIdx) => {
                        const isTowerCollapsed = collapsedTowers.includes(towerIdx);
                        return (
                          <div key={towerIdx} className="tower-config-block border rounded-xl overflow-hidden mb-6 bg-slate-50">
                            <div className="tower-name-bar bg-slate-200 px-4 py-2 font-bold flex justify-between items-center text-slate-700">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => toggleTowerCollapse(towerIdx)}
                                  className="p-1 hover:bg-slate-300 rounded-md transition-colors"
                                >
                                  {isTowerCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                                </button>
                                <div>
                                  {projectData.type === 'Bungalow' ? (
                                    <>
                                      {tower.name} ({tower.total_bungalows || 0} Bungalows)
                                      <span className="ml-3 text-xs font-normal">Total Units: {Object.values(towerUnits[towerIdx] || {}).flat().length}</span>
                                    </>
                                  ) : (
                                    <>
                                      {tower.name} ({tower.floors} Floors)
                                      <span className="ml-3 text-xs font-normal">Total Units: {Object.values(towerUnits[towerIdx] || {}).flat().length}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => prepopulateTowerUnits(towerIdx)}
                                className="text-[10px] bg-white text-blue-600 px-2 py-1 rounded border border-blue-200 hover:bg-blue-50 transition-colors"
                              >
                                {projectData.type === 'Bungalow' ? 'Reset Bungalows' : 'Reset to Defaults (4 per floor)'}
                              </button>
                            </div>

                            {!isTowerCollapsed && (
                              <>



                                {projectData.type === 'Bungalow' ? (
                                  <div className="p-4">
                                    <BungalowGrid
                                      units={(towerUnits[towerIdx]?.[0] || [])}
                                      onUpdate={(uIdx, field, val) => updateUnitConfig(towerIdx, 0, uIdx, field, val)}
                                      onRemove={(uIdx) => removeUnitFromConfig(towerIdx, 0, uIdx)}
                                      onAdd={() => addUnitToConfig(towerIdx, 0)}
                                      globalDefaults={globalUnitDefaults}

                                    />
                                  </div>
                                ) : (
                                  <div className="tower-floors-list p-4 space-y-4">
                                    {/* Special Floors */}
                                    {tower.hasBasement && (
                                      <FloorRow
                                        towerIdx={towerIdx}
                                        floorNum={-1}
                                        floorName="Basement"
                                        units={towerUnits[towerIdx]?.[-1] || []}
                                        onAdd={() => addUnitToConfig(towerIdx, -1)}
                                        onRemove={(uIdx) => removeUnitFromConfig(towerIdx, -1, uIdx)}
                                        onUpdate={(uIdx, f, v) => updateUnitConfig(towerIdx, -1, uIdx, f, v)}
                                        projectType={projectData.type}
                                        globalDefaults={globalUnitDefaults}
                                        generateFlatLabels={generateFlatLabels}
                                        isCollapsed={collapsedFloors[`${towerIdx}--1`]}
                                        onToggle={() => toggleFloorCollapse(towerIdx, -1)}
                                      />
                                    )}
                                    {tower.hasGroundFloor && (
                                      <FloorRow
                                        towerIdx={towerIdx}
                                        floorNum={0}
                                        floorName="Ground Floor"
                                        units={towerUnits[towerIdx]?.[0] || []}
                                        onAdd={() => addUnitToConfig(towerIdx, 0)}
                                        onRemove={(uIdx) => removeUnitFromConfig(towerIdx, 0, uIdx)}
                                        onUpdate={(uIdx, f, v) => updateUnitConfig(towerIdx, 0, uIdx, f, v)}
                                        projectType={projectData.type}
                                        globalDefaults={globalUnitDefaults}
                                        generateFlatLabels={generateFlatLabels}
                                        isCollapsed={collapsedFloors[`${towerIdx}-0`]}
                                        onToggle={() => toggleFloorCollapse(towerIdx, 0)}
                                      />
                                    )}
                                    {/* Regular Floors */}
                                    {[...Array(parseInt(tower.floors) || 0)].map((_, i) => {
                                      const floorNum = i + 1;
                                      return (
                                        <FloorRow
                                          key={floorNum}
                                          towerIdx={towerIdx}
                                          floorNum={floorNum}
                                          floorName={`Floor ${floorNum}`}
                                          units={towerUnits[towerIdx]?.[floorNum] || []}
                                          onAdd={() => addUnitToConfig(towerIdx, floorNum)}
                                          onRemove={(uIdx) => removeUnitFromConfig(towerIdx, floorNum, uIdx)}
                                          onUpdate={(uIdx, f, v) => updateUnitConfig(towerIdx, floorNum, uIdx, f, v)}
                                          onCopy={() => {
                                            const prevFloor = floorNum - 1;
                                            if (prevFloor >= 1) copyFloorConfig(towerIdx, prevFloor, floorNum);
                                            else if (tower.hasGroundFloor) copyFloorConfig(towerIdx, 0, floorNum);
                                          }}
                                          projectType={projectData.type}
                                          globalDefaults={globalUnitDefaults}
                                          generateFlatLabels={generateFlatLabels}
                                          isCollapsed={collapsedFloors[`${towerIdx}-${floorNum}`]}
                                          onToggle={() => toggleFloorCollapse(towerIdx, floorNum)}
                                        />
                                      );
                                    })}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="wizard-footer">
                <button className="secondary-btn" onClick={() => wizardStep > 1 ? setWizardStep(wizardStep - 1) : setShowWizard(false)}>
                  {wizardStep === 1 ? 'Cancel' : 'Back'}
                </button>
                <div className="filler"></div>
                {wizardStep < 4 ? (
                  <button
                    className="primary-btn"
                    onClick={() => setWizardStep(wizardStep + 1)}
                    disabled={wizardStep === 1 && !projectData.type}
                  >
                    Next <ChevronRight size={18} />
                  </button>
                ) : (
                  <button className="primary-btn finish" onClick={handleCreateProject} disabled={saving}>
                    {saving ? 'Creating...' : 'Confirm & Generate'} <CheckCircle2 size={18} />
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AdminUnitEditModal
        isOpen={showUnitEditModal}
        onClose={() => setShowUnitEditModal(false)}
        unit={editingUnit}
        onUpdate={handleUnitUpdate}
        projectType={selectedProject?.type}
      />

      {/* ADMIN ACTION MODAL */}
      <AnimatePresence>
        {showUnitActionModal && selectedUnit && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowUnitActionModal(false)}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl m-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4 items-center">
                  {(() => {
                    const type = (selectedUnit.unit_type || '').toLowerCase();
                    let Icon = LayoutGrid;
                    let color = 'text-slate-400';
                    let bg = 'bg-slate-50';

                    if (type.includes('flat')) { Icon = Home; color = 'text-blue-500'; bg = 'bg-blue-50'; }
                    else if (type.includes('shop')) { Icon = ShoppingBag; color = 'text-orange-500'; bg = 'bg-orange-50'; }
                    else if (type.includes('office')) { Icon = Briefcase; color = 'text-purple-500'; bg = 'bg-purple-50'; }
                    else if (type.includes('showroom')) { Icon = Store; color = 'text-rose-500'; bg = 'bg-rose-50'; }
                    else if (type.includes('basement') || type.includes('storage')) { Icon = Box; color = 'text-slate-500'; bg = 'bg-slate-50'; }
                    else if (type.includes('parking')) { Icon = Car; color = 'text-emerald-500'; bg = 'bg-emerald-50'; }

                    return (
                      <div className={`p-3 rounded-2xl ${bg} ${color}`}>
                        <Icon size={32} />
                      </div>
                    );
                  })()}
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 leading-tight">Unit {selectedUnit.unit_number}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{selectedUnit.unit_type}</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{selectedUnit.area} SQ FT</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setShowUnitActionModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 mb-6 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Status</span>
                  <span className={`font-bold uppercase tracking-tight ${selectedUnit.status === 'available' ? 'text-emerald-600' : 'text-slate-600'}`}>
                    {selectedUnit.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Area</span>
                  <span className="font-bold text-slate-700">{selectedUnit.area} SQ FT</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-100">
                  <span className="text-slate-500">Rate (₹/Sqft)</span>
                  <div className="text-right">
                    {selectedUnit.discount_price_per_sqft ? (
                      <>
                        <span className="text-xs text-slate-400 line-through mr-2">₹{selectedUnit.price_per_sqft}</span>
                        <span className="font-bold text-emerald-600">₹{selectedUnit.discount_price_per_sqft}</span>
                      </>
                    ) : (
                      <span className="font-bold text-slate-700">₹{selectedUnit.price_per_sqft || 0}</span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-end pt-2 border-t border-slate-100">
                  <span className="text-slate-500 text-sm">Final Price</span>
                  <div className="text-right">
                    {selectedUnit.discount_price_per_sqft && (
                      <span className="text-xs text-slate-400 line-through block leading-none mb-1">
                        ₹{((selectedUnit.area * selectedUnit.price_per_sqft) / 100000).toFixed(2)} L
                      </span>
                    )}
                    <span className="font-black text-slate-900 text-xl leading-none">
                      ₹{(selectedUnit.price / 100000).toFixed(2)} L
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {selectedUnit.status === 'available' && (
                  <>
                    <button
                      className="w-full py-3 rounded-xl bg-amber-50 text-amber-700 font-bold border border-amber-200 hover:bg-amber-100 transition-colors flex items-center justify-center gap-2"
                      onClick={() => handleAdminAction('lock')}
                      disabled={actionLoading}
                    >
                      <Lock size={18} /> {actionLoading ? 'Processing...' : 'Hold Unit (Lock)'}
                    </button>
                    <button
                      className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                      onClick={() => handleAdminAction('book')}
                      disabled={actionLoading}
                    >
                      <DollarSign size={18} /> {actionLoading ? 'Processing...' : 'Mark as Booked'}
                    </button>
                  </>
                )}
                {selectedUnit.status !== 'available' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-100 rounded-xl text-center text-slate-500 text-xs mb-2">
                      Unit is currently <strong>{selectedUnit.status}</strong>
                    </div>
                    <button
                      className="w-full py-3 rounded-xl bg-orange-50 text-orange-600 font-bold border border-orange-200 hover:bg-orange-100 transition-colors flex items-center justify-center gap-2"
                      onClick={() => handleAdminAction('release')}
                      disabled={actionLoading}
                    >
                      {actionLoading ? 'Releasing...' : 'Release / Unbook Unit'} <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div >
  );
};

// Helper Component for Unit Configurator
const FloorRow = ({ floorName, units, onAdd, onRemove, onUpdate, onCopy, projectType, globalDefaults, generateFlatLabels, isCollapsed, onToggle }) => {
  const getUnitOptions = () => {
    if (projectType === 'Commercial') {
      return ['Shop', 'Office', 'Showroom', 'Commercial Unit', 'Parking', 'Storage'];
    }
    return ['Flat', 'Shop', 'Showroom', 'Office', 'Penthouse', 'Villa', 'Plot', 'Parking', 'Storage'];
  };

  const unitOptions = getUnitOptions();
  const flatLabelOptions = generateFlatLabels(Math.max(units.length + 5, 10)); // Provide more options than current units

  return (
    <div className="floor-row-config border-b pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggle}
            className="p-1 hover:bg-slate-100 rounded-md transition-colors"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
          </button>
          <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{floorName}</h4>
          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">
            {units.length} Units
          </span>
        </div>
        <div className="flex gap-2">
          {onCopy && (
            <button onClick={onCopy} className="text-[10px] text-blue-600 hover:text-blue-800 flex items-center gap-1 font-bold bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition-all">
              <RefreshCw size={10} /> Copy Previous
            </button>
          )}
          <button onClick={onAdd} className="text-[10px] text-emerald-600 hover:text-emerald-800 flex items-center gap-1 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 transition-all">
            <Plus size={10} /> Add Unit
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="floor-row-units-content">
          {units.length === 0 ? (
            <div className="p-4 bg-white/50 border border-dashed rounded-xl text-center">
              <p className="text-xs text-slate-400 italic">No units configured for this floor.</p>
            </div>
          ) : (
            <div className="units-sub-grid">
              {units.map((unit, uIdx) => {
                const area = parseFloat(unit.area) || 0;
                const pricingArea = (unit.pricing_area && parseFloat(unit.pricing_area) > 0) ? parseFloat(unit.pricing_area) : area;
                const regSqft = parseFloat(unit.price_per_sqft) || 0;
                const discSqft = (unit.discount_price_per_sqft !== '' && unit.discount_price_per_sqft !== null) ? parseFloat(unit.discount_price_per_sqft) : null;
                const finalPrice = discSqft !== null ? pricingArea * discSqft : pricingArea * regSqft;

                return (
                  <div key={uIdx} className={`unit-mini-card relative group ${unit.isCustom ? 'is-custom border-blue-400' : 'is-default opacity-90'}`}>
                    <div className="status-badge-container absolute top-2 right-2 flex gap-1 z-10">
                      <span className={`status-indicator text-[8px] font-bold px-1.5 py-0.5 rounded-full ${unit.isCustom ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                        {unit.isCustom ? 'Custom' : 'Default'}
                      </span>
                      <button
                        onClick={() => onRemove(uIdx)}
                        className="bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md"
                      >
                        <X size={10} />
                      </button>
                    </div>

                    <div className="card-inner-layout p-3">
                      <div className="unit-card-header border-b border-slate-100 pb-2 mb-2">
                        <div className="flex flex-col gap-1 w-full">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Flat Label</label>
                          <select
                            className={`text-xs font-bold p-1 rounded border transition-colors ${!unit.isCustom ? 'bg-slate-50 border-transparent cursor-not-allowed text-slate-500' : 'bg-white border-slate-200 text-slate-800 focus:border-blue-400 outline-none'}`}
                            value={unit.flat_label}
                            onChange={e => {
                              const val = e.target.value;
                              const isConflict = units.some((u, idx) => idx !== uIdx && u.flat_label === val);
                              if (isConflict) {
                                alert("This flat label is already used on this floor.");
                                return;
                              }
                              onUpdate(uIdx, 'flat_label', val);
                              onUpdate(uIdx, 'unit_number', val);
                            }}
                            disabled={!unit.isCustom}
                          >
                            {flatLabelOptions.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="unit-card-body space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="input-field-group">
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Unit Type</label>
                            <select
                              className="text-[10px] border rounded p-1 w-full disabled:bg-slate-50 disabled:text-slate-400"
                              value={unit.unit_type}
                              onChange={e => onUpdate(uIdx, 'unit_type', e.target.value)}
                              disabled={!unit.isCustom}
                            >
                              {unitOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          </div>
                          <div className="input-field-group">
                            <label className="text-[9px] font-bold text-slate-400 uppercase">SBUA (SqFt)</label>
                            <input
                              type="number"
                              className="text-[10px] border rounded p-1 w-full disabled:bg-slate-50 disabled:text-slate-400"
                              value={unit.area}
                              onChange={e => onUpdate(uIdx, 'area', parseFloat(e.target.value) || 0)}
                              disabled={!unit.isCustom}
                            />
                          </div>
                          <div className="input-field-group">
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Carpet (SqFt)</label>
                            <input
                              type="number"
                              className="text-[10px] border rounded p-1 w-full disabled:bg-slate-50 disabled:text-slate-400"
                              value={unit.carpet_area || ''}
                              onChange={e => onUpdate(uIdx, 'carpet_area', e.target.value)}
                              disabled={!unit.isCustom}
                            />
                          </div>
                          <div className="input-field-group">
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Reg. Rate</label>
                            <input
                              type="number"
                              className="text-[10px] border rounded p-1 w-full disabled:bg-slate-50 disabled:text-slate-400"
                              value={unit.price_per_sqft || ''}
                              onChange={e => onUpdate(uIdx, 'price_per_sqft', e.target.value)}
                              disabled={!unit.isCustom}
                            />
                          </div>
                          <div className="input-field-group col-span-2">
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Discount Rate</label>
                            <input
                              type="number"
                              className="text-[10px] border rounded p-1 w-full disabled:bg-slate-50 disabled:text-slate-400"
                              value={unit.discount_price_per_sqft || ''}
                              onChange={e => onUpdate(uIdx, 'discount_price_per_sqft', e.target.value)}
                              disabled={!unit.isCustom}
                            />
                          </div>
                        </div>

                        <div className="action-buttons flex justify-between items-center">
                          {!unit.isCustom ? (
                            <button
                              onClick={() => onUpdate(uIdx, 'isCustom', true)}
                              className="text-[9px] font-bold text-blue-600 hover:text-blue-700 underline underline-offset-2"
                            >
                              Customize / Edit
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                if (window.confirm("Reset this unit to global defaults?")) {
                                  onUpdate(uIdx, 'isCustom', false);
                                  // Revert to defaults
                                  onUpdate(uIdx, 'unit_type', globalDefaults.unitType);
                                  onUpdate(uIdx, 'area', globalDefaults.sbua);
                                  onUpdate(uIdx, 'carpet_area', globalDefaults.carpetArea);
                                  onUpdate(uIdx, 'price_per_sqft', globalDefaults.baseRate);
                                  onUpdate(uIdx, 'discount_price_per_sqft', globalDefaults.discountRate);

                                  const label = `Flat ${String.fromCharCode(65 + uIdx)}`;
                                  onUpdate(uIdx, 'flat_label', label);
                                  onUpdate(uIdx, 'unit_number', label);
                                }
                              }}
                              className="text-[9px] font-bold text-green-600 hover:text-green-700 underline underline-offset-2"
                            >
                              Use Default
                            </button>
                          )}
                        </div>

                        <div className="pricing-row-display flex justify-between items-center mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <div className="flex flex-col">
                            <span className="text-[8px] text-slate-400 font-bold uppercase">Total Price</span>
                            {discSqft !== null && (
                              <span className="strikethrough-price text-[8px] text-slate-400 font-bold line-through">
                                {(() => {
                                  const val = area * regSqft;
                                  if (val === 0) return '₹0';
                                  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
                                  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
                                  return `₹${val.toLocaleString('en-IN')}`;
                                })()}
                              </span>
                            )}
                          </div>
                          <span className="final-price-tag text-indigo-700 font-bold text-xs">
                            {(() => {
                              if (finalPrice <= 0) return '₹0';
                              if (finalPrice >= 10000000) return `₹${(finalPrice / 10000000).toFixed(2)} Cr`;
                              if (finalPrice >= 100000) return `₹${(finalPrice / 100000).toFixed(2)} L`;
                              return `₹${finalPrice.toLocaleString('en-IN')}`;
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Bungalow Grid Component
const BungalowGrid = ({ units, onUpdate, onRemove, onAdd, globalDefaults }) => {


  return (
    <div className="bungalow-grid-container">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Bungalow Units</h4>
          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">
            {units.length} Units
          </span>
        </div>
        <button onClick={onAdd} className="text-[10px] text-emerald-600 hover:text-emerald-800 flex items-center gap-1 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 transition-all">
          <Plus size={10} /> Add Unit
        </button>
      </div>

      <div className="units-sub-grid">
        {units.map((unit, uIdx) => {
          // Determine Effective Values: specific if custom, global default if default
          const area = unit.isCustom
            ? (parseFloat(unit.area) || 0)
            : (parseFloat(globalDefaults.sbua) || 0);

          const regSqft = unit.isCustom
            ? (parseFloat(unit.price_per_sqft) || 0)
            : (parseFloat(globalDefaults.baseRate) || 0);

          let discSqft = null;
          if (unit.isCustom) {
            discSqft = (unit.discount_price_per_sqft !== '' && unit.discount_price_per_sqft !== null)
              ? parseFloat(unit.discount_price_per_sqft)
              : null;
          } else {
            discSqft = (globalDefaults.discountRate !== '' && globalDefaults.discountRate !== null)
              ? parseFloat(globalDefaults.discountRate)
              : null;
          }

          // fallback to regular price if discount is not set (null)
          const finalPrice = discSqft !== null ? area * discSqft : area * regSqft;

          return (
            <div key={uIdx} className={`unit-mini-card relative group ${unit.isCustom ? 'is-custom border-blue-400' : 'is-default opacity-90'}`}>
              <div className="status-badge-container absolute top-2 right-2 flex gap-1 z-10">
                <span className={`status-indicator text-[8px] font-bold px-1.5 py-0.5 rounded-full ${unit.isCustom ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                  {unit.isCustom ? 'Custom' : 'Default'}
                </span>
                <button
                  onClick={() => onRemove(uIdx)}
                  className="bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md"
                >
                  <X size={10} />
                </button>
              </div>

              <div className="card-inner-layout p-3">
                <div className="unit-card-header border-b border-slate-100 pb-2 mb-2">
                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Unit Label</label>
                    <input
                      type="text"
                      className={`text-xs font-bold p-1 rounded border transition-colors ${!unit.isCustom ? 'bg-slate-50 border-transparent cursor-not-allowed text-slate-500' : 'bg-white border-slate-200 text-slate-800 focus:border-blue-400 outline-none'}`}
                      value={unit.unit_number}
                      onChange={e => onUpdate(uIdx, 'unit_number', e.target.value)}
                      disabled={!unit.isCustom}
                    />
                  </div>
                </div>

                <div className="unit-card-body space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="input-field-group">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Unit Type</label>
                      <select
                        className="text-[10px] border rounded p-1 w-full disabled:bg-slate-50 disabled:text-slate-400"
                        value={unit.unit_type}
                        onChange={e => onUpdate(uIdx, 'unit_type', e.target.value)}
                        disabled={!unit.isCustom}
                      >
                        <option value="Villa">Villa</option>
                        <option value="Bungalow">Bungalow</option>
                        <option value="Row House">Row House</option>
                        <option value="Twin Villa">Twin Villa</option>
                        <option value="Plot">Plot</option>
                      </select>
                    </div>
                    <div className="input-field-group">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Area (SqFt)</label>
                      <input
                        type="number"
                        className="text-[10px] border rounded p-1 w-full disabled:bg-slate-50 disabled:text-slate-400"
                        value={unit.area}
                        onChange={e => onUpdate(uIdx, 'area', parseFloat(e.target.value) || 0)}
                        disabled={!unit.isCustom}
                      />
                    </div>
                    <div className="input-field-group">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Regular Price</label>
                      <input
                        type="number"
                        className="text-[10px] border rounded p-1 w-full disabled:bg-slate-50 disabled:text-slate-400"
                        value={unit.price_per_sqft || ''}
                        onChange={e => onUpdate(uIdx, 'price_per_sqft', e.target.value)}
                        placeholder={!unit.isCustom ? globalDefaults.baseRate : ''}
                        disabled={!unit.isCustom}
                      />
                    </div>
                    <div className="input-field-group">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Discount Price</label>
                      <input
                        type="number"
                        className="text-[10px] border rounded p-1 w-full disabled:bg-slate-50 disabled:text-slate-400"
                        value={unit.discount_price_per_sqft || ''}
                        onChange={e => onUpdate(uIdx, 'discount_price_per_sqft', e.target.value)}
                        placeholder={!unit.isCustom ? globalDefaults.discountRate : ''}
                        disabled={!unit.isCustom}
                      />
                    </div>
                  </div>

                  <div className="action-buttons flex justify-between items-center">
                    {!unit.isCustom ? (
                      <button
                        onClick={() => onUpdate(uIdx, 'isCustom', true)}
                        className="text-[9px] font-bold text-blue-600 hover:text-blue-700 underline underline-offset-2"
                      >
                        Customize / Edit
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (window.confirm("Reset this bungalow to global defaults?")) {
                            onUpdate(uIdx, 'isCustom', false);
                            onUpdate(uIdx, 'unit_type', globalDefaults.unitType);
                            onUpdate(uIdx, 'area', globalDefaults.sbua);
                            onUpdate(uIdx, 'price_per_sqft', globalDefaults.baseRate);
                            onUpdate(uIdx, 'discount_price_per_sqft', globalDefaults.discountRate);
                          }
                        }}
                        className="text-[9px] font-bold text-green-600 hover:text-green-700 underline underline-offset-2"
                      >
                        Use Default
                      </button>
                    )}
                  </div>

                  <div className="pricing-row-display flex justify-between items-center mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div className="flex flex-col">
                      <span className="text-[8px] text-slate-400 font-bold uppercase">Total Price</span>
                      <span className="final-price-tag text-indigo-700 font-bold text-sm">
                        ₹{(finalPrice / 100000).toFixed(2)} L
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminLiveGrouping;
