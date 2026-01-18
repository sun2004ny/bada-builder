import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, Text, PerspectiveCamera } from '@react-three/drei';
import { useLocation, useNavigate } from 'react-router-dom';
import * as THREE from 'three';
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

const ThreeDView = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser, isAuthenticated } = useAuth();
    const property = location.state?.property;

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [paymentLoading, setPaymentLoading] = useState(false);

    useEffect(() => {
        if (property?.id) {
            fetchHierarchy();
        } else {
            setLoading(false);
        }
    }, [property]);

    const fetchHierarchy = async () => {
        try {
            setLoading(true);
            const data = await liveGroupDynamicAPI.getFullHierarchy(property.id);
            setProject(data.project);
        } catch (error) {
            console.error('Error fetching project hierarchy:', error);
        } finally {
            setLoading(false);
        }
    };

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

    if (loading) return <div className="loader-container"><div className="spinner"></div><p>Generating 3D Scene...</p></div>;
    if (!project) return <div className="error-container"><h3>Project not found</h3><button onClick={() => navigate(-1)}>Go Back</button></div>;

    return (
        <div className="three-d-page">
            {/* Header Overlay */}
            <div className="scene-overlay header">
                <button className="back-btn" onClick={() => navigate(-1)}>← Exit View</button>
                <div className="project-info">
                    <h1>{project.title}</h1>
                    <p>{project.location} • {project.towers.length} Towers • {project.total_slots} Units</p>
                </div>
            </div>

            {/* Legend Overlay */}
            <div className="scene-overlay legend">
                <div className="legend-item"><div className="color available"></div> Available</div>
                <div className="legend-item"><div className="color locked"></div> In Checkout (10m)</div>
                <div className="legend-item"><div className="color booked"></div> Sold</div>
            </div>

            {/* Selection Modal */}
            {selectedUnit && (
                <div className="unit-modal-v2">
                    <div className="modal-content">
                        <h2>Unit {selectedUnit.unit_number}</h2>
                        <div className="unit-stats">
                            <div className="u-stat"><span>Floor</span> <strong>{selectedUnit.floor_number}</strong></div>
                            <div className="u-stat"><span>Type</span> <strong>{selectedUnit.unit_type}</strong></div>
                            <div className="u-stat"><span>Area</span> <strong>{selectedUnit.area} sq ft</strong></div>
                            <div className="u-stat"><span>Price</span> <strong>₹{(selectedUnit.price / 100000).toFixed(2)} L</strong></div>
                        </div>
                        <p className="advance-note">Pay 0.5% Advance to confirm: <strong>₹{(selectedUnit.price * 0.005 / 1000).toFixed(2)} K</strong></p>
                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={() => setSelectedUnit(null)}>Cancel</button>
                            <button className="book-btn" onClick={handleBookNow} disabled={paymentLoading}>
                                {paymentLoading ? 'Processing...' : 'Proceed to Payment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Canvas shadows>
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
        </div>
    );
};

export default ThreeDView;
