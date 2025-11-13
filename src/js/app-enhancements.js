// ============================================
// QUALITY OF LIFE ENHANCEMENTS
// Autosave, Drag & Drop, Keyboard Shortcuts
// ============================================

class AppEnhancements {
    constructor() {
        this.autosaveInterval = null;
        this.lastSaveTime = null;
        this.saveTimeout = null;
        this.statusTimeouts = [];
        this.eventListeners = [];
        this.init();
    }

    init() {
        this.initAutosave();
        this.initDragDrop();
        this.initKeyboardShortcuts();
        this.initTooltips();
        this.loadSavedSettings();
    }

    // ========== CLEANUP ==========
    cleanup() {
        // Clear intervals
        if (this.autosaveInterval) {
            clearInterval(this.autosaveInterval);
            this.autosaveInterval = null;
        }

        // Clear timeouts
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
            this.saveTimeout = null;
        }

        this.statusTimeouts.forEach(timeout => clearTimeout(timeout));
        this.statusTimeouts = [];

        // Remove event listeners
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
    }

    // ========== AUTOSAVE ==========
    initAutosave() {
        // Clear existing interval to prevent race condition
        if (this.autosaveInterval) {
            clearInterval(this.autosaveInterval);
        }

        // Autosave every 30 seconds
        this.autosaveInterval = setInterval(() => {
            this.saveSettings();
            this.updateAutosaveStatus('saved');
        }, 30000);

        // Save on input change with debouncing
        document.querySelectorAll('input, select').forEach(input => {
            const handler = () => {
                if (this.saveTimeout) {
                    clearTimeout(this.saveTimeout);
                }
                this.saveTimeout = setTimeout(() => {
                    this.saveSettings();
                    this.updateAutosaveStatus('saved');
                }, 1000);
            };

            input.addEventListener('change', handler);
            this.eventListeners.push({ element: input, event: 'change', handler });
        });
    }

    saveSettings() {
        const settings = {
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
            commentEngagement: document.getElementById('commentEngagement')?.checked || false,
            shareEngagement: document.getElementById('shareEngagement')?.checked || false,
            followEngagement: document.getElementById('followEngagement')?.checked || false,
            likeEngagement: document.getElementById('likeEngagement')?.checked || false,
            autoDownload: document.getElementById('autoDownload')?.checked || false,
            showTimestamps: document.getElementById('showTimestamps')?.checked || true,
            enableAnimations: document.getElementById('enableAnimations')?.checked || true,
            timestamp: Date.now()
        };

        try {
            localStorage.setItem('wouldyourather_settings', JSON.stringify(settings));
            this.lastSaveTime = Date.now();
        } catch (e) {
            console.error('Failed to save settings to localStorage:', e);
            // Safari private mode or storage full
        }
    }

    loadSavedSettings() {
        try {
            const saved = localStorage.getItem('wouldyourather_settings');
            if (!saved) return;

            const settings = JSON.parse(saved);

            // Safely update DOM elements
            const updateElement = (id, value) => {
                const el = document.getElementById(id);
                if (el) el.value = value;
            };

            const updateCheckbox = (id, checked) => {
                const el = document.getElementById(id);
                if (el) el.checked = checked;
            };

            const updateText = (id, text) => {
                const el = document.getElementById(id);
                if (el) el.textContent = text;
            };

            // Load text inputs
            if (settings.unsplashKey) updateElement('unsplashKey', settings.unsplashKey);
            if (settings.elevenlabsKey) updateElement('elevenlabsKey', settings.elevenlabsKey);

            // Load selects
            if (settings.voiceSelect) updateElement('voiceSelect', settings.voiceSelect);
            if (settings.fontSize) updateElement('fontSize', settings.fontSize);
            if (settings.imageFilter) updateElement('imageFilter', settings.imageFilter);

            // Load range inputs with display updates
            if (settings.musicVolume) {
                updateElement('musicVolume', settings.musicVolume);
                updateText('volumeValue', settings.musicVolume + '%');
            }
            if (settings.voiceSpeed) {
                updateElement('voiceSpeed', settings.voiceSpeed);
                updateText('voiceSpeedValue', settings.voiceSpeed + 'x');
            }
            if (settings.questionCount) {
                updateElement('questionCount', settings.questionCount);
                updateText('questionCountValue', settings.questionCount);
            }
            if (settings.questionDuration) {
                updateElement('questionDuration', settings.questionDuration);
                updateText('questionDurationValue', settings.questionDuration + 's');
            }
            if (settings.optionDuration) {
                updateElement('optionDuration', settings.optionDuration);
                updateText('optionDurationValue', settings.optionDuration + 's');
            }
            if (settings.pauseDuration) {
                updateElement('pauseDuration', settings.pauseDuration);
                updateText('pauseDurationValue', settings.pauseDuration + 's');
            }
            if (settings.transitionSpeed) {
                updateElement('transitionSpeed', settings.transitionSpeed);
                updateText('transitionSpeedValue', settings.transitionSpeed + 's');
            }
            if (settings.imageZoom) {
                updateElement('imageZoom', settings.imageZoom);
                updateText('imageZoomValue', settings.imageZoom + 'x');
            }

            // Load color inputs
            if (settings.textColor) updateElement('textColor', settings.textColor);
            if (settings.bgColor) updateElement('bgColor', settings.bgColor);

            // Load checkboxes
            if (settings.commentEngagement !== undefined) {
                updateCheckbox('commentEngagement', settings.commentEngagement);
            }
            if (settings.shareEngagement !== undefined) {
                updateCheckbox('shareEngagement', settings.shareEngagement);
            }
            if (settings.followEngagement !== undefined) {
                updateCheckbox('followEngagement', settings.followEngagement);
            }
            if (settings.likeEngagement !== undefined) {
                updateCheckbox('likeEngagement', settings.likeEngagement);
            }
            if (settings.autoDownload !== undefined) {
                updateCheckbox('autoDownload', settings.autoDownload);
            }
            if (settings.showTimestamps !== undefined) {
                updateCheckbox('showTimestamps', settings.showTimestamps);
            }
            if (settings.enableAnimations !== undefined) {
                updateCheckbox('enableAnimations', settings.enableAnimations);
            }

            this.updateAutosaveStatus('loaded');
        } catch (e) {
            console.error('Failed to load settings:', e);
        }
    }

    updateAutosaveStatus(status) {
        const statusEl = document.getElementById('autosaveStatus');
        if (!statusEl) return;

        // Clear existing status timeouts
        this.statusTimeouts.forEach(timeout => clearTimeout(timeout));
        this.statusTimeouts = [];

        if (status === 'saved') {
            statusEl.textContent = '✓ Autosaved';
            statusEl.style.color = 'var(--green)';
            const timeout = setTimeout(() => {
                statusEl.textContent = 'Autosave enabled';
                statusEl.style.color = 'var(--text-lighter)';
            }, 2000);
            this.statusTimeouts.push(timeout);
        } else if (status === 'loaded') {
            statusEl.textContent = '✓ Settings loaded';
            statusEl.style.color = 'var(--blue)';
            const timeout = setTimeout(() => {
                statusEl.textContent = 'Autosave enabled';
                statusEl.style.color = 'var(--text-lighter)';
            }, 3000);
            this.statusTimeouts.push(timeout);
        }
    }

    // ========== DRAG & DROP ==========
    initDragDrop() {
        const dropZone = document.getElementById('dropZone');
        if (!dropZone) return;

        const preventDefaults = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };

        const handleDragEnter = () => dropZone.classList.add('drag-over');
        const handleDragLeave = () => dropZone.classList.remove('drag-over');
        const handleDrop = (e) => {
            dropZone.classList.remove('drag-over');
            this.handleDrop(e);
        };

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
        });

        dropZone.addEventListener('dragenter', handleDragEnter);
        dropZone.addEventListener('dragover', handleDragEnter);
        dropZone.addEventListener('dragleave', handleDragLeave);
        dropZone.addEventListener('drop', handleDrop);

        // Store for cleanup
        this.eventListeners.push(
            { element: dropZone, event: 'dragenter', handler: handleDragEnter },
            { element: dropZone, event: 'dragover', handler: handleDragEnter },
            { element: dropZone, event: 'dragleave', handler: handleDragLeave },
            { element: dropZone, event: 'drop', handler: handleDrop }
        );
    }

    handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (files.length > 0) {
            const file = files[0];
            if (file.type === 'application/json') {
                this.loadConfigFile(file);
            }
        }
    }

    loadConfigFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const config = JSON.parse(e.target.result);
                // Load config into form (implement based on your config structure)
                this.updateAutosaveStatus('loaded');
            } catch (err) {
                alert('Failed to load config file: ' + err.message);
            }
        };
        reader.readAsText(file);
    }

    // ========== KEYBOARD SHORTCUTS ==========
    initKeyboardShortcuts() {
        const keyboardHandler = (e) => {
            // Ignore if typing in input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            switch(e.key.toLowerCase()) {
                case ' ':
                    e.preventDefault();
                    const playBtn = document.getElementById('playBtn');
                    const pauseBtn = document.getElementById('pauseBtn');
                    if (playBtn && !playBtn.disabled) playBtn.click();
                    else if (pauseBtn && !pauseBtn.disabled) pauseBtn.click();
                    break;
                case 'r':
                    e.preventDefault();
                    document.getElementById('restartBtn')?.click();
                    break;
                case 'g':
                    e.preventDefault();
                    document.getElementById('generateBtn')?.click();
                    break;
                case 'd':
                    e.preventDefault();
                    const downloadBtn = document.getElementById('downloadBtn');
                    if (downloadBtn && !downloadBtn.disabled) downloadBtn.click();
                    break;
                case 's':
                    e.preventDefault();
                    document.getElementById('saveConfigBtn')?.click();
                    break;
                case 'l':
                    e.preventDefault();
                    document.getElementById('loadConfigBtn')?.click();
                    break;
                case 'p':
                    e.preventDefault();
                    document.getElementById('promptManagerBtn')?.click();
                    break;
                case 't':
                    e.preventDefault();
                    document.getElementById('themeToggle')?.click();
                    break;
                case '?':
                    e.preventDefault();
                    document.getElementById('keyboardShortcuts')?.click();
                    break;
            }
        };

        document.addEventListener('keydown', keyboardHandler);
        this.eventListeners.push({ element: document, event: 'keydown', handler: keyboardHandler });

        // Shortcuts modal controls
        const shortcutsBtn = document.getElementById('keyboardShortcuts');
        const shortcutsModal = document.getElementById('shortcutsModal');
        const closeShortcuts = document.getElementById('closeShortcuts');
        const shortcutsOverlay = document.getElementById('shortcutsOverlay');

        if (shortcutsBtn && shortcutsModal) {
            const openModal = () => shortcutsModal.classList.remove('hidden');
            const closeModal = () => shortcutsModal.classList.add('hidden');

            shortcutsBtn.addEventListener('click', openModal);
            this.eventListeners.push({ element: shortcutsBtn, event: 'click', handler: openModal });

            if (closeShortcuts) {
                closeShortcuts.addEventListener('click', closeModal);
                this.eventListeners.push({ element: closeShortcuts, event: 'click', handler: closeModal });
            }

            if (shortcutsOverlay) {
                shortcutsOverlay.addEventListener('click', closeModal);
                this.eventListeners.push({ element: shortcutsOverlay, event: 'click', handler: closeModal });
            }

            // Close on Escape
            const escapeHandler = (e) => {
                if (e.key === 'Escape' && !shortcutsModal.classList.contains('hidden')) {
                    closeModal();
                }
            };
            document.addEventListener('keydown', escapeHandler);
            this.eventListeners.push({ element: document, event: 'keydown', handler: escapeHandler });
        }
    }

    // ========== TOOLTIPS ==========
    initTooltips() {
        // Tooltips are handled by CSS
        // This is a placeholder for any JS-based tooltip logic
    }
}

// Initialize enhancements when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.appEnhancements = new AppEnhancements();
    });
} else {
    window.appEnhancements = new AppEnhancements();
}
