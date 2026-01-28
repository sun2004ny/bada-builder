import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, Text, PerspectiveCamera, Html } from '@react-three/drei';
import { useLocation, useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { ChevronLeft, Layers, Box, Info, Timer, X, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { liveGroupDynamicAPI } from '../../services/api';
import './LiveGrouping.css';

// --- Decorative & Performance Components ---
const InstancedFoliage = ({ type = 'tree', count = 100, positions, scales, rotations }) => {
    const meshRef = useRef();
    const leafRef = useRef();

    useEffect(() => {
        if (!meshRef.current) return;
        const temp = new THREE.Object3D();
        const tempLeaf = new THREE.Object3D();

        for (let i = 0; i < count; i++) {
            const pos = positions[i] || [0, 0, 0];
            const scale = scales ? scales[i] : 1;
            const rotY = rotations ? rotations[i] : 0;

            if (type === 'tree') {
                // Trunk
                temp.position.set(pos[0], pos[1] + 0.5 * scale, pos[2]);
                temp.scale.set(scale, scale, scale);
                temp.rotation.y = rotY;
                temp.updateMatrix();
                meshRef.current.setMatrixAt(i, temp.matrix);

                // Leaves
                tempLeaf.position.set(pos[0], pos[1] + 1.2 * scale, pos[2]);
                tempLeaf.scale.set(scale, scale, scale);
                tempLeaf.rotation.y = rotY + (Math.random() * 0.2); // slight variation for leaves
                tempLeaf.updateMatrix();
                leafRef.current.setMatrixAt(i, tempLeaf.matrix);
            } else {
                // Bush
                temp.position.set(pos[0], pos[1] + 0.1 * scale, pos[2]);
                temp.scale.set(scale, scale, scale);
                temp.rotation.y = rotY;
                temp.updateMatrix();
                meshRef.current.setMatrixAt(i, temp.matrix);
            }
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
        if (leafRef.current) leafRef.current.instanceMatrix.needsUpdate = true;
    }, [count, positions, scales, rotations, type]);

    if (type === 'tree') {
        return (
            <group>
                <instancedMesh ref={meshRef} args={[null, null, count]}>
                    <cylinderGeometry args={[0.05, 0.1, 1, 6]} />
                    <meshStandardMaterial color="#4d2c19" roughness={0.9} />
                </instancedMesh>
                <instancedMesh ref={leafRef} args={[null, null, count]}>
                    <coneGeometry args={[0.4, 1.2, 6]} />
                    <meshStandardMaterial color="#2d5a27" roughness={0.8} />
                </instancedMesh>
            </group>
        );
    }

    return (
        <instancedMesh ref={meshRef} args={[null, null, count]}>
            <sphereGeometry args={[0.2, 5, 5]} />
            <meshStandardMaterial color="#367a4d" roughness={0.8} />
        </instancedMesh>
    );
};

const PerimeterBoundary = ({ width, depth }) => (
    <group>
        {/* Low Wall style boundary with depth */}
        {[
            { pos: [0, 0.25, -depth / 2], size: [width, 0.5, 0.4] }, // Back
            { pos: [0, 0.25, depth / 2], size: [width, 0.5, 0.4] },  // Front
            { pos: [-width / 2, 0.25, 0], size: [0.4, 0.5, depth] }, // Left
            { pos: [width / 2, 0.25, 0], size: [0.4, 0.5, depth] },  // Right
        ].map((v, i) => (
            <mesh key={`wall-${i}`} position={v.pos}>
                <boxGeometry args={v.size} />
                <meshStandardMaterial color="#cbd5e1" roughness={0.6} metalness={0.1} />
            </mesh>
        ))}
        {/* Hedge topping - lush green */}
        {[
            { pos: [0, 0.55, -depth / 2], size: [width + 0.4, 0.3, 0.5] },
            { pos: [0, 0.55, depth / 2], size: [width + 0.4, 0.3, 0.5] },
            { pos: [-width / 2, 0.55, 0], size: [0.5, 0.3, depth + 0.4] },
            { pos: [width / 2, 0.55, 0], size: [0.5, 0.3, depth + 0.4] },
        ].map((v, i) => (
            <mesh key={`hedge-${i}`} position={v.pos}>
                <boxGeometry args={v.size} />
                <meshStandardMaterial color="#2d5a27" roughness={1} />
            </mesh>
        ))}
    </group>
);

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

// Bungalow Colony Component - Multiple independent bungalows in a residential layout
const BungalowColony = ({ position, propertyData, project, onUnitClick }) => {
    // Collect and Sort units numerically for a logical sequence
    const rawUnits = project?.towers?.reduce((units, tower) => {
        return [...units, ...(tower.units || [])];
    }, []) || [];

    const allUnits = [...rawUnits].sort((a, b) => {
        const numA = parseInt(a.unit_number.match(/\d+/)?.[0] || 0);
        const numB = parseInt(b.unit_number.match(/\d+/)?.[0] || 0);
        return numA - numB;
    });

    const totalBungalows = allUnits.length || 6;

    // Colony configuration
    const BUNGALOW_WIDTH = 12;
    const BUNGALOW_HEIGHT = 3.5;
    const BUNGALOW_DEPTH = 10;
    const ROOF_HEIGHT = 1.5;
    const ROOF_OVERHANG = 0.8;
    const SPACING_X = 18; // Horizontal spacing between bungalows
    const SPACING_Z = 16; // Vertical spacing between rows
    const ROAD_WIDTH = 4;

    // Colors
    const WALL_COLORS = ['#f5f5dc', '#faf0e6', '#fff8dc', '#f0e68c']; // Cream variations
    const ROOF_COLORS = ['#4a5568', '#5a6978', '#6b7280']; // Dark grey variations
    const DOOR_COLOR = '#8b4513';
    const WINDOW_COLOR = '#87ceeb';
    const GROUND_COLOR = '#a8d5ba';
    const ROAD_COLOR = '#6b7280';
    const GREEN_SPACE_COLOR = '#7cb342';
    const COLOR_SELECTED = '#3b82f6'; // Blue for hover

    // Arrange bungalows in rows
    const bungalowsPerRow = project?.layout_columns || Math.ceil(Math.sqrt(totalBungalows));
    const rows = project?.layout_rows || Math.ceil(totalBungalows / bungalowsPerRow);

    // Calculate colony dimensions
    const colonyWidth = bungalowsPerRow * SPACING_X + ROAD_WIDTH * 2;
    const colonyDepth = rows * SPACING_Z + ROAD_WIDTH * 2;

    // Single Extremely Detailed Bungalow Unit Component
    const BungalowUnit = ({ position, index, unit }) => {
        const [hovered, setHovered] = useState(false);

        // --- Per-Unit Randomization Seed (based on index) ---
        const seed = (index * 77) % 100;

        // --- Structural Constants ---
        const PLINTH_HEIGHT = 0.6;
        const P_WIDTH = BUNGALOW_WIDTH;
        const P_DEPTH = BUNGALOW_DEPTH;

        const WALL_W = BUNGALOW_WIDTH * 0.94;
        const WALL_D = BUNGALOW_DEPTH * 0.94;
        const WALL_H = BUNGALOW_HEIGHT;

        const ROOF_SLAB_W = BUNGALOW_WIDTH + ROOF_OVERHANG;
        const ROOF_SLAB_D = BUNGALOW_DEPTH + ROOF_OVERHANG;
        const ROOF_SLAB_H = 0.3;

        // --- Visual Variants (6+ Randomized) ---
        const variants = [
            { wall: '#fefcf0', roof: '#2d3748', door: '#4a2c0a', accent: '#e2e8f0', steps: '#718096' }, // Ivory & Charcoal
            { wall: '#fdfbf7', roof: '#4a5568', door: '#5d3c1e', accent: '#cbd5e0', steps: '#a0aec0' }, // Classic Beige
            { wall: '#f7fafc', roof: '#1a202c', door: '#3e2723', accent: '#edf2f7', steps: '#4a5568' }, // Modern Cool
            { wall: '#fff5f5', roof: '#334155', door: '#5c4033', accent: '#f1f5f9', steps: '#64748b' }, // Subtle Rose
            { wall: '#f0fff4', roof: '#4a5568', door: '#2c3e50', accent: '#e6fffa', steps: '#718096' }, // Mint Tint
            { wall: '#fffaf0', roof: '#2d3748', door: '#3d2b1f', accent: '#f7fafc', steps: '#8a8d91' }, // Warm Silk
        ];
        const v = variants[seed % variants.length];

        // --- Randomized Porch Logic ---
        const porchWidth = 4 + (seed % 15) / 10; // 4.0 to 5.5
        const porchDepth = 2.5 + (seed % 10) / 10; // 2.5 to 3.5

        // --- Interaction State ---
        const isBooked = unit?.status === 'booked';
        const isLocked = unit?.status === 'locked';
        const isAvailable = unit?.status === 'available';

        let buildingColor = v.wall;
        if (isBooked) buildingColor = COLOR_BOOKED;
        else if (isLocked) buildingColor = COLOR_LOCKED;
        else if (hovered && isAvailable) buildingColor = COLOR_SELECTED;

        return (
            <group position={position}>
                {/* 1. Foundation Plinth (Beveled effect via layered boxes) */}
                <group position={[0, PLINTH_HEIGHT / 2, 0]} pointerEvents="none">
                    <mesh receiveShadow castShadow>
                        <boxGeometry args={[P_WIDTH, PLINTH_HEIGHT, P_DEPTH]} />
                        <meshStandardMaterial color={v.steps} roughness={0.9} />
                    </mesh>
                    <mesh position={[0, 0.05, 0]}> {/* Subtle top bevel slab */}
                        <boxGeometry args={[P_WIDTH + 0.1, 0.1, P_DEPTH + 0.1]} />
                        <meshStandardMaterial color={v.accent} roughness={0.7} />
                    </mesh>
                </group>

                {/* 2. Main Building Body (Walls) - Primary Interaction Target */}
                <mesh
                    position={[0, PLINTH_HEIGHT + WALL_H / 2, 0]}
                    receiveShadow
                    castShadow
                    onClick={(e) => {
                        e.stopPropagation();
                        // Only allow click for interactive units (available or locked)
                        if (!isBooked && unit) {
                            onUnitClick(unit);
                        }
                    }}
                    onPointerOver={(e) => {
                        e.stopPropagation();
                        // Only show hover for available units
                        if (isAvailable && !isBooked) {
                            setHovered(true);
                            document.body.style.cursor = 'pointer';
                        }
                    }}
                    onPointerOut={() => {
                        setHovered(false);
                        document.body.style.cursor = 'default';
                    }}
                >
                    <boxGeometry args={[WALL_W, WALL_H, WALL_D]} />
                    <meshStandardMaterial
                        color={buildingColor}
                        roughness={0.7}
                        transparent
                        opacity={isBooked ? 0.9 : 0.98}
                    />
                </mesh>

                {/* Decorative Elements - Non-Clickable (pointerEvents="none") */}
                <group pointerEvents="none">
                    {/* Corner Moldings */}
                    {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([x, z], i) => (
                        <mesh key={`corner-${i}`} position={[(WALL_W / 2) * x, PLINTH_HEIGHT + WALL_H / 2, (WALL_D / 2) * z]} castShadow>
                            <boxGeometry args={[0.2, WALL_H, 0.2]} />
                            <meshStandardMaterial color={v.accent} />
                        </mesh>
                    ))}

                    {/* 3. Roof System */}
                    <group position={[0, PLINTH_HEIGHT + WALL_H, 0]}>
                        <mesh position={[0, ROOF_SLAB_H / 2, 0]} castShadow>
                            <boxGeometry args={[ROOF_SLAB_W, ROOF_SLAB_H, ROOF_SLAB_D]} />
                            <meshStandardMaterial color={v.accent} roughness={0.5} />
                        </mesh>
                        <mesh
                            position={[0, ROOF_SLAB_H + ROOF_HEIGHT / 2, 0]}
                            scale={[1, 1, ROOF_SLAB_D / ROOF_SLAB_W]}
                            rotation={[0, Math.PI / 4, 0]}
                            castShadow
                        >
                            <coneGeometry args={[ROOF_SLAB_W / Math.sqrt(2), ROOF_HEIGHT, 4]} />
                            <meshStandardMaterial color={v.roof} roughness={0.4} flatShading={true} />
                        </mesh>
                    </group>

                    {/* 4. Porch & Entrance Assembly */}
                    <group position={[0, PLINTH_HEIGHT, WALL_D / 2]}>
                        <mesh position={[0, -0.05, porchDepth / 2]} receiveShadow castShadow>
                            <boxGeometry args={[porchWidth, 0.2, porchDepth]} />
                            <meshStandardMaterial color={v.accent} />
                        </mesh>

                        {[0, 1, 2, 3].map((step) => (
                            <mesh key={`step-${step}`} position={[0, -0.2 - (step * 0.12), porchDepth + (step * 0.3)]} castShadow>
                                <boxGeometry args={[porchWidth * 0.8, 0.12, 0.4]} />
                                <meshStandardMaterial color={v.steps} roughness={0.9} />
                            </mesh>
                        ))}

                        {[-(porchWidth / 2 - 0.2), (porchWidth / 2 - 0.2)].map((x, i) => (
                            <group key={`col-grp-${i}`} position={[x, 0, porchDepth - 0.3]}>
                                <mesh position={[0, 0.1, 0]} castShadow>
                                    <boxGeometry args={[0.4, 0.2, 0.4]} />
                                    <meshStandardMaterial color={v.steps} />
                                </mesh>
                                <mesh position={[0, WALL_H / 2, 0]} castShadow>
                                    <boxGeometry args={[0.2, WALL_H, 0.2]} />
                                    <meshStandardMaterial color={v.accent} />
                                </mesh>
                            </group>
                        ))}

                        <group position={[0, 1.1, 0.05]}>
                            <mesh castShadow>
                                <boxGeometry args={[1.8, 2.4, 0.2]} />
                                <meshStandardMaterial color={v.accent} />
                            </mesh>
                            <group position={[0, 0, 0.08]}>
                                <mesh>
                                    <boxGeometry args={[1.5, 2.1, 0.1]} />
                                    <meshStandardMaterial color={v.door} roughness={0.5} />
                                </mesh>
                                <mesh position={[0, 0.6, 0.02]} scale={[0.7, 0.3, 1]}>
                                    <boxGeometry args={[1.3, 2.0, 0.02]} />
                                    <meshStandardMaterial color={v.door} roughness={0.7} />
                                </mesh>
                                <mesh position={[0.5, 0, 0.06]}>
                                    <sphereGeometry args={[0.04, 8, 8]} />
                                    <meshStandardMaterial color="#ECC94B" metalness={0.8} />
                                </mesh>
                            </group>
                        </group>
                    </group>

                    {/* 5. Window Assemblies */}
                    {[-3.2, 3.2].map((x, i) => (
                        <group key={`win-f-${i}`} position={[x, PLINTH_HEIGHT + WALL_H * 0.55, WALL_D / 2 + 0.05]}>
                            <mesh castShadow>
                                <boxGeometry args={[1.5, 1.8, 0.2]} />
                                <meshStandardMaterial color="white" />
                            </mesh>
                            <mesh position={[0, -0.9, 0.1]}>
                                <boxGeometry args={[1.7, 0.1, 0.3]} />
                                <meshStandardMaterial color={v.accent} />
                            </mesh>
                            <mesh position={[0, 0.9, 0.1]}>
                                <boxGeometry args={[1.6, 0.15, 0.25]} />
                                <meshStandardMaterial color={v.accent} />
                            </mesh>
                            <mesh position={[0, 0, 0.06]}>
                                <boxGeometry args={[1.2, 1.5, 0.05]} />
                                <meshStandardMaterial color="#87ceeb" transparent opacity={0.6} metalness={0.6} />
                            </mesh>
                        </group>
                    ))}

                    {/* Side Windows */}
                    {[-2.5, 2.5].map((z, i) => (
                        <group key={`win-s-${i}`}>
                            <group position={[WALL_W / 2 + 0.05, PLINTH_HEIGHT + WALL_H * 0.55, z]} rotation={[0, Math.PI / 2, 0]}>
                                <mesh castShadow><boxGeometry args={[1.5, 1.5, 0.2]} /><meshStandardMaterial color="white" /></mesh>
                                <mesh position={[0, -0.75, 0.1]}><boxGeometry args={[1.6, 0.08, 0.25]} /><meshStandardMaterial color={v.accent} /></mesh>
                                <mesh position={[0, 0, 0.06]}><boxGeometry args={[1.2, 1.2, 0.05]} /><meshStandardMaterial color="#87ceeb" transparent opacity={0.5} /></mesh>
                            </group>
                            <group position={[-WALL_W / 2 - 0.05, PLINTH_HEIGHT + WALL_H * 0.55, z]} rotation={[0, -Math.PI / 2, 0]}>
                                <mesh castShadow><boxGeometry args={[1.5, 1.5, 0.2]} /><meshStandardMaterial color="white" /></mesh>
                                <mesh position={[0, -0.75, 0.1]}><boxGeometry args={[1.6, 0.08, 0.25]} /><meshStandardMaterial color={v.accent} /></mesh>
                                <mesh position={[0, 0, 0.06]}><boxGeometry args={[1.2, 1.2, 0.05]} /><meshStandardMaterial color="#87ceeb" transparent opacity={0.5} /></mesh>
                            </group>
                        </group>
                    ))}
                </group>

                {/* 6. High Visibility Unit Label */}
                {unit && (
                    <group position={[0, PLINTH_HEIGHT + WALL_H * 0.8, WALL_D / 2 + 0.2]}>
                        <Text
                            fontSize={0.6}
                            color={hovered ? "#3b82f6" : "#1a202c"} // Solid black/dark charcoal
                            anchorX="center"
                            anchorY="middle"
                        >
                            {unit.unit_number}
                        </Text>
                    </group>
                )}
            </group>
        );
    };

    return (
        <group position={position}>
            {/* Colony Ground Base */}
            <mesh position={[0, -0.5, 0]} receiveShadow>
                <boxGeometry args={[colonyWidth + 10, 0.3, colonyDepth + 10]} />
                <meshStandardMaterial color={GROUND_COLOR} roughness={0.9} />
            </mesh>

            {/* Compound Boundary Wall */}
            <lineSegments position={[0, 1, 0]}>
                <edgesGeometry args={[new THREE.BoxGeometry(colonyWidth + 8, 2, colonyDepth + 8)]} />
                <lineBasicMaterial color="#8b7355" linewidth={3} />
            </lineSegments>

            {/* Internal Roads - Horizontal */}
            {Array.from({ length: rows + 1 }).map((_, i) => {
                const zPos = -colonyDepth / 2 + i * SPACING_Z;
                return (
                    <mesh key={`road-h-${i}`} position={[0, -0.35, zPos]} receiveShadow>
                        <boxGeometry args={[colonyWidth, 0.1, ROAD_WIDTH]} />
                        <meshStandardMaterial color={ROAD_COLOR} roughness={0.4} />
                    </mesh>
                );
            })}

            {/* Internal Roads - Vertical */}
            {Array.from({ length: bungalowsPerRow + 1 }).map((_, i) => {
                const xPos = -colonyWidth / 2 + i * SPACING_X;
                return (
                    <mesh key={`road-v-${i}`} position={[xPos, -0.35, 0]} receiveShadow>
                        <boxGeometry args={[ROAD_WIDTH, 0.1, colonyDepth]} />
                        <meshStandardMaterial color={ROAD_COLOR} roughness={0.4} />
                    </mesh>
                );
            })}

            {/* Green Spaces (between some bungalows) */}
            {Array.from({ length: Math.floor(totalBungalows / 3) }).map((_, i) => {
                const row = Math.floor((i * 2) / bungalowsPerRow);
                const col = (i * 2) % bungalowsPerRow;
                const xPos = -colonyWidth / 2 + col * SPACING_X + SPACING_X / 2;
                const zPos = -colonyDepth / 2 + row * SPACING_Z + SPACING_Z / 2;

                return (
                    <mesh key={`green-${i}`} position={[xPos, -0.3, zPos]} receiveShadow>
                        <boxGeometry args={[6, 0.15, 6]} />
                        <meshStandardMaterial color={GREEN_SPACE_COLOR} roughness={0.8} />
                    </mesh>
                );
            })}

            {/* Render Individual Bungalows */}
            {Array.from({ length: totalBungalows }).map((_, index) => {
                const row = Math.floor(index / bungalowsPerRow);
                const col = index % bungalowsPerRow;

                const xPos = -colonyWidth / 2 + col * SPACING_X + SPACING_X / 2;
                // Reverse row mapping: row 0 (index 0) is now at the front
                const visualRow = (rows - 1) - row;
                const zPos = -colonyDepth / 2 + visualRow * SPACING_Z + SPACING_Z / 2;

                const unit = allUnits[index]; // Get the actual unit data

                return (
                    <BungalowUnit
                        key={`bungalow-${index}`}
                        position={[xPos, 0, zPos]}
                        index={index}
                        unit={unit}
                        onUnitClick={onUnitClick}
                    />
                );
            })}

            {/* Colony Name Label */}
            <Text
                position={[0, BUNGALOW_HEIGHT + ROOF_HEIGHT + 4, -colonyDepth / 2 - 8]}
                fontSize={3}
                color="#1e293b"
                anchorX="center"
            >
                {propertyData?.title || propertyData?.project_name || 'Bungalow Colony'}
            </Text>
        </group>
    );
};

const PlotColony = ({ position, propertyData, project, onUnitClick, showPremium, selectedUnit }) => {
    const meshRef = useRef();
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const rows = parseInt(project?.layout_rows) || project?.towers?.[0]?.layout_rows || 5;
    const cols = parseInt(project?.layout_columns) || project?.towers?.[0]?.layout_columns || 4;

    const roadWidth = parseFloat(project?.road_width) || 20;
    const plotGap = parseFloat(project?.plot_gap) || 2;
    const plotWidth = parseFloat(project?.plot_size_width) || 30;
    const plotDepth = parseFloat(project?.plot_size_depth) || 40;

    const SCALE = 0.2;
    const V_PLOT_W = plotWidth * SCALE;
    const V_PLOT_D = plotDepth * SCALE;
    const V_ROAD_W = roadWidth * SCALE;
    const V_GAP = plotGap * SCALE;

    const SPACING_X = V_PLOT_W + V_GAP;
    const SPACING_Z = V_PLOT_D + V_ROAD_W;

    const colonyWidth = cols * SPACING_X;
    const colonyDepth = rows * SPACING_Z;

    const allUnits = useMemo(() => {
        const units = project.towers?.[0]?.units || [];
        // Sort numerically (e.g., P-1, P-2, ..., P-10) instead of alphabetically
        return [...units].sort((a, b) => {
            const numA = parseInt(String(a.unit_number).replace(/\D/g, '')) || 0;
            const numB = parseInt(String(b.unit_number).replace(/\D/g, '')) || 0;
            return numA - numB;
        });
    }, [project.towers]);

    // Shared Coordinate Calculation Logic
    const getPlotLayout = useCallback((index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        const x = -colonyWidth / 2 + col * SPACING_X + V_PLOT_W / 2;
        const z = -colonyDepth / 2 + row * SPACING_Z + V_PLOT_D / 2;
        return { x, z, row, col };
    }, [cols, colonyWidth, colonyDepth, SPACING_X, SPACING_Z, V_PLOT_W, V_PLOT_D]);

    // Apply Matrices and Colors
    useEffect(() => {
        if (!meshRef.current) return;

        const tempObject = new THREE.Object3D();
        const tempColor = new THREE.Color();

        allUnits.forEach((unit, index) => {
            const { x, z } = getPlotLayout(index);

            // REALISM: Organic slight Y-rotation and slight Y-offset variation
            tempObject.position.set(x, 0.05 + (Math.random() * 0.01), z);
            tempObject.rotation.y = (Math.random() - 0.5) * 0.04;
            tempObject.updateMatrix();
            meshRef.current.setMatrixAt(index, tempObject.matrix);

            let color = '#10b981'; // Green
            if (unit?.status === 'booked') color = '#ef4444'; // Red
            else if (unit?.status === 'locked') color = '#f59e0b'; // Amber

            tempColor.set(color);
            meshRef.current.setColorAt(index, tempColor);
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    }, [allUnits, getPlotLayout]);

    // --- Memoized Foliage Positions (Performance Safety) ---
    const foliageData = useMemo(() => {
        if (!showPremium) return { treePositions: [], treeScales: [], treeRotations: [], bushPositions: [], bushScales: [], bushRotations: [] };

        const trees = [];
        const bushes = [];

        // Perimeter Clusters (Corners and Boundaries)
        const projectBounds = [
            { x: -colonyWidth / 2 - 5, z: (Math.random() - 0.5) * colonyDepth },
            { x: colonyWidth / 2 + 5, z: (Math.random() - 0.5) * colonyDepth },
            { x: (Math.random() - 0.5) * colonyWidth, z: -colonyDepth / 2 - 5 },
            { x: (Math.random() - 0.5) * colonyWidth, z: colonyDepth / 2 + 5 }
        ];

        // Trees along boundary
        const treeCount = Math.floor((colonyWidth + colonyDepth) / 5);
        for (let i = 0; i < treeCount; i++) {
            const side = i % 4;
            let x, z;
            if (side === 0) { x = -colonyWidth / 2 - 6; z = (i / treeCount) * colonyDepth - colonyDepth / 2; }
            else if (side === 1) { x = colonyWidth / 2 + 6; z = (i / treeCount) * colonyDepth - colonyDepth / 2; }
            else if (side === 2) { x = (i / treeCount) * colonyWidth - colonyWidth / 2; z = -colonyDepth / 2 - 6; }
            else { x = (i / treeCount) * colonyWidth - colonyWidth / 2; z = colonyDepth / 2 + 6; }

            // Add some jitter
            x += (Math.random() - 0.5) * 3;
            z += (Math.random() - 0.5) * 3;

            trees.push({ pos: [x, 0, z], scale: 1.0 + Math.random() * 1.2, rot: Math.random() * Math.PI * 2 });
        }

        // Road-side Clusters
        for (let i = 0; i < rows + 1; i++) {
            const roadZ = -colonyDepth / 2 + i * SPACING_Z - V_ROAD_W / 2;
            const bushCount = Math.floor(colonyWidth / 6);
            for (let j = 0; j < bushCount; j++) {
                const x = -colonyWidth / 2 + j * 6 + (Math.random() - 0.5) * 3;
                bushes.push({ pos: [x, 0.05, roadZ + V_ROAD_W / 2 + 1.2], scale: 0.6 + Math.random() * 0.8, rot: Math.random() * Math.PI * 2 });
                bushes.push({ pos: [x, 0.05, roadZ - V_ROAD_W / 2 - 1.2], scale: 0.6 + Math.random() * 0.8, rot: Math.random() * Math.PI * 2 });
            }
        }

        return {
            treePositions: trees.map(t => t.pos),
            treeScales: trees.map(t => t.scale),
            treeRotations: trees.map(t => t.rot),
            bushPositions: bushes.map(b => b.pos),
            bushScales: bushes.map(b => b.scale),
            bushRotations: bushes.map(b => b.rot)
        };
    }, [showPremium, colonyWidth, colonyDepth, rows, SPACING_Z, V_ROAD_W]);

    // Handle Hover Update
    useEffect(() => {
        if (!meshRef.current) return;
        const tempColor = new THREE.Color();

        allUnits.forEach((unit, index) => {
            let color = '#10b981';
            if (unit?.status === 'booked') color = '#ef4444';
            else if (unit?.status === 'locked') color = '#f59e0b';

            if (index === hoveredIndex) {
                tempColor.set(color).multiplyScalar(1.2);
            } else {
                tempColor.set(color);
            }
            meshRef.current.setColorAt(index, tempColor);
        });
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    }, [hoveredIndex, allUnits]);

    return (
        <group position={position}>
            {/* Ground Terrain - Main Project Base */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
                <planeGeometry args={[colonyWidth + 120, colonyDepth + 120]} />
                <meshStandardMaterial color="#f8fafc" roughness={1} />
            </mesh>

            {/* Carved Land / Plot Surface (Slightly elevated above roads) */}
            <group position={[0, -0.05, 0]}>
                {/* Main Grass Surface with patches */}
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[colonyWidth + 10, colonyDepth + 10]} />
                    <meshStandardMaterial color="#367a4d" roughness={0.9} />
                </mesh>
                {showPremium && Array.from({ length: 45 }).map((_, i) => (
                    <mesh
                        key={`noise-patch-${i}`}
                        rotation={[-Math.PI / 2, 0, Math.random() * Math.PI]}
                        position={[
                            (Math.random() - 0.5) * (colonyWidth + 40),
                            0.001 * i, // prevent z-fighting
                            (Math.random() - 0.5) * (colonyDepth + 40)
                        ]}
                    >
                        <planeGeometry args={[10 + Math.random() * 15, 10 + Math.random() * 15]} />
                        <meshStandardMaterial
                            color={i % 3 === 0 ? "#4caf50" : i % 3 === 1 ? "#8bc34a" : "#967b5f"} // Green mix + Soil
                            transparent
                            opacity={0.25}
                            roughness={1}
                        />
                    </mesh>
                ))}
            </group>

            {/* Roads - Deep Recessed Asphalt style */}
            {Array.from({ length: rows + 1 }).map((_, i) => {
                const roadZ = -colonyDepth / 2 + i * SPACING_Z - V_ROAD_W / 2;
                return (
                    <group key={`road-set-${i}`}>
                        {/* Asphalt Base */}
                        <mesh position={[0, -0.18, roadZ]}>
                            <boxGeometry args={[colonyWidth + 50, 0.06, V_ROAD_W]} />
                            <meshStandardMaterial color="#1e293b" roughness={0.6} />
                        </mesh>
                        {/* Curbs / Shoulders with beveled feel */}
                        <mesh position={[0, -0.1, roadZ + V_ROAD_W / 2 + 0.3]}>
                            <boxGeometry args={[colonyWidth + 50, 0.12, 0.6]} />
                            <meshStandardMaterial color="#94a3b8" roughness={0.5} />
                        </mesh>
                        <mesh position={[0, -0.1, roadZ - V_ROAD_W / 2 - 0.3]}>
                            <boxGeometry args={[colonyWidth + 50, 0.12, 0.6]} />
                            <meshStandardMaterial color="#94a3b8" roughness={0.5} />
                        </mesh>
                    </group>
                );
            })}

            {/* Outer Perimeter Boundary */}
            {showPremium && <PerimeterBoundary width={colonyWidth + 10} depth={colonyDepth + 10} />}

            {/* foliage (Instanced for Performance Safety) */}
            {showPremium && (
                <group>
                    <InstancedFoliage
                        type="tree"
                        count={foliageData.treePositions.length}
                        positions={foliageData.treePositions}
                        scales={foliageData.treeScales}
                        rotations={foliageData.treeRotations}
                    />
                    <InstancedFoliage
                        type="bush"
                        count={foliageData.bushPositions.length}
                        positions={foliageData.bushPositions}
                        scales={foliageData.bushScales}
                        rotations={foliageData.bushRotations}
                    />
                </group>
            )}

            {/* Instanced Plots - Physical 'Carved' look with organic variation */}
            <instancedMesh
                ref={meshRef}
                args={[null, null, allUnits.length]}
                onPointerMove={(e) => {
                    e.stopPropagation();
                    setHoveredIndex(e.instanceId);
                }}
                onPointerOut={() => setHoveredIndex(null)}
                onClick={(e) => {
                    e.stopPropagation();
                    if (e.instanceId !== undefined) onUnitClick(allUnits[e.instanceId]);
                }}
            >
                <boxGeometry args={[V_PLOT_W, 0.15, V_PLOT_D]} />
                <meshStandardMaterial roughness={0.7} metalness={0.05} />
            </instancedMesh>

            {/* Embedded Boundary Markers and Premium Labels */}
            {allUnits.map((unit, index) => {
                const { x, z, col } = getPlotLayout(index);
                const areaSqFt = parseFloat(unit?.area || 0);
                const areaSqYd = (areaSqFt / 9).toFixed(1);

                return (
                    <group key={`plot-assets-${index}`}>
                        {/* Boundary line logic - Recessed into ground */}
                        {showPremium && col < cols - 1 && (
                            <mesh position={[x + SPACING_X / 2 - V_GAP / 2, 0.015, z]}>
                                <boxGeometry args={[0.04, 0.01, V_PLOT_D]} />
                                <meshStandardMaterial color="#ffffff" transparent opacity={0.5} />
                            </mesh>
                        )}

                        {!selectedUnit && (
                            <Html
                                position={[x, 0.45, z]}
                                center
                                distanceFactor={22}
                                style={{
                                    pointerEvents: 'none',
                                    color: 'white',
                                    textAlign: 'center',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                <div className="flex flex-col items-center gap-1 opacity-90 hover:opacity-100 transition-opacity">
                                    <div style={{
                                        background: 'rgba(15, 23, 42, 0.85)',
                                        padding: '10px 20px',
                                        borderRadius: '10px',
                                        border: '1px solid rgba(255, 255, 255, 0.15)',
                                        boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                                        backdropFilter: 'blur(8px)',
                                        transition: 'all 0.3s ease-out',
                                        transform: hoveredIndex === index ? 'scale(1.05) translateY(-5px)' : 'none'
                                    }}>
                                        <div style={{ fontSize: '20px', fontWeight: '900', color: '#fff', letterSpacing: '0.4px' }}>
                                            {unit?.unit_number}
                                        </div>
                                        <div style={{
                                            fontSize: '10px',
                                            fontWeight: '700',
                                            marginTop: '3px',
                                            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                                            paddingTop: '4px',
                                            color: '#94a3b8'
                                        }}>
                                            {areaSqFt} ft²
                                        </div>
                                    </div>
                                </div>
                            </Html>
                        )}
                    </group>
                );
            })}
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
    const cols = tower.layout_columns || Math.ceil(Math.sqrt(sampleFloorUnits.length || 4));
    const rows = tower.layout_rows || Math.ceil(sampleFloorUnits.length / cols) || 1;
    const currentCols = cols; // For reference in unit mapping
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
                    const row = Math.floor(idx / currentCols);
                    const col = idx % currentCols;

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

// --- Helper: Calculate Effective Unit Price (Unit > Project Default) ---
// NOTE: This helper is only for display + payment calculation, not for updating database.
const getEffectiveUnitDetails = (unit, project) => {
    if (!unit) return { finalPrice: 0, bookingAmount: 0, area: 0, isDiscounted: false };

    // 1. Resolve Area
    let area = (unit.area !== null && unit.area !== undefined) ? parseFloat(unit.area) : 0;
    if (area === 0) {
        area = parseFloat(unit.super_built_up_area) || parseFloat(unit.carpet_area) || 0;
    }

    // 2. Resolve Rates
    // Regular Rate Priority: Unit > Project > 0
    let regularRate = parseFloat(unit.price_per_sqft);

    // Treat 0, NaN, null, undefined as "Invalid/Not Set" -> Fallback to project defaults
    // We check multiple keys because 'original_price' might be saved differently or named differently.
    const projectDefaults = [
        parseFloat(project?.base_rate),
        parseFloat(project?.price_per_sqft),
        parseFloat(project?.original_price),
        parseFloat(project?.group_price),
        parseFloat(project?.starting_price),
        parseFloat(project?.price)
    ];

    let fallbackValue = 0;
    if (!regularRate || regularRate === 0) {
        fallbackValue = projectDefaults.find(val => !isNaN(val) && val > 0) || 0;
    }

    // Discount Rate Priority: Unit > Project
    let discountRate = unit.discount_price_per_sqft;
    if (discountRate === null || discountRate === undefined || discountRate === '') {
        const projDisc = project?.discount_rate || project?.discount_price;
        if (projDisc !== null && projDisc !== undefined && projDisc !== '') {
            discountRate = projDisc;
        }
    }

    const validDiscount = (discountRate !== null && discountRate !== undefined && discountRate !== '')
        ? parseFloat(discountRate)
        : null;

    // 3. Calculate Final Price
    let finalPrice = 0;

    // Heuristic: If fallbackValue is huge (e.g. > 50,000), it's likely a Total Price, not a Rate.
    // Unless area is very small? 
    // Typical Rate: 3000 - 20000. Typical Price: 20L - 5Cr.
    // Threshold: 50000? 

    const isFallbackTotal = fallbackValue > 50000;

    if (validDiscount !== null && validDiscount > 0) {
        finalPrice = area * validDiscount;
    } else {
        if (!regularRate || regularRate === 0) {
            // Using fallback
            if (isFallbackTotal) {
                finalPrice = fallbackValue; // Use directly as Total
                regularRate = finalPrice / (area || 1); // Reverse calc rate for display if needed
            } else {
                finalPrice = area * fallbackValue;
                regularRate = fallbackValue;
            }
        } else {
            // Using Unit Rate
            finalPrice = area * regularRate;
        }
    }

    // Fallback: If calculation yielded 0 but unit has a direct fixed price, use it
    if ((!finalPrice || finalPrice === 0) && unit.price && parseFloat(unit.price) > 0) {
        finalPrice = parseFloat(unit.price);
    }

    // Last Resort: If still 0, trying to use "original_price" as Total if it wasn't caught above
    if ((!finalPrice || finalPrice === 0) && fallbackValue > 0) {
        finalPrice = fallbackValue;
    }

    const bookingAmount = finalPrice * 0.005; // 0.5%
    const isDiscounted = validDiscount !== null && validDiscount > 0;

    // console.log('EffectiveDetails:', { unitRate: unit.price_per_sqft, fallbackValue, area, finalPrice });

    return {
        area,
        finalPrice,
        bookingAmount,
        regularRate,
        discountRate: validDiscount,
        isDiscounted
    };
};

const ThreeDView = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const property = location.state?.property;

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);

    // View Mode State
    const [viewMode, setViewMode] = useState('3d'); // '3d' | '2d'
    const [showHoldOptions, setShowHoldOptions] = useState(false);
    const [holdLoading, setHoldLoading] = useState(false);
    const [showPremium, setShowPremium] = useState(true);

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

    // Load Razorpay Script
    useEffect(() => {
        const loadRazorpay = () => {
            return new Promise((resolve) => {
                if (window.Razorpay) {
                    setRazorpayLoaded(true);
                    resolve(true);
                    return;
                }

                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.onload = () => {
                    setRazorpayLoaded(true);
                    console.log('✅ Razorpay script loaded successfully');
                    resolve(true);
                };
                script.onerror = () => {
                    console.error('❌ Failed to load Razorpay script');
                    resolve(false);
                };
                document.head.appendChild(script);
            });
        };

        loadRazorpay();
    }, []);

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

    // Razorpay Payment Handler
    const handleRazorpayPayment = async (unit) => {
        if (!window.Razorpay) {
            alert('Payment gateway is loading. Please try again in a moment.');
            return false;
        }

        try {
            // Use effective details for booking amount
            const { bookingAmount, finalPrice } = getEffectiveUnitDetails(unit, project);

            console.log('📝 Creating Razorpay order for unit:', unit.unit_number, 'Amount:', bookingAmount, 'Total Price:', finalPrice);

            // Step 1: Create Razorpay order on backend
            const orderResponse = await liveGroupDynamicAPI.createBookingOrder({
                unit_id: unit.id,
                amount: bookingAmount
            });
            console.log('✅ Order created:', orderResponse);

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: orderResponse.amount * 100, // Amount in paise
                currency: orderResponse.currency || 'INR',
                name: 'Bada Builder',
                description: `Unit Booking - ${unit.unit_number} (${unit.unit_type})`,
                order_id: orderResponse.orderId,
                handler: async function (response) {
                    console.log('✅ Payment successful:', response);

                    try {
                        // Book the unit with payment details
                        await liveGroupDynamicAPI.bookUnit(unit.id, {
                            amount: bookingAmount,
                            currency: 'INR',
                            payment_id: response.razorpay_payment_id,
                            order_id: response.razorpay_order_id,
                            signature: response.razorpay_signature,
                            userName: 'Customer' // Will be replaced by backend with actual user
                        });

                        console.log('✅ Unit booked successfully');
                        alert('🎉 Payment successful! Unit booked.');
                        setPaymentLoading(false);
                        setSelectedUnit(null);
                        await fetchHierarchy();

                    } catch (error) {
                        console.error('Error booking unit:', error);
                        alert('Payment successful but booking failed. Please contact support with payment ID: ' + response.razorpay_payment_id);
                        setPaymentLoading(false);
                    }
                },
                prefill: {
                    name: '',
                    email: '',
                    contact: ''
                },
                notes: {
                    unit_id: unit.id,
                    unit_number: unit.unit_number,
                    unit_type: unit.unit_type,
                    floor_number: unit.floor_number,
                    booking_amount: bookingAmount,
                    booking_type: 'unit_booking'
                },
                theme: {
                    color: '#ef4444'
                },
                modal: {
                    ondismiss: function () {
                        console.log('Payment cancelled by user');
                        setPaymentLoading(false);
                    }
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
            return true;

        } catch (error) {
            console.error('❌ Error creating order:', error);
            alert(error.response?.data?.error || 'Failed to initiate payment. Please try again.');
            return false;
        }
    };

    const handleBookNow = async () => {
        if (!selectedUnit) return;

        if (!razorpayLoaded) {
            alert('Payment gateway is still loading. Please try again in a moment.');
            return;
        }

        setPaymentLoading(true);
        console.log('🚀 Starting payment for unit:', selectedUnit.unit_number);

        // Initiate Razorpay payment
        const paymentSuccess = await handleRazorpayPayment(selectedUnit);
        if (!paymentSuccess) {
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
                            {project.location}
                            {project.type === 'Plot' ? (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-white/50"></span>
                                    Plot / Land
                                </>
                            ) : (project.type !== 'Bungalow' && project.type !== 'Colony') && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-white/50"></span>
                                    {project.towers.length} Towers
                                </>
                            )}
                            <span className="w-1 h-1 rounded-full bg-white/50"></span>
                            {project.total_slots} Units
                        </p>
                    </div>
                </div>

                {/* View Toggle */}
                <div className="pointer-events-auto self-center md:self-auto flex items-center gap-3">
                    {/* Premium Toggle (only for Plot type) */}
                    {/* Premium Toggle removed as per user request */}
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
                                        {project.type === 'Plot'
                                            ? `${selectedUnit.unit_type || 'Plot'}${selectedUnit.is_corner ? ' • Corner' : ''}${selectedUnit.facing ? ` • ${selectedUnit.facing} Facing` : ''}`
                                            : selectedUnit.floor_number === -1
                                                ? 'Basement Level'
                                                : selectedUnit.floor_number === 0
                                                    ? 'Ground Floor'
                                                    : `Floor ${selectedUnit.floor_number}`}
                                        {project.type !== 'Plot' && ` • ${selectedUnit.unit_type}`}
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
                            {(() => {
                                const { finalPrice, bookingAmount, area } = getEffectiveUnitDetails(selectedUnit, project);

                                return (
                                    <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 mb-4 space-y-3">
                                        <div className="flex justify-between items-center border-b border-slate-200/50 pb-2.5">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pricing</span>
                                            <span className="text-xl font-black text-slate-900">
                                                {finalPrice >= 100000
                                                    ? `₹${(finalPrice / 100000).toFixed(2)} L`
                                                    : `₹${finalPrice.toLocaleString('en-IN')}`}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                                                    {selectedUnit.floor_number === -1 ? 'Area' : 'Carpet Area'}
                                                </p>
                                                <p className="text-base font-black text-slate-700">{area} sq ft</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider mb-0.5">Booking (0.5%)</p>
                                                <p className="text-base font-black text-emerald-600">
                                                    {bookingAmount >= 1000
                                                        ? `₹${(bookingAmount / 1000).toFixed(2)} K`
                                                        : `₹${bookingAmount.toLocaleString('en-IN')}`}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Action Area */}
                            {!showHoldOptions ? (
                                <div className="space-y-4">
                                    {/* Real-time Status Disclaimer */}
                                    {(() => {
                                        const { bookingAmount } = getEffectiveUnitDetails(selectedUnit, project);
                                        return (
                                            <div className="bg-emerald-50 border border-emerald-100/50 p-2.5 rounded-xl flex items-center gap-2.5">
                                                <div className="bg-emerald-500 rounded-full p-1 text-white shrink-0">
                                                    <Info size={10} strokeWidth={3} />
                                                </div>
                                                <p className="text-[11px] font-bold text-emerald-800 leading-tight">
                                                    Pay ₹<span className="text-sm font-black text-emerald-950">
                                                        {bookingAmount >= 1000
                                                            ? `${(bookingAmount / 1000).toFixed(2)} K`
                                                            : bookingAmount.toFixed(0)}
                                                    </span> (0.5%) right now to secure this unit instantly.
                                                </p>
                                            </div>
                                        );
                                    })()}

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
                                            className="flex-[1.2] py-3 text-white font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-xl shadow-rose-200/40 text-[10px] uppercase tracking-widest disabled:opacity-50"
                                            style={{ backgroundColor: '#ef4444' }} // Solid Red
                                            onClick={handleBookNow}
                                            disabled={paymentLoading || !razorpayLoaded}
                                        >
                                            <CreditCard size={14} strokeWidth={3} />
                                            {paymentLoading ? 'Processing...' : !razorpayLoaded ? 'Loading...' : 'Book'}
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
                <Canvas
                    shadows={property?.type !== 'Plot'}
                    className="w-full h-full"
                    style={{ background: property?.type === 'Plot' ? '#f1f5f9' : '#0f172a' }}
                    frameloop={property?.type === 'Plot' ? 'demand' : 'always'}
                >
                    <PerspectiveCamera
                        makeDefault
                        position={project?.type === 'Plot' ? [40, 30, 40] : property?.type === 'Bungalow' ? [30, 15, 40] : [50, 50, 100]}
                        fov={40}
                    />
                    <Sky sunPosition={[100, 20, 50]} />
                    <ambientLight intensity={0.7} />
                    <directionalLight
                        position={[50, 100, 50]}
                        intensity={1.5}
                        castShadow
                        shadow-mapSize={[2048, 2048]}
                    />
                    <OrbitControls
                        target={project?.type === 'Plot' ? [0, 0, 0] : property?.type === 'Bungalow' ? [0, 3, 0] : [0, (project.towers[0]?.total_floors || 5) * 1.25, 0]}
                        maxPolarAngle={Math.PI / 2.1}
                    />

                    {/* Conditional Rendering: Bungalow vs Plot vs Tower/Flat */}
                    {property?.type === 'Bungalow' ? (
                        <BungalowColony
                            position={[0, 0, 0]}
                            propertyData={property}
                            project={project}
                            onUnitClick={handleUnitClick}
                        />
                    ) : property?.type === 'Plot' ? (
                        <PlotColony
                            position={[0, 0, 0]}
                            propertyData={property}
                            project={project}
                            onUnitClick={handleUnitClick}
                            showPremium={showPremium}
                            selectedUnit={selectedUnit}
                        />
                    ) : (
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
                    )}

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
