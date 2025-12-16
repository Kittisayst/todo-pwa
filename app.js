// Modern Task Management App
class TaskApp {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.currentTaskId = null;
        this.init();
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
        this.render();
        this.updateDate();
        this.registerServiceWorker();
        this.setupInstallPrompt();
    }

    setupElements() {
        // Header
        this.currentDateEl = document.getElementById('current-date');
        this.searchBtn = document.getElementById('search-btn');
        
        // Filter tabs
        this.filterTabs = document.querySelectorAll('.filter-tab');
        
        // Task lists
        this.inProgressList = document.getElementById('in-progress-list');
        this.completedList = document.getElementById('completed-list');
        this.emptyState = document.getElementById('empty-state');
        
        // Bottom nav
        this.navBtns = document.querySelectorAll('.nav-btn');
        
        // FAB button
        this.addTaskBtn = document.getElementById('add-task-btn');
        
        // Task Modal
        this.taskModal = document.getElementById('task-modal');
        this.cancelBtn = document.getElementById('cancel-btn');
        this.saveBtn = document.getElementById('save-btn');
        this.taskTitleInput = document.getElementById('task-title-input');
        this.taskDetailsInput = document.getElementById('task-details-input');
        this.modalTitle = document.getElementById('modal-title');
        
        // Quick actions
        this.flagBtn = document.getElementById('flag-btn');
        this.tagsBtn = document.getElementById('tags-btn');
        this.remindBtn = document.getElementById('remind-btn');
        
        // Form sections
        this.dueDateSection = document.getElementById('due-date-section');
        this.dueDateValue = document.getElementById('due-date-value');
        this.listSection = document.getElementById('list-section');
        this.listValue = document.getElementById('list-value');
        
        // Priority
        this.priorityBtns = document.querySelectorAll('.priority-btn');
        
        // Tags
        this.tagsInputSection = document.getElementById('tags-input-section');
        this.tagsContainer = document.getElementById('tags-container');
        this.tagInput = document.getElementById('tag-input');
        
        // Subtasks
        this.subtasksSection = document.getElementById('subtasks-section');
        this.subtasksList = document.getElementById('subtasks-list');
        this.addSubtaskBtn = document.getElementById('add-subtask-btn');
        
        // Detail Modal
        this.detailModal = document.getElementById('detail-modal');
        this.backBtn = document.getElementById('back-btn');
        this.editBtn = document.getElementById('edit-btn');
        this.detailCheckbox = document.getElementById('detail-checkbox');
        this.detailTitle = document.getElementById('detail-title');
        this.detailPriority = document.getElementById('detail-priority');
        this.detailDueDate = document.getElementById('detail-due-date');
        this.detailDueTime = document.getElementById('detail-due-time');
        this.detailProject = document.getElementById('detail-project');
        this.detailCategory = document.getElementById('detail-category');
        this.detailTags = document.getElementById('detail-tags');
        this.detailNotes = document.getElementById('detail-notes');
        this.detailSubtasks = document.getElementById('detail-subtasks');
        this.deleteTaskBtn = document.getElementById('delete-task-btn');
        this.markCompleteBtn = document.getElementById('mark-complete-btn');
        
        // Install prompt
        this.installPrompt = document.getElementById('install-prompt');
        this.installBtn = document.getElementById('install-btn');
        this.dismissInstallBtn = document.getElementById('dismiss-install');
    }

    setupEventListeners() {
        // Filter tabs
        this.filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.setFilter(tab.dataset.filter);
            });
        });
        
        // Bottom nav
        this.navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.navBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
        
        // FAB button
        this.addTaskBtn.addEventListener('click', () => {
            this.openTaskModal();
        });
        
        // Task Modal
        this.cancelBtn.addEventListener('click', () => {
            this.closeTaskModal();
        });
        
        this.saveBtn.addEventListener('click', () => {
            this.saveTask();
        });
        
        // Quick actions
        this.tagsBtn.addEventListener('click', () => {
            this.tagsInputSection.style.display = 
                this.tagsInputSection.style.display === 'none' ? 'block' : 'none';
        });
        
        // Priority buttons
        this.priorityBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.priorityBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
        
        // Tag input
        this.tagInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && this.tagInput.value.trim()) {
                this.addTag(this.tagInput.value.trim());
                this.tagInput.value = '';
            }
        });
        
        // Add subtask
        this.addSubtaskBtn.addEventListener('click', () => {
            this.addSubtaskInput();
        });
        
        // Detail Modal
        this.backBtn.addEventListener('click', () => {
            this.closeDetailModal();
        });
        
        this.editBtn.addEventListener('click', () => {
            this.editCurrentTask();
        });
        
        this.deleteTaskBtn.addEventListener('click', () => {
            this.deleteCurrentTask();
        });
        
        this.markCompleteBtn.addEventListener('click', () => {
            this.toggleCurrentTaskComplete();
        });
        
        // Modal backdrop click
        [this.taskModal, this.detailModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeTaskModal();
                    this.closeDetailModal();
                }
            });
        });
    }

    updateDate() {
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        const date = new Date().toLocaleDateString('en-US', options);
        this.currentDateEl.textContent = date;
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        this.filterTabs.forEach(tab => {
            if (tab.dataset.filter === filter) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        this.render();
    }

    openTaskModal(task = null) {
        this.currentTaskId = task ? task.id : null;
        
        if (task) {
            this.modalTitle.textContent = 'Edit Task';
            this.taskTitleInput.value = task.title;
            this.taskDetailsInput.value = task.details || '';
            this.dueDateValue.textContent = task.dueDate || 'Today';
            this.listValue.textContent = task.list || 'Inbox';
            
            // Set priority
            this.priorityBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.priority === task.priority);
            });
            
            // Set tags
            if (task.tags && task.tags.length > 0) {
                this.tagsInputSection.style.display = 'block';
                this.tagsContainer.innerHTML = '';
                task.tags.forEach(tag => this.addTag(tag));
            }
            
            // Set subtasks
            if (task.subtasks && task.subtasks.length > 0) {
                this.subtasksSection.style.display = 'block';
                this.subtasksList.innerHTML = '';
                task.subtasks.forEach(subtask => {
                    this.addSubtaskInput(subtask.text, subtask.completed);
                });
            }
        } else {
            this.modalTitle.textContent = 'New Task';
            this.resetTaskModal();
        }
        
        this.taskModal.classList.add('show');
        this.taskTitleInput.focus();
    }

    closeTaskModal() {
        this.taskModal.classList.remove('show');
        this.resetTaskModal();
    }

    resetTaskModal() {
        this.taskTitleInput.value = '';
        this.taskDetailsInput.value = '';
        this.dueDateValue.textContent = 'Today';
        this.listValue.textContent = 'Inbox';
        this.priorityBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.priority === 'none');
        });
        this.tagsInputSection.style.display = 'none';
        this.subtasksSection.style.display = 'none';
        this.tagsContainer.innerHTML = '';
        this.subtasksList.innerHTML = '';
        this.currentTaskId = null;
    }

    saveTask() {
        const title = this.taskTitleInput.value.trim();
        if (!title) {
            alert('ກະລຸນາປ້ອນຊື່ວຽກ');
            return;
        }
        
        const activePriority = document.querySelector('.priority-btn.active');
        const priority = activePriority ? activePriority.dataset.priority : 'none';
        
        const tags = Array.from(this.tagsContainer.querySelectorAll('.tag-chip'))
            .map(chip => chip.textContent.trim().replace('×', '').trim());
        
        const subtasks = Array.from(this.subtasksList.querySelectorAll('.subtask-item'))
            .map(item => ({
                text: item.querySelector('.subtask-text').value,
                completed: item.querySelector('.subtask-checkbox').classList.contains('checked')
            }))
            .filter(s => s.text.trim());
        
        const taskData = {
            title,
            details: this.taskDetailsInput.value.trim(),
            priority,
            dueDate: this.dueDateValue.textContent,
            list: this.listValue.textContent,
            tags,
            subtasks,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        if (this.currentTaskId) {
            // Edit existing task
            const taskIndex = this.tasks.findIndex(t => t.id === this.currentTaskId);
            if (taskIndex !== -1) {
                this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...taskData };
            }
        } else {
            // Create new task
            taskData.id = Date.now();
            this.tasks.unshift(taskData);
        }
        
        this.saveTasks();
        this.render();
        this.closeTaskModal();
    }

    addTag(tagText) {
        const chip = document.createElement('div');
        chip.className = 'tag-chip';
        chip.innerHTML = `
            ${this.escapeHtml(tagText)}
            <button type="button">×</button>
        `;
        
        chip.querySelector('button').addEventListener('click', () => {
            chip.remove();
        });
        
        this.tagsContainer.appendChild(chip);
    }

    addSubtaskInput(text = '', completed = false) {
        this.subtasksSection.style.display = 'block';
        
        const item = document.createElement('div');
        item.className = 'subtask-item' + (completed ? ' completed' : '');
        item.innerHTML = `
            <div class="subtask-checkbox ${completed ? 'checked' : ''}"></div>
            <input type="text" class="subtask-text" value="${this.escapeHtml(text)}" placeholder="Subtask name...">
            <button type="button" class="text-btn" style="color: var(--color-danger);">×</button>
        `;
        
        const checkbox = item.querySelector('.subtask-checkbox');
        checkbox.addEventListener('click', () => {
            checkbox.classList.toggle('checked');
            item.classList.toggle('completed');
        });
        
        item.querySelector('button').addEventListener('click', () => {
            item.remove();
            if (this.subtasksList.children.length === 0) {
                this.subtasksSection.style.display = 'none';
            }
        });
        
        this.subtasksList.appendChild(item);
        if (!text) {
            item.querySelector('.subtask-text').focus();
        }
    }

    openDetailModal(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        this.currentTaskId = taskId;
        
        // Set title and checkbox
        this.detailTitle.textContent = task.title;
        this.detailCheckbox.classList.toggle('checked', task.completed);
        
        // Set priority
        if (task.priority && task.priority !== 'none') {
            this.detailPriority.className = 'detail-priority task-priority ' + task.priority;
            this.detailPriority.textContent = task.priority.toUpperCase() + ' PRIORITY';
            this.detailPriority.style.display = 'inline-flex';
        } else {
            this.detailPriority.style.display = 'none';
        }
        
        // Set due date
        this.detailDueDate.textContent = task.dueDate || 'Today';
        this.detailDueTime.textContent = task.dueTime || '10:00 AM';
        
        // Set project/list
        this.detailProject.textContent = task.list || 'Inbox';
        this.detailCategory.textContent = task.category || 'Personal';
        
        // Set tags
        const tagsSection = document.getElementById('detail-tags-section');
        if (task.tags && task.tags.length > 0) {
            tagsSection.style.display = 'block';
            this.detailTags.innerHTML = task.tags.map(tag => 
                `<span class="task-tag">${this.escapeHtml(tag)}</span>`
            ).join('');
        } else {
            tagsSection.style.display = 'none';
        }
        
        // Set notes
        const notesSection = document.getElementById('detail-notes-section');
        if (task.details) {
            notesSection.style.display = 'block';
            this.detailNotes.textContent = task.details;
        } else {
            notesSection.style.display = 'none';
        }
        
        // Set subtasks
        const subtasksSection = document.getElementById('detail-subtasks-section');
        if (task.subtasks && task.subtasks.length > 0) {
            subtasksSection.style.display = 'block';
            this.detailSubtasks.innerHTML = task.subtasks.map(subtask => `
                <div class="subtask-item ${subtask.completed ? 'completed' : ''}">
                    <div class="subtask-checkbox ${subtask.completed ? 'checked' : ''}"></div>
                    <span class="subtask-text">${this.escapeHtml(subtask.text)}</span>
                </div>
            `).join('');
        } else {
            subtasksSection.style.display = 'none';
        }
        
        // Update button text
        this.markCompleteBtn.innerHTML = task.completed ? `
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 18L18 6M6 6l12 12"/>
            </svg>
            <span>Mark as Incomplete</span>
        ` : `
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 6L9 17l-5-5"/>
            </svg>
            <span>Mark as Complete</span>
        `;
        
        this.detailModal.classList.add('show');
    }

    closeDetailModal() {
        this.detailModal.classList.remove('show');
        this.currentTaskId = null;
    }

    editCurrentTask() {
        const task = this.tasks.find(t => t.id === this.currentTaskId);
        if (task) {
            this.closeDetailModal();
            setTimeout(() => {
                this.openTaskModal(task);
            }, 300);
        }
    }

    deleteCurrentTask() {
        if (confirm('ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບວຽກນີ້?')) {
            this.tasks = this.tasks.filter(t => t.id !== this.currentTaskId);
            this.saveTasks();
            this.render();
            this.closeDetailModal();
        }
    }

    toggleCurrentTaskComplete() {
        const task = this.tasks.find(t => t.id === this.currentTaskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
            this.closeDetailModal();
        }
    }

    toggleTaskComplete(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }

    getFilteredTasks() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        return this.tasks.filter(task => {
            if (this.currentFilter === 'today') {
                // Show tasks due today
                return !task.completed;
            } else if (this.currentFilter === 'high') {
                return task.priority === 'high' && !task.completed;
            } else if (this.currentFilter === 'all') {
                return true;
            }
            return true;
        });
    }

    render() {
        const filteredTasks = this.getFilteredTasks();
        const inProgressTasks = filteredTasks.filter(t => !t.completed);
        const completedTasks = filteredTasks.filter(t => t.completed);
        
        // Render in progress tasks
        if (inProgressTasks.length > 0) {
            this.inProgressList.innerHTML = inProgressTasks.map(task => this.createTaskElement(task)).join('');
            this.emptyState.classList.remove('show');
        } else if (completedTasks.length === 0) {
            this.inProgressList.innerHTML = '';
            this.emptyState.classList.add('show');
        } else {
            this.inProgressList.innerHTML = '';
        }
        
        // Render completed tasks
        if (completedTasks.length > 0) {
            this.completedList.innerHTML = completedTasks.map(task => this.createTaskElement(task)).join('');
        } else {
            this.completedList.innerHTML = '';
        }
        
        // Add event listeners
        document.querySelectorAll('.task-item').forEach(item => {
            const taskId = parseInt(item.dataset.id);
            
            item.querySelector('.task-checkbox').addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleTaskComplete(taskId);
            });
            
            item.addEventListener('click', () => {
                this.openDetailModal(taskId);
            });
        });
    }

    createTaskElement(task) {
        const hasSubtasks = task.subtasks && task.subtasks.length > 0;
        const completedSubtasks = hasSubtasks ? task.subtasks.filter(s => s.completed).length : 0;
        
        return `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <div class="task-content">
                    <div class="task-checkbox ${task.completed ? 'checked' : ''}"></div>
                    <div class="task-info">
                        <div class="task-header">
                            <div class="task-title-group">
                                <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
                                ${task.details ? `<p class="task-description">${this.escapeHtml(task.details)}</p>` : ''}
                            </div>
                            ${task.priority && task.priority !== 'none' ? 
                                `<span class="task-priority ${task.priority}">${task.priority}</span>` : ''}
                        </div>
                        <div class="task-meta">
                            ${task.dueDate ? `
                                <span class="task-meta-item">
                                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="3" y="4" width="18" height="18" rx="2"/>
                                        <path d="M16 2v4M8 2v4M3 10h18"/>
                                    </svg>
                                    ${task.dueDate}
                                </span>
                            ` : ''}
                            ${task.list ? `
                                <span class="task-meta-item">
                                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                                    </svg>
                                    ${this.escapeHtml(task.list)}
                                </span>
                            ` : ''}
                            ${hasSubtasks ? `
                                <span class="task-meta-item">
                                    <svg width="16" height="16" fill="currentColor">
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                    ${completedSubtasks}/${task.subtasks.length}
                                </span>
                            ` : ''}
                        </div>
                        ${task.tags && task.tags.length > 0 ? `
                            <div class="task-tags">
                                ${task.tags.map(tag => `<span class="task-tag">${this.escapeHtml(tag)}</span>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveTasks() {
        localStorage.setItem('modern-tasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        const saved = localStorage.getItem('modern-tasks');
        return saved ? JSON.parse(saved) : this.getDefaultTasks();
    }

    getDefaultTasks() {
        return [
            {
                id: 1,
                title: 'Design System Audit',
                details: 'Review color contrast and typography scale across all mobile screens.',
                priority: 'high',
                dueDate: 'Today',
                dueTime: '2:00 PM',
                list: 'Mobile App',
                category: 'Design',
                tags: ['UX Research', 'Design'],
                completed: false,
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                title: 'Weekly Team Sync',
                details: 'Discuss Q3 goals and project updates',
                priority: 'medium',
                dueDate: 'Tomorrow',
                dueTime: '10:00 AM',
                list: 'Work',
                category: 'Meetings',
                tags: [],
                completed: false,
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                title: 'Grocery Shopping',
                details: '',
                priority: 'low',
                dueDate: 'Saturday',
                list: 'Personal',
                tags: [],
                completed: false,
                createdAt: new Date().toISOString()
            },
            {
                id: 4,
                title: 'Revamp Home Screen UI for V2 Launch',
                details: 'Review the current analytics data before starting the redesign. Focus on improving engagement metrics in the first fold.',
                priority: 'high',
                dueDate: 'Tomorrow',
                dueTime: '10:00 AM',
                list: 'Mobile App',
                category: 'Design System',
                tags: ['UX Research', 'Design'],
                subtasks: [
                    { text: 'Analyze Heatmaps', completed: true },
                    { text: 'Create Wireframes', completed: false },
                    { text: 'Review with Design Lead', completed: false }
                ],
                completed: false,
                createdAt: new Date().toISOString()
            },
            {
                id: 5,
                title: 'Pay Utilities',
                details: '',
                priority: 'none',
                dueDate: 'Yesterday',
                list: 'Personal',
                tags: [],
                completed: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 6,
                title: 'Call Mom',
                details: '',
                priority: 'none',
                dueDate: 'Sunday',
                list: 'Personal',
                tags: [],
                completed: true,
                createdAt: new Date().toISOString()
            }
        ];
    }

    // Service Worker Registration
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./service-worker.js')
                    .then(registration => {
                        console.log('Service Worker registered:', registration);
                    })
                    .catch(error => {
                        console.log('Service Worker registration failed:', error);
                    });
            });
        }
    }

    // Install Prompt
    setupInstallPrompt() {
        let deferredPrompt;
        
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return;
        }
        
        // Check if user dismissed before
        const dismissed = localStorage.getItem('install-prompt-dismissed');
        if (dismissed) {
            return;
        }
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Show install prompt after 3 seconds
            setTimeout(() => {
                this.installPrompt.classList.add('show');
            }, 3000);
        });
        
        this.installBtn.addEventListener('click', async () => {
            if (!deferredPrompt) return;
            
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            
            console.log(`User response: ${outcome}`);
            deferredPrompt = null;
            this.installPrompt.classList.remove('show');
        });
        
        this.dismissInstallBtn.addEventListener('click', () => {
            this.installPrompt.classList.remove('show');
            localStorage.setItem('install-prompt-dismissed', 'true');
        });
        
        window.addEventListener('appinstalled', () => {
            console.log('PWA installed');
            this.installPrompt.classList.remove('show');
        });
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    new TaskApp();
});