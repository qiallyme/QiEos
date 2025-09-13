import React from 'react';

const Tenants: React.FC = () => {
  return (
    <div className="content">
      <div className="card">
        <h2>Tenant Management</h2>
        <p>Manage organizations, departments, and companies.</p>
        <div className="margin-top">
          <button className="btn btn-primary">Create New Tenant</button>
        </div>
      </div>
    </div>
  );
};

export default Tenants;
