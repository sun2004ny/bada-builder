import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, Text, PerspectiveCamera } from '@react-three/drei';
import { useLocation, useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { ChevronLeft, Layers, Box, Info } from 'lucide-react';
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
const COLOR_AVAILABLE = '#22c55e'; // Green
const COLOR_BOOKED = '#ef4444';    // Red
const COLOR_LOCKED = '#eab308';    // Yellow
const COLOR_DEFAULT = '#94a3b8';

// --- Sub-Components ---

const UnitBox = ({ unit, position, size, onClick }) => {
    const [hovered, setHovered] = useState(false);
    const meshRef = useRef();

    let color = COLOR_DEFAULT;
    if (unit.status === 'booked') color = COLOR_BOOKED;
    else if (unit.status === 'locked') color = COLOR_LOCKED;
    else if (unit.status === 'available') color = COLOR_AVAILABLE;

    if (hovered && unit.status === 'available') color = '#3b82f6';

    return (
        <group position={position}>
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

const Tower = ({ tower, position, onUnitClick }) => {
    // Group units by floor
    const unitsByFloor = tower.units.reduce((acc, unit) => {
        if (!acc[unit.floor_number]) acc[unit.floor_number] = [];
        acc[unit.floor_number].push(unit);
        return acc;
    }, {});

    return (
        <group position={position}>
            {/* Tower label */}
            <Text
                position={[0, (tower.total_floors + 1) * FLOOR_HEIGHT, 0]}
                fontSize={2.5}
                color="#1e293b"
                anchorX="center"
            >
                {tower.tower_name}
            </Text>

            {/* Render units floor by floor */}
            {Object.entries(unitsByFloor).map(([floor, units]) => {
                const floorNum = parseInt(floor);
                const floorY = floorNum * FLOOR_HEIGHT;

                // Arrange units in a grid around center
                const cols = Math.ceil(Math.sqrt(units.length));

                return units.map((unit, idx) => {
                    const row = Math.floor(idx / cols);
                    const col = idx % cols;

                    const posX = (col - (cols - 1) / 2) * (UNIT_WIDTH + UNIT_GAP);
                    const posZ = (row - (Math.ceil(units.length / cols) - 1) / 2) * (UNIT_DEPTH + UNIT_GAP);

                    return (
                        <UnitBox
                            key={unit.id}
                            unit={unit}
                            position={[posX, floorY, posZ]}
                            size={[UNIT_WIDTH, FLOOR_HEIGHT * 0.9, UNIT_DEPTH]}
                            onClick={onUnitClick}
                        />
                    );
                });
            })}

            {/* Foundation / Ground */}
            <mesh position={[0, FLOOR_HEIGHT / 2, 0]}>
                <boxGeometry args={[UNIT_WIDTH * 3, 0.5, UNIT_DEPTH * 3]} />
                <meshStandardMaterial color="#475569" />
            </mesh>
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
        } else {
            setLoading(false);
        }
    }, [property, fetchHierarchy]);

    const handleUnitClick = async (unit) => {
        if (unit.status !== 'available') return;

        if (!isAuthenticated) {
            alert('Please login to lock and book a unit.');
            navigate('/login');
            return;
        }

        try {
            setPaymentLoading(true);
            // 🚨 Locking Mechanism
            await liveGroupDynamicAPI.lockUnit(unit.id);

            // Refresh hierarchy to show yellow status
            await fetchHierarchy();

            // Open details for payment
            setSelectedUnit(unit);
        } catch (error) {
            alert(error.message || 'Failed to lock unit. It might have been taken just now.');
        } finally {
            setPaymentLoading(false);
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
                <div className="pointer-events-auto self-center md:self-auto bg-slate-900/40 backdrop-blur-xl p-1.5 rounded-full border border-white/10 flex relative shadow-2xl">
                    {['3d', '2d'].map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={`relative z-10 px-5 py-2 md:px-6 md:py-2.5 rounded-full text-xs md:text-sm font-bold tracking-wide transition-all duration-300 flex items-center gap-2 ${
                                viewMode === mode ? 'text-slate-900' : 'text-slate-200 hover:text-white'
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

            {/* Legend Overlay - Responsive positioning */}
            <div className="absolute bottom-6 left-6 z-40 bg-white/80 backdrop-blur-xl p-4 md:p-5 rounded-2xl shadow-2xl border border-white/40 pointer-events-auto transform transition-transform hover:scale-105 hidden sm:block">
                <div className="flex items-center gap-2 mb-3">
                    <Info size={14} className="text-slate-400" />
                    <h3 className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Live Status</h3>
                </div>
                <div className="space-y-2.5">
                    <div className="flex items-center gap-3 group cursor-help">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)] group-hover:scale-110 transition-transform"></div>
                        <span className="text-xs md:text-sm font-semibold text-slate-700">Available</span>
                    </div>
                    <div className="flex items-center gap-3 group cursor-help">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.6)] group-hover:scale-110 transition-transform"></div>
                        <span className="text-xs md:text-sm font-semibold text-slate-700">Checking Out <span className="text-[10px] text-slate-400 ml-1 font-medium bg-slate-100 px-1.5 py-0.5 rounded-md">Live</span></span>
                    </div>
                    <div className="flex items-center gap-3 group cursor-help">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)] group-hover:scale-110 transition-transform"></div>
                        <span className="text-xs md:text-sm font-semibold text-slate-700 opacity-60">Sold Out</span>
                    </div>
                </div>
            </div>

            {/* Selection Modal */}
            {selectedUnit && (
                <div className="absolute inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800">Unit {selectedUnit.unit_number}</h2>
                                    <p className="text-slate-500">Floor {selectedUnit.floor_number} • {selectedUnit.unit_type}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-slate-400 uppercase font-semibold">Total Price</p>
                                    <p className="text-xl font-bold text-slate-900">₹{(selectedUnit.price / 100000).toFixed(2)} L</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <p className="text-xs text-slate-400 font-medium uppercase">Carpet Area</p>
                                    <p className="font-semibold text-slate-700">{selectedUnit.area} sq ft</p>
                                </div>
                                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                                    <p className="text-xs text-emerald-600 font-medium uppercase">Booking Amount</p>
                                    <p className="font-semibold text-emerald-700">₹{(selectedUnit.price * 0.005 / 1000).toFixed(2)} K</p>
                                </div>
                            </div>

                            <p className="text-sm text-slate-500 text-center mb-6 bg-slate-50 p-3 rounded-lg">
                                Pay <span className="font-bold text-slate-900">0.5%</span> now to lock this unit instantly.
                            </p>

                            <div className="flex gap-3">
                                <button 
                                    className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                                    onClick={() => setSelectedUnit(null)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="flex-[2] py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                    onClick={handleBookNow} 
                                    disabled={paymentLoading}
                                >
                                    {paymentLoading ? 'Processing...' : 'Proceed to Payment'}
                                </button>
                            </div>
                        </div>
                    </div>
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
                            return (
                                <Tower
                                    key={tower.id}
                                    tower={tower}
                                    position={[posX, 0, 0]}
                                    onUnitClick={handleUnitClick}
                                />
                            );
                        })}
                    </group>

                    {/* Ground */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
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
