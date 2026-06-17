/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Edit2, Trash2, Calendar, CheckSquare, Square, AlertCircle, Bookmark, Circle } from 'lucide-react';
import { Task, Priority } from '../types';
import { formatHexDate, checkDeadlineStatus } from '../utils/helpers';

interface ListViewProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  highlightedTaskId: string | null;
}

export default function ListView({
  tasks,
  onToggleComplete,
  onEdit,
  onDelete,
  highlightedTaskId,
}: ListViewProps) {
  if (tasks.length === 0) {
    return (
      <div className="py-16 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-205 dark:border-slate-805 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-455 dark:text-slate-500 mb-4 border border-dashed border-slate-200 dark:border-slate-800">
          <CheckSquare className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
          No tasks found
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
          Try relaxing active filters, refining search terms, or creating a new task to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {tasks.map((task, index) => {
          const { isOverdue, isDueToday, isDueSoon } = checkDeadlineStatus(task.dueDate);
          const isHighlighted = highlightedTaskId === task.id;

          // Priority styles
          let priorityBadge = '';
          if (task.priority === Priority.HIGH) {
            priorityBadge = 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/40';
          } else if (task.priority === Priority.MEDIUM) {
            priorityBadge = 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-450 dark:border-amber-900/40';
          } else {
            priorityBadge = 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40';
          }

          // Due date style
          let dateStyle = 'text-gray-500 dark:text-gray-400';
          let dateBg = 'bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300';
          if (!task.completed) {
            if (isOverdue) {
              dateStyle = 'text-rose-600 dark:text-rose-400 font-semibold';
              dateBg = 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/30 dark:text-rose-450 dark:border-rose-900/30';
            } else if (isDueToday) {
              dateStyle = 'text-amber-600 dark:text-amber-500 font-semibold';
              dateBg = 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:text-amber-450 dark:border-amber-900/30';
            } else if (isDueSoon) {
              dateStyle = 'text-blue-600 dark:text-blue-400';
              dateBg = 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/30';
            }
          }

          return (
            <motion.div
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{
                opacity: 1,
                y: 0,
                backgroundColor: isHighlighted ? 'rgba(99, 102, 241, 0.08)' : '',
              }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              id={`task-row-${task.id}`}
              className={`group flex items-start gap-3.5 p-4 bg-white dark:bg-slate-900 rounded-xl border ${
                isHighlighted
                  ? 'border-indigo-400 ring-2 ring-indigo-500/10'
                  : 'border-slate-100 dark:border-slate-800/80 hover:border-slate-205 dark:hover:border-slate-700'
              } transition-all duration-200 shadow-sm`}
            >
              {/* Completed Status Checkbox */}
              <button
                id={`toggle-complete-${task.id}`}
                onClick={() => onToggleComplete(task.id)}
                className="mt-1 flex-shrink-0 text-gray-400 hover:text-indigo-600 dark:text-gray-500 dark:hover:text-indigo-450 rounded-lg transition-colors cursor-pointer focus:outline-none"
                aria-label={task.completed ? 'Mark active' : 'Mark completed'}
              >
                {task.completed ? (
                  <CheckSquare id={`checkbox-checked-${task.id}`} className="w-5.5 h-5.5 text-indigo-500 fill-indigo-50 dark:fill-indigo-950/20" />
                ) : (
                  <Square id={`checkbox-unchecked-${task.id}`} className="w-5.5 h-5.5 text-gray-300 hover:text-indigo-450 dark:text-gray-700 dark:hover:text-indigo-400" />
                )}
              </button>

              {/* Task Details */}
              <div className="flex-1 min-w-0 text-left">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  {/* Category */}
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100/40 dark:border-indigo-900/40 uppercase tracking-wider font-mono">
                    <Bookmark className="w-3 h-3" />
                    {task.category}
                  </span>

                  {/* Priority Tag */}
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${priorityBadge}`}>
                    {task.priority} Priority
                  </span>
                  
                  {/* Overdue/Urgent Banner */}
                  {!task.completed && isOverdue && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-450 border border-rose-100 dark:border-rose-900/40 animate-pulse">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      Overdue
                    </span>
                  )}
                </div>

                {/* Title and Description */}
                <h4
                  id={`task-title-${task.id}`}
                  className={`text-sm sm:text-base font-semibold text-slate-900 dark:text-white break-words ${
                    task.completed ? 'line-through text-slate-400 dark:text-slate-500 decoration-slate-200 dark:decoration-slate-800' : ''
                  }`}
                >
                  {task.title}
                </h4>

                {task.description && (
                  <p
                    id={`task-desc-${task.id}`}
                    className={`text-xs sm:text-sm mt-1 text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed whitespace-pre-wrap ${
                      task.completed ? 'text-slate-405/85 dark:text-slate-500/80' : ''
                    }`}
                  >
                    {task.description}
                  </p>
                )}

                {/* Subcategories */}
                {task.subcategories && task.subcategories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {task.subcategories.map((sub, idx) => (
                      <span
                        key={idx}
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          task.completed
                            ? 'bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-850'
                            : 'bg-slate-50 dark:bg-slate-850 text-slate-650 dark:text-slate-350 border-slate-205/40 dark:border-slate-705/50'
                        }`}
                      >
                        <Circle className="w-1.5 h-1.5 fill-slate-400 text-slate-400 dark:fill-slate-600 dark:text-slate-500 shrink-0" />
                        {sub}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Sidebar: Due Date & Edit/Delete buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
                {/* Due Date tag */}
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${dateBg}`}>
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span className={dateStyle}>
                    {task.completed ? 'Completed' : formatHexDate(task.dueDate)}
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1 self-end sm:self-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    id={`edit-task-btn-${task.id}`}
                    onClick={() => onEdit(task)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-205 dark:hover:border-slate-705 cursor-pointer transition-all"
                    aria-label="Edit task"
                    title="Edit Task"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    id={`delete-task-btn-${task.id}`}
                    onClick={() => onDelete(task.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-450 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-205 dark:hover:border-slate-705 cursor-pointer transition-all"
                    aria-label="Delete task"
                    title="Delete Task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
