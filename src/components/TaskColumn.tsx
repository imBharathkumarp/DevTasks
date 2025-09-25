// Kanban column component with drag and drop support
import React from 'react';
import { motion } from 'framer-motion';
import { Droppable } from 'react-beautiful-dnd';
import { Plus } from 'lucide-react';
import { Task, TaskColumn as TaskColumnType } from '../types';
import TaskCard from './TaskCard';
import { TASK_COLUMNS } from '../utils/constants';

interface TaskColumnProps {
  column: TaskColumnType;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: (status: Task['status']) => void;
}

const TaskColumn: React.FC<TaskColumnProps> = ({
  column,
  tasks,
  onEditTask,
  onDeleteTask,
  onAddTask,
}) => {
  const columnConfig = TASK_COLUMNS.find(col => col.id === column.id);

  return (
    <div className="bg-gray-900 rounded-lg p-4 min-h-[600px] w-full min-w-[300px]">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div 
            className={`w-3 h-3 rounded-full ${columnConfig?.color || 'bg-gray-500'}`}
          />
          <h2 className="text-white font-medium text-sm">
            {column.title}
          </h2>
          <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">
            {tasks.length}
          </span>
        </div>
        
        <motion.button
          onClick={() => onAddTask(column.id as Task['status'])}
          className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Add task to this column"
        >
          <Plus className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`min-h-[500px] transition-colors duration-200 rounded-lg p-2 ${
              snapshot.isDraggingOver 
                ? 'bg-blue-500/10 border-2 border-dashed border-blue-500' 
                : 'border-2 border-transparent'
            }`}
          >
            <motion.div
              className="space-y-3"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.05,
                  },
                },
              }}
            >
              {tasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              ))}
            </motion.div>

            {provided.placeholder}

            {/* Empty State */}
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-40 text-gray-500 border-2 border-dashed border-gray-700 rounded-lg"
              >
                <div className="text-center">
                  <div className="mb-2 opacity-50">
                    <Plus className="w-8 h-8 mx-auto" />
                  </div>
                  <p className="text-sm">No tasks in {column.title.toLowerCase()}</p>
                  <p className="text-xs mt-1 opacity-75">
                    Drag tasks here or click + to add
                  </p>
                </div>
              </motion.div>
            )}

            {/* Drag Over Indicator */}
            {snapshot.isDraggingOver && tasks.length === 0 && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center justify-center h-40 text-blue-400 bg-blue-500/5 border-2 border-dashed border-blue-500 rounded-lg"
              >
                <div className="text-center">
                  <div className="mb-2">
                    <Plus className="w-8 h-8 mx-auto" />
                  </div>
                  <p className="text-sm font-medium">Drop task here</p>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default TaskColumn;