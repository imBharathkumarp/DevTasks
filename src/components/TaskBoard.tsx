// Main Kanban board component with drag and drop functionality
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { Plus, Filter, Search, SortAsc, LayoutGrid } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { Task } from '../types';
import { TASK_COLUMNS } from '../utils/constants';
import TaskColumn from './TaskColumn';
import TaskModal from './TaskModal';

const TaskBoard: React.FC = () => {
  const { tasksByColumn, moveTask, filteredTasks, addTask, updateTask, deleteTask } = useTaskContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTaskStatus, setNewTaskStatus] = useState<Task['status']>('todo');
  const [searchQuery, setSearchQuery] = useState(''); // <-- Add this

  // Filter tasks by search query
  const searchedTasks = searchQuery
    ? filteredTasks.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredTasks;

  // Handle drag and drop
  const handleDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result;

    // No destination means dropped outside
    if (!destination) return;

    // Same position
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    // Move task to new column
    moveTask(draggableId, destination.droppableId as Task['status']);
  }, [moveTask]);

  const handleAddTask = useCallback((status: Task['status'] = 'todo') => {
    setNewTaskStatus(status);
    setEditingTask(null);
    setIsModalOpen(true);
  }, []);

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  }, []);

  const handleSaveTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask({ ...taskData, status: newTaskStatus });
    }
    setIsModalOpen(false);
    setEditingTask(null);
  }, [editingTask, newTaskStatus, updateTask, addTask]);

  const handleDeleteTask = useCallback((taskId: string) => {
    deleteTask(taskId);
  }, [deleteTask]);

  return (
    <div className="h-full">
      {/* Board Header */}
      <motion.div 
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-white flex items-center">
            <LayoutGrid className="w-6 h-6 mr-2" />
            Task Board
          </h1>
          <div className="text-sm text-gray-400">
            {searchedTasks.length} tasks total
          </div>
        </div>
        {/* Search Box */}
        <div className="flex items-center space-x-2 bg-gray-800 px-2 py-1 rounded-lg">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none text-white placeholder-gray-400 px-2"
          />
        </div>
        <motion.button
          onClick={() => handleAddTask()}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Task</span>
        </motion.button>
      </motion.div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4">
          <AnimatePresence>
            {TASK_COLUMNS.map((columnConfig, index) => {
              // Use searchedTasks instead of filteredTasks
              const columnTasks = (tasksByColumn[columnConfig.id as Task['status']] || []).filter(
                (task) => searchedTasks.some((t) => t.id === task.id)
              );
              return (
                <motion.div
                  key={columnConfig.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex-shrink-0"
                >
                  <TaskColumn
                    column={{
                      id: columnConfig.id,
                      title: columnConfig.title,
                      tasks: columnTasks,
                      color: columnConfig.color,
                    }}
                    tasks={columnTasks}
                    onEditTask={handleEditTask}
                    onDeleteTask={handleDeleteTask}
                    onAddTask={handleAddTask}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </DragDropContext>

      {/* Empty State */}
      {searchedTasks.length === 0 && (
        <motion.div
          className="flex flex-col items-center justify-center h-96 text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-center">
            <LayoutGrid className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-medium mb-2">No tasks found</h3>
            <p className="text-gray-400 mb-6 max-w-md">
              Get started by creating your first task, or adjust your filters to see existing tasks.
            </p>
            <motion.button
              onClick={() => handleAddTask()}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-5 h-5" />
              <span>Create Your First Task</span>
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        task={editingTask}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
      />
    </div>
  );
};

export default TaskBoard;