import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import ViewToggle from '../../components/ViewToggle/ViewToggle';
import PropertyCard from '../../components/PropertyCard/PropertyCard';
import useViewPreference from '../../hooks/useViewPreference';
import { filterAndMarkExpiredProperties } from '../../utils/propertyExpiry';
import './Exhibition.css';

const ByDeveloper = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useViewPreference();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use real-time listener for immediate updates
        const propertiesRef = collection(db, 'properties');
        const q = query(propertiesRef, where('user_type', '==', 'developer'));

        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
          const projectsData = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Filter active properties on client side
            if (data.status === 'active') {
              projectsData.push({
                id: doc.id,
                ...data
              });
            }
          });

          // Filter out expired properties and mark them as expired
          const activeProjects = await filterAndMarkExpiredProperties(projectsData);

          // Sort by created_at on client side
          activeProjects.sort((a, b) => {
            const dateA = new Date(a.created_at || 0);
            const dateB = new Date(b.created_at || 0);
            return dateB - dateA;
          });

          setProjects(activeProjects);
          setLoading(false);
        }, (error) => {
          console.error('Error fetching developer projects:', error);
          setError(`Failed to load projects: ${error.message}`);
          setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();

      } catch (error) {
        console.error('Error setting up projects listener:', error);
        setError(`Failed to load projects: ${error.message}`);
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="exhibition-page">
      <div className="exhibition-container">
        {/* Header */}
        <motion.div
          className="exhibition-header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Projects by Developers</h1>
          <p>Premium projects from trusted real estate developers</p>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          className="exhibition-tabs"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link to="/exhibition/individual" className="tab">
            By Individual
          </Link>
          <Link to="/exhibition/developer" className="tab active">
            By Developer
          </Link>
          <Link to="/exhibition/live-grouping" className="tab">
            🔴 Live Grouping
          </Link>
          <Link to="/exhibition/badabuilder" className="tab">
            By Bada Builder
          </Link>
          <Link to="/go-global" className="tab">
            🌍 Go Global
          </Link>
        </motion.div>

        {/* View Toggle */}
        {!loading && !error && projects.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
            <ViewToggle view={view} onViewChange={setView} />
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <motion.div
            className="loading-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="spinner"></div>
            <p>Loading developer projects...</p>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            className="error-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3>⚠️ {error}</h3>
            <button
              className="retry-btn"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* Projects Grid */}
        {!loading && !error && (
          <div className={`properties-grid ${view === 'list' ? 'list-view' : 'grid-view'}`}>
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <PropertyCard
                  property={{
                    ...project,
                    image: project.image_url,
                    area: project.area || project.size,
                    status: project.status || 'Active',
                    badge: 'Developer',
                    owner: project.company_name || 'Developer'
                  }}
                  viewType={view}
                  source="developer"
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State if no projects */}
        {!loading && !error && projects.length === 0 && (
          <motion.div
            className="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3>No projects available yet</h3>
            <p>Check back soon for new projects from developers</p>
            <Link to="/post-property" className="post-property-link">
              Be the first to post a project!
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ByDeveloper;
