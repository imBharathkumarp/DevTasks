// Mock data for demo purposes
import { Task, TaskStats } from '../types';
import { addDays, subDays } from 'date-fns';

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Implement User Authentication',
    description: 'Set up JWT-based authentication system with login, register, and password recovery',
    priority: 'high',
    status: 'in-progress',
    assignee: 'John Doe',
    dueDate: addDays(new Date(), 3),
    createdAt: subDays(new Date(), 5),
    updatedAt: subDays(new Date(), 1),
    tags: ['Backend', 'Security'],
    subtasks: [
      { id: 's1', title: 'Setup JWT middleware', completed: true },
      { id: 's2', title: 'Create login endpoint', completed: true },
      { id: 's3', title: 'Implement password hashing', completed: false },
    ],
  },
  {
    id: '2',
    title: 'Design Dashboard UI',
    description: 'Create modern, responsive dashboard with dark theme support',
    priority: 'medium',
    status: 'todo',
    assignee: 'Jane Smith',
    dueDate: addDays(new Date(), 7),
    createdAt: subDays(new Date(), 3),
    updatedAt: subDays(new Date(), 2),
    tags: ['Frontend', 'UI/UX'],
  },
  {
    id: '3',
    title: 'Optimize Database Queries',
    description: 'Improve performance by optimizing slow database queries and adding proper indexes',
    priority: 'medium',
    status: 'review',
    assignee: 'Mike Johnson',
    dueDate: addDays(new Date(), 1),
    createdAt: subDays(new Date(), 10),
    updatedAt: subDays(new Date(), 1),
    tags: ['Backend', 'Performance'],
  },
  {
    id: '4',
    title: 'Fix Mobile Responsive Issues',
    description: 'Resolve layout issues on mobile devices and improve touch interactions',
    priority: 'high',
    status: 'done',
    assignee: 'Sarah Wilson',
    dueDate: subDays(new Date(), 2),
    createdAt: subDays(new Date(), 8),
    updatedAt: subDays(new Date(), 2),
    tags: ['Frontend', 'Bug', 'Mobile'],
  },
  {
    id: '5',
    title: 'Write API Documentation',
    description: 'Document all API endpoints with examples and response schemas',
    priority: 'low',
    status: 'todo',
    assignee: 'David Brown',
    dueDate: addDays(new Date(), 14),
    createdAt: subDays(new Date(), 2),
    updatedAt: subDays(new Date(), 1),
    tags: ['Documentation'],
  },
  {
    id: '6',
    title: 'Implement Real-time Notifications',
    description: 'Add websocket-based real-time notifications for task updates',
    priority: 'medium',
    status: 'in-progress',
    assignee: 'John Doe',
    dueDate: addDays(new Date(), 10),
    createdAt: subDays(new Date(), 4),
    updatedAt: new Date(),
    tags: ['Backend', 'Feature'],
  },
];

export const generateMockStats = (tasks: Task[]): TaskStats => {
  const total = tasks.length;
  const completed = tasks.filter(task => task.status === 'done').length;
  const inProgress = tasks.filter(task => task.status === 'in-progress').length;
  const overdue = tasks.filter(task => 
    task.dueDate && task.dueDate < new Date() && task.status !== 'done'
  ).length;

  const byPriority = {
    high: tasks.filter(task => task.priority === 'high').length,
    medium: tasks.filter(task => task.priority === 'medium').length,
    low: tasks.filter(task => task.priority === 'low').length,
  };

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    completed,
    inProgress,
    overdue,
    byPriority,
    completionRate,
  };
};