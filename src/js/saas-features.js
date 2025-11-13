// ============================================
// PROFESSIONAL SAAS FEATURES - PRODUCTION READY
// All real values, no demo data
// ============================================

class SaaSFeatures {
    constructor() {
        this.currentView = 'workspace';
        this.projects = [];
        this.generatedVideos = [];
        this.init();
    }

    init() {
        this.loadData();
        this.initCommandPalette();
        this.initProfileDropdown();
        this.initNotifications();
        this.initViewNavigation();
        this.initProjects();
        this.initKeyboardShortcuts();
    }

    loadData() {
        // Load real user data
        try {
            const videos = localStorage.getItem('generated_videos');
            if (videos) {
                this.generatedVideos = JSON.parse(videos);
            }
        } catch(e) {
            console.error('Failed to load generated videos:', e);
            this.generatedVideos = [];
        }

        try {
            const projects = localStorage.getItem('user_projects');
            if (projects) {
                this.projects = JSON.parse(projects);
            }
        } catch(e) {
            console.error('Failed to load user projects:', e);
            this.projects = [];
        }
    }

    // ========== COMMAND PALETTE ==========
    initCommandPalette() {
        const trigger = document.getElementById('commandPalette');
        const modal = document.getElementById('commandPaletteModal');
        const overlay = document.getElementById('commandPaletteOverlay');
        const input = document.getElementById('commandInput');

        if (!trigger || !modal || !overlay || !input) return;

        trigger.addEventListener('click', () => this.openCommandPalette());
        overlay.addEventListener('click', () => this.closeCommandPalette());

        input.addEventListener('input', (e) => {
            this.filterCommands(e.target.value);
        });

        // Command items click
        document.querySelectorAll('.command-item').forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                this.executeCommand(action);
                this.closeCommandPalette();
            });
        });
    }

    openCommandPalette() {
        const modal = document.getElementById('commandPaletteModal');
        const input = document.getElementById('commandInput');
        if (!modal || !input) return;

        modal.classList.remove('hidden');
        setTimeout(() => input.focus(), 100);
    }

    closeCommandPalette() {
        const modal = document.getElementById('commandPaletteModal');
        const input = document.getElementById('commandInput');
        if (!modal || !input) return;

        modal.classList.add('hidden');
        input.value = '';
        this.filterCommands('');
    }

    filterCommands(query) {
        const items = document.querySelectorAll('.command-item');
        const sections = document.querySelectorAll('.command-section');

        items.forEach(item => {
            const name = item.querySelector('.command-name')?.textContent.toLowerCase() || '';
            const desc = item.querySelector('.command-desc')?.textContent.toLowerCase() || '';
            const matches = name.includes(query.toLowerCase()) || desc.includes(query.toLowerCase());
            item.style.display = matches ? 'flex' : 'none';
        });

        sections.forEach(section => {
            const visibleItems = section.querySelectorAll('.command-item:not([style*="display: none"])');
            section.style.display = visibleItems.length > 0 ? 'block' : 'none';
        });
    }

    executeCommand(action) {
        const actions = {
            'generate': () => document.getElementById('generateBtn')?.click(),
            'save': () => document.getElementById('saveConfigBtn')?.click(),
            'export': () => window.advancedFeatures?.exportSettings(),
            'dashboard': () => this.showView('dashboardView'),
            'projects': () => this.showView('projectsView'),
            'analytics': () => this.showView('analyticsView'),
            'template-youtube': () => window.advancedFeatures?.applyTemplate('youtube-shorts'),
            'template-tiktok': () => window.advancedFeatures?.applyTemplate('tiktok')
        };

        const fn = actions[action];
        if (fn) {
            try {
                fn();
            } catch(e) {
                console.error('Command execution failed:', e);
            }
        }
    }

    // ========== PROFILE DROPDOWN ==========
    initProfileDropdown() {
        const profileBtn = document.getElementById('profileBtn');
        const profileMenu = document.getElementById('profileMenu');

        if (!profileBtn || !profileMenu) return;

        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileMenu.classList.toggle('hidden');
        });

        document.addEventListener('click', () => {
            profileMenu.classList.add('hidden');
        });

        profileMenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Menu links
        const links = {
            'dashboardLink': 'dashboardView',
            'projectsLink': 'projectsView',
            'analyticsLink': 'analyticsView'
        };

        Object.entries(links).forEach(([id, view]) => {
            const link = document.getElementById(id);
            if (link) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showView(view);
                    profileMenu.classList.add('hidden');
                });
            }
        });
    }

    // ========== NOTIFICATIONS ==========
    initNotifications() {
        const notifBtn = document.getElementById('notificationsBtn');
        const notifPanel = document.getElementById('notificationsPanel');

        if (!notifBtn || !notifPanel) return;

        notifBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notifPanel.classList.toggle('hidden');
        });

        document.addEventListener('click', () => {
            notifPanel.classList.add('hidden');
        });

        notifPanel.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Update notification count
        this.updateNotificationCount();
    }

    updateNotificationCount() {
        const badge = document.querySelector('.notification-badge');
        const unreadCount = document.querySelectorAll('.notification-item.unread').length;
        if (badge) {
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'flex' : 'none';
        }
    }

    // ========== VIEW NAVIGATION ==========
    initViewNavigation() {
        this.workspaceEl = document.querySelector('.workspace');
    }

    showView(viewId) {
        // Hide all views
        document.querySelectorAll('.view-container').forEach(v => {
            v.classList.add('hidden');
        });

        // Show/hide workspace
        if (viewId === 'workspace') {
            if (this.workspaceEl) {
                this.workspaceEl.classList.remove('hidden');
            }
            this.currentView = 'workspace';
        } else {
            if (this.workspaceEl) {
                this.workspaceEl.classList.add('hidden');
            }
            const view = document.getElementById(viewId);
            if (view) {
                view.classList.remove('hidden');

                // Update view-specific content
                if (viewId === 'dashboardView') {
                    this.updateDashboard();
                } else if (viewId === 'projectsView') {
                    this.renderProjects();
                }
            }
            this.currentView = viewId;
        }

        // Close dropdowns
        const profileMenu = document.getElementById('profileMenu');
        if (profileMenu) profileMenu.classList.add('hidden');
    }

    // ========== DASHBOARD ==========
    updateDashboard() {
        // Calculate real statistics
        const videoCount = this.generatedVideos.length;
        const totalDuration = this.calculateTotalDuration();
        const storageUsed = this.calculateStorageUsed();

        // Update stat cards
        this.updateStatCard('.stat-card:nth-child(1) .stat-value', videoCount);
        this.updateStatCard('.stat-card:nth-child(2) .stat-value', this.formatDuration(totalDuration));
        this.updateStatCard('.stat-card:nth-child(3) .stat-value', this.formatStorage(storageUsed));
        this.updateStatCard('.stat-card:nth-child(4) .stat-value', '-');

        // Update activity from history
        this.updateActivityFeed();
    }

    calculateTotalDuration() {
        return this.generatedVideos.reduce((total, video) => {
            return total + (video.duration || 0);
        }, 0);
    }

    calculateStorageUsed() {
        return this.generatedVideos.reduce((total, video) => {
            return total + (video.size || 0);
        }, 0);
    }

    formatDuration(seconds) {
        if (seconds < 60) return `${Math.round(seconds)}s`;
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        if (hours > 0) return `${hours}.${Math.floor((minutes % 60) / 6)}h`;
        return `${minutes}m`;
    }

    formatStorage(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }

    updateStatCard(selector, value) {
        const el = document.querySelector(selector);
        if (el) el.textContent = value;
    }

    updateActivityFeed() {
        const activityList = document.querySelector('.activity-list');
        if (!activityList) return;

        const recentHistory = window.advancedFeatures?.recentHistory || [];

        if (recentHistory.length === 0) {
            activityList.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--text-light);">No activity yet</p>';
            return;
        }

        activityList.innerHTML = recentHistory.slice(0, 5).map(entry => `
            <div class="activity-item">
                <div class="activity-icon">📝</div>
                <div class="activity-content">
                    <div class="activity-title">${entry.action}</div>
                    <div class="activity-time">${this.timeAgo(entry.timestamp)}</div>
                </div>
            </div>
        `).join('');
    }

    timeAgo(timestamp) {
        const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    }

    // ========== PROJECTS ==========
    initProjects() {
        const newProjectBtn = document.getElementById('newProjectBtn');
        const projectSearch = document.getElementById('projectSearch');

        if (newProjectBtn) {
            newProjectBtn.addEventListener('click', () => this.createNewProject());
        }

        if (projectSearch) {
            projectSearch.addEventListener('input', (e) => this.filterProjects(e.target.value));
        }
    }

    renderProjects() {
        const grid = document.getElementById('projectsGrid');
        if (!grid) return;

        if (this.projects.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: var(--text-light);">
                    <div style="font-size: 64px; margin-bottom: 1rem;">📁</div>
                    <h3 style="font-size: 20px; margin-bottom: 0.5rem;">No Projects Yet</h3>
                    <p style="margin-bottom: 1.5rem;">Create your first project to organize your videos</p>
                    <button class="btn btn-primary" onclick="window.saasFeatures.createNewProject()">+ Create Project</button>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.projects.map(project => `
            <div class="project-card" onclick="window.saasFeatures.openProject(${project.id})">
                <div class="project-thumbnail">${project.thumbnail || '📁'}</div>
                <div class="project-title">${project.name}</div>
                <div class="project-meta">
                    <span>${project.type || 'General'}</span>
                    <span>•</span>
                    <span>${project.videos || 0} videos</span>
                </div>
            </div>
        `).join('');
    }

    createNewProject() {
        const name = prompt('Enter project name:');
        if (!name) return;

        const project = {
            id: Date.now(),
            name,
            type: 'General',
            thumbnail: '📁',
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            videos: 0,
            settings: {}
        };

        this.projects.unshift(project);
        this.saveProjects();
        this.renderProjects();

        if (window.advancedFeatures) {
            window.advancedFeatures.showToast('success', 'Project Created', `"${name}" created successfully`);
        }
    }

    openProject(id) {
        const project = this.projects.find(p => p.id === id);
        if (!project) return;

        this.showView('workspace');

        if (window.advancedFeatures) {
            window.advancedFeatures.showToast('info', 'Project Opened', `Working on "${project.name}"`);
        }
    }

    filterProjects(query) {
        const cards = document.querySelectorAll('.project-card');
        cards.forEach(card => {
            const title = card.querySelector('.project-title')?.textContent.toLowerCase() || '';
            const matches = title.includes(query.toLowerCase());
            card.style.display = matches ? 'block' : 'none';
        });
    }

    saveProjects() {
        try {
            localStorage.setItem('user_projects', JSON.stringify(this.projects));
        } catch(e) {
            console.error('Failed to save projects:', e);
        }
    }

    // ========== KEYBOARD SHORTCUTS ==========
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Command Palette: Cmd/Ctrl + K
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                this.openCommandPalette();
            }

            // Close: Escape
            if (e.key === 'Escape') {
                const modal = document.getElementById('commandPaletteModal');
                if (modal && !modal.classList.contains('hidden')) {
                    this.closeCommandPalette();
                }
            }
        });
    }

    // ========== PUBLIC API ==========
    addGeneratedVideo(videoData) {
        this.generatedVideos.push({
            ...videoData,
            timestamp: new Date().toISOString()
        });

        try {
            localStorage.setItem('generated_videos', JSON.stringify(this.generatedVideos));
        } catch(e) {
            console.error('Failed to save generated video:', e);
        }
    }
}

// Global function
function showView(viewId) {
    if (window.saasFeatures) {
        window.saasFeatures.showView(viewId);
    }
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.saasFeatures = new SaaSFeatures();
    });
} else {
    window.saasFeatures = new SaaSFeatures();
}
