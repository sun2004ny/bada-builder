import React from 'react';
import { Home, Building2, Box, Map as MapIcon, Store, CheckCircle2 } from 'lucide-react';

const SUB_PROPERTY_TYPES = [
    { id: 'Apartment', label: 'Flat / Apartments', icon: Building2 },
    { id: 'Bungalow', label: 'Bungalow', icon: Home },
    { id: 'Twin Villa', label: 'Twin Villa', icon: Box },
    { id: 'Plot', label: 'Land / Plot', icon: MapIcon },
    { id: 'Commercial', label: 'Commercial', icon: Store }
];

const MixedUseHierarchy = ({ selectedTypes, onToggleType }) => {
    return (
        <div className="mixed-use-hierarchy-selector mb-8">
            <div className="text-center mb-6">
                <h4 className="text-lg font-bold text-slate-800">Select Project Components</h4>
                <p className="text-sm text-slate-500">Pick all property types that will be part of this Mixed Use Complex.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {SUB_PROPERTY_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isActive = selectedTypes.includes(type.id);

                    return (
                        <div
                            key={type.id}
                            onClick={() => onToggleType(type.id)}
                            className={`relative cursor-pointer group p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-3 ${isActive
                                    ? 'border-blue-500 bg-blue-50/50 shadow-md'
                                    : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50'
                                }`}
                        >
                            {isActive && (
                                <div className="absolute top-2 right-2 text-blue-600">
                                    <CheckCircle2 size={16} fill="currentColor" className="text-white" />
                                </div>
                            )}

                            <div className={`p-3 rounded-full transition-colors ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-500'
                                }`}>
                                <Icon size={24} />
                            </div>

                            <span className={`text-xs font-bold text-center ${isActive ? 'text-blue-700' : 'text-slate-600'
                                }`}>
                                {type.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MixedUseHierarchy;
