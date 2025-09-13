import React from 'react';

const Ingest: React.FC = () => {
  return (
    <div className="content">
      <div className="card">
        <h2>Document Ingest</h2>
        <p>Bulk import documents for RAG processing.</p>
        <div className="margin-top">
          <button className="btn btn-primary">Upload Documents</button>
        </div>
      </div>
    </div>
  );
};

export default Ingest;
