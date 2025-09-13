import React from 'react';

const Migrations: React.FC = () => {
  return (
    <div className="content">
      <div className="card">
        <h2>Database Migrations</h2>
        <p>Run database migrations and schema updates.</p>
        <div className="margin-top">
          <button className="btn btn-primary">Run Migration</button>
        </div>
      </div>
    </div>
  );
};

export default Migrations;
