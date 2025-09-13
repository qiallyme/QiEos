import { FC } from "react";

const Auditor: FC = () => {
  return (
    <div className="content">
      <div className="card">
        <h2>System Auditor</h2>
        <p>Read-only audit views and system health monitoring.</p>
        <div className="margin-top">
          <button className="btn btn-primary">Run Audit</button>
        </div>
      </div>
    </div>
  );
};

export default Auditor;
