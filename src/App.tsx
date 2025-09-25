// Main application component
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskProvider } from './context/TaskContext';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TaskBoard from './components/TaskBoard';
import TaskModal from './components/TaskModal';
import { Task } from './types';

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'board'>('dashboard');
  const [showTaskModal, setShowTaskModal] = useState(false);

  const handleAddTask = () => {
    setShowTaskModal(true);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    // This will be handled by the TaskBoard component when in board view
    // For now, we'll just close the modal
    setShowTaskModal(false);
  };

  return (
    <TaskProvider>
      <div className="min-h-screen bg-gray-800">
        {/* Header */}
        <Header
          currentView={currentView}
          onViewChange={setCurrentView}
          onAddTask={handleAddTask}
        />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AnimatePresence mode="wait">
            {currentView === 'dashboard' ? (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Dashboard />
              </motion.div>
            ) : (
              <motion.div
                key="board"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TaskBoard />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Global Task Modal (for header add button) */}
        <TaskModal
          isOpen={showTaskModal && currentView === 'dashboard'}
          task={null}
          onClose={() => setShowTaskModal(false)}
          onSave={handleSaveTask}
        />
      </div>
    </TaskProvider>
  );
}

export default App;