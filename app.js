// TodoList PWA Application
class TodoApp {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
        this.render();
        this.registerServiceWorker();
        this.setupInstallPrompt();
    }

    setupElements() {
        this.taskInput = document.getElementById('task-input');
        this.addTaskForm = document.getElementById('add-task-form');
        this.tasksList = document.getElementById('tasks-list');
        this.emptyState = document.getElementById('empty-state');
        this.totalTasksEl = document.getElementById('total-tasks');
        this.activeTasksEl = document.getElementById('active-tasks');
        this.completedTasksEl = document.getElementById('completed-tasks');
        this.clearCompletedBtn = document.getElementById('clear-completed-btn');
        this.filterTabs = document.querySelectorAll('.filter-tab');
    }

    setupEventListeners() {
        // Add task
        this.addTaskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        // Clear completed tasks
        this.clearCompletedBtn.addEventListener('click', () => {
            this.clearCompletedTasks();
        });

        // Filter tabs
        this.filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.setFilter(tab.dataset.filter);
            });
        });
    }

    addTask() {
        const text = this.taskInput.value.trim();
        if (!text) return;

        const task = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(task);
        this.saveTasks();
        this.render();
        this.taskInput.value = '';
        this.taskInput.focus();
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }

    deleteTask(id) {
        if (confirm('ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບວຽກນີ້?')) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.saveTasks();
            this.render();
        }
    }

    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;

        const taskElement = document.querySelector(`[data-id="${id}"]`);
        const taskTextEl = taskElement.querySelector('.task-text');

        // Create input element
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'task-edit-input';
        input.value = task.text;

        // Add editing class
        taskElement.classList.add('editing');

        // Insert input before task text
        taskTextEl.parentNode.insertBefore(input, taskTextEl);
        input.focus();
        input.select();

        const saveEdit = () => {
            const newText = input.value.trim();
            if (newText && newText !== task.text) {
                task.text = newText;
                this.saveTasks();
            }
            this.render();
        };

        input.addEventListener('blur', saveEdit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                saveEdit();
            } else if (e.key === 'Escape') {
                this.render();
            }
        });
    }

    clearCompletedTasks() {
        const completedCount = this.tasks.filter(t => t.completed).length;
        if (completedCount === 0) {
            alert('ບໍ່ມີວຽກທີ່ສຳເລັດແລ້ວໃຫ້ລຶບ');
            return;
        }

        if (confirm(`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບວຽກທີ່ສຳເລັດແລ້ວ ${completedCount} ລາຍການ?`)) {
            this.tasks = this.tasks.filter(t => !t.completed);
            this.saveTasks();
            this.render();
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;

        // Update active tab
        this.filterTabs.forEach(tab => {
            if (tab.dataset.filter === filter) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        this.render();
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(t => !t.completed);
            case 'completed':
                return this.tasks.filter(t => t.completed);
            default:
                return this.tasks;
        }
    }

    render() {
        const filteredTasks = this.getFilteredTasks();

        // Update statistics
        const totalTasks = this.tasks.length;
        const activeTasks = this.tasks.filter(t => !t.completed).length;
        const completedTasks = this.tasks.filter(t => t.completed).length;

        this.totalTasksEl.textContent = totalTasks;
        this.activeTasksEl.textContent = activeTasks;
        this.completedTasksEl.textContent = completedTasks;

        // Render tasks
        if (filteredTasks.length === 0) {
            this.tasksList.innerHTML = '';
            this.emptyState.classList.add('show');
        } else {
            this.emptyState.classList.remove('show');
            this.tasksList.innerHTML = filteredTasks.map(task => this.createTaskElement(task)).join('');

            // Add event listeners to task elements
            this.tasksList.querySelectorAll('.task-item').forEach(item => {
                const id = parseInt(item.dataset.id);

                item.querySelector('.task-checkbox').addEventListener('click', () => {
                    this.toggleTask(id);
                });

                item.querySelector('.edit-btn').addEventListener('click', () => {
                    this.editTask(id);
                });

                item.querySelector('.delete-btn').addEventListener('click', () => {
                    this.deleteTask(id);
                });
            });
        }
    }

    createTaskElement(task) {
        return `
            <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}"></div>
                <span class="task-text">${this.escapeHtml(task.text)}</span>
                <div class="task-actions">
                    <button class="task-btn edit-btn" title="ແກ້ໄຂ">✏️</button>
                    <button class="task-btn delete-btn" title="ລຶບ">🗑️</button>
                </div>
            </li>
        `;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveTasks() {
        localStorage.setItem('todolist-tasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        const saved = localStorage.getItem('todolist-tasks');
        return saved ? JSON.parse(saved) : [];
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
        const installPromptEl = document.getElementById('install-prompt');
        const installBtn = document.getElementById('install-btn');
        const dismissBtn = document.getElementById('dismiss-install');

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
                installPromptEl.classList.add('show');
            }, 3000);
        });

        installBtn.addEventListener('click', async () => {
            if (!deferredPrompt) return;

            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            console.log(`User response: ${outcome}`);
            deferredPrompt = null;
            installPromptEl.classList.remove('show');
        });

        dismissBtn.addEventListener('click', () => {
            installPromptEl.classList.remove('show');
            localStorage.setItem('install-prompt-dismissed', 'true');
        });

        window.addEventListener('appinstalled', () => {
            console.log('PWA installed');
            installPromptEl.classList.remove('show');
        });
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});