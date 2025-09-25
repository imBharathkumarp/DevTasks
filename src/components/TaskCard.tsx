// Individual task card component with drag and drop support
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Draggable } from 'react-beautiful-dnd';
import { 
  Calendar, 
  User, 
  Tag, 
  MoreVertical, 
  Edit, 
  Trash2,
  CheckSquare,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { Task } from '../types';
import { PRIORITY_COLORS, PRIORITY_BG_COLORS } from '../utils/constants';
import { format, isAfter, isBefore, addDays } from 'date-fns';

interface TaskCardProps {
  task: Task;
  index: number;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, index, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  // Calculate task status indicators
  const isOverdue = task.dueDate && isBefore(task.dueDate, new Date()) && task.status !== 'done';
  const isDueSoon = task.dueDate && isAfter(task.dueDate, new Date()) && isBefore(task.dueDate, addDays(new Date(), 3));
  const completedSubtasks = task.subtasks?.filter(subtask => subtask.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(task);
    setShowMenu(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(task.id);
    setShowMenu(false);
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <motion.div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-gray-800 border border-gray-700 rounded-lg p-4 mb-3 cursor-move transition-all duration-200 ${
            snapshot.isDragging 
              ? 'shadow-2xl ring-2 ring-blue-500 transform rotate-3' 
              : 'hover:shadow-lg hover:border-gray-600'
          }`}
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="text-white font-medium text-sm leading-5 mb-1">
                {task.title}
              </h3>
              <p className="text-gray-400 text-xs leading-4 line-clamp-2">
                {task.description}
              </p>
            </div>
            
            <div className="relative ml-2">
              <button
                onClick={handleMenuClick}
                className="p-1 text-gray-400 hover:text-white rounded transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 top-6 bg-gray-900 border border-gray-700 rounded-lg shadow-lg py-1 z-10 min-w-[120px]"
                  >
                    <button
                      onClick={handleEdit}
                      className="flex items-center space-x-2 w-full px-3 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-gray-800"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex items-center space-x-2 w-full px-3 py-2 text-left text-sm text-red-400 hover:text-red-300 hover:bg-gray-800"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Priority Badge */}
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-3 ${PRIORITY_BG_COLORS[task.priority]}`}>
            <div className={`w-2 h-2 rounded-full mr-1 ${task.priority === 'high' ? 'bg-red-400' : task.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'}`} />
            <span className={PRIORITY_COLORS[task.priority]}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
          </div>

          {/* Subtasks Progress */}
          {totalSubtasks > 0 && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span className="flex items-center">
                  <CheckSquare className="w-3 h-3 mr-1" />
                  Subtasks
                </span>
                <span>{completedSubtasks}/{totalSubtasks}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  className="bg-blue-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {task.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-700 text-gray-300"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </span>
              ))}
              {task.tags.length > 2 && (
                <span className="text-xs text-gray-400">
                  +{task.tags.length - 2} more
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs">
            {/* Assignee */}
            {task.assignee && (
              <div className="flex items-center text-gray-400">
                <User className="w-3 h-3 mr-1" />
                <span className="truncate max-w-[80px]">{task.assignee}</span>
              </div>
            )}

            {/* Due Date */}
            {task.dueDate && (
              <div className={`flex items-center ${
                isOverdue 
                  ? 'text-red-400' 
                  : isDueSoon 
                    ? 'text-yellow-400' 
                    : 'text-gray-400'
              }`}>
                {isOverdue ? (
                  <AlertTriangle className="w-3 h-3 mr-1" />
                ) : (
                  <Calendar className="w-3 h-3 mr-1" />
                )}
                <span>{format(task.dueDate, 'MMM d')}</span>
              </div>
            )}
          </div>

          {/* Status indicators for overdue/due soon */}
          {(isOverdue || isDueSoon) && (
            <div className={`mt-2 text-xs font-medium ${
              isOverdue ? 'text-red-400' : 'text-yellow-400'
            }`}>
              {isOverdue ? '⚠️ Overdue' : '⏰ Due Soon'}
            </div>
          )}
        </motion.div>
      )}
    </Draggable>
  );
};

export default TaskCard;