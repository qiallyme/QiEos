import React from 'react';

const BillingDesk: React.FC = () => {
  return (
    <div className="content">
      <div className="card">
        <h2>Billing Desk</h2>
        <p>Manage invoices, payments, and billing.</p>
        <div className="margin-top">
          <button className="btn btn-primary">Create Invoice</button>
        </div>
      </div>
    </div>
  );
};

export default BillingDesk;
