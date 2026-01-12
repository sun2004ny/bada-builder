import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import listings from '../data/listings';
import './ProjectDetails.css';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = listings.find(item => item.id === parseInt(id));

  if (!project) return (
    <div className="text-center py-20 bg-white min-h-screen">
      <h2 className="text-2xl font-bold text-gray-800">Project Not Found</h2>
    </div>
  );

  return (
    <div className="project-details-container pb-20">
      <div className="max-w-7xl mx-auto p-4 sm:p-8">
        {/* Image Gallery */}
        <div className="relative mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.images?.slice(0, 6).map((img, idx) => (
              <div key={idx} className="overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <img
                  src={img}
                  alt={`Project Image ${idx + 1}`}
                  className="w-full h-64 object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
          <div className="absolute top-4 right-4">
            <button className="px-6 py-2.5 bg-white/90 backdrop-blur-md text-blue-600 font-bold rounded-full shadow-lg border border-blue-50 hover:bg-white transition-all">
              Download Brochure
            </button>
          </div>
        </div>

        {/* Title & Tags */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">{project.title}</h1>
            <p className="text-gray-500 font-bold text-lg">{project.location}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {project.tags?.map((tag, i) => {
                let tooltipText = null;

                if (tag === "RERA ✅") {
                  tooltipText = "RERA Number: PR/GJ/VADODARA/VADODARA/Vadodara Municipal Corporation/RN348AA10248/080523";
                } else if (tag === "Under Construction") {
                  tooltipText = "Construction Completion in Dec, 2025";
                }

                return tooltipText ? (
                  <div key={i} className="relative group">
                    <span className="px-4 py-1.5 text-xs font-bold bg-blue-50 text-blue-700 rounded-full cursor-pointer border border-blue-100 uppercase tracking-widest">
                      {tag}
                    </span>
                    <div className="absolute z-10 w-80 p-4 text-xs font-bold text-gray-700 bg-white rounded-xl shadow-2xl border border-gray-100 top-full mt-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                      {tooltipText}
                    </div>
                  </div>
                ) : (
                  <span key={i} className="px-4 py-1.5 text-xs font-bold bg-gray-100 text-gray-600 rounded-full uppercase tracking-widest border border-gray-200">
                    {tag}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="w-full md:w-auto">
            <button
              onClick={() => navigate('/book-visit', { state: { property: { ...project, type: 'project-details' } } })}
              className="w-full md:w-auto bg-[#1e90ff] hover:bg-[#1c86ee] text-white font-black px-10 py-4 rounded-2xl transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Book a Site Visit
            </button>
          </div>
        </div>

        {/* Pricing */}
        <div className="ui-bg p-8 mb-12">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Starting From</h2>
          <p className="text-4xl font-black text-[#1e90ff]">₹ {project.priceRange}</p>
          <p className="text-gray-500 mt-2 font-bold">4 BHK Villa (1638 - 1796 sq.ft.)</p>
        </div>

        {/* Floor Plans */}
        <div className="mb-16">
          <h2 className="text-2xl font-black text-gray-900 mb-8">Floor Plans & Pricing</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {project.floorPlans?.map((plan, idx) => (
              <div key={idx} className="floor-plan-card bg-white flex flex-col h-full">
                <img src={plan.image} alt={`Plan ${idx + 1}`} className="w-full h-56 object-cover" />
                <div className="p-6 flex flex-col flex-1">
                  <p className="text-xl font-extrabold text-gray-900">{plan.size} sq.ft. • 4 BHK</p>
                  <p className="text-lg font-bold text-[#1e90ff] mt-2">₹ {plan.price}</p>
                  <p className="text-sm text-gray-400 font-bold mt-1">Possession: Dec ‘25</p>
                  <button className="request-callback-btn mt-6 w-full py-4 text-sm">Request Callback</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Developer Info */}
        <div className="mb-16">
          <h2 className="text-2xl font-black text-gray-900 mb-6">Developer</h2>
          <div className="p-8 ui-bg flex items-center justify-between gap-6">
            <div>
              <p className="text-2xl font-black text-gray-900">Shree Balaji Builders</p>
              <p className="text-gray-500 font-bold">Premier Developer Portfolio</p>
            </div>
            <div className="h-16 w-16 bg-gray-50 rounded-xl flex items-center justify-center p-2 border border-gray-100">
              <span className="text-2xl font-black text-[#1e90ff]">SB</span>
            </div>
          </div>
        </div>

        {/* Facilities */}
        <div className="mb-16">
          <h2 className="text-2xl font-black text-gray-900 mb-8">Top Facilities</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-6">
            {project.facilities?.map((facility, idx) => (
              <div key={idx} className="facility-card">
                {facility}
              </div>
            ))}
          </div>
        </div>

        {/* Location Advantages */}
        <div className="mb-16">
          <h2 className="text-2xl font-black text-gray-900 mb-8">Location Advantages</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {project.advantages?.map((item, idx) => (
              <div key={idx} className="location-card">
                <p className="text-xl font-extrabold text-gray-900 mb-2">{item.place}</p>
                <p className="text-[#1e90ff] font-bold">{item.distance}</p>
              </div>
            ))}
          </div>
        </div>

        {/* More Info */}
        <div className="max-w-4xl">
          <h2 className="text-2xl font-black text-gray-900 mb-6">About {project.title}</h2>
          <p className="text-xl text-gray-600 leading-relaxed font-medium opacity-90">{project.description}</p>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
