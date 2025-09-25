// Dashboard page with statistics and charts
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  Users,
  Calendar,
  Target,
  Activity
} from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { format, startOfWeek, addDays, subDays, isWithinInterval } from 'date-fns';

const Dashboard: React.FC = () => {
  const { filteredTasks, taskStats } = useTaskContext();

  // Prepare data for charts
  const priorityData = useMemo(() => [
    { name: 'High', value: taskStats.byPriority.high, color: '#EF4444' },
    { name: 'Medium', value: taskStats.byPriority.medium, color: '#F59E0B' },
    { name: 'Low', value: taskStats.byPriority.low, color: '#10B981' },
  ], [taskStats]);

  const statusData = useMemo(() => [
    { name: 'To Do', value: filteredTasks.filter(t => t.status === 'todo').length, color: '#6B7280' },
    { name: 'In Progress', value: filteredTasks.filter(t => t.status === 'in-progress').length, color: '#3B82F6' },
    { name: 'Review', value: filteredTasks.filter(t => t.status === 'review').length, color: '#F59E0B' },
    { name: 'Done', value: filteredTasks.filter(t => t.status === 'done').length, color: '#10B981' },
  ], [filteredTasks]);

  // Weekly activity data
  const weeklyActivityData = useMemo(() => {
    const today = new Date();
    const startOfCurrentWeek = startOfWeek(today);
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(startOfCurrentWeek, i);
      const tasksOnDate = filteredTasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return format(taskDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
      }).length;
      
      return {
        day: format(date, 'EEE'),
        date: format(date, 'MMM d'),
        tasks: tasksOnDate,
      };
    });
  }, [filteredTasks]);

  // Team performance data (mock data based on assignees)
  const teamPerformanceData = useMemo(() => {
    const assigneeStats = filteredTasks.reduce((acc, task) => {
      if (task.assignee) {
        if (!acc[task.assignee]) {
          acc[task.assignee] = { total: 0, completed: 0 };
        }
        acc[task.assignee].total++;
        if (task.status === 'done') {
          acc[task.assignee].completed++;
        }
      }
      return acc;
    }, {} as Record<string, { total: number; completed: number }>);

    return Object.entries(assigneeStats).map(([name, stats]) => ({
      name: name.split(' ')[0], // First name only for chart
      total: stats.total,
      completed: stats.completed,
      completion: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
    }));
  }, [filteredTasks]);

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    trend 
  }: { 
    title: string; 
    value: string | number; 
    icon: React.ElementType; 
    color: string; 
    trend?: string;
  }) => (
    <motion.div
      className="bg-gray-900 border border-gray-700 rounded-xl p-6"
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {trend && (
            <p className="text-xs text-green-400 mt-1 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tasks"
          value={taskStats.total}
          icon={Target}
          color="bg-blue-600"
          trend="+12% from last week"
        />
        <StatCard
          title="Completed"
          value={taskStats.completed}
          icon={CheckCircle}
          color="bg-green-600"
          trend="+8% completion rate"
        />
        <StatCard
          title="In Progress"
          value={taskStats.inProgress}
          icon={Clock}
          color="bg-yellow-600"
          trend="3 due this week"
        />
        <StatCard
          title="Overdue"
          value={taskStats.overdue}
          icon={AlertTriangle}
          color="bg-red-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Task Distribution by Priority */}
        <motion.div
          className="bg-gray-900 border border-gray-700 rounded-xl p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Tasks by Priority
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`priority-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    color: '#F9FAFB',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-4 mt-4">
            {priorityData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-300">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Task Status Distribution */}
        <motion.div
          className="bg-gray-900 border border-gray-700 rounded-xl p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Tasks by Status
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name" 
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    color: '#F9FAFB',
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`status-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Weekly Activity and Team Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Activity */}
        <motion.div
          className="bg-gray-900 border border-gray-700 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Weekly Activity
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="day" 
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    color: '#F9FAFB',
                  }}
                  labelFormatter={(label, payload) => {
                    const data = payload?.[0]?.payload;
                    return data ? `${label}, ${data.date}` : label;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="tasks" 
                  stroke="#3B82F6" 
                  fill="#3B82F6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Team Performance */}
        <motion.div
          className="bg-gray-900 border border-gray-700 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Team Performance
          </h3>
          {teamPerformanceData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#9CA3AF"
                    fontSize={12}
                  />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                      color: '#F9FAFB',
                    }}
                  />
                  <Bar dataKey="total" fill="#6B7280" name="Total Tasks" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" fill="#10B981" name="Completed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No team data available</p>
                <p className="text-sm mt-1">Assign tasks to team members to see performance metrics</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Completion Rate Progress */}
      <motion.div
        className="bg-gray-900 border border-gray-700 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Overall Completion Rate
          </h3>
          <span className="text-3xl font-bold text-blue-400">
            {taskStats.completionRate}%
          </span>
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-4 mb-4">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full flex items-center justify-end pr-2"
            initial={{ width: 0 }}
            animate={{ width: `${taskStats.completionRate}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {taskStats.completionRate > 15 && (
              <span className="text-xs font-medium text-white">
                {taskStats.completionRate}%
              </span>
            )}
          </motion.div>
        </div>
        
        <div className="flex justify-between text-sm text-gray-400">
          <span>{taskStats.completed} completed</span>
          <span>{taskStats.total} total tasks</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;