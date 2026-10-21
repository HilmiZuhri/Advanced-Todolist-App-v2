# 📋 Advanced Todo List

A modern, responsive, and feature-rich Task Management & Todo application built with **React 19**, **TypeScript**, and **Tailwind CSS**. Designed for peak personal and professional productivity, it features interactive **List** and **Kanban Board** views, intuitive drag-and-drop interactions, rich task attributes, smart deadline notifications, advanced filtering/sorting, and seamless **Dark/Light Mode** support.

---

## ✨ Key Features

### 1. 🔄 Dual Layout Modes
- **List View**: A sleek, structured view displaying task deadlines, categories, and subcategory tags. Features **interactive priority drop zones** at the top that allow you to quickly change a task's priority (*Low*, *Medium*, *High*) via drag-and-drop.
- **Kanban Board View**: A visual workflow divided into three dynamic columns:
  - 📝 **To Do**
  - 🔥 **In Focus & Urgent**
  - ✅ **Completed**
  Offers smooth drag-and-drop between columns to update task completion and priority status on the fly.

### 2. 🏷️ Rich Task Attributes & Subcategories
- **Title & Detailed Notes**: Capture context and notes for every deliverable.
- **Priority Levels**: Three distinct priority tiers (*Low*, *Medium*, *High*) with clear visual badges.
- **Main Categories & Dynamic Subcategories**: Organize tasks into top-level categories (*Work*, *Personal*, *Shopping*, *Finance*, etc.) plus unlimited custom sub-tags (e.g., *Presentation*, *Q2 Plan*, *Health*).
- **Smart Due Date Tracking**:
  - 🔴 **Overdue**: Flags tasks whose deadline has passed.
  - 🟠 **Due Today**: Highlights items that need immediate attention today.
  - 🟡 **Due Soon**: Warns of tasks due within the next 24 hours.

### 3. 🔔 Intelligent Notification & Reminder Panel
- Dedicated notification center badge with real-time count of urgent and overdue items.
- Click any notification to automatically navigate and **highlight** the relevant task card on your screen.
- Mark individual notifications or all alerts as read.

### 4. 🔍 Instant Search, Filters & Sorting
- **Real-Time Search**: Search across task titles, descriptions, and custom subcategory tags.
- **Status Filtering**: Filter by *All*, *Active*, or *Completed* tasks.
- **Category Filtering**: Easily narrow down tasks by their assigned category.
- **Flexible Sorting**: Sort tasks by *Priority*, *Due Date*, or *Creation Date* in ascending or descending order.

### 5. 💾 Persistent Local Storage
- All tasks, changes, and theme preferences are automatically preserved in the browser's `localStorage` — no data loss upon page refresh or closing the tab.

### 6. 🌙 Dark & Light Themes
- Built-in theme switcher with smooth transitions, customized color palettes, and full dark-mode compliance.

---

## 🛠️ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **[React 19](https://react.dev/)** | Frontend component framework |
| **[TypeScript](https://www.typescriptlang.org/)** | Strict type safety and maintainable architecture |
| **[Vite 6](https://vitejs.dev/)** | Fast dev server and optimized production bundler |
| **[Tailwind CSS v4](https://tailwindcss.com/)** | Modern utility-first styling |
| **[Motion](https://motion.dev/)** | Fluid animations, transitions, and layout effects |
| **[Lucide React](https://lucide.dev/)** | Clean, lightweight icon suite |

---
## 💡 How to Use

1. **Creating a Task**:
   - Click the **"+ New Task"** button in the header.
   - Enter a title, description, priority (*Low*, *Medium*, *High*), category, and target due date.
   - Type a custom subcategory and press **Enter** (or click **Add**) to tag your task.
   - Click **"Create Task"**.

2. **Switching Views**:
   - Use the **List** and **Board** icons in the top navigation bar to toggle between the tabular list view and the 3-column Kanban board.

3. **Drag-and-Drop Operations**:
   - **Board View**: Drag task cards across columns (*To Do*, *In Focus & Urgent*, *Completed*) to update their status immediately.
   - **List View**: Drag a task card to reveal the priority drop targets at the top (*High*, *Medium*, *Low*) and release to re-prioritize.

4. **Filtering and Sorting**:
   - Type in the search box to find tasks by keyword or tag.
   - Use the Category and Status pills to filter matching items.
   - Click **Sort** to order tasks by deadline or priority.

5. **Checking Notifications**:
   - Click the bell icon (**🔔**) in the upper-right corner to review overdue tasks and upcoming deadlines.
   - Click any notification item to jump directly to and highlight that task.

---
