import React from 'react';
import { FiGrid, FiList } from 'react-icons/fi';
import './ViewToggle.css';

/**
 * ViewToggle component for switching between grid and list views
 * @param {string} view - Current view ('grid' or 'list')
 * @param {function} onViewChange - Callback function when view changes
 */
const ViewToggle = ({ view, onViewChange }) => {
  return (
    <div className="view-toggle-container">
      <button
        className={`view-toggle-btn ${view === 'grid' ? 'active' : ''}`}
        onClick={() => onViewChange('grid')}
        title="Grid View"
        aria-label="Switch to grid view"
      >
        <FiGrid />
        <span>Grid</span>
      </button>
      <button
        className={`view-toggle-btn ${view === 'list' ? 'active' : ''}`}
        onClick={() => onViewChange('list')}
        title="List View"
        aria-label="Switch to list view"
      >
        <FiList />
        <span>List</span>
      </button>
    </div>
  );
};

export default ViewToggle;
