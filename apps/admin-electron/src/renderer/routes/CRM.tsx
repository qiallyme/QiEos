import React from 'react';

const CRM: React.FC = () => {
  return (
    <div className="content">
      <div className="card">
        <h2>CRM Management</h2>
        <p>Manage contacts, companies, and relationships.</p>
        <div className="margin-top">
          <button className="btn btn-primary">Add Contact</button>
        </div>
      </div>
    </div>
  );
};

export default CRM;
