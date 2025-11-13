// ============================================
// ADVANCED QUALITY OF LIFE FEATURES (20+)
// ============================================

class AdvancedFeatures {
    constructor() {
        this.undoStack = [];
        this.redoStack = [];
        this.maxUndoSteps = 50;
        this.favorites = [];
        this.recentHistory = [];
        this.templates = {};
        this.canvasZoom = 1;
        this.playbackSpeed = 1;
        this.captureStateTimeout = null;
        this.toastTimeout = null;
        this.eventListeners = [];
        this.init();
    }

    init() {
        this.loadFavorites();
        this.loadTemplates();
        this.loadRecentHistory();
        this.initFeatures();
        this.initEventListeners();
    }

    // ========== FEATURE 1-3: UNDO/REDO SYSTEM ==========
    captureState() {
        const state = this.getCurrentSettings();
        this.undoStack.push(JSON.parse(JSON.stringify(state)));
        if (this.undoStack.length > this.maxUndoSteps) {
            this.undoStack.shift();
        }
        this.redoStack = [];
        this.updateUndoRedoButtons();
    }

    undo() {
        if (this.undoStack.length === 0) return;

        const currentState = this.getCurrentSettings();
        this.redoStack.push(currentState);

        const previousState = this.undoStack.pop();
        this.applySettings(previousState);
        this.updateUndoRedoButtons();
        this.showToast('success', 'Undo', 'Reverted to previous state');
    }

    redo() {
        if (this.redoStack.length === 0) return;

        const currentState = this.getCurrentSettings();
        this.undoStack.push(currentState);

        const nextState = this.redoStack.pop();
        this.applySettings(nextState);
        this.updateUndoRedoButtons();
        this.showToast('success', 'Redo', 'Restored next state');
    }

    updateUndoRedoButtons() {
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');
        if (undoBtn) undoBtn.disabled = this.undoStack.length === 0;
        if (redoBtn) redoBtn.disabled = this.redoStack.length === 0;
    }

    // ========== FEATURE 4-6: COPY/PASTE/EXPORT SETTINGS ==========
    async copySettings() {
        const settings = this.getCurrentSettings();
        const json = JSON.stringify(settings, null, 2);

        try {
            await navigator.clipboard.writeText(json);
            this.showToast('success', 'Copied', 'Settings copied to clipboard');
        } catch (err) {
            this.showToast('error', 'Error', 'Failed to copy settings');
        }
    }

    async pasteSettings() {
        try {
            const text = await navigator.clipboard.readText();
            const settings = JSON.parse(text);
            this.captureState();
            this.applySettings(settings);
            this.showToast('success', 'Pasted', 'Settings loaded from clipboard');
        } catch (err) {
            this.showToast('error', 'Error', 'Invalid settings in clipboard');
        }
    }

    exportSettings() {
        const settings = this.getCurrentSettings();
        const json = JSON.stringify(settings, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wouldyourather-settings-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('success', 'Exported', 'Settings saved as JSON file');
    }

    // ========== FEATURE 7-9: FAVORITES SYSTEM ==========
    saveFavorite() {
        const name = prompt('Enter a name for this favorite:');
        if (!name || !name.trim()) return;

        // Limit name length
        const cleanName = name.trim().substring(0, 50);

        const settings = this.getCurrentSettings();
        const favorite = {
            id: Date.now(),
            name: cleanName,
            settings,
            timestamp: new Date().toISOString()
        };

        this.favorites.push(favorite);
        try {
            localStorage.setItem('favorites', JSON.stringify(this.favorites));
            this.showToast('success', 'Saved', `Favorite "${cleanName}" saved`);
            this.updateFavoritesList();
        } catch (e) {
            console.error('Failed to save favorite:', e);
            this.showToast('error', 'Error', 'Failed to save favorite');
        }
    }

    loadFavorite(id) {
        const favorite = this.favorites.find(f => f.id === id);
        if (!favorite) return;

        this.captureState();
        this.applySettings(favorite.settings);
        this.showToast('success', 'Loaded', `Loaded favorite "${favorite.name}"`);
    }

    deleteFavorite(id) {
        this.favorites = this.favorites.filter(f => f.id !== id);
        try {
            localStorage.setItem('favorites', JSON.stringify(this.favorites));
            this.updateFavoritesList();
            this.showToast('info', 'Deleted', 'Favorite removed');
        } catch (e) {
            console.error('Failed to delete favorite:', e);
        }
    }

    loadFavorites() {
        try {
            const saved = localStorage.getItem('favorites');
            if (saved) {
                this.favorites = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Failed to load favorites:', e);
            this.favorites = [];
        }
    }

    updateFavoritesList() {
        const container = document.getElementById('favoritesList');
        if (!container) return;

        if (this.favorites.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-light);">No favorites saved yet</p>';
            return;
        }

        container.innerHTML = this.favorites.map(fav => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; background: var(--surface); border: 1px solid var(--border); border-radius: 6px;">
                <div style="flex: 1;">
                    <div style="font-weight: 600; font-size: 14px;">${fav.name}</div>
                    <div style="font-size: 11px; color: var(--text-lighter);">${new Date(fav.timestamp).toLocaleString()}</div>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-sm" onclick="window.advancedFeatures.loadFavorite(${fav.id})">Load</button>
                    <button class="btn btn-sm" onclick="window.advancedFeatures.deleteFavorite(${fav.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    // ========== FEATURE 10-12: TEMPLATES SYSTEM ==========
    loadTemplates() {
        try {
            const saved = localStorage.getItem('templates');
            if (saved) {
                this.templates = JSON.parse(saved);
            } else {
                this.templates = this.getDefaultTemplates();
            }
        } catch (e) {
            console.error('Failed to load templates:', e);
            this.templates = this.getDefaultTemplates();
        }
    }

    getDefaultTemplates() {
        return {
            'youtube-shorts': { questionCount: 5, fontSize: 'large', aspectRatio: '9:16', fps: 30 },
            'tiktok': { questionCount: 3, fontSize: 'xl', aspectRatio: '9:16', fps: 60 },
            'instagram-reels': { questionCount: 4, fontSize: 'large', aspectRatio: '9:16', fps: 30 },
            'professional': { questionCount: 10, fontSize: 'medium', aspectRatio: '16:9', fps: 30 },
            'minimalist': { fontSize: 'medium', textColor: '#000000', bgColor: '#ffffff' },
            'colorful': { fontSize: 'xl', textColor: '#ffffff', imageFilter: 'none' }
        };
    }

    applyTemplate(templateId) {
        const template = this.templates[templateId];
        if (!template) return;

        this.captureState();
        this.applySettings(template);
        this.showToast('success', 'Template Applied', `Loaded ${templateId} template`);
    }

    saveCustomTemplate() {
        const name = prompt('Enter template name:');
        if (!name || !name.trim()) return;

        const cleanName = name.trim().substring(0, 30);
        const settings = this.getCurrentSettings();
        this.templates[cleanName.toLowerCase().replace(/\s+/g, '-')] = settings;

        try {
            localStorage.setItem('templates', JSON.stringify(this.templates));
            this.showToast('success', 'Template Saved', `Template "${cleanName}" saved`);
        } catch (e) {
            console.error('Failed to save template:', e);
            this.showToast('error', 'Error', 'Failed to save template');
        }
    }

    // ========== FEATURE 13-15: RECENT HISTORY ==========
    addToHistory(action) {
        const entry = {
            id: Date.now(),
            action,
            timestamp: new Date().toISOString(),
            settings: this.getCurrentSettings()
        };

        this.recentHistory.unshift(entry);
        if (this.recentHistory.length > 10) {
            this.recentHistory = this.recentHistory.slice(0, 10);
        }

        try {
            localStorage.setItem('recentHistory', JSON.stringify(this.recentHistory));
            this.updateRecentHistory();
        } catch (e) {
            console.error('Failed to save history:', e);
        }
    }

    loadRecentHistory() {
        try {
            const saved = localStorage.getItem('recentHistory');
            if (saved) {
                this.recentHistory = JSON.parse(saved);
                this.updateRecentHistory();
            }
        } catch (e) {
            console.error('Failed to load history:', e);
            this.recentHistory = [];
        }
    }

    updateRecentHistory() {
        const container = document.getElementById('recentHistory');
        if (!container) return;

        if (this.recentHistory.length === 0) {
            container.innerHTML = '<p style="padding: 0.5rem; text-align: center;">No recent projects</p>';
            return;
        }

        container.innerHTML = this.recentHistory.map(entry => `
            <div style="padding: 0.5rem; border-bottom: 1px solid var(--border); cursor: pointer; transition: background 150ms;"
                 onclick="window.advancedFeatures.loadFromHistory(${entry.id})"
                 onmouseover="this.style.background='var(--surface)'"
                 onmouseout="this.style.background='transparent'">
                <div style="font-size: 12px; font-weight: 500;">${entry.action}</div>
                <div style="font-size: 10px; color: var(--text-lighter);">${this.timeAgo(entry.timestamp)}</div>
            </div>
        `).join('');
    }

    loadFromHistory(id) {
        const entry = this.recentHistory.find(e => e.id === id);
        if (!entry) return;

        this.captureState();
        this.applySettings(entry.settings);
        this.showToast('info', 'Loaded', 'Settings restored from history');
    }

    timeAgo(timestamp) {
        const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    }

    // ========== FEATURE 16-18: PREVIEW CONTROLS ==========
    toggleFullscreen() {
        const canvas = document.getElementById('previewCanvas');
        if (!canvas) return;

        if (!document.fullscreenElement) {
            canvas.requestFullscreen().catch(err => {
                this.showToast('error', 'Fullscreen Error', 'Could not enter fullscreen');
            });
            this.showToast('info', 'Fullscreen', 'Press ESC to exit');
        } else {
            document.exitFullscreen();
        }
    }

    zoomIn() {
        this.canvasZoom = Math.min(this.canvasZoom + 0.1, 2);
        this.applyCanvasZoom();
        this.showToast('info', 'Zoom', `${Math.round(this.canvasZoom * 100)}%`);
    }

    zoomOut() {
        this.canvasZoom = Math.max(this.canvasZoom - 0.1, 0.5);
        this.applyCanvasZoom();
        this.showToast('info', 'Zoom', `${Math.round(this.canvasZoom * 100)}%`);
    }

    applyCanvasZoom() {
        const container = document.querySelector('.canvas-container');
        if (container) {
            container.style.transform = `scale(${this.canvasZoom})`;
        }
    }

    changePlaybackSpeed(speed) {
        this.playbackSpeed = parseFloat(speed);
        // Apply to video playback (implement based on your video player)
        this.showToast('info', 'Playback Speed', `${speed}x`);
    }

    // ========== FEATURE 19-21: NOTIFICATION SYSTEM ==========
    showToast(type, title, message, duration = 3000) {
        const toast = document.getElementById('notificationToast');
        const toastIcon = document.getElementById('toastIcon');
        const toastTitle = document.getElementById('toastTitle');
        const toastMessage = document.getElementById('toastMessage');

        if (!toast) return;

        // Set icon
        const icons = {
            success: '✓',
            error: '✕',
            info: 'ℹ',
            warning: '⚠'
        };
        toastIcon.textContent = icons[type] || 'ℹ';
        toastIcon.className = `toast-icon toast-${type}`;

        toastTitle.textContent = title;
        toastMessage.textContent = message;

        toast.classList.remove('hidden', 'toast-exit');

        // Clear existing timeout
        if (this.toastTimeout) {
            clearTimeout(this.toastTimeout);
            this.toastTimeout = null;
        }

        // Auto-hide
        this.toastTimeout = setTimeout(() => {
            toast.classList.add('toast-exit');
            setTimeout(() => toast.classList.add('hidden'), 300);
            this.toastTimeout = null;
        }, duration);
    }

    // ========== FEATURE 22-24: SETTINGS HELPERS ==========
    getCurrentSettings() {
        return {
            unsplashKey: document.getElementById('unsplashKey')?.value || '',
            elevenlabsKey: document.getElementById('elevenlabsKey')?.value || '',
            voiceSelect: document.getElementById('voiceSelect')?.value || '',
            musicVolume: document.getElementById('musicVolume')?.value || '30',
            voiceSpeed: document.getElementById('voiceSpeed')?.value || '1',
            questionCount: document.getElementById('questionCount')?.value || '3',
            questionDuration: document.getElementById('questionDuration')?.value || '3',
            optionDuration: document.getElementById('optionDuration')?.value || '2',
            pauseDuration: document.getElementById('pauseDuration')?.value || '1',
            transitionSpeed: document.getElementById('transitionSpeed')?.value || '0.5',
            textColor: document.getElementById('textColor')?.value || '#ffffff',
            bgColor: document.getElementById('bgColor')?.value || '#000000',
            fontSize: document.getElementById('fontSize')?.value || 'medium',
            imageFilter: document.getElementById('imageFilter')?.value || 'none',
            imageZoom: document.getElementById('imageZoom')?.value || '1.2',
            videoQuality: document.getElementById('videoQuality')?.value || '1080',
            fps: document.getElementById('fps')?.value || '30',
            aspectRatio: document.getElementById('aspectRatio')?.value || '9:16',
            commentEngagement: document.getElementById('commentEngagement')?.checked || false,
            shareEngagement: document.getElementById('shareEngagement')?.checked || false,
            followEngagement: document.getElementById('followEngagement')?.checked || false,
            likeEngagement: document.getElementById('likeEngagement')?.checked || false,
        };
    }

    applySettings(settings) {
        Object.keys(settings).forEach(key => {
            const el = document.getElementById(key);
            if (!el) return;

            if (el.type === 'checkbox') {
                el.checked = settings[key];
            } else {
                el.value = settings[key];
            }

            // Trigger display updates
            el.dispatchEvent(new Event('input'));
            el.dispatchEvent(new Event('change'));
        });
    }

    // ========== INITIALIZE EVENT LISTENERS ==========
    initEventListeners() {
        // Undo/Redo
        document.getElementById('undoBtn')?.addEventListener('click', () => this.undo());
        document.getElementById('redoBtn')?.addEventListener('click', () => this.redo());

        // Copy/Paste/Export
        document.getElementById('copySettingsBtn')?.addEventListener('click', () => this.copySettings());
        document.getElementById('pasteSettingsBtn')?.addEventListener('click', () => this.pasteSettings());
        document.getElementById('exportJsonBtn')?.addEventListener('click', () => this.exportSettings());

        // Favorites
        document.getElementById('favoritesBtn')?.addEventListener('click', () => {
            const modal = document.getElementById('favoritesModal');
            modal?.classList.remove('hidden');
            this.updateFavoritesList();
        });

        document.getElementById('closeFavorites')?.addEventListener('click', () => {
            document.getElementById('favoritesModal')?.classList.add('hidden');
        });

        document.getElementById('favoritesOverlay')?.addEventListener('click', () => {
            document.getElementById('favoritesModal')?.classList.add('hidden');
        });

        // Add to favorites button (you need to add this to the UI)
        const addFavoriteBtn = document.createElement('button');
        addFavoriteBtn.className = 'btn btn-sm';
        addFavoriteBtn.textContent = '💾 Add to Favorites';
        addFavoriteBtn.onclick = () => this.saveFavorite();

        // Templates
        document.getElementById('templateSelect')?.addEventListener('change', (e) => {
            if (e.target.value) {
                this.applyTemplate(e.target.value);
                e.target.value = '';
            }
        });

        document.getElementById('saveTemplateBtn')?.addEventListener('click', () => this.saveCustomTemplate());

        // Preview controls
        document.getElementById('fullscreenBtn')?.addEventListener('click', () => this.toggleFullscreen());
        document.getElementById('zoomInBtn')?.addEventListener('click', () => this.zoomIn());
        document.getElementById('zoomOutBtn')?.addEventListener('click', () => this.zoomOut());
        document.getElementById('playbackSpeed')?.addEventListener('change', (e) => this.changePlaybackSpeed(e.target.value));

        // Toast close
        document.getElementById('toastClose')?.addEventListener('click', () => {
            const toast = document.getElementById('notificationToast');
            toast?.classList.add('hidden');
        });

        // Capture state on input changes with debouncing (500ms)
        document.querySelectorAll('input, select').forEach(input => {
            const handler = () => {
                // Clear existing timeout
                if (this.captureStateTimeout) {
                    clearTimeout(this.captureStateTimeout);
                }

                // Debounce state capture
                this.captureStateTimeout = setTimeout(() => {
                    this.captureState();
                    this.captureStateTimeout = null;
                }, 500);
            };

            input.addEventListener('change', handler);
            this.eventListeners.push({ element: input, event: 'change', handler });
        });

        // Keyboard shortcuts for new features
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            if (e.ctrlKey || e.metaKey) {
                switch(e.key.toLowerCase()) {
                    case 'z':
                        e.preventDefault();
                        this.undo();
                        break;
                    case 'y':
                        e.preventDefault();
                        this.redo();
                        break;
                    case 'c':
                        e.preventDefault();
                        this.copySettings();
                        break;
                    case 'v':
                        e.preventDefault();
                        this.pasteSettings();
                        break;
                }
            } else {
                switch(e.key.toLowerCase()) {
                    case 'f':
                        e.preventDefault();
                        this.toggleFullscreen();
                        break;
                    case 'arrowleft':
                        // Previous frame
                        break;
                    case 'arrowright':
                        // Next frame
                        break;
                }
            }
        });
    }

    initFeatures() {
        this.updateUndoRedoButtons();
        this.updateFavoritesList();
        this.updateRecentHistory();

        // Add welcome toast (optional, could be commented out)
        // setTimeout(() => {
        //     this.showToast('info', 'Welcome Back!', 'All your settings have been restored', 4000);
        // }, 500);
    }

    // Cleanup method
    cleanup() {
        // Clear timeouts
        if (this.captureStateTimeout) {
            clearTimeout(this.captureStateTimeout);
            this.captureStateTimeout = null;
        }

        if (this.toastTimeout) {
            clearTimeout(this.toastTimeout);
            this.toastTimeout = null;
        }

        // Remove event listeners
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
    }
}

// Initialize advanced features
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.advancedFeatures = new AdvancedFeatures();
    });
} else {
    window.advancedFeatures = new AdvancedFeatures();
}
