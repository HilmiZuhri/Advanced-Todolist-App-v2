/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  SlidersHorizontal, 
  List, 
  Kanban, 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileText, 
  Compass, 
  RefreshCw,
  Sparkles,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Task, 
  Priority, 
  ViewMode, 
  FilterState, 
  SortState, 
  AppNotification 
} from './types';
import { generateNotifications } from './utils/helpers';
import ThemeToggle from './components/ThemeToggle';
import NotificationPanel from './components/NotificationPanel';
import TaskForm from './components/TaskForm';
import ListView from './components/ListView';
import BoardView from './components/BoardView';

// Helper to calculate YYYY-MM-DD offsets relative to today
const getDateOffsetString = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

// Seed/mock initial data if nothing exists in storage
const SEED_TASKS: Task[] = [
  {
    id: 'seed-task-1',
    title: 'Finalize Strategy review slides',
    description: 'Structure key deliverables, highlight Q2 milestones, and share slides with stakeholders for feedback.',
    priority: Priority.HIGH,
    category: 'Work',
    subcategories: ['Presentation', 'Q2 Plan'],
    dueDate: getDateOffsetString(0), // Due today
    completed: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'seed-task-2',
    title: 'Weekly grocery shopping lists',
    description: 'Ensure to grab fresh produce, organic milk, and baking essentials. Check pantry first.',
    priority: Priority.MEDIUM,
    category: 'Shopping',
    subcategories: ['Produce', 'Whole Foods'],
    dueDate: getDateOffsetString(2), // Due in 2 days
    completed: false,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'seed-task-3',
    title: 'Schedule dentist appointment',
    description: 'Book routine cleanup session before insurance cycle expires this month.',
    priority: Priority.LOW,
    category: 'Personal',
    subcategories: ['Health', 'Routine'],
    dueDate: getDateOffsetString(1), // Due tomorrow
    completed: false,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'seed-task-4',
    title: 'Renew vehicle registration and permit',
    description: 'Critical update before late fine penalty matches. Form requires scanning emission test sheets.',
    priority: Priority.HIGH,
    category: 'Personal',
    subcategories: ['Insurance', 'Overdue'],
    dueDate: getDateOffsetString(-2), // Overdue by 2 days!
    completed: false,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
  },
  {
    id: 'seed-task-5',
    title: 'Complete financial statement audit',
    description: 'Submit expense reporting spreadsheet reconciliation for internal finance audit approval.',
    priority: Priority.HIGH,
    category: 'Finance',
    subcategories: ['Taxes', 'Audit'],
    dueDate: getDateOffsetString(-3),
    completed: true,
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString()
  }
];

const DEFAULT_CATEGORIES = ['Work', 'Personal', 'Shopping', 'Health', 'Finance'];

export default function App() {
  // --- Core State managers ---
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('todo_tasks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error restoring tasks:', e);
      }
    }
    return SEED_TASKS;
  });

  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('todo_categories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_CATEGORIES;
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('todo_dark_mode');
    if (saved) {
      return saved === 'true';
    }
    // Respect system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('todo_view_mode') as ViewMode;
    return saved === 'list' || saved === 'board' ? saved : 'list';
  });

  // --- Interaction State managers ---
  const [filter, setFilter] = useState<FilterState>({
    status: 'all',
    category: 'all',
    searchQuery: '',
  });

  const [sort, setSort] = useState<SortState>({
    field: 'dueDate',
    order: 'asc',
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('todo_dismissed_notifications');
    return saved ? JSON.parse(saved) : [];
  });
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);

  // --- UI Layout state managers (collapsing/simplifying) ---
  const [showStats, setShowStats] = useState<boolean>(() => {
    const saved = localStorage.getItem('todo_show_stats');
    return saved !== 'false'; // default to true (expanded)
  });

  const [showFilters, setShowFilters] = useState<boolean>(() => {
    const saved = localStorage.getItem('todo_show_filters');
    return saved === 'true'; // default to false (collapsed)
  });

  const [dismissCriticalBanner, setDismissCriticalBanner] = useState<boolean>(false);

  // Compute count of active non-default advanced filters to show badging
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filter.status !== 'all') count++;
    if (filter.category !== 'all') count++;
    if (sort.field !== 'dueDate' || sort.order !== 'asc') count++;
    return count;
  }, [filter, sort]);

  // --- Theme Application ---
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('todo_dark_mode', String(darkMode));
  }, [darkMode]);

  // --- Local Storage syncer ---
  useEffect(() => {
    localStorage.setItem('todo_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('todo_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('todo_view_mode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem('todo_dismissed_notifications', JSON.stringify(dismissedNotificationIds));
  }, [dismissedNotificationIds]);

  useEffect(() => {
    localStorage.setItem('todo_show_stats', String(showStats));
  }, [showStats]);

  useEffect(() => {
    localStorage.setItem('todo_show_filters', String(showFilters));
  }, [showFilters]);

  // --- Notification Engine ---
  const notifications = useMemo(() => {
    const generated = generateNotifications(tasks);
    // Filter out notifications manually dismissed by the user
    return generated.filter(n => !dismissedNotificationIds.includes(n.id));
  }, [tasks, dismissedNotificationIds]);

  // Handle task locator (focuses and highlights a task)
  const handleLocateTask = (taskId: string) => {
    setHighlightedTaskId(taskId);
    setFilter({
      status: 'all',
      category: 'all',
      searchQuery: '',
    });
    
    // Clear highlight after 3 seconds
    setTimeout(() => {
      setHighlightedTaskId(null);
    }, 3000);

    // Scroll into view gently
    setTimeout(() => {
      const element = document.getElementById(`task-row-${taskId}`) || document.getElementById(`task-card-${taskId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // --- Dashboard Calculation KPI Panel ---
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const highPriorityActive = tasks.filter(t => !t.completed && t.priority === Priority.HIGH).length;
    
    // Count overdue active tasks
    const todayStr = new Date().toISOString().split('T')[0];
    const overdueCount = tasks.filter(t => {
      if (t.completed || !t.dueDate) return false;
      return t.dueDate < todayStr;
    }).length;

    return { total, completed, pending, progress, highPriorityActive, overdueCount };
  }, [tasks]);

  // --- State Action Callbacks ---
  const handleCreateOrUpdateTask = (taskData: Omit<Task, 'id' | 'createdAt'> & { id?: string }) => {
    if (taskData.id) {
      // Edit mode
      setTasks(prev => prev.map(t => t.id === taskData.id ? { 
        ...t, 
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        category: taskData.category,
        subcategories: taskData.subcategories,
        dueDate: taskData.dueDate,
        completed: taskData.completed,
      } as Task : t));
    } else {
      // Add mode
      const newTask: Task = {
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        category: taskData.category,
        subcategories: taskData.subcategories,
        dueDate: taskData.dueDate,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      setTasks(prev => [newTask, ...prev]);
    }

    // Dynamic addition of category to existing list if custom category added
    if (!categories.includes(taskData.category)) {
      setCategories(prev => [...prev, taskData.category]);
    }
  };

  const handleToggleComplete = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTask = (id: string) => {
    // Confirm delete gently in simple inline visual manner, or standard confirm (avoid window.alert as per constraint)
    setTasks(prev => prev.filter(t => t.id !== id));
    // Clear custom notification IDs tied to this task
    setDismissedNotificationIds(prev => prev.filter(nid => !nid.includes(id)));
  };

  const handleUpdatePriority = (id: string, priority: Priority) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, priority } : t));
  };

  const handleDismissNotification = (id: string) => {
    setDismissedNotificationIds(prev => [...prev, id]);
  };

  const handleClearAllNotifications = () => {
    const allIds = notifications.map(n => n.id);
    setDismissedNotificationIds(prev => [...prev, ...allIds]);
  };

  const handleResetAppToSeed = () => {
    if (window.confirm('Are you sure you want to restore initial seed tasks? This resets your localized data.')) {
      setTasks(SEED_TASKS);
      setCategories(DEFAULT_CATEGORIES);
      setDismissedNotificationIds([]);
      setFilter({ status: 'all', category: 'all', searchQuery: '' });
      setSort({ field: 'dueDate', order: 'asc' });
    }
  };

  // --- Filter and Sort Engine computations ---
  const processedTasks = useMemo(() => {
    return tasks
      .filter(task => {
        // 1. Status Filter
        if (filter.status === 'active' && task.completed) return false;
        if (filter.status === 'completed' && !task.completed) return false;

        // 2. Category Filter
        if (filter.category !== 'all' && task.category !== filter.category) return false;

        // 3. Search Query
        if (filter.searchQuery.trim()) {
          const query = filter.searchQuery.toLowerCase();
          const matchesTitle = task.title.toLowerCase().includes(query);
          const matchesDesc = task.description.toLowerCase().includes(query);
          const matchesCategory = task.category.toLowerCase().includes(query);
          const matchesSub = task.subcategories.some(sub => sub.toLowerCase().includes(query));
          return matchesTitle || matchesDesc || matchesCategory || matchesSub;
        }

        return true;
      })
      .sort((a, b) => {
        // Sort Calculations
        let comparison = 0;
        
        if (sort.field === 'priority') {
          // Priority Order mapping
          const pWeights = { [Priority.HIGH]: 3, [Priority.MEDIUM]: 2, [Priority.LOW]: 1 };
          comparison = pWeights[b.priority] - pWeights[a.priority];
        } else if (sort.field === 'dueDate') {
          // Handling null dates or empty boundaries safety
          comparison = (a.dueDate || '9999-12-31').localeCompare(b.dueDate || '9999-12-31');
        } else if (sort.field === 'createdAt') {
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }

        return sort.order === 'asc' ? comparison : -comparison;
      });
  }, [tasks, filter, sort]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-200 flex flex-col transition-colors duration-200">
      
      {/* HEADER BAR */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/30 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          
          {/* Logo Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h1 className="font-display font-medium text-lg text-slate-900 dark:text-white italic tracking-tight flex items-center">
                TaskFlow <span className="text-indigo-600 dark:text-indigo-400 font-normal not-italic text-sm ml-1"></span>
              </h1>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 font-mono tracking-wide leading-none mt-0.5">PRODUCTIVITY HUB</p>
            </div>
          </div>

          {/* Core App Actions */}
          <div className="flex items-center gap-2">
            {/* Reset Seed Button */}
            <button
              id="reset-seed-btn"
              onClick={handleResetAppToSeed}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/30 transition-colors cursor-pointer"
              title="Reset tasks to standard initial seed"
              aria-label="Reset database to seed"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Notification triggers */}
            <div className="relative">
              <button
                id="notifications-trigger"
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/50 dark:border-slate-700/30 transition-colors relative cursor-pointer"
                title={`${notifications.length} Task reminders pending`}
                aria-label="Open notifications center"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span id="notif-badge" className="absolute top-0 right-0 w-4 h-4 bg-rose-550 font-extrabold text-[9px] text-white rounded-full flex items-center justify-center animate-bounce">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Notification dropdown component */}
              <NotificationPanel
                notifications={notifications}
                isOpen={isNotificationOpen}
                onClose={() => setIsNotificationOpen(false)}
                onClearAll={handleClearAllNotifications}
                onDismissOne={handleDismissNotification}
                onLocateTask={handleLocateTask}
              />
            </div>

            {/* Theme trigger */}
            <ThemeToggle darkMode={darkMode} onToggle={() => setDarkMode(!darkMode)} />

            {/* Main CTA */}
            <button
              id="create-task-head-btn"
              onClick={() => {
                setTaskToEdit(null);
                setIsFormOpen(true);
              }}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-650 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all focus:outline-none"
            >
              <Plus className="w-4.5 h-4.5" />
              <span className="hidden sm:inline">Add Task</span>
            </button>
          </div>
        </div>
      </header>

      {/* SYSTEM NOTIFICATION CRITICAL TOP BANNER */}
      {!dismissCriticalBanner && notifications.length > 0 && (
        <div id="urgent-danger-top-bar" className="bg-rose-600 text-white font-medium py-1.5 px-4 shadow-inner text-xs flex justify-between items-center text-center">
          <div className="flex items-center gap-2 mx-auto justify-center">
            <AlertCircle className="w-4 h-4 text-rose-100 shrink-0 select-none animate-pulse" />
            <span>
              Attention: You have <strong className="font-bold">{notifications.filter(n=>n.type === 'overdue').length} overdue</strong> tasks. Check task reminders panel above.
            </span>
          </div>
          <button 
            onClick={() => setDismissCriticalBanner(true)} 
            className="p-1 hover:bg-white/10 rounded-md transition-colors cursor-pointer shrink-0 ml-2"
            title="Dismiss notification alert"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* KPI DASHBOARD SECTION */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">Metrics & Status Overview</h2>
            <button
              id="toggle-stats-btn"
              onClick={() => setShowStats(!showStats)}
              className="text-xs text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold cursor-pointer flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 px-2.5 py-1 rounded-lg border border-indigo-100/30 dark:border-indigo-900/20 transition-all font-sans"
            >
              {showStats ? 'Hide Stats' : 'Show Stats'}
            </button>
          </div>

          <AnimatePresence initial={false}>
            {showStats && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                  
                  {/* Progress widget */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Weekly progress</p>
                        <p className="text-xl sm:text-2xl font-semibold tracking-tight text-indigo-650 dark:text-indigo-400">{stats.progress}%</p>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                        <CheckCircle2 className="w-4.5 h-4.5" />
                      </div>
                    </div>
                    
                    {/* Custom styled static Progress bar */}
                    <div className="mt-4">
                      <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div 
                          className="h-full bg-indigo-650 dark:bg-indigo-500 rounded-full transition-all duration-500" 
                          style={{ width: `${stats.progress}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-1.5 font-medium">
                        {stats.completed} of {stats.total} total completed
                      </p>
                    </div>
                  </div>

                  {/* Overdue Items widget */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-805 p-4 flex flex-col justify-between shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Overdue load</p>
                        <p className="text-xl sm:text-2xl font-semibold tracking-tight text-rose-600 dark:text-rose-450">
                          {stats.overdueCount}
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-rose-500 dark:text-rose-450 shrink-0">
                        <AlertCircle className="w-4.5 h-4.5" />
                      </div>
                    </div>
                    <div className="mt-4 text-[10px] font-medium text-slate-455 dark:text-slate-400">
                      {stats.overdueCount > 0 ? (
                        <span className="text-rose-605 dark:text-rose-450 font-semibold flex items-center gap-1.5">
                          Needs immediate focus!
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-450 font-semibold">
                          All dates cleanly updated!
                        </span>
                      )}
                    </div>
                  </div>

                  {/* High Priority count */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Urgent Queue</p>
                        <p className="text-xl sm:text-2xl font-semibold tracking-tight text-amber-655 dark:text-amber-450">
                          {stats.highPriorityActive}
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-amber-600 dark:text-amber-450 shrink-0">
                        <Clock className="w-4.5 h-4.5" />
                      </div>
                    </div>
                    <div className="mt-4 text-[10px] font-medium text-slate-450 dark:text-slate-400">
                      Active projects marked with High Priority
                    </div>
                  </div>

                  {/* Total active backlog */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-205 dark:border-slate-805 p-4 flex flex-col justify-between shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Active backlog</p>
                        <p className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-805 dark:text-slate-105">
                          {stats.pending}
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-450 dark:text-slate-400 shrink-0">
                        <FileText className="w-4.5 h-4.5" />
                      </div>
                    </div>
                    <div className="mt-4 text-[10px] font-medium text-slate-450 dark:text-slate-400">
                      Uncompleted tasks waiting in workspace
                    </div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* FILTER BAR SECTION */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 p-4 flex flex-col gap-4 shadow-sm">
          {/* Row 1: Search, Filters Toggle, & Layout Mode switcher */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 dark:text-slate-550" />
              <input
                id="search-input"
                type="text"
                placeholder="Search tasks..."
                value={filter.searchQuery}
                onChange={(e) => setFilter(prev => ({ ...prev, searchQuery: e.target.value }))}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium transition-colors"
              />
            </div>

            {/* Layout controls & collapsible filters button */}
            <div className="flex items-center gap-2 justify-between sm:justify-start">
              {/* Collapsed/Expanded Advanced Filters Toggle Button */}
              <button
                id="advanced-filters-toggle-btn"
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                  showFilters
                    ? 'bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-500 dark:border-indigo-505 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-300'
                }`}
                title="Toggle advanced filters & sorting"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] font-bold ${showFilters ? 'bg-white text-indigo-600' : 'bg-indigo-600 text-white dark:bg-indigo-505'}`}>
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Layout view controls */}
              <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl shrink-0 border border-slate-200/40 dark:border-slate-800/60">
                <button
                  id="layout-list-btn"
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 px-3 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/20 dark:border-slate-700/10'
                      : 'text-slate-500 hover:text-slate-805 dark:hover:text-slate-200'
                  }`}
                  title="Switch to detailed list view"
                >
                  <List className="w-4 h-4" />
                  <span>List</span>
                </button>
                <button
                  id="layout-board-btn"
                  onClick={() => setViewMode('board')}
                  className={`p-1.5 px-3 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    viewMode === 'board'
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/20 dark:border-slate-700/10'
                      : 'text-slate-500 hover:text-slate-805 dark:hover:text-slate-200'
                  }`}
                  title="Switch to Kanban board view"
                >
                  <Kanban className="w-4 h-4" />
                  <span>Board</span>
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Category filter buttons & Sort controls - Collapsible */}
          <AnimatePresence initial={false}>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/60 mt-1">
                  {/* Status filters */}
                  <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1.5 select-none font-mono">STATUS</span>
                    {(['all', 'active', 'completed'] as const).map((status) => (
                      <button
                        key={status}
                        id={`status-filter-${status}`}
                        onClick={() => setFilter(prev => ({ ...prev, status }))}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer capitalize transition-all ${
                          filter.status === status
                            ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm'
                            : 'bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/30'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    {/* Category selection */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider select-none font-mono">CATEGORY</span>
                      <select
                        id="category-filter-select"
                        value={filter.category}
                        onChange={(e) => setFilter(prev => ({ ...prev, category: e.target.value }))}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-105/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-305 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors cursor-pointer"
                      >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    {/* Sort selectors */}
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider select-none font-mono">SORT</span>
                      
                      <div className="flex items-center gap-1 bg-slate-105/80 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-705">
                        <select
                          id="sort-field-select"
                          value={sort.field}
                          onChange={(e) => setSort(prev => ({ ...prev, field: e.target.value as any }))}
                          className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer px-1 outline-none"
                        >
                          <option value="dueDate">Due Date</option>
                          <option value="priority">Priority</option>
                          <option value="createdAt">Date Created</option>
                        </select>

                        <button
                          id="sort-order-toggle"
                          onClick={() => setSort(prev => ({ ...prev, order: prev.order === 'asc' ? 'desc' : 'asc' }))}
                          className="p-1 rounded text-slate-500 hover:text-indigo-605 dark:hover:text-indigo-400 cursor-pointer font-bold text-xs"
                          title={sort.order === 'asc' ? 'Sorting Ascending' : 'Sorting Descending'}
                          aria-label="Toggle sort order"
                        >
                          {sort.order === 'asc' ? '▲' : '▼'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* WORKSPACE DATA AREA */}
        <section id="workspace-tasks-container" className="space-y-4">
          {/* Header count label */}
          <div className="flex items-center justify-between px-2">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
              Displaying {processedTasks.length} results of {tasks.length} total tasks
            </p>
            {processedTasks.length > 0 && (
              <span className="text-[9px] bg-slate-150/80 dark:bg-slate-900 border border-slate-205/60 dark:border-slate-800/60 px-2 py-0.5 rounded text-slate-505 dark:text-slate-400 font-bold uppercase tracking-widest font-mono">
                View: {viewMode}
              </span>
            )}
          </div>

          {/* Conditional Layout view rendering */}
          {viewMode === 'list' ? (
            <ListView
              tasks={processedTasks}
              onToggleComplete={handleToggleComplete}
              onEdit={(task) => {
                setTaskToEdit(task);
                setIsFormOpen(true);
              }}
              onDelete={handleDeleteTask}
              highlightedTaskId={highlightedTaskId}
            />
          ) : (
            <BoardView
              tasks={processedTasks}
              onToggleComplete={handleToggleComplete}
              onEdit={(task) => {
                setTaskToEdit(task);
                setIsFormOpen(true);
              }}
              onDelete={handleDeleteTask}
              onUpdatePriority={handleUpdatePriority}
              highlightedTaskId={highlightedTaskId}
            />
          )}
        </section>
      </main>

      {/* POPUP MODAL DIALOG TASK FORM FOR CRUD OPERATIONS */}
      <TaskForm
        taskToEdit={taskToEdit}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setTaskToEdit(null);
        }}
        onSave={handleCreateOrUpdateTask}
        existingCategories={categories}
      />

      {/* COMPACT CLEAN FOOTER */}
      <footer className="mt-auto py-8 border-t border-slate-200/50 dark:border-slate-900/60 bg-white/40 dark:bg-slate-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            TaskNest Advanced To-Do application powered by React + Vite + Tailwind CSS.
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-505/80 font-mono">
            Secure client-side localized persistence enabled. No background telemetry or trackers.
          </p>
        </div>
      </footer>
    </div>
  );
}
