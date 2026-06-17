/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Calendar, Tag, AlertTriangle } from 'lucide-react';
import { Task, Priority } from '../types';

interface TaskFormProps {
  taskToEdit?: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt'> & { id?: string }) => void;
  existingCategories: string[];
}

export default function TaskForm({
  taskToEdit,
  isOpen,
  onClose,
  onSave,
  existingCategories,
}: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [category, setCategory] = useState('Work');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [newSubcategory, setNewSubcategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');

  // Sync state if editing a task
  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description);
      setPriority(taskToEdit.priority);
      
      // Check if task's category is one of the existing defaults or already exists.
      // If we need to set it, check against current ones
      if (existingCategories.includes(taskToEdit.category)) {
        setCategory(taskToEdit.category);
        setIsCustomCategory(false);
      } else {
        setCategory('__custom__');
        setCustomCategory(taskToEdit.category);
        setIsCustomCategory(true);
      }
      
      setSubcategories(taskToEdit.subcategories || []);
      setDueDate(taskToEdit.dueDate || '');
    } else {
      // Clear forms for a fresh task
      setTitle('');
      setDescription('');
      setPriority(Priority.MEDIUM);
      setCategory('Work');
      setCustomCategory('');
      setIsCustomCategory(false);
      setSubcategories([]);
      setNewSubcategory('');
      
      // Default due date to today
      const today = new Date().toISOString().split('T')[0];
      setDueDate(today);
    }
    setError('');
  }, [taskToEdit, isOpen]);

  const handleAddSubcategory = (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = newSubcategory.trim();
    if (!formatted) return;

    if (subcategories.includes(formatted)) {
      setError('Subcategory tag already added.');
      return;
    }

    setSubcategories([...subcategories, formatted]);
    setNewSubcategory('');
    setError('');
  };

  const handleRemoveSubcategory = (indexToRemove: number) => {
    setSubcategories(subcategories.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    const finalCategory = isCustomCategory ? customCategory.trim() : category;
    if (!finalCategory || finalCategory === '__custom__') {
      setError('Please specify a valid category.');
      return;
    }

    if (!dueDate) {
      setError('Please select a due date.');
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      priority,
      category: finalCategory,
      subcategories,
      dueDate,
      completed: taskToEdit ? taskToEdit.completed : false,
      ...(taskToEdit && { id: taskToEdit.id }),
    });

    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur overlay */}
          <motion.div
            id="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/65 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            id="task-form-modal"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800/80 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {taskToEdit ? 'Modify Task Properties' : 'Initialize New Task'}
              </h2>
              <button
                id="close-form-btn"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="px-5 py-3 bg-rose-50 dark:bg-rose-950/30 border-b border-rose-100 dark:border-rose-950 flex items-center gap-2 text-rose-700 dark:text-rose-400 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Scrollable Form Body */}
            <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto flex-1 text-left">
              {/* Task Title */}
              <div>
                <label htmlFor="task-title-input" className="block text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider mb-1.5 font-mono">
                  Task Title <span className="text-rose-500">*</span>
                </label>
                <input
                  id="task-title-input"
                  type="text"
                  required
                  placeholder="e.g. Sync review presentation with team"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-sm transition-all shadow-xs"
                />
              </div>

              {/* Task Description */}
              <div>
                <label htmlFor="task-description-input" className="block text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider mb-1.5 font-mono">
                  Detailed Description
                </label>
                <textarea
                  id="task-description-input"
                  rows={3}
                  placeholder="Elaborate on the key deliverables, goals, or action steps..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-sm transition-all resize-none shadow-xs"
                />
              </div>

              {/* Grid: Priority, Category, Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Priority Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider mb-1.5 font-mono">
                    Priority Level
                  </label>
                  <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-205 dark:border-slate-800/80">
                    {(Object.values(Priority) as Priority[]).map((p) => {
                      const isActive = priority === p;
                      let activeStyle = '';
                      if (isActive) {
                        if (p === Priority.HIGH) activeStyle = 'bg-rose-500 text-white shadow-sm';
                        else if (p === Priority.MEDIUM) activeStyle = 'bg-amber-500 text-white shadow-sm';
                        else activeStyle = 'bg-emerald-500 text-white shadow-sm';
                      }

                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p)}
                          className={`flex-1 py-1.5 px-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                            isActive
                              ? activeStyle
                              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <label htmlFor="task-duedate-input" className="block text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider mb-1.5 font-mono">
                    Due Date <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="task-duedate-input"
                      type="date"
                      required
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 font-medium text-sm transition-all shadow-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Category selector */}
              <div>
                <label htmlFor="task-category-select" className="block text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider mb-1.5 font-mono">
                  Category Tag
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    id="task-category-select"
                    value={isCustomCategory ? '__custom__' : category}
                    onChange={(e) => {
                      if (e.target.value === '__custom__') {
                        setIsCustomCategory(true);
                      } else {
                        setIsCustomCategory(false);
                        setCategory(e.target.value);
                      }
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 font-medium text-sm transition-all shadow-xs"
                  >
                    {existingCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="__custom__">+ Add Custom Category...</option>
                  </select>

                  {isCustomCategory && (
                    <input
                      id="custom-category-input"
                      type="text"
                      placeholder="Enter category name..."
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 font-medium text-sm transition-all shadow-xs"
                    />
                  )}
                </div>
              </div>

              {/* Subcategories */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider mb-1.5 font-mono">
                  Subcategory Tags (Checklists / Subheadings)
                </label>
                <div className="flex gap-2 mb-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="task-subcategory-input"
                      type="text"
                      placeholder="Add sub-tag (e.g., Phase 1, Design, Urgent)"
                      value={newSubcategory}
                      onChange={(e) => setNewSubcategory(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const formatted = newSubcategory.trim();
                          if (formatted) {
                            if (subcategories.includes(formatted)) {
                              setError('Subcategory tag already added.');
                            } else {
                              setSubcategories([...subcategories, formatted]);
                              setNewSubcategory('');
                            }
                          }
                        }
                      }}
                      className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 font-medium text-sm transition-all"
                    />
                  </div>
                  <button
                    id="add-subcategory-btn"
                    type="button"
                    onClick={handleAddSubcategory}
                    className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-100 dark:border-indigo-900/65 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {/* Subcategories tags container */}
                {subcategories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 dark:bg-slate-950/45 rounded-xl border border-slate-200 dark:border-slate-800/60">
                    {subcategories.map((sub, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100/40 dark:border-indigo-900/40 text-xs font-semibold"
                      >
                        {sub}
                        <button
                          id={`remove-sub-${idx}`}
                          type="button"
                          onClick={() => handleRemoveSubcategory(idx)}
                          className="p-0.5 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-900/80 hover:text-indigo-900 dark:hover:text-indigo-100 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                         </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Footer Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-3 sticky bottom-0 bg-white dark:bg-slate-900">
                <button
                  id="cancel-form-btn"
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="save-task-btn"
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-650 hover:bg-indigo-600 rounded-xl cursor-pointer shadow-md shadow-indigo-100 dark:shadow-none transition-all focus:outline-none focus:ring-2 focus:ring-indigo-550"
                >
                  {taskToEdit ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
