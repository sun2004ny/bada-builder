import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../components/Motion/PageTransition';

// Import creatives (just add more imports if needed)
import liveGroupingImg from '../assets/creatives/live_grouping.png';
import individualListingImg from '../assets/creatives/individual_listing.png';
import developerListingImg from '../assets/creatives/developer_listing.png';

/* ---------- SIMPLE CREATIVE CARD ---------- */
const CreativeCard = ({ title, image, link }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -8 }}
            onClick={() => link && navigate(link)}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden cursor-pointer border border-gray-100"
        >
            <div className="aspect-square overflow-hidden">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="p-5 text-center">
                <h3 className="text-lg font-bold text-gray-800">
                    {title}
                </h3>
            </div>
        </motion.div>
    );
};

/* ---------- MAIN PAGE ---------- */
const About = () => {
    return (
        <PageTransition>
            <div className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="max-w-7xl mx-auto">

                    {/* HEADER */}
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-[#58335e] mb-4">
                            Who Are We
                        </h1>
                        <div className="h-1 w-24 bg-[#58335e] mx-auto rounded-full mb-6" />
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Redefining real estate with innovation, transparency, and community-driven solutions.
                        </p>
                    </div>

                    {/* CREATIVES GRID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

                        {/* JUST COPY–PASTE BELOW TO ADD NEW CREATIVE */}

                        <CreativeCard
                            title="Live Grouping"
                            image={liveGroupingImg}
                            link="/exhibition/live-grouping"
                        />

                        <CreativeCard
                            title="Individual Property Listings"
                            image={individualListingImg}
                            link="/exhibition/individual"
                        />

                        <CreativeCard
                            title="Developer Property Listings"
                            image={developerListingImg}
                            link="/exhibition/developer"
                        />



                        {/* ADD MORE BELOW LIKE THIS 👇 */}
                        {/*
              <CreativeCard
                title="New Service"
                image={newImage}
              />
              */}

                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default About;
