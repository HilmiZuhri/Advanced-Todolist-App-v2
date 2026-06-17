/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Task, Priority, AppNotification } from '../types';

/**
 * Gets a numeric value representing the priority of a task for sorting purposes
 */
export function getPriorityWeight(priority: Priority): number {
  switch (priority) {
    case Priority.HIGH:
      return 3;
    case Priority.MEDIUM:
      return 2;
    case Priority.LOW:
      return 1;
    default:
      return 0;
  }
}

/**
 * Formats a YYYY-MM-DD date string to a human-readable format
 */
export function formatHexDate(dateStr: string): string {
  if (!dateStr) return 'No due date';
  try {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    
    const date = new Date(year, month, day);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
}

/**
 * Checks if a YYYY-MM-DD date string is overdue, due today, or due tomorrow
 */
export function checkDeadlineStatus(dueDateStr: string): {
  isOverdue: boolean;
  isDueToday: boolean;
  isDueSoon: boolean; // Due in next 48 hours
} {
  if (!dueDateStr) {
    return { isOverdue: false, isDueToday: false, isDueSoon: false };
  }

  // Get current date stripped of time in local timezone
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDate = now.getDate();
  const todayStart = new Date(currentYear, currentMonth, currentDate).getTime();
  const todayEnd = todayStart + 24 * 60 * 60 * 1000 - 1;
  const tomorrowEnd = todayEnd + 24 * 60 * 60 * 1000;
  const twoDaysEnd = tomorrowEnd + 24 * 60 * 60 * 1000;

  try {
    const parts = dueDateStr.split('-');
    if (parts.length !== 3) return { isOverdue: false, isDueToday: false, isDueSoon: false };
    const dueYear = parseInt(parts[0], 10);
    const dueMonth = parseInt(parts[1], 10) - 1;
    const dueDay = parseInt(parts[2], 10);
    
    const dueTime = new Date(dueYear, dueMonth, dueDay).getTime();

    const isOverdue = dueTime < todayStart;
    const isDueToday = dueTime >= todayStart && dueTime <= todayEnd;
    const isDueSoon = dueTime > todayEnd && dueTime <= twoDaysEnd;

    return { isOverdue, isDueToday, isDueSoon };
  } catch (e) {
    return { isOverdue: false, isDueToday: false, isDueSoon: false };
  }
}

/**
 * Scans all pending tasks and generates relevant system notifications
 */
export function generateNotifications(tasks: Task[]): AppNotification[] {
  const activeTasks = tasks.filter(task => !task.completed);
  const notifications: AppNotification[] = [];

  activeTasks.forEach(task => {
    const { isOverdue, isDueToday, isDueSoon } = checkDeadlineStatus(task.dueDate);

    if (isOverdue) {
      notifications.push({
        id: `ndue-overdue-${task.id}`,
        taskId: task.id,
        taskTitle: task.title,
        type: 'overdue',
        message: `"${task.title}" is overdue! It was due on ${formatHexDate(task.dueDate)}.`,
        read: false,
        createdAt: new Date().toISOString()
      });
    } else if (isDueToday) {
      notifications.push({
        id: `ndue-today-${task.id}`,
        taskId: task.id,
        taskTitle: task.title,
        type: 'due-today',
        message: `"${task.title}" is due today! Complete it as soon as possible.`,
        read: false,
        createdAt: new Date().toISOString()
      });
    } else if (isDueSoon) {
      notifications.push({
        id: `ndue-soon-${task.id}`,
        taskId: task.id,
        taskTitle: task.title,
        type: 'due-soon',
        message: `"${task.title}" is due soon (by ${formatHexDate(task.dueDate)}).`,
        read: false,
        createdAt: new Date().toISOString()
      });
    }
  });

  return notifications;
}
