import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Exhibition = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to By Individual page by default
    navigate('/exhibition/individual', { replace: true });
  }, [navigate]);
  return null; // This component just redirects
};

export default Exhibition;
