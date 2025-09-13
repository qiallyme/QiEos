import React from 'react';

const Tasks: React.FC = () => {
  return (
    <div className="content">
      <div className="card">
        <h2>Task Management</h2>
        <p>Manage tasks and assignments.</p>
        <div className="margin-top">
          <button className="btn btn-primary">Create Task</button>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
