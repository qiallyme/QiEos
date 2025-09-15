import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { api } from "../../lib/api";
import { AIQuickAdd } from "./AIQuickAdd";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "completed" | "cancelled";
  priority: number;
  due_date?: string;
  labels: string[];
  project?: {
    name: string;
    color: string;
  };
  assignee?: {
    full_name: string;
    email: string;
  };
  created_at: string;
}

interface Project {
  id: string;
  name: string;
  color: string;
  type: "personal" | "team";
  task_count: number;
}

export function TaskList() {
  const { claims } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [view, setView] = useState<"list" | "board">("list");
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showAIQuickAdd, setShowAIQuickAdd] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedProject]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load projects
      const projectsResponse = await api.get("/projects");
      setProjects((projectsResponse as any).projects || []);

      // Load tasks
      const params = selectedProject ? `?project_id=${selectedProject}` : "";
      const tasksResponse = await api.get(`/tasks${params}`);
      setTasks((tasksResponse as any).tasks || []);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (title: string, description?: string) => {
    try {
      const response = await api.post("/tasks", {
        title,
        description,
        project_id: selectedProject || null,
        priority: 3,
      });

      setTasks((prev) => [(response as any).task, ...prev]);
      setShowQuickAdd(false);
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const handleAITaskCreated = (task: any) => {
    setTasks((prev) => [task, ...prev]);
    setShowAIQuickAdd(false);
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, { status });

      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, status: status as any } : task
        )
      );
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return "text-red-600 bg-red-100";
      case 2:
        return "text-orange-600 bg-orange-100";
      case 3:
        return "text-yellow-600 bg-yellow-100";
      case 4:
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo":
        return "bg-gray-100 text-gray-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600">Manage your tasks and projects</p>
        </div>

        <div className="flex items-center space-x-4">
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setView("list")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                view === "list"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              List
            </button>
            <button
              type="button"
              onClick={() => setView("board")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                view === "board"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Board
            </button>
          </div>

          {/* Quick Add Buttons */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowQuickAdd(true)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Quick Add
            </button>
            <button
              type="button"
              onClick={() => setShowAIQuickAdd(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              AI Quick Add
            </button>
          </div>
        </div>
      </div>

      {/* Project Filter */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Project:</label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name} ({project.task_count})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <QuickAddModal
          onClose={() => setShowQuickAdd(false)}
          onCreate={createTask}
        />
      )}

      {/* AI Quick Add Modal */}
      {showAIQuickAdd && (
        <AIQuickAdd
          onClose={() => setShowAIQuickAdd(false)}
          onTaskCreated={handleAITaskCreated}
          projects={projects}
        />
      )}

      {/* Tasks */}
      {view === "list" ? (
        <ListView
          tasks={tasks}
          onStatusChange={updateTaskStatus}
          getPriorityColor={getPriorityColor}
          getStatusColor={getStatusColor}
        />
      ) : (
        <BoardView
          tasks={tasks}
          onStatusChange={updateTaskStatus}
          getPriorityColor={getPriorityColor}
          getStatusColor={getStatusColor}
        />
      )}
    </div>
  );
}

// List View Component
function ListView({
  tasks,
  onStatusChange,
  getPriorityColor,
  getStatusColor,
}: {
  tasks: Task[];
  onStatusChange: (taskId: string, status: string) => void;
  getPriorityColor: (priority: number) => string;
  getStatusColor: (status: string) => string;
}) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">All Tasks</h3>
      </div>

      <div className="divide-y divide-gray-200">
        {tasks.map((task) => (
          <div key={task.id} className="px-6 py-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  checked={task.status === "completed"}
                  onChange={(e) =>
                    onStatusChange(
                      task.id,
                      e.target.checked ? "completed" : "todo"
                    )
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />

                <div className="flex-1">
                  <h4
                    className={`text-sm font-medium ${
                      task.status === "completed"
                        ? "line-through text-gray-500"
                        : "text-gray-900"
                    }`}
                  >
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {task.description}
                    </p>
                  )}

                  <div className="flex items-center space-x-4 mt-2">
                    {task.project && (
                      <span
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                        style={
                          {
                            backgroundColor: `${task.project.color}20`,
                            color: task.project.color,
                          } as React.CSSProperties
                        }
                      >
                        {task.project.name}
                      </span>
                    )}

                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      P{task.priority}
                    </span>

                    {task.labels.map((label) => (
                      <span
                        key={label}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        #{label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    task.status
                  )}`}
                >
                  {task.status.replace("_", " ")}
                </span>

                {task.due_date && (
                  <span className="text-sm text-gray-500">
                    {new Date(task.due_date).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="px-6 py-12 text-center">
          <p className="text-gray-500">
            No tasks found. Create your first task!
          </p>
        </div>
      )}
    </div>
  );
}

// Board View Component
function BoardView({
  tasks,
  onStatusChange,
  getPriorityColor,
  getStatusColor,
}: {
  tasks: Task[];
  onStatusChange: (taskId: string, status: string) => void;
  getPriorityColor: (priority: number) => string;
  getStatusColor: (status: string) => string;
}) {
  const columns = [
    { id: "todo", title: "To Do", color: "bg-gray-100" },
    { id: "in_progress", title: "In Progress", color: "bg-blue-100" },
    { id: "completed", title: "Completed", color: "bg-green-100" },
  ];

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((column) => (
        <div key={column.id} className="bg-white rounded-lg shadow">
          <div className={`px-4 py-3 rounded-t-lg ${column.color}`}>
            <h3 className="text-sm font-medium text-gray-900">
              {column.title} ({getTasksByStatus(column.id).length})
            </h3>
          </div>

          <div className="p-4 space-y-3">
            {getTasksByStatus(column.id).map((task) => (
              <div
                key={task.id}
                className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
              >
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  {task.title}
                </h4>

                {task.description && (
                  <p className="text-xs text-gray-600 mb-2">
                    {task.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      P{task.priority}
                    </span>

                    {task.project && (
                      <span
                        className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium"
                        style={
                          {
                            backgroundColor: `${task.project.color}20`,
                            color: task.project.color,
                          } as React.CSSProperties
                        }
                      >
                        {task.project.name}
                      </span>
                    )}
                  </div>

                  {task.due_date && (
                    <span className="text-xs text-gray-500">
                      {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Quick Add Modal Component
function QuickAddModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (title: string, description?: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onCreate(title.trim(), description.trim() || undefined);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Quick Add Task
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What needs to be done?"
              autoFocus
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add more details..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
