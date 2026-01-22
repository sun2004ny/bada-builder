import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './RecommendedProjects.css';
import { Link } from 'react-router-dom';
import { propertiesAPI, liveGroupingAPI, liveGroupDynamicAPI } from '../../services/api';
import PropertyCard from '../PropertyCard/PropertyCard';
import ScrollReveal from '../Motion/ScrollReveal';

const RecommendedProjects = () => {
  const [featuredProperties, setFeaturedProperties] = useState({
    individual: null,
    developer: null,
    liveGrouping: null,
    badaBuilder: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        setLoading(true);

        const fallbackBadaBuilder = [
          {
            id: 'bb-1',
            title: "Premium Investment Opportunity",
            category: "Curated by Bada Builder",
            location: "Prime Location, Vadodara",
            price: "₹75 L - ₹1.5 Cr",
            image: "/placeholder-property.jpg",
            type: "Mixed Development",
            verified: true,
            featured: true
          }
        ];

        // Fetch properties from API in parallel
        const [individualRes, developerRes, liveGroupingRes] = await Promise.all([
          propertiesAPI.getAll({ user_type: 'individual', status: 'active' }).catch(() => ({ properties: [] })),
          propertiesAPI.getAll({ user_type: 'developer', status: 'active' }).catch(() => ({ properties: [] })),
          liveGroupDynamicAPI.getAll().catch(() => ({ projects: [] }))
        ]);

        const individualProperties = individualRes.properties || individualRes || [];
        const developerProperties = developerRes.properties || developerRes || [];
        const liveGroupingProperties = liveGroupingRes.projects || [];

        // Fetch Bada Builder properties from localStorage or fallback
        const storedBB = JSON.parse(localStorage.getItem('badaBuilderProperties') || '[]');
        const badaBuilderProperties = storedBB.length > 0 ? storedBB : fallbackBadaBuilder;

        const results = {
          individual: individualProperties.length > 0 ? individualProperties[0] : null,
          developer: developerProperties.length > 0 ? developerProperties[0] : null,
          liveGrouping: liveGroupingProperties.length > 0 ? {
            ...liveGroupingProperties[0],
            // Map common fields
            title: liveGroupingProperties[0].title,
            image: liveGroupingProperties[0].image,
            location: liveGroupingProperties[0].location,
            price: liveGroupingProperties[0].group_price || liveGroupingProperties[0].price,
            filled_slots: liveGroupingProperties[0].filled_slots,
            total_slots: liveGroupingProperties[0].total_slots,
            min_buyers: liveGroupingProperties[0].min_buyers
          } : null,
          badaBuilder: badaBuilderProperties.length > 0 ? badaBuilderProperties[0] : null
        };

        setFeaturedProperties(results);
      } catch (error) {
        console.error('Error fetching featured properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProperties();
  }, []);

  const categories = [
    {
      key: 'individual',
      title: 'By Individual',
      link: '/exhibition/individual',
      badge: 'Individual'
    },
    {
      key: 'developer',
      title: 'By Developer / Builder',
      link: '/exhibition/developer',
      badge: 'Developer'
    },
    {
      key: 'liveGrouping',
      title: '🔴 Live Grouping',
      link: '/exhibition/live-grouping',
      badge: 'Live'
    },
    {
      key: 'badaBuilder',
      title: 'By Bada Builder',
      link: '/exhibition/badabuilder',
      badge: 'Bada Builder'
    }
  ];

  if (loading) {
    return (
      <section className="recommended-section">
        <div className="section-header">
          <h2>Featured Properties</h2>
        </div>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading featured properties...</p>
        </div>
      </section>
    );
  }

  // Check if at least one category has a property
  const hasAnyProperty = Object.values(featuredProperties).some(p => p !== null);

  if (!hasAnyProperty) {
    return null; // Hide section if no properties at all
  }

  return (
    <section className="recommended-section">
      <div className="section-header">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Featured Properties
        </motion.h2>
      </div>

      <div className="featured-categories">
        {categories.map((category, idx) => {
          const property = featuredProperties[category.key];

          return (
            <ScrollReveal
              key={category.key}
              className="featured-category"
              delay={idx * 0.15}
              width="100%"
            >
              <div className="category-header">
                <h3>{category.title}</h3>
                <Link to={category.link} className="view-more-link">
                  View All →
                </Link>
              </div>

              {property ? (
                <PropertyCard
                  property={{
                    ...property,
                    image: property.image || property.image_url,
                    area: property.area || property.size,
                    status: property.status || 'Available',
                    badge: category.badge,
                    // Grouping specific fields
                    discount: property.discount,
                    timeLeft: property.timeLeft,
                    original_price: property.original_price,
                    group_price: property.group_price,
                    source: category.key === 'liveGrouping' ? 'live-grouping' : category.key
                  }}
                  viewType="grid"
                  source={category.key}
                />
              ) : (
                <div className="empty-property-slot">
                  <div className="empty-slot-content">
                    <span className="empty-icon">🏠</span>
                    <p>No properties yet</p>
                    <Link to="/post-property" className="post-link">Be the first to post!</Link>
                  </div>
                </div>
              )}
            </ScrollReveal>
          );
        })}
      </div>

      <motion.div
        className="view-all-wrapper"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Link to="/exhibition" className="view-all-btn">
          Explore All Properties
        </Link>
      </motion.div>
    </section>
  );
};

export default RecommendedProjects;
