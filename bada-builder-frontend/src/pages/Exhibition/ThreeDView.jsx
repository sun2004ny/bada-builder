import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, Text } from '@react-three/drei';
import { useLocation, useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { db } from '../../firebase';
import { collection, doc, setDoc, onSnapshot, updateDoc, writeBatch, getDocs, query, where, collectionGroup, addDoc, increment } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import './LiveGrouping.css';

// --- Constants & Config ---
const TOWER_COUNT = 3;
const FLOORS = 10;
const TOWER_SPACING = 15;
const FLOOR_HEIGHT = 1.2;
const UNIT_WIDTH = 2;
const UNIT_DEPTH = 2;
const SHOP_HEIGHT = 1.5;

// Colors
const COLOR_AVAILABLE = '#22c55e'; // Greenssss
const COLOR_BOOKED = '#ef4444';    // Red
const COLOR_HOLD = '#eab308';      // Yellow
const COLOR_SHOP = '#f59e0b';      // Amber
const COLOR_PARKING = '#64748b';   // Slate
const COLOR_DEFAULT = '#e2e8f0';

// --- Components ---

const UnitDetailsModal = ({ unit, onClose, onBookNow, onHold, paymentLoading }) => {
    if (!unit) return null;

    // Calculate 0.5% advance payment
    const advanceAmount = (unit.price * 0.5) / 100;

    return (
        <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            backgroundColor: 'white', padding: '24px', borderRadius: '16px', zIndex: 100,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            minWidth: '320px', border: '2px solid #e2e8f0'
        }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: 'bold', color: '#1e293b' }}>
                Unit: {unit.unitNumber} (Floor {unit.floorId})
            </h3>

            <div style={{ marginBottom: '16px', display: 'grid', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Type:</span>
                    <span style={{ fontWeight: '600' }}>{unit.unitType || 'Standard'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Super Area:</span>
                    <span style={{ fontWeight: '600' }}>{unit.superBuiltUpArea} sq ft</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Carpet Area:</span>
                    <span style={{ fontWeight: '600' }}>{unit.carpetArea} sq ft</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Price:</span>
                    <span style={{ fontWeight: '600', color: '#0f172a' }}>₹{(unit.price / 100000).toFixed(2)} L</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Advance (0.5%):</span>
                    <span style={{ fontWeight: '700', color: '#2563eb' }}>₹{(advanceAmount / 100000).toFixed(2)} L</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748b' }}>Status:</span>
                    <span style={{
                        padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase',
                        backgroundColor: unit.status === 'booked' ? '#fee2e2' : unit.status === 'hold' ? '#fef9c3' : '#dcfce7',
                        color: unit.status === 'booked' ? '#991b1b' : unit.status === 'hold' ? '#854d0e' : '#166534'
                    }}>
                        {unit.status}
                    </span>
                </div>
            </div>

            <div style={{ display: 'grid', gap: '8px' }}>
                {unit.status === 'available' && (
                    <>
                        <button
                            onClick={() => onBookNow(unit)}
                            disabled={paymentLoading}
                            style={{
                                background: paymentLoading ? '#94a3b8' : '#2563eb',
                                color: 'white',
                                padding: '10px',
                                borderRadius: '8px',
                                border: 'none',
                                fontWeight: 'bold',
                                cursor: paymentLoading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {paymentLoading ? 'Processing...' : `Book Now - Pay ₹${(advanceAmount / 100000).toFixed(2)}L`}
                        </button>
                        <button
                            onClick={() => onHold(unit)}
                            disabled={paymentLoading}
                            style={{
                                background: paymentLoading ? '#cbd5e1' : '#f59e0b',
                                color: 'white',
                                padding: '10px',
                                borderRadius: '8px',
                                border: 'none',
                                fontWeight: 'bold',
                                cursor: paymentLoading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            Hold Unit
                        </button>
                    </>
                )}
                {unit.status !== 'available' && (
                    <div style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', padding: '8px' }}>
                        Unavailable for Booking
                    </div>
                )}
                <button
                    onClick={onClose}
                    disabled={paymentLoading}
                    style={{
                        background: 'transparent',
                        color: '#64748b',
                        padding: '8px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        cursor: paymentLoading ? 'not-allowed' : 'pointer'
                    }}
                >
                    Close
                </button>
            </div>
        </div>
    );
};

const UnitBox = ({ position, name, status, isShop, isParking, onClick, size, label }) => {
    const [hovered, setHovered] = useState(false);
    const meshRef = useRef();

    // Color Logic based on Firestore Status
    let color = COLOR_DEFAULT;
    if (status === 'booked') color = COLOR_BOOKED;
    else if (status === 'hold') color = COLOR_HOLD;
    else if (status === 'available') color = COLOR_AVAILABLE;
    else if (isShop) color = COLOR_SHOP;
    else if (isParking) color = COLOR_PARKING;

    if (hovered && status !== 'booked') color = '#3b82f6'; // Hover blue if not booked

    return (
        <group position={position}>
            <mesh
                ref={meshRef}
                onClick={(e) => {
                    e.stopPropagation();
                    onClick(name);
                }}
                onPointerOver={(e) => {
                    e.stopPropagation();
                    setHovered(true);
                }}
                onPointerOut={(e) => setHovered(false)}
            >
                <boxGeometry args={[size[0], size[1], size[2]]} />
                <meshStandardMaterial color={color} roughness={0.5} metalness={0.1} />
                <lineSegments>
                    <edgesGeometry args={[new THREE.BoxGeometry(size[0], size[1], size[2])]} />
                    <lineBasicMaterial color="#94a3b8" />
                </lineSegments>
            </mesh>
            {label && (
                <Text position={[0, 0, size[2] / 2 + 0.1]} fontSize={0.3} color="#1e293b" anchorX="center" anchorY="middle">
                    {label}
                </Text>
            )}
        </group>
    );
};

const Tower = ({ towerIndex, position, unitsData, onUnitClick }) => {
    const units = [];

    // 1. Ground Floor (Shops)
    units.push(
        <UnitBox key={`Tower_${towerIndex + 1}_G_S1`} name={`Tower_${towerIndex + 1}_G_S1`} position={[-UNIT_WIDTH / 2 - 0.2, 0, UNIT_DEPTH / 2]} size={[UNIT_WIDTH, SHOP_HEIGHT, UNIT_DEPTH]} isShop={true} label="SHOP" onClick={onUnitClick} />
    );
    units.push(
        <UnitBox key={`Tower_${towerIndex + 1}_G_S2`} name={`Tower_${towerIndex + 1}_G_S2`} position={[UNIT_WIDTH / 2 + 0.2, 0, UNIT_DEPTH / 2]} size={[UNIT_WIDTH, SHOP_HEIGHT, UNIT_DEPTH]} isShop={true} label="SHOP" onClick={onUnitClick} />
    );
    units.push(
        <UnitBox key={`Tower_${towerIndex + 1}_Park`} name={`Tower_${towerIndex + 1}_Park`} position={[0, 0, -UNIT_DEPTH / 2]} size={[UNIT_WIDTH * 2.2, SHOP_HEIGHT, UNIT_DEPTH]} isParking={true} label="PARKING" onClick={onUnitClick} />
    );

    // 2. Residential Floors
    for (let floor = 1; floor <= FLOORS; floor++) {
        const floorY = (SHOP_HEIGHT / 2) + (floor * FLOOR_HEIGHT) + 0.1;

        ['A', 'B', 'C', 'D'].forEach((unitChar, idx) => {
            /* 
               IMPORTANT: 
               We use a unique ID string for mapping 3D objects to Firestore data.
               Format: "Tower_1_Floor_5_Unit_A"
               This ID must match the 'id' field in the Firestore unit doc.
            */
            const uniqueId = `Tower_${towerIndex + 1}_Floor_${floor}_Unit_${unitChar}`;
            const unitData = unitsData[uniqueId] || { status: 'available' }; // Default to available if not loaded

            let pos = [0, floorY, 0];
            if (unitChar === 'A') pos = [-UNIT_WIDTH / 2 - 0.2, floorY, UNIT_DEPTH / 2 + 0.2];
            if (unitChar === 'B') pos = [UNIT_WIDTH / 2 + 0.2, floorY, UNIT_DEPTH / 2 + 0.2];
            if (unitChar === 'C') pos = [-UNIT_WIDTH / 2 - 0.2, floorY, -UNIT_DEPTH / 2 - 0.2];
            if (unitChar === 'D') pos = [UNIT_WIDTH / 2 + 0.2, floorY, -UNIT_DEPTH / 2 - 0.2];

            units.push(
                <UnitBox
                    key={uniqueId} name={uniqueId} position={pos} size={[UNIT_WIDTH, FLOOR_HEIGHT, UNIT_DEPTH]}
                    label={`${floor}${unitChar}`}
                    status={unitData.status}
                    onClick={onUnitClick}
                />
            );
        });
    }

    // 3. Roof
    const roofY = (SHOP_HEIGHT / 2) + ((FLOORS + 1) * FLOOR_HEIGHT);
    units.push(
        <mesh position={[0, roofY - 0.4, 0]} key={`Tower_${towerIndex + 1}_Roof`}>
            <boxGeometry args={[UNIT_WIDTH * 2.5, 0.2, UNIT_DEPTH * 2.5]} />
            <meshStandardMaterial color="#334155" />
        </mesh>
    );

    return (
        <group position={position}>
            <Text position={[0, roofY + 1, 0]} fontSize={1} color="black" anchorX="center" anchorY="bottom">{`TOWER ${towerIndex + 1}`}</Text>
            {units}
        </group>
    );
};

const ThreeDView = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser, isAuthenticated, userProfile } = useAuth();
    const property = location.state?.property;
    const propertyId = property?.id || 'viram-template-demo';

    const [unitsData, setUnitsData] = useState({});
    const [selectedUnitId, setSelectedUnitId] = useState(null);
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);

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
                    console.log('\u2705 Razorpay script loaded successfully');
                    resolve(true);
                };
                script.onerror = () => {
                    console.error('\u274c Failed to load Razorpay script');
                    resolve(false);
                };
                document.head.appendChild(script);
            });
        };

        loadRazorpay();
    }, []);

    // 1. Deep Nested Seeding
    useEffect(() => {
        if (!propertyId) return;

        const checkAndSeed = async () => {
            try {
                // Check if ANY units exist for this project using a collection group query
                // This requires an index, but for now we can check a specific known path to avoid index error on first run
                const testTowerRef = collection(db, 'properties', String(propertyId), 'towers');
                const snapshot = await getDocs(testTowerRef);

                if (snapshot.empty) {
                    console.log("Seeding Deep Structure...");
                    const batch = writeBatch(db);

                    // Structure: properties/{pid}/towers/{tid}/floors/{fid}/units/{uid}
                    for (let t = 1; t <= TOWER_COUNT; t++) {
                        const towerId = `Tower_${t}`;
                        const towerRef = doc(db, 'properties', String(propertyId), 'towers', towerId);
                        batch.set(towerRef, { created: true }); // Placeholder for tower

                        for (let f = 1; f <= FLOORS; f++) {
                            const floorId = `Floor_${f}`;
                            const floorRef = doc(db, 'properties', String(propertyId), 'towers', towerId, 'floors', floorId);
                            batch.set(floorRef, { created: true }); // Placeholder for floor

                            ['A', 'B', 'C', 'D'].forEach(u => {
                                const unitId = `Unit_${u}`;
                                const uniqueId = `Tower_${t}_Floor_${f}_Unit_${u}`; // Unique key for logic

                                const unitRef = doc(db, 'properties', String(propertyId), 'towers', towerId, 'floors', floorId, 'units', unitId);

                                batch.set(unitRef, {
                                    id: uniqueId, // Store the logical ID used by 3D mesh
                                    towerId: t,
                                    floorId: f,
                                    unitNumber: `${f}${u}`,
                                    unitType: '3 BHK',
                                    carpetArea: 1200,
                                    superBuiltUpArea: 1550,
                                    price: 7500000 + (f * 50000),
                                    status: 'available',
                                    projectId: String(propertyId),
                                    updatedAt: new Date()
                                });
                            });
                        }
                    }
                    await batch.commit();
                    console.log("Deep Seeding Complete!");
                }
            } catch (e) {
                console.error("Seeding Error:", e);
            }
        };

        checkAndSeed();

        // 2. Collection Group Listener
        // Listens to ALL 'units' subcollections where projectId matches
        const q = query(collectionGroup(db, 'units'), where('projectId', '==', String(propertyId)));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = {};
            snapshot.forEach(doc => {
                const unit = doc.data();
                // Map by the logical ID (e.g., Tower_1_Floor_5_Unit_A)
                if (unit.id) {
                    data[unit.id] = { ...unit, firestorePath: doc.ref.path };
                }
            });
            setUnitsData(data);
        }, (error) => {
            console.error("Snapshot Error (Index might be missing):", error);
            if (error.code === 'failed-precondition') {
                alert("Database Index Missing! Check console for link.");
            }
        });

        return () => unsubscribe();
    }, [propertyId]);

    // Handle Logic
    const handleUnitClick = (id) => {
        if (id.includes('Unit')) {
            setSelectedUnitId(id);
        }
    };

    // Razorpay Payment Handler for Book Now
    const handleBookNowPayment = async (unit) => {
        // Validation
        if (!isAuthenticated) {
            alert('Please login to book a unit');
            navigate('/login');
            return;
        }

        if (!razorpayLoaded) {
            alert('Payment gateway is loading. Please try again in a moment.');
            return;
        }

        if (unit.status !== 'available') {
            alert('This unit is no longer available');
            return;
        }

        setPaymentLoading(true);

        // Calculate 0.5% advance payment
        const advanceAmount = (unit.price * 0.5) / 100;
        const currency = 'INR';

        console.log('\ud83d\ude80 Starting unit booking payment for:', unit.unitNumber);
        console.log('\ud83d\udcb0 Advance Amount (0.5%):', advanceAmount);

        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: advanceAmount * 100, // Amount in paise
            currency: currency,
            name: 'Bada Builder',
            description: `Unit Booking - ${unit.unitNumber} (${property?.title || 'Property'})`,
            image: '/logo.png',
            handler: async function (response) {
                console.log('\u2705 Payment successful:', response);

                try {
                    // Atomic Firestore Updates
                    const batch = writeBatch(db);

                    // 1. Update Unit Status to Booked
                    const unitRef = doc(db, 'properties', String(propertyId),
                        'towers', `Tower_${unit.towerId}`,
                        'floors', `Floor_${unit.floorId}`,
                        'units', `Unit_${unit.unitNumber.slice(-1)}`
                    );

                    batch.update(unitRef, {
                        status: 'booked',
                        bookedBy: currentUser.uid,
                        bookedByName: userProfile?.name || currentUser.displayName || 'User',
                        bookedByEmail: userProfile?.email || currentUser.email,
                        bookedAt: new Date().toISOString(),
                        paymentId: response.razorpay_payment_id,
                        amountPaid: advanceAmount,
                        updatedAt: new Date()
                    });

                    // 2. Store Payment Record
                    const paymentData = {
                        payment_id: response.razorpay_payment_id,
                        user_id: currentUser.uid,
                        user_name: userProfile?.name || currentUser.displayName || 'User',
                        user_email: userProfile?.email || currentUser.email,
                        property_id: String(propertyId),
                        property_title: property?.title || 'Property',
                        unit_id: unit.id,
                        unit_number: unit.unitNumber,
                        tower_id: unit.towerId,
                        floor_id: unit.floorId,
                        amount: advanceAmount,
                        unit_price: unit.price,
                        payment_type: 'unit_booking',
                        payment_status: 'success',
                        currency: currency,
                        razorpay_order_id: response.razorpay_order_id || '',
                        razorpay_signature: response.razorpay_signature || '',
                        created_at: new Date().toISOString(),
                        timestamp: new Date()
                    };

                    const paymentsRef = collection(db, 'payments');
                    await addDoc(paymentsRef, paymentData);

                    // 3. Increment Buyer Count in Property
                    const propertyRef = doc(db, 'properties', String(propertyId));
                    batch.update(propertyRef, {
                        currentBuyers: increment(1)
                    });

                    // 4. Add User to Group Members
                    const memberRef = doc(db, 'properties', String(propertyId), 'members', currentUser.uid);
                    batch.set(memberRef, {
                        userId: currentUser.uid,
                        userName: userProfile?.name || currentUser.displayName || 'User',
                        userEmail: userProfile?.email || currentUser.email,
                        unitId: unit.id,
                        unitNumber: unit.unitNumber,
                        towerId: unit.towerId,
                        floorId: unit.floorId,
                        joinedAt: new Date().toISOString(),
                        paymentId: response.razorpay_payment_id,
                        amountPaid: advanceAmount
                    }, { merge: true });

                    // Commit all changes atomically
                    await batch.commit();

                    console.log('\u2705 Unit booked successfully!');
                    console.log('\u2705 Payment record stored');
                    console.log('\u2705 Buyer count incremented');
                    console.log('\u2705 User added to group members');

                    // Close modal and show success
                    setPaymentLoading(false);
                    setSelectedUnitId(null);

                    alert(`\u2705 Booking Successful!\\n\\nUnit: ${unit.unitNumber}\\nAmount Paid: \u20b9${(advanceAmount / 100000).toFixed(2)}L\\nPayment ID: ${response.razorpay_payment_id}\\n\\nThe unit will now appear as BOOKED (RED).`);

                } catch (error) {
                    console.error('Error updating database:', error);
                    alert(`Payment successful but booking failed. Please contact support.\\nPayment ID: ${response.razorpay_payment_id}`);
                    setPaymentLoading(false);
                }
            },
            prefill: {
                name: userProfile?.name || currentUser?.displayName || '',
                email: userProfile?.email || currentUser?.email || '',
                contact: userProfile?.phone || currentUser?.phoneNumber || ''
            },
            notes: {
                property_id: String(propertyId),
                unit_id: unit.id,
                unit_number: unit.unitNumber,
                user_id: currentUser.uid,
                payment_type: 'unit_booking_advance'
            },
            theme: {
                color: '#2563eb'
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
    };

    // Hold Unit Handler (without payment)
    const handleHoldUnit = async (unit) => {
        if (!isAuthenticated) {
            alert('Please login to hold a unit');
            navigate('/login');
            return;
        }

        if (unit.status !== 'available') {
            alert('This unit is no longer available');
            return;
        }

        setPaymentLoading(true);

        try {
            const unitRef = doc(db, 'properties', String(propertyId),
                'towers', `Tower_${unit.towerId}`,
                'floors', `Floor_${unit.floorId}`,
                'units', `Unit_${unit.unitNumber.slice(-1)}`
            );

            await updateDoc(unitRef, {
                status: 'hold',
                heldBy: currentUser.uid,
                heldByName: userProfile?.name || currentUser.displayName || 'User',
                heldAt: new Date().toISOString(),
                updatedAt: new Date()
            });

            console.log('\u2705 Unit put on hold');
            setPaymentLoading(false);
            setSelectedUnitId(null);
            alert(`Unit ${unit.unitNumber} is now on HOLD.`);

        } catch (error) {
            console.error('Error holding unit:', error);
            alert('Failed to hold unit. Please try again.');
            setPaymentLoading(false);
        }
    };

    const selectedUnit = selectedUnitId ? unitsData[selectedUnitId] : null;

    return (
        <div className="three-d-view-container">
            {/* Back & Legend Overlay */}
            <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, background: 'rgba(255, 255, 255, 0.95)', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', maxWidth: '250px' }}>
                <button onClick={() => navigate(-1)} style={{ marginBottom: '10px', cursor: 'pointer', border: 'none', background: 'transparent', fontSize: '16px', fontWeight: 'bold' }}>⬅ Back</button>
                <h1 style={{ margin: '0 0 5px 0', fontSize: '20px' }}>{property?.title || 'Viram Template'}</h1>
                <div style={{ marginTop: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}><div style={{ width: 12, height: 12, background: COLOR_AVAILABLE, borderRadius: '2px' }}></div> Available</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}><div style={{ width: 12, height: 12, background: COLOR_BOOKED, borderRadius: '2px' }}></div> Booked</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}><div style={{ width: 12, height: 12, background: COLOR_HOLD, borderRadius: '2px' }}></div> On Hold</div>
                </div>
            </div>

            {/* Unit Modal Overlay */}
            {selectedUnit && (
                <UnitDetailsModal
                    unit={selectedUnit}
                    onClose={() => setSelectedUnitId(null)}
                    onBookNow={handleBookNowPayment}
                    onHold={handleHoldUnit}
                    paymentLoading={paymentLoading}
                />
            )}

            <Canvas camera={{ position: [20, 20, 40], fov: 45 }}>
                <Sky sunPosition={[100, 20, 100]} />
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow />
                <OrbitControls target={[0, 5, 0]} maxPolarAngle={Math.PI / 2 - 0.05} minDistance={10} maxDistance={100} />

                <group position={[-(TOWER_SPACING), 0, 0]}>
                    <Tower towerIndex={0} position={[0, 0, 0]} unitsData={unitsData} onUnitClick={handleUnitClick} />
                </group>
                <group position={[0, 0, 0]}>
                    <Tower towerIndex={1} position={[0, 0, 0]} unitsData={unitsData} onUnitClick={handleUnitClick} />
                </group>
                <group position={[TOWER_SPACING, 0, 0]}>
                    <Tower towerIndex={2} position={[0, 0, 0]} unitsData={unitsData} onUnitClick={handleUnitClick} />
                </group>

                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
                    <planeGeometry args={[100, 100]} />
                    <meshStandardMaterial color="#f0fdf4" />
                </mesh>
                <gridHelper args={[100, 50]} position={[0, -0.05, 0]} />
            </Canvas>
        </div>
    );
};

export default ThreeDView;
