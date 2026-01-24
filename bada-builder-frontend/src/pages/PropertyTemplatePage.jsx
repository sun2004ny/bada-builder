import React, { useState } from 'react';
import PropertyTemplateEditor from '../components/PropertyTemplateEditor/PropertyTemplateEditor';
import './PropertyTemplatePage.css';

const PropertyTemplatePage = ({ property, isNew, handleSave, handleCancel }) => {
  const [userType, setUserType] = useState('individual');

  const handleChangeUserType = () => {
    setUserType(prev => (prev === 'individual' ? 'developer' : 'individual'));
  };

  return (
    <div className="property-template-page">
      <div className="header-section">
        <div className="container">
          <div className="user-type-badge-section flex justify-between items-center mb-8">
            <div>
              <h1 className="main-heading">Property Template</h1>
              <p className="sub-heading">Create or edit your property template</p>
            </div>
            <button
              className="change-type-button"
              onClick={handleChangeUserType}
            >
              Change User Type
            </button>
          </div>
        </div>
      </div>

      {/* Template Form */}
      <div className="template-form-container">
        <PropertyTemplateEditor
          property={property}
          userType={userType}
          isNew={isNew}
          onSubmit={handleSave}
          onCancel={handleCancel}
          handleImageChange={() => { }}
          imagePreview={null}
        />
      </div>
    </div>
  );
};

export default PropertyTemplatePage;