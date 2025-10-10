import React, { useState } from 'react';
import {
  X,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  Edit,
  Trash2,
  ClipboardList
} from 'lucide-react';
import { customerServiceRepo } from '../services/customerServiceRepo';
import {
  CSRTask,
  Customer,
  TaskStatus,
  Priority,
  TASK_STATUS_DISPLAY,
  PRIORITY_DISPLAY
} from '../types/customerService';

interface TaskManagementProps {
  customerId?: string;
  onClose?: () => void;
  onTaskUpdated?: () => void;
}

interface TaskFormData {
  title: string;
  description: string;
  category: 'follow_up' | 'tour_guidance' | 'booking_assistance' | 'document_verification' | 'complaint_resolution' | 'general';
  priority: Priority;
  customerId: string;
  customerName: string;
  dueDate: string;
  notes: string;
}

const TaskManagement: React.FC<TaskManagementProps> = ({ customerId, onClose, onTaskUpdated }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState<CSRTask | null>(null);
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    category: 'follow_up',
    priority: Priority.MEDIUM,
    customerId: customerId || '',
    customerName: '',
    dueDate: '',
    notes: ''
  });

  const customers = customerServiceRepo.getAllCustomers();
  const tasks = customerId 
    ? customerServiceRepo.getAllTasks().filter((t: CSRTask) => t.customerId === customerId)
    : customerServiceRepo.getAllTasks();

  const handleInputChange = (field: keyof TaskFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-fill customer name when customer is selected
    if (field === 'customerId') {
      const customer = customers.find((c: Customer) => c.id === value);
      setFormData(prev => ({ ...prev, customerName: customer?.fullName || '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTask) {
        customerServiceRepo.updateTask(editingTask.id, {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          priority: formData.priority,
          dueDate: new Date(formData.dueDate).toISOString(),
          notes: formData.notes
        });
      } else {
        customerServiceRepo.createTask({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          priority: formData.priority,
          status: TaskStatus.PENDING,
          assignedCSR: 'Emily Rodriguez', // In real app, get from current user
          customerId: formData.customerId,
          customerName: formData.customerName,
          dueDate: new Date(formData.dueDate).toISOString(),
          notes: formData.notes
        });
      }
      
      resetForm();
      setShowCreateForm(false);
      setEditingTask(null);
      onTaskUpdated?.();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'follow_up',
      priority: Priority.MEDIUM,
      customerId: customerId || '',
      customerName: '',
      dueDate: '',
      notes: ''
    });
  };

  const handleEdit = (task: CSRTask) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      customerId: task.customerId,
      customerName: task.customerName,
      dueDate: task.dueDate.split('T')[0],
      notes: task.notes
    });
    setShowCreateForm(true);
  };

  const handleStatusUpdate = (taskId: string, newStatus: TaskStatus) => {
    try {
      customerServiceRepo.updateTask(taskId, { status: newStatus });
      onTaskUpdated?.();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.LOW: return 'bg-green-100 text-green-800 border-green-200';
      case Priority.MEDIUM: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case Priority.HIGH: return 'bg-orange-100 text-orange-800 border-orange-200';
      case Priority.URGENT: return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.PENDING: return 'bg-red-100 text-red-800 border-red-200';
      case TaskStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-800 border-blue-200';
      case TaskStatus.COMPLETED: return 'bg-green-100 text-green-800 border-green-200';
      case TaskStatus.CANCELLED: return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.PENDING: return <AlertCircle className="w-4 h-4" />;
      case TaskStatus.IN_PROGRESS: return <Clock className="w-4 h-4" />;
      case TaskStatus.COMPLETED: return <CheckCircle className="w-4 h-4" />;
      case TaskStatus.CANCELLED: return <X className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && tasks.find((t: CSRTask) => t.dueDate === dueDate)?.status !== TaskStatus.COMPLETED;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {onClose && (
            <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
              <X className="w-6 h-6" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
            <p className="text-gray-600">
              {customerId ? 'Customer-specific tasks' : 'All customer service tasks'}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowCreateForm(true);
            setEditingTask(null);
          }}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4" />
          Create Task
        </button>
      </div>

      {/* Create/Edit Task Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </h2>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setEditingTask(null);
                resetForm();
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer
                </label>
                <select
                  value={formData.customerId}
                  onChange={(e) => handleInputChange('customerId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Customer</option>
                  {customers.map((customer: Customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.fullName} - {customer.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="follow_up">Follow Up</option>
                  <option value="tour_guidance">Tour Guidance</option>
                  <option value="booking_assistance">Booking Assistance</option>
                  <option value="document_verification">Document Verification</option>
                  <option value="complaint_resolution">Complaint Resolution</option>
                  <option value="general">General</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value as Priority)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value={Priority.LOW}>Low</option>
                  <option value={Priority.MEDIUM}>Medium</option>
                  <option value={Priority.HIGH}>High</option>
                  <option value={Priority.URGENT}>Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Additional notes or instructions..."
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingTask(null);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                {editingTask ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-4">
        {tasks.length > 0 ? (
          tasks.map((task: CSRTask) => (
            <div
              key={task.id}
              className={`bg-white p-6 rounded-lg shadow-sm border ${
                isOverdue(task.dueDate) ? 'border-red-300 bg-red-50' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                    {isOverdue(task.dueDate) && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                        OVERDUE
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-2">{task.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {task.customerName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                    <span className="capitalize">{task.category.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(task.priority)}`}>
                    {PRIORITY_DISPLAY[task.priority]}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-1 ${getStatusColor(task.status)}`}>
                    {getStatusIcon(task.status)}
                    {TASK_STATUS_DISPLAY[task.status]}
                  </span>
                </div>
              </div>

              {task.notes && (
                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <p className="text-sm text-gray-700">{task.notes}</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusUpdate(task.id, e.target.value as TaskStatus)}
                    className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value={TaskStatus.PENDING}>Pending</option>
                    <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                    <option value={TaskStatus.COMPLETED}>Completed</option>
                    <option value={TaskStatus.CANCELLED}>Cancelled</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(task)}
                    className="text-blue-600 hover:text-blue-900"
                    title="Edit Task"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this task?')) {
                        // In real app, implement delete functionality
                        console.log('Delete task:', task.id);
                      }
                    }}
                    className="text-red-600 hover:text-red-900"
                    title="Delete Task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {task.completedAt && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Completed on {new Date(task.completedAt).toLocaleDateString()} by {task.assignedCSR}
                  </p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
            <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No tasks found</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 text-purple-600 hover:text-purple-800"
            >
              Create your first task
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskManagement;