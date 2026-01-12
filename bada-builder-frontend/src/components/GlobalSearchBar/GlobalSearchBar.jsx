import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import SearchBar from '../SearchBar/SearchBar';
import './GlobalSearchBar.css';

const GlobalSearchBar = () => {
  const location = useLocation();
  const [serviceSearch, setServiceSearch] = useState('');

  // Don't show on these pages
  if (location.pathname === '/search' || location.pathname === '/') {
    return null;
  }

  // Services page - show services search
  if (location.pathname === '/services') {
    const handleServiceSearch = (e) => {
      e.preventDefault();
      const searchValue = serviceSearch.toLowerCase();

      // Find all service cards
      const serviceCards = document.querySelectorAll('.service-card');
      let foundCount = 0;

      serviceCards.forEach(card => {
        const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
        const description = card.querySelector('p')?.textContent.toLowerCase() || '';

        if (searchValue === '' || title.includes(searchValue) || description.includes(searchValue)) {
          card.style.display = 'block';
          foundCount++;
        } else {
          card.style.display = 'none';
        }
      });

      // Show/hide no results message
      let noResultsMsg = document.querySelector('.no-services-found');
      if (foundCount === 0 && searchValue !== '') {
        if (!noResultsMsg) {
          noResultsMsg = document.createElement('div');
          noResultsMsg.className = 'no-services-found';
          noResultsMsg.innerHTML = `
            <p style="text-align: center; padding: 40px; color: #666; font-size: 18px;">
              No services found matching "${serviceSearch}"
            </p>
          `;
          document.querySelector('.services-grid')?.appendChild(noResultsMsg);
        }
      } else if (noResultsMsg) {
        noResultsMsg.remove();
      }
    };

    return (
      <div className="global-search-bar">
        <div className="global-search-container">
          <form onSubmit={handleServiceSearch} className="search-bar-compact">
            <div className="search-input-wrapper">
              <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search services..."
                value={serviceSearch}
                onChange={(e) => {
                  setServiceSearch(e.target.value);
                  // Real-time search
                  const searchValue = e.target.value.toLowerCase();
                  const serviceCards = document.querySelectorAll('.service-card');
                  let foundCount = 0;

                  serviceCards.forEach(card => {
                    const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
                    const description = card.querySelector('p')?.textContent.toLowerCase() || '';

                    if (searchValue === '' || title.includes(searchValue) || description.includes(searchValue)) {
                      card.style.display = 'block';
                      foundCount++;
                    } else {
                      card.style.display = 'none';
                    }
                  });

                  // Show/hide no results message
                  let noResultsMsg = document.querySelector('.no-services-found');
                  if (foundCount === 0 && searchValue !== '') {
                    if (!noResultsMsg) {
                      noResultsMsg = document.createElement('div');
                      noResultsMsg.className = 'no-services-found';
                      noResultsMsg.innerHTML = `
                        <p style="text-align: center; padding: 40px; color: #666; font-size: 18px;">
                          No services found matching "${e.target.value}"
                        </p>
                      `;
                      document.querySelector('.services-grid')?.appendChild(noResultsMsg);
                    } else {
                      noResultsMsg.querySelector('p').textContent = `No services found matching "${e.target.value}"`;
                    }
                  } else if (noResultsMsg) {
                    noResultsMsg.remove();
                  }
                }}
                className="search-input-compact"
              />
              {serviceSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setServiceSearch('');
                    const serviceCards = document.querySelectorAll('.service-card');
                    serviceCards.forEach(card => {
                      card.style.display = 'block';
                    });
                    const noResultsMsg = document.querySelector('.no-services-found');
                    if (noResultsMsg) noResultsMsg.remove();
                  }}
                  className="clear-btn"
                >
                  ✕
                </button>
              )}
              <button type="submit" className="search-btn-compact">
                Search
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Default - show property search
  return (
    <div className="global-search-bar">
      <div className="global-search-container">
        <SearchBar variant="compact" />
      </div>
    </div>
  );
};

export default GlobalSearchBar;
