// Main navigation header component
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Plus, 
  BarChart3, 
  Kanban,
  Menu,
  X,
  Settings
} from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { useDebounce } from '../hooks/useDebounce';

interface HeaderProps {
  currentView: 'dashboard' | 'board';
  onViewChange: (view: 'dashboard' | 'board') => void;
  onAddTask: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onViewChange, onAddTask }) => {
  const { filters, setFilters, resetFilters } = useTaskContext();
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search);
  
  // Debounce search input to avoid excessive filtering
  const debouncedSearch = useDebounce(searchInput, 300);
  
  React.useEffect(() => {
    setFilters({ search: debouncedSearch });
  }, [debouncedSearch, setFilters]);

  const handlePriorityFilter = (priority: typeof filters.priority) => {
    setFilters({ priority });
  };

  const handleClearFilters = () => {
    setSearchInput('');
    resetFilters();
    setShowFilters(false);
  };

  return (
    <header className="bg-gray-900 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <motion.div
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Kanban className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white hidden sm:block">
                DevTasks
              </h1>
            </motion.div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* View Toggle */}
            <div className="flex items-center bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => onViewChange('dashboard')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => onViewChange('board')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'board'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Kanban className="w-4 h-4" />
                <span>Board</span>
              </button>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 text-gray-400 hover:text-white"
            >
              {showMobileMenu ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-700 py-4"
            >
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-300">Priority:</span>
                  <select
                    value={filters.priority}
                    onChange={(e) => handlePriorityFilter(e.target.value as any)}
                    className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                
                <button
                  onClick={handleClearFilters}
                  className="px-3 py-1 text-sm text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded border border-gray-700"
                >
                  Clear Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-700 py-4"
            >
              <div className="space-y-4">
                {/* Mobile Search */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Mobile Navigation */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      onViewChange('dashboard');
                      setShowMobileMenu(false);
                    }}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-medium ${
                      currentView === 'dashboard'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-300'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Dashboard</span>
                  </button>
                  <button
                    onClick={() => {
                      onViewChange('board');
                      setShowMobileMenu(false);
                    }}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-medium ${
                      currentView === 'board'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-300'
                    }`}
                  >
                    <Kanban className="w-4 h-4" />
                    <span>Board</span>
                  </button>
                </div>

                {/* Mobile Add Task */}
                <button
                  onClick={() => {
                    onAddTask();
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-2 bg-blue-600 text-white rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Task</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;