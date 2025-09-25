// Global state management using React Context API
import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import { Task, TaskFilters, TaskStats } from '../types';
import { mockTasks, generateMockStats } from '../utils/mockData';

// Action types for task management
type TaskAction =
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'MOVE_TASK'; payload: { taskId: string; newStatus: Task['status'] } }
  | { type: 'SET_FILTERS'; payload: Partial<TaskFilters> }
  | { type: 'RESET_FILTERS' };

interface TaskState {
  tasks: Task[];
  filters: TaskFilters;
}

interface TaskContextType extends TaskState {
  // Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, newStatus: Task['status']) => void;
  setFilters: (filters: Partial<TaskFilters>) => void;
  resetFilters: () => void;
  
  // Computed values
  filteredTasks: Task[];
  taskStats: TaskStats;
  tasksByColumn: Record<Task['status'], Task[]>;
}

const initialFilters: TaskFilters = {
  search: '',
  priority: 'all',
  assignee: '',
  tags: [],
};

const initialState: TaskState = {
  tasks: mockTasks,
  filters: initialFilters,
};

// Task reducer for complex state management
const taskReducer = (state: TaskState, action: TaskAction): TaskState => {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
      
    case 'ADD_TASK': {
      const newTask = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return { ...state, tasks: [...state.tasks, newTask] };
    }
    
    case 'UPDATE_TASK': {
      const updatedTasks = state.tasks.map(task =>
        task.id === action.payload.id
          ? { ...task, ...action.payload.updates, updatedAt: new Date() }
          : task
      );
      return { ...state, tasks: updatedTasks };
    }
    
    case 'DELETE_TASK': {
      const filteredTasks = state.tasks.filter(task => task.id !== action.payload);
      return { ...state, tasks: filteredTasks };
    }
    
    case 'MOVE_TASK': {
      const updatedTasks = state.tasks.map(task =>
        task.id === action.payload.taskId
          ? { ...task, status: action.payload.newStatus, updatedAt: new Date() }
          : task
      );
      return { ...state, tasks: updatedTasks };
    }
    
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
      
    case 'RESET_FILTERS':
      return { ...state, filters: initialFilters };
      
    default:
      return state;
  }
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  // Action creators using useCallback for performance optimization
  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    dispatch({ type: 'ADD_TASK', payload: task as Task });
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    dispatch({ type: 'UPDATE_TASK', payload: { id, updates } });
  }, []);

  const deleteTask = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
  }, []);

  const moveTask = useCallback((taskId: string, newStatus: Task['status']) => {
    dispatch({ type: 'MOVE_TASK', payload: { taskId, newStatus } });
  }, []);

  const setFilters = useCallback((filters: Partial<TaskFilters>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
  }, []);

  // Memoized computed values for performance
  const filteredTasks = useMemo(() => {
    let filtered = state.tasks;

    // Search filter
    if (state.filters.search) {
      const searchLower = state.filters.search.toLowerCase();
      filtered = filtered.filter(
        task =>
          task.title.toLowerCase().includes(searchLower) ||
          task.description.toLowerCase().includes(searchLower) ||
          task.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Priority filter
    if (state.filters.priority !== 'all') {
      filtered = filtered.filter(task => task.priority === state.filters.priority);
    }

    // Assignee filter
    if (state.filters.assignee) {
      filtered = filtered.filter(task => task.assignee === state.filters.assignee);
    }

    // Tags filter
    if (state.filters.tags.length > 0) {
      filtered = filtered.filter(task =>
        state.filters.tags.some(tag => task.tags.includes(tag))
      );
    }

    return filtered;
  }, [state.tasks, state.filters]);

  const taskStats = useMemo(() => {
    return generateMockStats(filteredTasks);
  }, [filteredTasks]);

  const tasksByColumn = useMemo(() => {
    return filteredTasks.reduce((acc, task) => {
      if (!acc[task.status]) {
        acc[task.status] = [];
      }
      acc[task.status].push(task);
      return acc;
    }, {} as Record<Task['status'], Task[]>);
  }, [filteredTasks]);

  const contextValue: TaskContextType = {
    ...state,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    setFilters,
    resetFilters,
    filteredTasks,
    taskStats,
    tasksByColumn,
  };

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  );
};

// Custom hook for using the task context
export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};