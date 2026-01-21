import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, Text, PerspectiveCamera } from '@react-three/drei';
import { useLocation, useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { ChevronLeft, Layers, Box, Info, Timer, X, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { liveGroupDynamicAPI } from '../../services/api';
import './LiveGrouping.css';

// --- Configuration ---
const TOWER_SPACING = 20;
const FLOOR_HEIGHT = 2.5;
const UNIT_WIDTH = 4;
const UNIT_DEPTH = 4;
const UNIT_GAP = 0.5;

// Colors
const COLOR_AVAILABLE = '#22c55e';
const COLOR_BOOKED = '#ef4444';
const COLOR_LOCKED = '#fbbf24';
const COLOR_DEFAULT = '#94a3b8';
const COLOR_SELECTED = '#3b82f6';

// --- Sub-Components ---

const UnitBox = ({ unit, position, size, onClick, specialColor, rotation = [0, 0, 0] }) => {
    const [hovered, setHovered] = useState(false);
    const meshRef = useRef();

    let color = specialColor || COLOR_DEFAULT;
    if (unit.status === 'booked') color = COLOR_BOOKED;
    else if (unit.status === 'locked') color = COLOR_LOCKED;
    else if (unit.status === 'available' && !specialColor) color = COLOR_AVAILABLE;

    if (unit.status === 'available') color = COLOR_AVAILABLE;

    if (hovered && unit.status === 'available') color = COLOR_SELECTED;

    return (
        <group position={position} rotation={rotation}>
            <mesh
                ref={meshRef}
                onClick={(e) => {
                    e.stopPropagation();
                    onClick(unit);
                }}
                onPointerOver={(e) => {
                    e.stopPropagation();
                    setHovered(true);
                }}
                onPointerOut={() => setHovered(false)}
            >
                <boxGeometry args={[size[0], size[1], size[2]]} />
                <meshStandardMaterial
                    color={color}
                    roughness={0.3}
                    metalness={0.2}
                    transparent
                    opacity={unit.status === 'booked' ? 0.9 : 0.7}
                    side={THREE.DoubleSide}
                />
                <lineSegments>
                    <edgesGeometry args={[new THREE.BoxGeometry(size[0], size[1], size[2])]} />
                    <lineBasicMaterial color="white" />
                </lineSegments>
            </mesh>
            <Text
                position={[0, 0, size[2] / 2 + 0.05]}
                fontSize={0.8}
                color="white"
                anchorX="center"
                anchorY="middle"
            >
                {unit.unit_number}
            </Text>
        </group>
    );
};

const Tower = ({ tower, position, onUnitClick, lowestFloor }) => {
    const BASEMENT_HEIGHT = 4.0;
    const UNIT_HEIGHT = FLOOR_HEIGHT * 0.9;

    // Group units by floor
    const unitsByFloor = tower.units.reduce((acc, unit) => {
        if (!acc[unit.floor_number]) acc[unit.floor_number] = [];
        acc[unit.floor_number].push(unit);
        return acc;
    }, {});

    const sortedFloors = Object.keys(unitsByFloor).sort((a, b) => parseInt(a) - parseInt(b));
    const hasBasement = lowestFloor === -1;
    const hasGF = unitsByFloor[0] !== undefined;

    // Filter out basement from units rendering (it will be a single block)
    const unitsFloors = sortedFloors.filter(f => parseInt(f) !== -1);

    // Calculate vertical position for each floor
    const getFloorY = (floorNum) => {
        const bH = hasBasement ? BASEMENT_HEIGHT : 0;
        const gfH = hasGF ? FLOOR_HEIGHT : 0;

        if (floorNum === -1) return BASEMENT_HEIGHT / 2;
        if (floorNum === 0) return bH + (UNIT_HEIGHT / 2);

        // Floor 1 sits above GF or B or Ground
        return bH + gfH + (floorNum - 1) * FLOOR_HEIGHT + (UNIT_HEIGHT / 2);
    };

    // Calculate Footprint based on unitsPerFloor
    const sampleFloorUnits = unitsByFloor[1] || unitsByFloor[0] || unitsByFloor[-1] || [];
    const cols = Math.ceil(Math.sqrt(sampleFloorUnits.length || 4));
    const rows = Math.ceil(sampleFloorUnits.length / cols) || 1;
    const footprintWidth = cols * (UNIT_WIDTH + UNIT_GAP) + 1;
    const footprintDepth = rows * (UNIT_DEPTH + UNIT_GAP) + 1;

    return (
        <group position={position}>
            {/* Tower Name Label */}
            <Text
                position={[0, (tower.total_floors + 1) * FLOOR_HEIGHT + (hasBasement ? 2 : 0), 0]}
                fontSize={2.5}
                color="#1e293b"
                anchorX="center"
            >
                {tower.tower_name}
            </Text>

            {/* Render Unified Basement Volume */}
            {hasBasement && (
                <group position={[0, BASEMENT_HEIGHT / 2, 0]}>
                    <mesh receiveShadow castShadow>
                        <boxGeometry args={[footprintWidth, BASEMENT_HEIGHT, footprintDepth]} />
                        <meshStandardMaterial color="#334155" roughness={0.8} />
                    </mesh>
                    <lineSegments>
                        <edgesGeometry args={[new THREE.BoxGeometry(footprintWidth, BASEMENT_HEIGHT, footprintDepth)]} />
                        <lineBasicMaterial color="#475569" />
                    </lineSegments>
                </group>
            )}

            {/* Render units floor by floor (starting from GF) */}
            {unitsFloors.map((floor) => {
                const floorNum = parseInt(floor);
                const units = unitsByFloor[floor];
                const floorY = getFloorY(floorNum);

                let specialColor = null;
                if (floorNum === 0) {
                    specialColor = '#64748b'; // GF - Concrete/Glass mix
                }

                return units.map((unit, idx) => {
                    const row = Math.floor(idx / cols);
                    const col = idx % cols;

                    const posX = (col - (cols - 1) / 2) * (UNIT_WIDTH + UNIT_GAP);
                    const posZ = (row - (Math.ceil(units.length / cols) - 1) / 2) * (UNIT_DEPTH + UNIT_GAP);

                    // Back units (A & B sides) should be rotated 180 deg to face outward
                    const isBackUnit = unit.unit_number.includes('A') || unit.unit_number.includes('B');
                    const rotation = isBackUnit ? [0, Math.PI, 0] : [0, 0, 0];

                    return (
                        <UnitBox
                            key={unit.id}
                            unit={unit}
                            position={[posX, floorY, posZ]}
                            size={[UNIT_WIDTH, UNIT_HEIGHT, UNIT_DEPTH]}
                            onClick={onUnitClick}
                            specialColor={specialColor}
                            rotation={rotation}
                        />
                    );
                });
            })}
        </group>
    );
};

// --- Main Page ---

import TwoDView from './TwoDView';

const ThreeDView = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const property = location.state?.property;

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [paymentLoading, setPaymentLoading] = useState(false);

    // View Mode State
    const [viewMode, setViewMode] = useState('3d'); // '3d' | '2d'
    const [showHoldOptions, setShowHoldOptions] = useState(false);
    const [holdLoading, setHoldLoading] = useState(false);

    const fetchHierarchy = useCallback(async () => {
        try {
            setLoading(true);
            const data = await liveGroupDynamicAPI.getFullHierarchy(property.id);
            setProject(data.project);
        } catch (error) {
            console.error('Error fetching project hierarchy:', error);
        } finally {
            setLoading(false);
        }
    }, [property]);

    useEffect(() => {
        if (property?.id) {
            fetchHierarchy();

            // 🔄 Polling for real-time status sync (every 3 seconds)
            const interval = setInterval(() => {
                const fetchSilent = async () => {
                    try {
                        const data = await liveGroupDynamicAPI.getFullHierarchy(property.id);
                        setProject(data.project);
                    } catch (e) {
                        console.error('Silent fetch error:', e);
                    }
                };
                fetchSilent();
            }, 3000);

            return () => clearInterval(interval);
        } else {
            setLoading(false);
        }
    }, [property, fetchHierarchy]);

    const handleUnitClick = (unit) => {
        // If booked by someone else
        if (unit.status === 'booked') {
            alert('This unit is already booked.');
            return;
        }

        // If locked by someone else
        if (unit.status === 'locked' && !selectedUnit) {
            alert('This unit is currently on hold. Please try again later.');
            return;
        }

        if (!isAuthenticated) {
            alert('Please login to lock and book a unit.');
            navigate('/login');
            return;
        }

        setSelectedUnit(unit);
        setShowHoldOptions(false);
    };

    const handleHoldUnit = async (duration) => {
        if (!selectedUnit) return;
        setHoldLoading(true);
        try {
            await liveGroupDynamicAPI.lockUnit(selectedUnit.id, duration);
            await fetchHierarchy();
            setShowHoldOptions(false);
        } catch (error) {
            alert(error.message || 'Failed to hold unit.');
        } finally {
            setHoldLoading(false);
        }
    };

    const handleBookNow = async () => {
        if (!selectedUnit) return;
        setPaymentLoading(true);

        try {
            // In real production, this would trigger Razorpay
            // On success, we call the book API
            alert('Payment Success (Mock)! Finalizing booking...');

            await liveGroupDynamicAPI.bookUnit(selectedUnit.id, {
                amount: (selectedUnit.price * 0.5) / 100,
                payment_id: 'PAY-' + Math.random().toString(36).substr(2, 9)
            });

            alert('Unit booked successfully! Redirecting...');
            setSelectedUnit(null);
            await fetchHierarchy();
        } catch (error) {
            alert('Booking failed: ' + error.message);
        } finally {
            setPaymentLoading(false);
        }
    };

    if (loading) return <div className="loader-container"><div className="spinner"></div><p>Generating Scene...</p></div>;
    if (!project) return <div className="error-container"><h3>Project not found</h3><button onClick={() => navigate(-1)}>Go Back</button></div>;

    return (
        <div className="relative w-full h-screen bg-slate-50 overflow-hidden">
            {/* Header Overlay */}
            <div className="absolute top-0 left-0 w-full z-50 p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-b from-slate-900/90 via-slate-900/50 to-transparent pointer-events-none space-y-4 md:space-y-0 text-shadow-sm">
                <div className="pointer-events-auto flex items-center gap-4 w-full md:w-auto">
                    <button
                        className="bg-white/10 backdrop-blur-md text-white px-3 py-2 md:px-4 md:py-2.5 rounded-xl font-medium hover:bg-white/20 hover:scale-105 active:scale-95 transition-all border border-white/10 flex items-center gap-2 group shadow-lg shadow-black/5"
                        onClick={() => navigate(-1)}
                    >
                        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="hidden sm:inline">Back</span>
                    </button>

                    <div className="!text-white flex-1 md:flex-none">
                        <h1 className="text-xl md:text-2xl font-bold tracking-tight drop-shadow-md leading-tight !text-white">{project.title}</h1>
                        <p className="text-xs md:text-sm !text-slate-200 font-medium flex items-center gap-2">
                            {project.location} <span className="w-1 h-1 rounded-full bg-white/50"></span> {project.towers.length} Towers <span className="w-1 h-1 rounded-full bg-white/50"></span> {project.total_slots} Units
                        </p>
                    </div>
                </div>

                {/* View Toggle */}
                <div className="pointer-events-auto self-center md:self-auto flex gap-3">
                    {/* View Toggle */}
                    <div className="bg-slate-900/40 backdrop-blur-xl p-1.5 rounded-full border border-white/10 flex relative shadow-2xl">
                        {['3d', '2d'].map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                className={`relative z-10 px-5 py-2 md:px-6 md:py-2.5 rounded-full text-xs md:text-sm font-bold tracking-wide transition-all duration-300 flex items-center gap-2 ${viewMode === mode ? 'text-slate-900' : 'text-slate-200 hover:text-white'
                                    }`}
                            >
                                {viewMode === mode && (
                                    <motion.div
                                        layoutId="toggle-bg"
                                        className="absolute inset-0 bg-white rounded-full shadow-lg"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        style={{ zIndex: -1 }}
                                    />
                                )}
                                {mode === '3d' ? <Box size={14} strokeWidth={2.5} /> : <Layers size={14} strokeWidth={2.5} />}
                                {mode === '3d' ? '3D View' : 'Blueprint'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Legend Overlay */}
            <div className="absolute bottom-6 left-6 z-40 bg-white/90 backdrop-blur-xl p-5 rounded-3xl shadow-2xl border border-white/40 pointer-events-auto transform transition-transform hover:scale-105 hidden sm:block">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Inventory</h3>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center gap-4 group cursor-help">
                        <div className="w-3.5 h-3.5 rounded-lg bg-emerald-500 shadow-[0_4px_12px_rgba(16,185,129,0.3)] group-hover:scale-125 transition-all"></div>
                        <span className="text-[13px] font-bold text-slate-600">Available</span>
                    </div>
                    <div className="flex items-center gap-4 group cursor-help">
                        <div className="w-3.5 h-3.5 rounded-lg bg-amber-400 shadow-[0_4px_12px_rgba(251,191,36,0.3)] group-hover:scale-125 transition-all"></div>
                        <span className="text-[13px] font-bold text-slate-600">On Hold</span>
                    </div>
                    <div className="flex items-center gap-4 group cursor-help">
                        <div className="w-3.5 h-3.5 rounded-lg bg-rose-500 shadow-[0_4px_12px_rgba(244,63,94,0.3)] group-hover:scale-125 transition-all"></div>
                        <span className="text-[13px] font-bold text-slate-600">Booked</span>
                    </div>
                </div>
            </div>

            {/* Selection Modal */}
            {selectedUnit && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all duration-300">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-white w-full max-w-md rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden border border-white/20"
                    >
                        <div className="p-6">
                            {/* Close & Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                            {selectedUnit.floor_number === -1 ? 'Slot' : 'Unit'} {selectedUnit.unit_number}
                                        </h2>
                                        {selectedUnit.status === 'locked' && (
                                            <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 border border-amber-200">
                                                <Timer size={9} /> Held
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                                        {selectedUnit.floor_number === -1
                                            ? 'Basement Level'
                                            : selectedUnit.floor_number === 0
                                                ? 'Ground Floor'
                                                : `Floor ${selectedUnit.floor_number}`} • {selectedUnit.unit_type}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedUnit(null)}
                                    className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Main Info Card */}
                            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 mb-4 space-y-3">
                                <div className="flex justify-between items-center border-b border-slate-200/50 pb-2.5">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pricing</span>
                                    <span className="text-xl font-black text-slate-900">₹{(selectedUnit.price / 100000).toFixed(2)} L</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                                            {selectedUnit.floor_number === -1 ? 'Area' : 'Carpet Area'}
                                        </p>
                                        <p className="text-base font-black text-slate-700">{selectedUnit.area} sq ft</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider mb-0.5">Booking (0.5%)</p>
                                        <p className="text-base font-black text-emerald-600">₹{(selectedUnit.price * 0.005 / 1000).toFixed(2)} K</p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Area */}
                            {!showHoldOptions ? (
                                <div className="space-y-4">
                                    {/* Real-time Status Disclaimer */}
                                    <div className="bg-emerald-50 border border-emerald-100/50 p-2.5 rounded-xl flex items-center gap-2.5">
                                        <div className="bg-emerald-500 rounded-full p-1 text-white shrink-0">
                                            <Info size={10} strokeWidth={3} />
                                        </div>
                                        <p className="text-[11px] font-bold text-emerald-800 leading-tight">
                                            Pay ₹<span className="text-sm font-black text-emerald-950">{(selectedUnit.price * 0.005 / 1000).toFixed(2)} K</span> (0.5%) right now to secure this unit instantly.
                                        </p>
                                    </div>

                                    {/* Action Buttons Row */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            className="flex-1 py-3 bg-slate-100 text-slate-600 font-extrabold rounded-xl hover:bg-slate-200 transition-all active:scale-95 text-[10px] uppercase tracking-widest border border-slate-200 shadow-sm"
                                            onClick={() => setSelectedUnit(null)}
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            className="flex-1 py-3 text-white font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-lg shadow-amber-200/40 disabled:opacity-50 text-[10px] uppercase tracking-widest"
                                            style={{ backgroundColor: '#f59e0b' }} // Solid Amber/Yellow
                                            onClick={() => setShowHoldOptions(true)}
                                            disabled={selectedUnit.status === 'locked'}
                                        >
                                            <Timer size={14} strokeWidth={3} />
                                            {selectedUnit.status === 'locked' ? 'Held' : 'Hold'}
                                        </button>

                                        <button
                                            className="flex-[1.2] py-3 text-white font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-xl shadow-rose-200/40 text-[10px] uppercase tracking-widest"
                                            style={{ backgroundColor: '#ef4444' }} // Solid Red
                                            onClick={handleBookNow}
                                            disabled={paymentLoading}
                                        >
                                            <CreditCard size={14} strokeWidth={3} />
                                            {paymentLoading ? 'Wait' : 'Book'}
                                        </button>
                                    </div>

                                    <p className="text-[9px] text-slate-400 text-center font-bold uppercase tracking-[0.2em]">Secure Encryption Active</p>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-in slide-in-from-bottom-5 duration-300">
                                    <div className="flex items-center gap-3 justify-center mb-2">
                                        <div className="h-px bg-slate-100 flex-1"></div>
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Select Duration</h3>
                                        <div className="h-px bg-slate-100 flex-1"></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            className="py-6 bg-amber-50 border-2 border-amber-200 rounded-2xl hover:bg-amber-100 transition-all text-center group active:scale-95"
                                            onClick={() => handleHoldUnit(30)}
                                            disabled={holdLoading}
                                        >
                                            <span className="block text-3xl font-black text-amber-600 group-hover:scale-110 transition-transform tracking-tight">30</span>
                                            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Minutes</span>
                                        </button>
                                        <button
                                            className="py-6 bg-orange-50 border-2 border-orange-200 rounded-2xl hover:bg-orange-100 transition-all text-center group active:scale-95"
                                            onClick={() => handleHoldUnit(60)}
                                            disabled={holdLoading}
                                        >
                                            <span className="block text-3xl font-black text-orange-600 group-hover:scale-110 transition-transform tracking-tight">1</span>
                                            <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">Hour</span>
                                        </button>
                                    </div>
                                    <button
                                        className="w-full py-2 text-slate-400 font-bold hover:text-slate-600 transition-colors text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                                        onClick={() => setShowHoldOptions(false)}
                                    >
                                        <ChevronLeft size={14} /> Back to Details
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}

            {/* 3D Canvas */}
            {viewMode === '3d' && (
                <Canvas shadows className="w-full h-full">
                    <PerspectiveCamera makeDefault position={[50, 50, 100]} fov={40} />
                    <Sky sunPosition={[100, 20, 50]} />
                    <ambientLight intensity={0.7} />
                    <directionalLight
                        position={[50, 100, 50]}
                        intensity={1.5}
                        castShadow
                        shadow-mapSize={[2048, 2048]}
                    />
                    <OrbitControls target={[0, (project.towers[0]?.total_floors || 5) * 1.25, 0]} maxPolarAngle={Math.PI / 2.1} />

                    <group>
                        {project.towers.map((tower, idx) => {
                            const posX = (idx - (project.towers.length - 1) / 2) * TOWER_SPACING;

                            const towerUnits = tower.units || [];
                            const lowestFloor = towerUnits.length > 0
                                ? towerUnits.reduce((min, u) => Math.min(min, parseInt(u.floor_number)), 100)
                                : 1;

                            return (
                                <Tower
                                    key={tower.id}
                                    tower={tower}
                                    position={[posX, 0, 0]}
                                    onUnitClick={handleUnitClick}
                                    lowestFloor={lowestFloor}
                                />
                            );
                        })}
                    </group>

                    {/* Ground Grid - Reset to 0 as Pillars now touch 0 */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                        <planeGeometry args={[1000, 1000]} />
                        <meshStandardMaterial color="#e2e8f0" />
                    </mesh>
                    <gridHelper args={[200, 40]} position={[0, -0.4, 0]} colorCenterLine="#94a3b8" />
                </Canvas>
            )}

            {/* 2D View */}
            {viewMode === '2d' && (
                <div className="absolute inset-x-0 bottom-0 top-20 z-0 bg-slate-50">
                    <TwoDView
                        project={project}
                        onUnitClick={handleUnitClick}
                    />
                </div>
            )}
        </div>
    );
};

export default ThreeDView;
