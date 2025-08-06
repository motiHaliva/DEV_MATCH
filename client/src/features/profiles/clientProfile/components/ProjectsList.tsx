import { useState } from 'react';
import { FaProjectDiagram, FaCalendarAlt, FaEdit, FaTrash } from 'react-icons/fa';
import type { Project } from '../../type';
import Button from '../../../../ui/Button';
import { variants } from '../../../../utils/variants';
import type { ProjectsListProps } from '../../type';
import { toast } from "react-toastify"; 

const ProjectsList = ({ projects, loading, onDelete, onUpdate, isOwnProfile }: ProjectsListProps) => {
  const [editingProject, setEditingProject] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Project>>({});

  const handleEditClick = (project: Project) => {
    setEditingProject(project.id);
    setEditForm({
      title: project.title,
      description: project.description,
      deadline: project.deadline,
      is_open: project.is_open,
      project_type: project.project_type,
    });
  };

  const handleSaveEdit = async (projectId: number) => {
    try {
      if (onUpdate) {
        await onUpdate(projectId, editForm);
        toast.success("Project updated successfully!");
        setEditingProject(null);
        setEditForm({});
      }
    } catch (error) {
      toast.error("Failed to update project.");
    }
  };

  const handleCancelEdit = () => {
    setEditingProject(null);
    setEditForm({});
  };


  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 ">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <div className="text-lg text-gray-500">Loading projects...</div>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <FaProjectDiagram className="text-blue-600 text-2xl" />
          <h2 className="text-3xl font-bold text-gray-900">
            {isOwnProfile ? 'My Projects' : 'Projects'}
          </h2>
        </div>
        <div className="text-center py-12">
          <FaProjectDiagram className="text-gray-300 text-6xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No projects yet</h3>
          <p className="text-gray-500">
            {isOwnProfile ? 'Click "Add Project" to create your first project' : 'This client has no projects yet'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8">
      <div className="flex items-center gap-3 mb-8">
        <FaProjectDiagram className="text-blue-600 text-2xl" />
        <h2 className="text-3xl font-bold text-gray-900">
          {isOwnProfile ? 'My Projects' : 'Projects'}
        </h2>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold text-sm">
          {projects.length}
        </span>
      </div>

      <div className="space-y-6">
        {projects.map((project) => (
          <div key={project.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            {editingProject === project.id && isOwnProfile ? (

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={editForm.title || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Project Type</label>
                    <select
                      value={editForm.project_type || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, project_type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="website">Website</option>
                      <option value="app">App</option>
                      <option value="ecommerce">E-commerce</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
                    <input
                      type="date"
                      value={editForm.deadline || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, deadline: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editForm.is_open || false}
                    onChange={(e) => setEditForm(prev => ({ ...prev, is_open: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label className="text-sm font-medium text-gray-700">Open for applications</label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    text="Save Changes"
                    variant="blue"
                    onClick={() => handleSaveEdit(project.id)}
                  />
                  <Button
                    text="Cancel"
                    variant="text"
                    onClick={handleCancelEdit}
                  />
                </div>
              </div>
            ) : (

              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{project.title}</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">{project.description}</p>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                      <span className={`px-2 py-1 rounded-full border font-semibold text-xs ${
                             variants[project.project_type] ?? variants.default
                           }`}>
                             {project.project_type}
                           </span>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold
                        ${project.is_open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                    >
                      {project.is_open ? 'Open' : 'Closed'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt />
                      <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                    </div>
                    {project.created_at && (
                      <div className="flex items-center gap-2">
                        <span>Created: {new Date(project.created_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Show action buttons only if it's own profile */}
                  {isOwnProfile && (
                    <div className="flex items-center gap-2">
                      <Button
                        icon={<FaEdit />}
                        variant="icon"
                        onClick={() => handleEditClick(project)}
                        className="text-blue-600"
                      />
                      {onDelete && (
                        <Button
                          icon={<FaTrash />}
                          variant="icon"
                          onClick={() => onDelete(project.id)}
                          className="text-red-600"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsList;
