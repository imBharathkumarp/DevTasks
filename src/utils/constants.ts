// Application constants and configuration

export const TASK_COLUMNS = [
  { id: 'todo', title: 'To Do', color: 'bg-slate-600' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-blue-600' },
  { id: 'review', title: 'Review', color: 'bg-amber-600' },
  { id: 'done', title: 'Done', color: 'bg-green-600' },
];

export const PRIORITY_COLORS = {
  low: 'text-green-400',
  medium: 'text-yellow-400',
  high: 'text-red-400',
};

export const PRIORITY_BG_COLORS = {
  low: 'bg-green-500/20',
  medium: 'bg-yellow-500/20',
  high: 'bg-red-500/20',
};

export const ASSIGNEES = [
  'John Doe',
  'Jane Smith',
  'Mike Johnson',
  'Sarah Wilson',
  'David Brown',
];

export const COMMON_TAGS = [
  'Frontend',
  'Backend',
  'UI/UX',
  'Bug',
  'Feature',
  'Testing',
  'Documentation',
  'Performance',
];