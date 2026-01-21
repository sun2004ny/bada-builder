import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, TowerControl as Tower, Building2,
  Trash2, Edit, Eye, Save, X, ChevronRight,
  ChevronLeft, LayoutGrid, List, CheckCircle2, AlertCircle,
  ArrowLeft, Lock, DollarSign
} from 'lucide-react';
import { liveGroupDynamicAPI } from '../../services/api';
import TwoDView from '../../pages/Exhibition/TwoDView'; // Import the 2D View component
import './AdminLiveGrouping.css';

const AdminLiveGrouping = () => {
  const navigate = useNavigate();
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
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form State
  const [projectData, setProjectData] = useState({
    title: '',
    developer: '',
    location: '',
    description: '',
    original_price: '',
    group_price: '',
    discount: '',
    savings: '',
    type: 'Apartment',
    min_buyers: 5,
    area: '',
    possession: '',
    rera_number: ''
  });

  const [towers, setTowers] = useState([
    { name: 'Tower A', floors: 10, unitsPerFloor: 4 }
  ]);

  const [unitSettings, setUnitSettings] = useState({
    unitType: '3 BHK',
    areaPerUnit: 1500,
    pricePerUnit: 7500000
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleCreateProject = async () => {
    try {
      setSaving(true);

      // 1. Create Project
      const response = await liveGroupDynamicAPI.createProject(projectData, imageFiles);
      const newProject = response.project;

      // 2. Add Towers & Generate Units
      for (const towerInfo of towers) {
        const towerResponse = await liveGroupDynamicAPI.addTower(newProject.id, {
          tower_name: towerInfo.name,
          total_floors: towerInfo.floors
        });

        await liveGroupDynamicAPI.generateUnits(towerResponse.tower.id, {
          unitsPerFloor: towerInfo.unitsPerFloor,
          pricePerUnit: unitSettings.pricePerUnit,
          unitType: unitSettings.unitType,
          areaPerUnit: unitSettings.areaPerUnit,
          hasBasement: towerInfo.hasBasement,
          hasGroundFloor: towerInfo.hasGroundFloor
        });
      }

      alert('Project, Towers, and Units created successfully!');
      setShowWizard(false);
      setWizardStep(1);
      fetchProjects();
    } catch (error) {
      console.error('Wizard submission error:', error);
      alert('Failed to complete setup: ' + error.message);
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
      }
      // Refresh data
      const data = await liveGroupDynamicAPI.getFullHierarchy(selectedProject.id);
      setProjectHierarchy(data.project);
      setShowUnitActionModal(false);
      // alert(`Unit ${action}ed successfully!`); // Optional feedback
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
    const newTowers = [...towers];
    // Handle number inputs specifically to prevent NaN
    if (field === 'floors' || field === 'unitsPerFloor') {
      newTowers[index][field] = value === '' ? '' : parseInt(value);
    } else {
      newTowers[index][field] = value;
    }
    setTowers(newTowers);
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
                    <div className="stats-row">
                      <div className="stat">
                        <span className="label">Towers</span>
                        <span className="value">{project.tower_count || 'N/A'}</span>
                      </div>
                      <div className="stat">
                        <span className="label">Units</span>
                        <span className="value">{project.total_slots}</span>
                      </div>
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
                  <TwoDView project={projectHierarchy} onUnitClick={handleUnitClick} />
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
                  <span>Basics</span>
                </div>
                <div className="line"></div>
                <div className={`step ${wizardStep >= 2 ? 'active' : ''} ${wizardStep > 2 ? 'completed' : ''}`}>
                  <div className="node">2</div>
                  <span>Hierarchy</span>
                </div>
                <div className="line"></div>
                <div className={`step ${wizardStep >= 3 ? 'active' : ''} ${wizardStep > 3 ? 'completed' : ''}`}>
                  <div className="node">3</div>
                  <span>Units</span>
                </div>
              </div>

              <div className="wizard-content">
                {wizardStep === 1 && (
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
                      <div className="input-group">
                        <label>Regular Price (sq ft)</label>
                        <input type="text" value={projectData.original_price} onChange={e => setProjectData({ ...projectData, original_price: e.target.value })} placeholder="e.g. ₹5,500" />
                      </div>
                      <div className="input-group">
                        <label>Group Price (sq ft)</label>
                        <input type="text" value={projectData.group_price} onChange={e => setProjectData({ ...projectData, group_price: e.target.value })} placeholder="e.g. ₹4,800" />
                      </div>
                      <div className="input-group">
                        <label>Discount Label</label>
                        <input type="text" value={projectData.discount} onChange={e => setProjectData({ ...projectData, discount: e.target.value })} placeholder="e.g. 12.5% OFF" />
                      </div>
                      <div className="input-group">
                        <label>Min. Buyers to Start</label>
                        <input type="number" value={projectData.min_buyers} onChange={e => setProjectData({ ...projectData, min_buyers: e.target.value })} />
                      </div>
                      <div className="input-group full">
                        <label>Images</label>
                        <input type="file" multiple onChange={handleImageChange} />
                        <div className="previews">
                          {imagePreviews.map((p, i) => <img key={i} src={p} alt="" />)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {wizardStep === 2 && (
                  <div className="step-pane">
                    <div className="pane-header">
                      <h3>Towers & Floors Configuration</h3>
                      <button className="add-btn" onClick={addTowerRow}><Plus size={16} /> Add Tower</button>
                    </div>
                    <table className="wizard-table">
                      <thead>
                        <tr>
                          <th>Tower Name</th>
                          <th>Floors</th>
                          <th>Units / Floor</th>
                          <th>Extra Levels</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {towers.map((t, idx) => (
                          <tr key={idx}>
                            <td><input type="text" value={t.name} onChange={e => updateTowerRow(idx, 'name', e.target.value)} /></td>
                            <td><input type="number" value={t.floors} onChange={e => updateTowerRow(idx, 'floors', e.target.value)} /></td>
                            <td><input type="number" value={t.unitsPerFloor} onChange={e => updateTowerRow(idx, 'unitsPerFloor', e.target.value)} /></td>
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
                            <td><button className="remove-btn" onClick={() => removeTowerRow(idx)}><Trash2 size={16} /></button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {wizardStep === 3 && (
                  <div className="step-pane">
                    <h3>Unit Generation Defaults</h3>
                    <p className="hint">These settings apply to all generated units in this project.</p>
                    <div className="form-grid">
                      <div className="input-group">
                        <label>Unit Type</label>
                        <input type="text" value={unitSettings.unitType} onChange={e => setUnitSettings({ ...unitSettings, unitType: e.target.value })} placeholder="e.g. 3 BHK" />
                      </div>
                      <div className="input-group">
                        <label>Unit Area (sq ft)</label>
                        <input type="number" value={unitSettings.areaPerUnit} onChange={e => setUnitSettings({ ...unitSettings, areaPerUnit: e.target.value })} />
                      </div>
                      <div className="input-group">
                        <label>Total Price (Approx)</label>
                        <input type="number" value={unitSettings.pricePerUnit} onChange={e => setUnitSettings({ ...unitSettings, pricePerUnit: e.target.value })} />
                      </div>
                    </div>

                    <div className="summary-box">
                      <h4>Generation Summary</h4>
                      <div className="summary-grid">
                        <div className="s-item">
                          <span>Total Towers</span>
                          <strong>{towers.length}</strong>
                        </div>
                        <div className="s-item">
                          <span>Total Units</span>
                          <strong>{towers.reduce((acc, t) => acc + ((parseInt(t.floors) || 0) * (parseInt(t.unitsPerFloor) || 0)), 0)}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="wizard-footer">
                <button className="secondary-btn" onClick={() => wizardStep > 1 ? setWizardStep(wizardStep - 1) : setShowWizard(false)}>
                  {wizardStep === 1 ? 'Cancel' : 'Back'}
                </button>
                <div className="filler"></div>
                {wizardStep < 3 ? (
                  <button className="primary-btn" onClick={() => setWizardStep(wizardStep + 1)}>
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
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Unit {selectedUnit.unit_number}</h3>
                  <p className="text-sm text-slate-500">Current Status: <span className="font-semibold uppercase">{selectedUnit.status}</span></p>
                </div>
                <button onClick={() => setShowUnitActionModal(false)} className="p-1 hover:bg-slate-100 rounded-full">
                  <X size={20} className="text-slate-400" />
                </button>
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
                  <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-500 text-sm">
                    This unit is currently <strong>{selectedUnit.status}</strong>.
                    <br />Unlock/Release functionality coming soon.
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminLiveGrouping;
