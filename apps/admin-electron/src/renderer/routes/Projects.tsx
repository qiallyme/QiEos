import React from 'react';

const Projects: React.FC = () => {
  return (
    <div className="content">
      <div className="card">
        <h2>Project Management</h2>
        <p>Manage projects, tasks, and tickets.</p>
        <div className="margin-top">
          <button className="btn btn-primary">Create Project</button>
        </div>
      </div>
    </div>
  );
};

export default Projects;
