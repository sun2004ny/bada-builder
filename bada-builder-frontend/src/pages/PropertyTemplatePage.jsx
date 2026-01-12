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
        <PropertyTemplateForm
          property={property}
          userType={userType}
          isNew={isNew}
          onSave={handleSave}
          onCancel={handleCancel}
          loading={false}
        />
      </div>
    </div>
  );
};

export default PropertyTemplatePage;