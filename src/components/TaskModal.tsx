// Modal component for creating and editing tasks
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Calendar, 
  User, 
  Tag, 
  Flag, 
  FileText, 
  Plus, 
  Trash2,
  Lightbulb,
  Loader2
} from 'lucide-react';
import { Task, SubTask } from '../types';
import { ASSIGNEES, COMMON_TAGS } from '../utils/constants';
import { generateSubtaskSuggestions } from '../utils/aiSuggestions';
import { format } from 'date-fns';

interface TaskModalProps {
  isOpen: boolean;
  task: Task | null; // null means creating new task
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, task, onClose, onSave }) => {
  const [formData, setFormData] = useState<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    assignee: '',
    dueDate: undefined,
    tags: [],
    subtasks: [],
  });

  const [newTag, setNewTag] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<SubTask[]>([]);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);

  // Initialize form when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        assignee: task.assignee || '',
        dueDate: task.dueDate,
        tags: task.tags,
        subtasks: task.subtasks || [],
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        assignee: '',
        dueDate: undefined,
        tags: [],
        subtasks: [],
      });
    }
    setAiSuggestions([]);
    setShowAiSuggestions(false);
  }, [task]);

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(newTag.trim())) {
        handleInputChange('tags', [...formData.tags, newTag.trim()]);
      }
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddSubtask = () => {
    const newSubtask: SubTask = {
      id: Date.now().toString(),
      title: '',
      completed: false,
    };
    handleInputChange('subtasks', [...formData.subtasks, newSubtask]);
  };

  const handleSubtaskChange = (index: number, field: keyof SubTask, value: any) => {
    const updatedSubtasks = formData.subtasks.map((subtask, i) =>
      i === index ? { ...subtask, [field]: value } : subtask
    );
    handleInputChange('subtasks', updatedSubtasks);
  };

  const handleRemoveSubtask = (index: number) => {
    handleInputChange('subtasks', formData.subtasks.filter((_, i) => i !== index));
  };

  const handleAISuggestions = async () => {
    if (!formData.description.trim()) return;
    
    setAiLoading(true);
    try {
      const response = await generateSubtaskSuggestions(formData.description);
      setAiSuggestions(response.subtasks);
      setShowAiSuggestions(true);
    } catch (error) {
      console.error('Failed to generate AI suggestions:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAcceptAISuggestion = (suggestion: SubTask) => {
    const updatedSubtasks = [...formData.subtasks, { ...suggestion, id: Date.now().toString() }];
    handleInputChange('subtasks', updatedSubtasks);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    // Filter out empty subtasks
    const validSubtasks = formData.subtasks.filter(subtask => subtask.title.trim());
    
    onSave({
      ...formData,
      subtasks: validSubtasks,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                {task ? 'Edit Task' : 'Create New Task'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter task title..."
                  required
                />
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-300">
                    Description
                  </label>
                  <button
                    type="button"
                    onClick={handleAISuggestions}
                    disabled={!formData.description.trim() || aiLoading}
                    className="flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                  >
                    {aiLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Lightbulb className="w-3 h-3" />
                    )}
                    <span>AI Suggestions</span>
                  </button>
                </div>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Describe the task..."
                  rows={3}
                />
              </div>

              {/* Priority and Status Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Flag className="w-4 h-4 inline mr-2" />
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>

              {/* Assignee and Due Date Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Assignee
                  </label>
                  <select
                    value={formData.assignee}
                    onChange={(e) => handleInputChange('assignee', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Unassigned</option>
                    {ASSIGNEES.map(assignee => (
                      <option key={assignee} value={assignee}>{assignee}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate ? format(formData.dueDate, 'yyyy-MM-dd') : ''}
                    onChange={(e) => handleInputChange('dueDate', e.target.value ? new Date(e.target.value) : undefined)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Tag className="w-4 h-4 inline mr-2" />
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag, index) => (
                    <motion.span
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 text-blue-200 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {COMMON_TAGS.filter(tag => !formData.tags.includes(tag)).map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleInputChange('tags', [...formData.tags, tag])}
                      className="px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-700 rounded transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add custom tag and press Enter..."
                />
              </div>

              {/* AI Suggestions */}
              <AnimatePresence>
                {showAiSuggestions && aiSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg"
                  >
                    <h4 className="text-sm font-medium text-blue-400 mb-3 flex items-center">
                      <Lightbulb className="w-4 h-4 mr-2" />
                      AI Suggested Subtasks
                    </h4>
                    <div className="space-y-2">
                      {aiSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-800 rounded"
                        >
                          <span className="text-sm text-gray-300">{suggestion.title}</span>
                          <button
                            type="button"
                            onClick={() => handleAcceptAISuggestion(suggestion)}
                            className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded hover:bg-gray-700"
                          >
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Subtasks */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-300">
                    Subtasks
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSubtask}
                    className="flex items-center space-x-1 text-sm text-blue-400 hover:text-blue-300"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Subtask</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.subtasks.map((subtask, index) => (
                    <motion.div
                      key={subtask.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center space-x-2 p-2 bg-gray-800 rounded-lg"
                    >
                      <input
                        type="checkbox"
                        checked={subtask.completed}
                        onChange={(e) => handleSubtaskChange(index, 'completed', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <input
                        type="text"
                        value={subtask.title}
                        onChange={(e) => handleSubtaskChange(index, 'title', e.target.value)}
                        className="flex-1 px-2 py-1 bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
                        placeholder="Subtask title..."
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSubtask(index)}
                        className="p-1 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={!formData.title.trim()}
                >
                  {task ? 'Update Task' : 'Create Task'}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TaskModal;