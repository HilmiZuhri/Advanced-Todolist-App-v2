/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Edit2, Trash2, Calendar, CheckSquare, Square, AlertCircle, Bookmark, ArrowRight, ArrowLeft } from 'lucide-react';
import { Task, Priority } from '../types';
import { formatHexDate, checkDeadlineStatus } from '../utils/helpers';

interface BoardViewProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onUpdatePriority: (id: string, priority: Priority) => void;
  highlightedTaskId: string | null;
}

export default function BoardView({
  tasks,
  onToggleComplete,
  onEdit,
  onDelete,
  onUpdatePriority,
  highlightedTaskId,
}: BoardViewProps) {
  
  // Distribute tasks across columns
  const getColumns = () => {
    const todo: Task[] = [];
    const inFocus: Task[] = [];
    const completed: Task[] = [];

    tasks.forEach(task => {
      const { isOverdue } = checkDeadlineStatus(task.dueDate);
      if (task.completed) {
        completed.push(task);
      } else if (task.priority === Priority.HIGH || isOverdue) {
        inFocus.push(task);
      } else {
        todo.push(task);
      }
    });

    return { todo, inFocus, completed };
  };

  const { todo, inFocus, completed } = getColumns();

  const handlePromote = (task: Task, currentColumn: 'todo' | 'infocus') => {
    if (currentColumn === 'todo') {
      // Move to In Focus by making priority HIGH
      onUpdatePriority(task.id, Priority.HIGH);
    } else if (currentColumn === 'infocus') {
      // Move to Completed
      onToggleComplete(task.id);
    }
  };

  const handleDemote = (task: Task, currentColumn: 'infocus' | 'completed') => {
    if (currentColumn === 'infocus') {
      // Move to To Do by lowering priority to MEDIUM
      onUpdatePriority(task.id, Priority.MEDIUM);
    } else if (currentColumn === 'completed') {
      // Move back to In Focus by making active with HIGH priority
      onToggleComplete(task.id);
      onUpdatePriority(task.id, Priority.HIGH);
    }
  };

  const ColumnHeader = ({ title, count, badgeBg }: { title: string; count: number; badgeBg: string }) => (
    <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/80">
      <h3 className="font-bold text-xs tracking-wider text-slate-800 dark:text-slate-100 uppercase font-sans">
        {title}
      </h3>
      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${badgeBg}`}>
        {count}
      </span>
    </div>
  );

  const renderCard = (task: Task, column: 'todo' | 'infocus' | 'completed') => {
    const { isOverdue, isDueToday, isDueSoon } = checkDeadlineStatus(task.dueDate);
    const isHighlighted = highlightedTaskId === task.id;

    let priorityColor = 'bg-emerald-500';
    if (task.priority === Priority.HIGH) priorityColor = 'bg-rose-500';
    else if (task.priority === Priority.MEDIUM) priorityColor = 'bg-amber-500';

    let dateBg = 'bg-slate-50 text-slate-600 dark:text-slate-400 border border-slate-250/20 dark:border-slate-800/60';
    let dateText = 'text-slate-550 dark:text-slate-400';
    if (!task.completed) {
      if (isOverdue) {
        dateBg = 'bg-rose-50 border-rose-100/60 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/30';
        dateText = 'text-rose-600 dark:text-rose-400 font-semibold';
      } else if (isDueToday) {
        dateBg = 'bg-amber-50 border-amber-100/60 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/30';
        dateText = 'text-amber-605 dark:text-amber-450 font-semibold';
      } else if (isDueSoon) {
        dateBg = 'bg-blue-50 border-blue-100/60 text-blue-700 dark:bg-blue-950/20 dark:border-blue-900/30';
        dateText = 'text-blue-600 dark:text-blue-400';
      }
    }

    return (
      <motion.div
        key={task.id}
        layout
        initial={{ opacity: 0, y: 15 }}
        animate={{
          opacity: 1,
          y: 0,
          backgroundColor: isHighlighted ? 'rgba(99, 102, 241, 0.08)' : '',
        }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        id={`task-card-${task.id}`}
        className={`p-4 bg-white dark:bg-slate-900 rounded-xl border ${
          isHighlighted
            ? 'border-indigo-400 ring-2 ring-indigo-500/10'
            : 'border-slate-205 dark:border-slate-800/80'
        } shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3 group text-left`}
      >
        {/* Top badges */}
        <div className="flex items-center justify-between gap-2 max-w-full">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100/40 dark:border-indigo-900/40 uppercase tracking-wider truncate">
            <Bookmark className="w-2.5 h-2.5 shrink-0" />
            {task.category}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`w-2.5 h-2.5 rounded-full ${priorityColor}`} title={`${task.priority} Priority`} />
            <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">
              {task.priority}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-start gap-2">
            <button
              id={`board-toggle-${task.id}`}
              onClick={() => onToggleComplete(task.id)}
              className="mt-0.5 shrink-0 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer focus:outline-none"
              aria-label={task.completed ? 'Mark status active' : 'Mark status completed'}
            >
              {task.completed ? (
                <CheckSquare className="w-4.5 h-4.5 text-indigo-500 fill-indigo-50 dark:fill-indigo-950/20" />
              ) : (
                <Square className="w-4.5 h-4.5 text-gray-300 hover:text-indigo-400 dark:text-gray-700" />
              )}
            </button>
            <h4
              className={`text-sm font-semibold text-slate-900 dark:text-white leading-snug break-words ${
                task.completed ? 'line-through text-slate-400 dark:text-slate-500 decoration-slate-205 dark:decoration-slate-800' : ''
              }`}
            >
              {task.title}
            </h4>
          </div>

          {task.description && (
            <p className={`text-xs mt-1.5 text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed ${
              task.completed ? 'text-slate-400/80 dark:text-slate-500/80' : ''
            }`}>
              {task.description}
            </p>
          )}

          {/* Subcategories */}
          {task.subcategories && task.subcategories.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2.5">
              {task.subcategories.slice(0, 3).map((sub, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-800 text-[9px] font-medium text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-850 truncate max-w-[80px]"
                >
                  {sub}
                </span>
              ))}
              {task.subcategories.length > 3 && (
                <span className="px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-800 text-[9px] font-medium text-slate-500">
                  +{task.subcategories.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-2 border-t border-gray-50 dark:border-gray-800/80 flex items-center justify-between gap-2 mt-auto">
          {/* Due date */}
          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] border ${dateBg} max-w-[130px] truncate`}>
            <Calendar className="w-3 h-3 shrink-0" />
            <span className={`${dateText} truncate`}>
              {task.completed ? 'Completed' : formatHexDate(task.dueDate)}
            </span>
          </div>

          {/* Board navigation & Editing */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Quick board promotion/demotion arrows */}
            {column !== 'todo' && (
              <button
                id={`demote-${task.id}`}
                onClick={() => handleDemote(task, column as any)}
                className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-205 dark:hover:border-slate-705 cursor-pointer transition-all"
                title={column === 'completed' ? 'Return to In Focus' : 'Move to To Do'}
                aria-label="Demote task column"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              id={`board-edit-${task.id}`}
              onClick={() => onEdit(task)}
              className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-205 dark:hover:border-slate-705 cursor-pointer transition-all"
              title="Edit Task Details"
              aria-label="Edit task properties"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            <button
              id={`board-delete-${task.id}`}
              onClick={() => onDelete(task.id)}
              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-205 dark:hover:border-slate-705 cursor-pointer transition-all"
              title="Delete Task"
              aria-label="Delete task immediately"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {column !== 'completed' && (
              <button
                id={`promote-${task.id}`}
                onClick={() => handlePromote(task, column as any)}
                className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-205 dark:hover:border-slate-705 cursor-pointer transition-all"
                title={column === 'todo' ? 'Move to In Focus' : 'Complete Task'}
                aria-label="Promote task column"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
      {/* COLUMN 1: To Do */}
      <div id="lane-todo" className="bg-slate-50/65 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 min-h-[500px] flex flex-col shadow-xs">
        <ColumnHeader title="To Do" count={todo.length} badgeBg="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300" />
        <div className="space-y-3 flex-1 overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {todo.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500 select-none">
                No active general items.
              </div>
            ) : (
              todo.map(task => renderCard(task, 'todo'))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* COLUMN 2: In Focus / Urgent */}
      <div id="lane-infocus" className="bg-slate-50/65 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 min-h-[500px] flex flex-col shadow-xs">
        <ColumnHeader title="In Focus & Urgent" count={inFocus.length} badgeBg="bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300" />
        <div className="space-y-3 flex-1 overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {inFocus.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500 select-none">
                No urgent tasks needing immediate attention.
              </div>
            ) : (
              inFocus.map(task => renderCard(task, 'infocus'))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* COLUMN 3: Completed */}
      <div id="lane-completed" className="bg-slate-50/65 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 min-h-[500px] flex flex-col shadow-xs">
        <ColumnHeader title="Completed" count={completed.length} badgeBg="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" />
        <div className="space-y-3 flex-1 overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {completed.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500 select-none">
                No completed tasks yet. Finish a task to cross it off!
              </div>
            ) : (
              completed.map(task => renderCard(task, 'completed'))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
