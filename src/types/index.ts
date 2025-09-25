// Core type definitions for the DevTasks application

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'review' | 'done';
  assignee?: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  subtasks?: SubTask[];
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskColumn {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
}

export interface TaskFilters {
  search: string;
  priority: 'all' | 'low' | 'medium' | 'high';
  assignee: string;
  tags: string[];
}

export interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
  byPriority: {
    high: number;
    medium: number;
    low: number;
  };
  completionRate: number;
}