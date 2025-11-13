// ============================================
// QUALITY OF LIFE ENHANCEMENTS
// Autosave, Drag & Drop, Keyboard Shortcuts
// ============================================

class AppEnhancements {
    constructor() {
        this.autosaveInterval = null;
        this.lastSaveTime = null;
        this.init();
    }

    init() {
        this.initAutosave();
        this.initDragDrop();
        this.initKeyboardShortcuts();
        this.initTooltips();
        this.loadSavedSettings();
    }

    // ========== AUTOSAVE ==========
    initAutosave() {
        const statusEl = document.getElementById('autosaveStatus');

        // Autosave every 30 seconds
        this.autosaveInterval = setInterval(() => {
            this.saveSettings();
            this.updateAutosaveStatus('saved');
        }, 30000);

        // Save on input change
        document.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('change', () => {
                clearTimeout(this.saveTimeout);
                this.saveTimeout = setTimeout(() => {
                    this.saveSettings();
                    this.updateAutosaveStatus('saved');
                }, 1000);
            });
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

        localStorage.setItem('wouldyourather_settings', JSON.stringify(settings));
        this.lastSaveTime = Date.now();
    }

    loadSavedSettings() {
        const saved = localStorage.getItem('wouldyourather_settings');
        if (!saved) return;

        try {
            const settings = JSON.parse(saved);

            // Load text inputs
            if (settings.unsplashKey) document.getElementById('unsplashKey').value = settings.unsplashKey;
            if (settings.elevenlabsKey) document.getElementById('elevenlabsKey').value = settings.elevenlabsKey;

            // Load selects
            if (settings.voiceSelect) document.getElementById('voiceSelect').value = settings.voiceSelect;
            if (settings.fontSize) document.getElementById('fontSize').value = settings.fontSize;
            if (settings.imageFilter) document.getElementById('imageFilter').value = settings.imageFilter;

            // Load range inputs
            if (settings.musicVolume) {
                document.getElementById('musicVolume').value = settings.musicVolume;
                document.getElementById('volumeValue').textContent = settings.musicVolume + '%';
            }
            if (settings.voiceSpeed) {
                document.getElementById('voiceSpeed').value = settings.voiceSpeed;
                document.getElementById('voiceSpeedValue').textContent = settings.voiceSpeed + 'x';
            }
            if (settings.questionCount) {
                document.getElementById('questionCount').value = settings.questionCount;
                document.getElementById('questionCountValue').textContent = settings.questionCount;
            }
            if (settings.questionDuration) {
                document.getElementById('questionDuration').value = settings.questionDuration;
                document.getElementById('questionDurationValue').textContent = settings.questionDuration + 's';
            }
            if (settings.optionDuration) {
                document.getElementById('optionDuration').value = settings.optionDuration;
                document.getElementById('optionDurationValue').textContent = settings.optionDuration + 's';
            }
            if (settings.pauseDuration) {
                document.getElementById('pauseDuration').value = settings.pauseDuration;
                document.getElementById('pauseDurationValue').textContent = settings.pauseDuration + 's';
            }
            if (settings.transitionSpeed) {
                document.getElementById('transitionSpeed').value = settings.transitionSpeed;
                document.getElementById('transitionSpeedValue').textContent = settings.transitionSpeed + 's';
            }
            if (settings.imageZoom) {
                document.getElementById('imageZoom').value = settings.imageZoom;
                document.getElementById('imageZoomValue').textContent = settings.imageZoom + 'x';
            }

            // Load color inputs
            if (settings.textColor) document.getElementById('textColor').value = settings.textColor;
            if (settings.bgColor) document.getElementById('bgColor').value = settings.bgColor;

            // Load checkboxes
            if (settings.commentEngagement !== undefined) {
                document.getElementById('commentEngagement').checked = settings.commentEngagement;
            }
            if (settings.shareEngagement !== undefined) {
                document.getElementById('shareEngagement').checked = settings.shareEngagement;
            }
            if (settings.followEngagement !== undefined) {
                document.getElementById('followEngagement').checked = settings.followEngagement;
            }
            if (settings.likeEngagement !== undefined) {
                document.getElementById('likeEngagement').checked = settings.likeEngagement;
            }
            if (settings.autoDownload !== undefined) {
                document.getElementById('autoDownload').checked = settings.autoDownload;
            }
            if (settings.showTimestamps !== undefined) {
                document.getElementById('showTimestamps').checked = settings.showTimestamps;
            }
            if (settings.enableAnimations !== undefined) {
                document.getElementById('enableAnimations').checked = settings.enableAnimations;
            }

            this.updateAutosaveStatus('loaded');
        } catch (e) {
            console.error('Failed to load settings:', e);
        }
    }

    updateAutosaveStatus(status) {
        const statusEl = document.getElementById('autosaveStatus');
        if (!statusEl) return;

        if (status === 'saved') {
            statusEl.textContent = '✓ Autosaved';
            statusEl.style.color = 'var(--green)';
            setTimeout(() => {
                statusEl.textContent = 'Autosave enabled';
                statusEl.style.color = 'var(--text-lighter)';
            }, 2000);
        } else if (status === 'loaded') {
            statusEl.textContent = '✓ Settings loaded';
            statusEl.style.color = 'var(--blue)';
            setTimeout(() => {
                statusEl.textContent = 'Autosave enabled';
                statusEl.style.color = 'var(--text-lighter)';
            }, 3000);
        }
    }

    // ========== DRAG & DROP ==========
    initDragDrop() {
        const dropZone = document.getElementById('dropZone');
        if (!dropZone) return;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, this.preventDefaults, false);
        });

        dropZone.addEventListener('dragenter', () => dropZone.classList.add('drag-over'));
        dropZone.addEventListener('dragover', () => dropZone.classList.add('drag-over'));
        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
        dropZone.addEventListener('drop', () => dropZone.classList.remove('drag-over'));

        dropZone.addEventListener('drop', (e) => this.handleDrop(e));
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
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
                console.log('Config loaded:', config);
                this.updateAutosaveStatus('loaded');
            } catch (err) {
                alert('Failed to load config file: ' + err.message);
            }
        };
        reader.readAsText(file);
    }

    // ========== KEYBOARD SHORTCUTS ==========
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
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
        });

        // Shortcuts modal controls
        const shortcutsBtn = document.getElementById('keyboardShortcuts');
        const shortcutsModal = document.getElementById('shortcutsModal');
        const closeShortcuts = document.getElementById('closeShortcuts');
        const shortcutsOverlay = document.getElementById('shortcutsOverlay');

        if (shortcutsBtn && shortcutsModal) {
            shortcutsBtn.addEventListener('click', () => {
                shortcutsModal.classList.remove('hidden');
            });

            closeShortcuts?.addEventListener('click', () => {
                shortcutsModal.classList.add('hidden');
            });

            shortcutsOverlay?.addEventListener('click', () => {
                shortcutsModal.classList.add('hidden');
            });

            // Close on Escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && !shortcutsModal.classList.contains('hidden')) {
                    shortcutsModal.classList.add('hidden');
                }
            });
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
