import { useState } from 'react';
import Input from '../../../../ui/Input';
import Button from '../../../../ui/Button';
import { FaProjectDiagram, FaCalendarAlt } from 'react-icons/fa';
import type { AddProjectFormProps } from '../../type';
import { createProject } from '../../../../api/projectsApi';
import { toast } from "react-toastify";
import { validateAddProjectForm } from '../../../../utils/validateAddProjectForm'


const AddProject = ({ onProjectAdded, onCancel }: AddProjectFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    project_type: '',
    is_open: true
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, type, value, checked } = e.target as HTMLInputElement;
    const newValue = type === "checkbox" ? checked : type === "number" ? Number(value) : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };




const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  const validationError = validateAddProjectForm(formData);
  if (validationError) {
    setError(validationError);
    setLoading(false);
    return;
  }

  try {
    await createProject(formData);
    toast.success("Project created successfully!");
    onProjectAdded();
  } catch (err: any) {
    const errorMsg = err.response?.data?.error || 'Error creating project';
    setError(errorMsg);
    toast.error(errorMsg);
  } finally {
    setLoading(false);
  }
};



  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8">
      <div className="flex items-center gap-3 mb-8">
        <FaProjectDiagram className="text-blue-600 text-2xl" />
        <h2 className="text-3xl font-bold text-gray-900">Add New Project</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        <div>
          <Input
            label="Project Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter project title"
           
          />
        </div>

      
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Project Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Describe your project in detail..."
            required
          />
        </div>

     
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Project Type
            </label>
            <select
              name="project_type"
              value={formData.project_type}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="website">website</option>
              <option value="app">app</option>
              <option value="ecommerce">ecommerce</option>

            </select>
          </div>


        </div>

        {/* Deadline */}
        <div>
          <Input
            label="Deadline"
            name="deadline"
            type="date"
            value={formData.deadline}
            onChange={handleChange}
            icon={<FaCalendarAlt />}
       
          />
        </div>

        {/* Project Status */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
          <input
            type="checkbox"
            name="is_open"
            checked={formData.is_open}
            onChange={handleChange}
            id="is_open"
            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <label htmlFor="is_open" className="text-base font-medium text-gray-800 select-none">
            Open for applications
          </label>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end pt-6">
          <Button
            text="Cancel"
            variant="blue"
            onClick={onCancel}
            type="button"
          />
          <Button
            text={loading ? "Creating..." : "Create Project"}
            variant="blue"
            type="submit"
            disabled={loading}
            icon={<FaProjectDiagram />}
          />
        </div>
      </form>
    </div>
  );
};

export default AddProject;