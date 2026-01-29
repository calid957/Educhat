// Admin Settings JavaScript
class AdminSettings {
    constructor() {
        this.settings = this.loadSettings();
        this.initializeEventListeners();
        this.loadCurrentSettings();
    }

    // Load settings from localStorage
    loadSettings() {
        const defaultSettings = {
            maintenance: {
                enabled: false,
                message: "We're currently undergoing maintenance. Please check back soon."
            },
            theme: {
                preset: 'immersive',
                layout: 'default',
                primaryColor: '#3B82F6',
                accentColor: '#8B5CF6',
                fontSize: 'medium',
                animationSpeed: 'normal'
            },
            site: {
                logo: null,
                background: null,
                bgOpacity: 100,
                bgSize: 'cover',
                bgPosition: 'center'
            },
            datetime: {
                format: 'MM/DD/YYYY',
                timeFormat: '12h',
                timezone: 'UTC',
                firstDay: 'sunday'
            },
            notifications: {
                pushEnabled: true,
                types: {
                    messages: true,
                    users: true,
                    system: true,
                    moderation: false
                },
                quietHours: {
                    start: '22:00',
                    end: '08:00'
                }
            },
            uploads: {
                maxFileSize: 10,
                allowedTypes: {
                    images: true,
                    docs: true,
                    videos: false,
                    audio: false
                },
                storageLimit: 50
            },
            cache: {
                enabled: true,
                expiration: '24hours'
            },
            emailTemplates: {
                welcome: {
                    subject: 'Welcome to Our Platform!',
                    body: 'Hello {user_name},\n\nWelcome to our platform! We\'re excited to have you join us.\n\nBest regards,\nThe Team'
                },
                'password-reset': {
                    subject: 'Password Reset Request',
                    body: 'Hello {user_name},\n\nYou requested a password reset. Click here: {reset_link}\n\nThis link expires in 1 hour.\n\nBest regards,\nThe Team'
                }
            },
            termsOfService: {
                content: 'Welcome to our platform! By using our service, you agree to the following terms and conditions...',
                lastUpdated: new Date().toISOString()
            }
        };

        const saved = localStorage.getItem('adminSettings');
        return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    }

    // Save settings to localStorage
    saveSettings() {
        localStorage.setItem('adminSettings', JSON.stringify(this.settings));
        
        // Apply settings immediately
        this.applySettings();
        
        // Show success message
        this.showNotification('Settings saved successfully!', 'success');
        
        // Notify real-time manager if available
        if (window.realtimeManager) {
            window.realtimeManager.sendRealtimeMessage({
                type: 'settings_update',
                settings: this.settings
            });
        }
    }

    // Load current settings into UI
    loadCurrentSettings() {
        // Maintenance mode
        document.getElementById('maintenanceMode').checked = this.settings.maintenance.enabled;
        document.getElementById('maintenanceText').value = this.settings.maintenance.message;
        document.getElementById('maintenanceMessage').style.display = this.settings.maintenance.enabled ? 'block' : 'none';

        // Theme settings
        document.getElementById('themePreset').value = this.settings.theme.preset;
        document.getElementById('layoutStyle').value = this.settings.theme.layout;
        document.getElementById('primaryColor').value = this.settings.theme.primaryColor;
        document.getElementById('primaryColorHex').value = this.settings.theme.primaryColor;
        document.getElementById('accentColor').value = this.settings.theme.accentColor;
        document.getElementById('accentColorHex').value = this.settings.theme.accentColor;
        document.getElementById('fontSize').value = this.settings.theme.fontSize;
        document.getElementById('animationSpeed').value = this.settings.theme.animationSpeed;

        // Site settings
        document.getElementById('bgOpacity').value = this.settings.site.bgOpacity;
        document.getElementById('bgOpacityValue').textContent = this.settings.site.bgOpacity + '%';
        document.getElementById('bgSize').value = this.settings.site.bgSize;
        document.getElementById('bgPosition').value = this.settings.site.bgPosition;

        // Date/Time settings
        document.getElementById('dateFormat').value = this.settings.datetime.format;
        document.getElementById('timeFormat').value = this.settings.datetime.timeFormat;
        document.getElementById('timezone').value = this.settings.datetime.timezone;
        document.getElementById('firstDay').value = this.settings.datetime.firstDay;

        // Update examples
        this.updateDateTimeExamples();

        // Notification settings
        document.getElementById('pushNotifications').checked = this.settings.notifications.pushEnabled;
        document.getElementById('notifyMessages').checked = this.settings.notifications.types.messages;
        document.getElementById('notifyUsers').checked = this.settings.notifications.types.users;
        document.getElementById('notifySystem').checked = this.settings.notifications.types.system;
        document.getElementById('notifyModeration').checked = this.settings.notifications.types.moderation;
        document.getElementById('quietStart').value = this.settings.notifications.quietHours.start;
        document.getElementById('quietEnd').value = this.settings.notifications.quietHours.end;

        // Upload settings
        document.getElementById('maxFileSize').value = this.settings.uploads.maxFileSize;
        document.getElementById('allowImages').checked = this.settings.uploads.allowedTypes.images;
        document.getElementById('allowDocs').checked = this.settings.uploads.allowedTypes.docs;
        document.getElementById('allowVideos').checked = this.settings.uploads.allowedTypes.videos;
        document.getElementById('allowAudio').checked = this.settings.uploads.allowedTypes.audio;
        document.getElementById('storageLimit').value = this.settings.uploads.storageLimit;

        // Cache settings
        document.getElementById('enableCaching').checked = this.settings.cache.enabled;
        document.getElementById('cacheExpiration').value = this.settings.cache.expiration;

        // Terms of Service
        document.getElementById('termsContent').value = this.settings.termsOfService.content;
        document.getElementById('termsLastUpdated').textContent = new Date(this.settings.termsOfService.lastUpdated).toLocaleDateString();

        // Load saved logo and background if they exist
        this.loadSavedAssets();
    }

    // Apply theme settings
    applyThemeSettings() {
        const root = document.documentElement;
        
        // Apply theme preset
        this.applyThemePreset(this.settings.theme.preset);
        
        // Apply layout style
        this.applyLayoutStyle(this.settings.theme.layout);
        
        // Apply colors
        this.applyColorScheme();
        
        // Apply font size
        this.applyFontSize(this.settings.theme.fontSize);
        
        // Apply animation speed
        this.applyAnimationSpeed(this.settings.theme.animationSpeed);
    }

    // Apply site settings
    applySiteSettings() {
        // Apply background if exists
        if (this.settings.site.background) {
            this.applyBackgroundImage(this.settings.site.background);
        }
        
        // Apply logo if exists
        if (this.settings.site.logo) {
            // Update logo elements throughout the site
            const logoElements = document.querySelectorAll('.site-logo, .admin-logo');
            logoElements.forEach(element => {
                element.src = this.settings.site.logo;
            });
        }
    }

    // Apply datetime settings
    applyDateTimeSettings() {
        // Store datetime settings for use throughout the application
        localStorage.setItem('datetimeSettings', JSON.stringify(this.settings.datetime));
        
        // Update any existing date/time displays
        this.updateDateTimeDisplays();
    }

    // Update date/time displays throughout the application
    updateDateTimeDisplays() {
        const now = new Date();
        const dateElements = document.querySelectorAll('.date-display');
        const timeElements = document.querySelectorAll('.time-display');
        
        dateElements.forEach(element => {
            element.textContent = this.formatDate(now, this.settings.datetime.format);
        });
        
        timeElements.forEach(element => {
            element.textContent = this.formatTime(now, this.settings.datetime.timeFormat);
        });
    }

    // Apply settings to the application
    applySettings() {
        // Apply maintenance mode
        if (this.settings.maintenance.enabled) {
            this.enableMaintenanceMode();
        } else {
            this.disableMaintenanceMode();
        }

        // Apply theme settings
        this.applyThemeSettings();

        // Apply site settings
        this.applySiteSettings();

        // Apply datetime settings
        this.applyDateTimeSettings();
    }

    // Initialize event listeners
    initializeEventListeners() {
        // Maintenance mode
        const maintenanceToggle = document.getElementById('maintenanceMode');
        if (maintenanceToggle) {
            maintenanceToggle.addEventListener('change', (e) => {
                this.settings.maintenance.enabled = e.target.checked;
                const messageDiv = document.getElementById('maintenanceMessage');
                if (messageDiv) {
                    messageDiv.style.display = e.target.checked ? 'block' : 'none';
                }
                this.saveSettings();
            });
        }

        const maintenanceText = document.getElementById('maintenanceText');
        if (maintenanceText) {
            maintenanceText.addEventListener('input', (e) => {
                this.settings.maintenance.message = e.target.value;
                // Auto-save maintenance message
                clearTimeout(this.maintenanceSaveTimeout);
                this.maintenanceSaveTimeout = setTimeout(() => {
                    this.saveSettings();
                }, 1000);
            });
        }

        // Background opacity slider
        const bgOpacitySlider = document.getElementById('bgOpacity');
        if (bgOpacitySlider) {
            bgOpacitySlider.addEventListener('input', (e) => {
                const value = e.target.value;
                const valueDisplay = document.getElementById('bgOpacityValue');
                if (valueDisplay) {
                    valueDisplay.textContent = value + '%';
                }
            });
        }

        // Color hex inputs
        const primaryHexInput = document.getElementById('primaryColorHex');
        if (primaryHexInput) {
            primaryHexInput.addEventListener('input', (e) => {
                const color = e.target.value;
                if (/^#[0-9A-F]{6}$/i.test(color)) {
                    const colorPicker = document.getElementById('primaryColor');
                    if (colorPicker) {
                        colorPicker.value = color;
                    }
                }
            });
        }

        const accentHexInput = document.getElementById('accentColorHex');
        if (accentHexInput) {
            accentHexInput.addEventListener('input', (e) => {
                const color = e.target.value;
                if (/^#[0-9A-F]{6}$/i.test(color)) {
                    const colorPicker = document.getElementById('accentColor');
                    if (colorPicker) {
                        colorPicker.value = color;
                    }
                }
            });
        }

        // Notification checkboxes
        const notificationCheckboxes = ['notifyMessages', 'notifyUsers', 'notifySystem', 'notifyModeration'];
        notificationCheckboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.addEventListener('change', (e) => {
                    const type = id.replace('notify', '').toLowerCase();
                    if (this.settings.notifications.types[type] !== undefined) {
                        this.settings.notifications.types[type] = e.target.checked;
                        this.saveSettings();
                    }
                });
            }
        });

        // File type checkboxes
        const fileTypeCheckboxes = ['allowImages', 'allowDocs', 'allowVideos', 'allowAudio'];
        fileTypeCheckboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.addEventListener('change', (e) => {
                    const type = id.replace('allow', '').toLowerCase();
                    if (this.settings.uploads.allowedTypes[type] !== undefined) {
                        this.settings.uploads.allowedTypes[type] = e.target.checked;
                        this.saveSettings();
                    }
                });
            }
        });

        // Quiet hours
        const quietStart = document.getElementById('quietStart');
        if (quietStart) {
            quietStart.addEventListener('change', (e) => {
                this.settings.notifications.quietHours.start = e.target.value;
                this.saveSettings();
            });
        }

        const quietEnd = document.getElementById('quietEnd');
        if (quietEnd) {
            quietEnd.addEventListener('change', (e) => {
                this.settings.notifications.quietHours.end = e.target.value;
                this.saveSettings();
            });
        }

        // Cache settings
        const cacheEnabled = document.getElementById('enableCaching');
        if (cacheEnabled) {
            cacheEnabled.addEventListener('change', (e) => {
                this.settings.cache.enabled = e.target.checked;
                this.saveSettings();
            });
        }

        const cacheExpiration = document.getElementById('cacheExpiration');
        if (cacheExpiration) {
            cacheExpiration.addEventListener('change', (e) => {
                this.settings.cache.expiration = e.target.value;
                this.saveSettings();
            });
        }
    }

    // Maintenance Mode Functions
    toggleMaintenanceMode() {
        const enabled = document.getElementById('maintenanceMode').checked;
        this.settings.maintenance.enabled = enabled;
        
        if (enabled) {
            this.enableMaintenanceMode();
        } else {
            this.disableMaintenanceMode();
        }
        
        this.saveSettings();
    }

    enableMaintenanceMode() {
        // Create maintenance overlay
        const maintenanceOverlay = document.createElement('div');
        maintenanceOverlay.id = 'maintenanceOverlay';
        maintenanceOverlay.className = 'fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center';
        maintenanceOverlay.innerHTML = `
            <div class="immersive-glass rounded-2xl p-8 max-w-md mx-4 text-center">
                <i class="fas fa-tools text-6xl text-white/60 mb-4"></i>
                <h2 class="text-2xl font-bold text-white mb-4">Under Maintenance</h2>
                <p class="text-white/80 mb-6">${this.settings.maintenance.message}</p>
                <div class="text-white/60 text-sm">
                    <p>We'll be back shortly!</p>
                    <p class="mt-2">Last updated: ${new Date().toLocaleString()}</p>
                </div>
            </div>
        `;
        document.body.appendChild(maintenanceOverlay);
    }

    disableMaintenanceMode() {
        const overlay = document.getElementById('maintenanceOverlay');
        if (overlay) {
            overlay.remove();
        }
    }

    // Theme Functions
    changeThemePreset() {
        const preset = document.getElementById('themePreset').value;
        this.settings.theme.preset = preset;
        this.applyThemePreset(preset);
        this.saveSettings();
    }

    applyThemePreset(preset) {
        const root = document.documentElement;
        
        // Remove existing theme classes
        root.classList.remove('theme-immersive', 'theme-dark', 'theme-light', 'theme-cyberpunk', 'theme-nature', 'theme-minimal');
        
        // Add new theme class
        root.classList.add(`theme-${preset}`);
        
        // Apply preset-specific colors
        const presets = {
            immersive: { primary: '#3B82F6', accent: '#8B5CF6' },
            dark: { primary: '#1F2937', accent: '#374151' },
            light: { primary: '#F3F4F6', accent: '#E5E7EB' },
            cyberpunk: { primary: '#FF00FF', accent: '#00FFFF' },
            nature: { primary: '#10B981', accent: '#84CC16' },
            minimal: { primary: '#6B7280', accent: '#9CA3AF' }
        };
        
        if (presets[preset]) {
            this.settings.theme.primaryColor = presets[preset].primary;
            this.settings.theme.accentColor = presets[preset].accent;
            document.getElementById('primaryColor').value = presets[preset].primary;
            document.getElementById('primaryColorHex').value = presets[preset].primary;
            document.getElementById('accentColor').value = presets[preset].accent;
            document.getElementById('accentColorHex').value = presets[preset].accent;
        }
        
        this.updateThemePreview();
    }

    changeLayoutStyle() {
        const layout = document.getElementById('layoutStyle').value;
        this.settings.theme.layout = layout;
        this.applyLayoutStyle(layout);
        this.saveSettings();
    }

    applyLayoutStyle(layout) {
        const body = document.body;
        body.classList.remove('layout-default', 'layout-compact', 'layout-spacious', 'layout-sidebar');
        body.classList.add(`layout-${layout}`);
        
        // Apply layout-specific styles
        const layoutStyles = {
            compact: { padding: '0.5rem' },
            spacious: { padding: '2rem' },
            sidebar: { display: 'grid', gridTemplateColumns: '250px 1fr' }
        };
        
        if (layoutStyles[layout]) {
            Object.assign(body.style, layoutStyles[layout]);
        }
    }

    updatePrimaryColor() {
        const color = document.getElementById('primaryColor').value;
        this.settings.theme.primaryColor = color;
        document.getElementById('primaryColorHex').value = color;
        this.applyColorScheme();
        this.saveSettings();
    }

    updatePrimaryColorFromHex() {
        const color = document.getElementById('primaryColorHex').value;
        this.settings.theme.primaryColor = color;
        document.getElementById('primaryColor').value = color;
        this.applyColorScheme();
        this.saveSettings();
    }

    updateAccentColor() {
        const color = document.getElementById('accentColor').value;
        this.settings.theme.accentColor = color;
        document.getElementById('accentColorHex').value = color;
        this.applyColorScheme();
        this.saveSettings();
    }

    updateAccentColorFromHex() {
        const color = document.getElementById('accentColorHex').value;
        this.settings.theme.accentColor = color;
        document.getElementById('accentColor').value = color;
        this.applyColorScheme();
        this.saveSettings();
    }

    applyColorScheme() {
        const root = document.documentElement;
        root.style.setProperty('--primary-color', this.settings.theme.primaryColor);
        root.style.setProperty('--accent-color', this.settings.theme.accentColor);
        this.updateThemePreview();
    }

    updateFontSize() {
        const size = document.getElementById('fontSize').value;
        this.settings.theme.fontSize = size;
        this.applyFontSize(size);
        this.saveSettings();
    }

    applyFontSize(size) {
        const root = document.documentElement;
        const sizes = {
            small: '14px',
            medium: '16px',
            large: '18px',
            'extra-large': '20px'
        };
        root.style.setProperty('--base-font-size', sizes[size]);
    }

    updateAnimationSpeed() {
        const speed = document.getElementById('animationSpeed').value;
        this.settings.theme.animationSpeed = speed;
        this.applyAnimationSpeed(speed);
        this.saveSettings();
    }

    applyAnimationSpeed(speed) {
        const root = document.documentElement;
        const speeds = {
            slow: '0.3s',
            normal: '0.2s',
            fast: '0.1s',
            disabled: '0s'
        };
        root.style.setProperty('--animation-speed', speeds[speed]);
    }

    updateThemePreview() {
        const preview = document.getElementById('themePreview');
        if (preview) {
            preview.innerHTML = `
                <div class="w-20 h-20 rounded-lg" style="background-color: ${this.settings.theme.primaryColor}"></div>
                <div class="w-20 h-20 rounded-lg" style="background-color: ${this.settings.theme.accentColor}"></div>
                <div class="w-20 h-20 rounded-lg" style="background: linear-gradient(135deg, ${this.settings.theme.primaryColor}, ${this.settings.theme.accentColor})"></div>
            `;
        }
    }

    // Site Logo & Background Functions
    handleLogoUpload(event) {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                this.showNotification('Logo file size must be less than 2MB', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                this.settings.site.logo = e.target.result;
                this.showLogoPreview(e.target.result);
                this.saveSettings();
            };
            reader.readAsDataURL(file);
        }
    }

    showLogoPreview(src) {
        const preview = document.getElementById('logoPreview');
        const image = document.getElementById('logoImage');
        
        if (preview && image) {
            image.src = src;
            preview.classList.remove('hidden');
        }
    }

    removeLogo() {
        this.settings.site.logo = null;
        document.getElementById('logoPreview').classList.add('hidden');
        document.getElementById('logoUpload').value = '';
        this.saveSettings();
    }

    handleBackgroundUpload(event) {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                this.showNotification('Background file size must be less than 5MB', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                this.settings.site.background = e.target.result;
                this.showBackgroundPreview(e.target.result);
                this.applyBackgroundImage(e.target.result);
                this.saveSettings();
            };
            reader.readAsDataURL(file);
        }
    }

    showBackgroundPreview(src) {
        const preview = document.getElementById('bgPreview');
        const image = document.getElementById('bgImage');
        
        if (preview && image) {
            image.src = src;
            preview.classList.remove('hidden');
        }
    }

    removeBackground() {
        this.settings.site.background = null;
        document.getElementById('bgPreview').classList.add('hidden');
        document.getElementById('bgUpload').value = '';
        this.removeBackgroundImage();
        this.saveSettings();
    }

    restoreDefaultBackground() {
        this.settings.site.background = null;
        document.getElementById('bgPreview').classList.add('hidden');
        document.getElementById('bgUpload').value = '';
        this.restoreDefaultBackgroundImage();
        this.saveSettings();
    }

    applyBackgroundImage(src) {
        const body = document.body;
        body.style.backgroundImage = `url(${src})`;
        body.style.backgroundSize = this.settings.site.bgSize;
        body.style.backgroundPosition = this.settings.site.bgPosition;
        body.style.backgroundOpacity = this.settings.site.bgOpacity / 100;
    }

    removeBackgroundImage() {
        const body = document.body;
        body.style.backgroundImage = '';
    }

    restoreDefaultBackgroundImage() {
        const body = document.body;
        body.style.backgroundImage = '';
        body.className = body.className.replace(/bg-\S+/g, '');
        body.classList.add('bg-gradient-to-br', 'from-purple-600', 'via-blue-600', 'to-cyan-600');
    }

    updateBackgroundOpacity() {
        const opacity = document.getElementById('bgOpacity').value;
        this.settings.site.bgOpacity = opacity;
        document.getElementById('bgOpacityValue').textContent = opacity + '%';
        
        if (this.settings.site.background) {
            document.body.style.backgroundOpacity = opacity / 100;
        }
        
        this.saveSettings();
    }

    updateBackgroundSize() {
        const size = document.getElementById('bgSize').value;
        this.settings.site.bgSize = size;
        
        if (this.settings.site.background) {
            document.body.style.backgroundSize = size;
        }
        
        this.saveSettings();
    }

    updateBackgroundPosition() {
        const position = document.getElementById('bgPosition').value;
        this.settings.site.bgPosition = position;
        
        if (this.settings.site.background) {
            document.body.style.backgroundPosition = position;
        }
        
        this.saveSettings();
    }

    // Date & Time Functions
    updateDateFormat() {
        const format = document.getElementById('dateFormat').value;
        this.settings.datetime.format = format;
        this.updateDateTimeExamples();
        this.saveSettings();
    }

    updateTimeFormat() {
        const format = document.getElementById('timeFormat').value;
        this.settings.datetime.timeFormat = format;
        this.updateDateTimeExamples();
        this.saveSettings();
    }

    updateTimezone() {
        const timezone = document.getElementById('timezone').value;
        this.settings.datetime.timezone = timezone;
        this.updateDateTimeExamples();
        this.saveSettings();
    }

    updateFirstDay() {
        const firstDay = document.getElementById('firstDay').value;
        this.settings.datetime.firstDay = firstDay;
        this.saveSettings();
    }

    updateDateTimeExamples() {
        const now = new Date();
        const dateExample = document.getElementById('dateExample');
        const timeExample = document.getElementById('timeExample');
        
        if (dateExample) {
            dateExample.textContent = this.formatDate(now, this.settings.datetime.format);
        }
        
        if (timeExample) {
            timeExample.textContent = this.formatTime(now, this.settings.datetime.timeFormat);
        }
    }

    formatDate(date, format) {
        const formats = {
            'MM/DD/YYYY': (d) => `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}/${d.getFullYear()}`,
            'DD/MM/YYYY': (d) => `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`,
            'YYYY-MM-DD': (d) => `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`,
            'DD MMM YYYY': (d) => `${d.getDate().toString().padStart(2, '0')} ${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`,
            'MMM DD, YYYY': (d) => `${d.toLocaleString('default', { month: 'short' })} ${d.getDate().toString().padStart(2, '0')}, ${d.getFullYear()}`
        };
        
        return formats[format] ? formats[format](date) : date.toLocaleDateString();
    }

    formatTime(date, format) {
        if (format === '12h') {
            return date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
            });
        } else {
            return date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
            });
        }
    }

    // Email Template Functions
    loadEmailTemplate() {
        const templateType = document.getElementById('emailTemplate').value;
        const template = this.settings.emailTemplates[templateType];
        
        if (template) {
            document.getElementById('emailSubject').value = template.subject;
            document.getElementById('emailBody').value = template.body;
        } else {
            // Create default template if it doesn't exist
            this.createDefaultEmailTemplate(templateType);
        }
    }

    createDefaultEmailTemplate(templateType) {
        const defaults = {
            'account-verified': {
                subject: 'Account Verified Successfully!',
                body: 'Hello {user_name},\n\nYour account has been successfully verified. You can now access all features of our platform.\n\nBest regards,\nThe Team'
            },
            'account-suspended': {
                subject: 'Account Suspended',
                body: 'Hello {user_name},\n\nYour account has been suspended due to violation of our terms of service. Please contact support for more information.\n\nBest regards,\nThe Team'
            },
            'newsletter': {
                subject: 'Our Latest Newsletter',
                body: 'Hello {user_name},\n\nCheck out our latest updates and news!\n\nBest regards,\nThe Team'
            }
        };
        
        if (defaults[templateType]) {
            this.settings.emailTemplates[templateType] = defaults[templateType];
            document.getElementById('emailSubject').value = defaults[templateType].subject;
            document.getElementById('emailBody').value = defaults[templateType].body;
        }
    }

    saveEmailTemplate() {
        const templateType = document.getElementById('emailTemplate').value;
        const subject = document.getElementById('emailSubject').value;
        const body = document.getElementById('emailBody').value;
        
        if (!subject || !body) {
            this.showNotification('Please fill in both subject and body', 'error');
            return;
        }
        
        if (!this.settings.emailTemplates[templateType]) {
            this.settings.emailTemplates[templateType] = {};
        }
        
        this.settings.emailTemplates[templateType].subject = subject;
        this.settings.emailTemplates[templateType].body = body;
        
        // Save to localStorage for use in application
        localStorage.setItem('emailTemplates', JSON.stringify(this.settings.emailTemplates));
        
        this.saveSettings();
        this.showNotification('Email template saved successfully!', 'success');
    }

    previewEmailTemplate() {
        const templateType = document.getElementById('emailTemplate').value;
        const template = this.settings.emailTemplates[templateType];
        
        if (template) {
            const preview = template.body
                .replace(/{user_name}/g, 'John Doe')
                .replace(/{user_email}/g, 'john@example.com')
                .replace(/{site_name}/g, 'Our Platform')
                .replace(/{reset_link}/g, 'https://example.com/reset')
                .replace(/{current_date}/g, new Date().toLocaleDateString());
            
            this.showEmailPreview(template.subject, preview);
        } else {
            this.showNotification('No template selected', 'warning');
        }
    }

    showEmailPreview(subject, body) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="immersive-glass rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                <h3 class="text-xl font-semibold text-white mb-4">Email Preview</h3>
                <div class="bg-white/10 rounded-lg p-4">
                    <p class="text-white/60 text-sm mb-2">Subject:</p>
                    <p class="text-white font-medium mb-4">${subject}</p>
                    <p class="text-white/60 text-sm mb-2">Body:</p>
                    <div class="text-white whitespace-pre-wrap">${body}</div>
                </div>
                <div class="mt-4 flex space-x-3">
                    <button onclick="this.parentElement.parentElement.remove()" class="immersive-button text-white px-4 py-2 rounded-lg">
                        Close Preview
                    </button>
                    <button onclick="adminSettings.sendTestEmail()" class="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30">
                        Send Test Email
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    sendTestEmail() {
        // Simulate sending test email
        this.showNotification('Test email sent successfully! (Simulated)', 'success');
    }

    resetEmailTemplate() {
        const templateType = document.getElementById('emailTemplate').value;
        const defaults = {
            welcome: {
                subject: 'Welcome to Our Platform!',
                body: 'Hello {user_name},\n\nWelcome to our platform! We\'re excited to have you join us.\n\nBest regards,\nThe Team'
            },
            'password-reset': {
                subject: 'Password Reset Request',
                body: 'Hello {user_name},\n\nYou requested a password reset. Click here: {reset_link}\n\nThis link expires in 1 hour.\n\nBest regards,\nThe Team'
            }
        };
        
        if (defaults[templateType]) {
            this.settings.emailTemplates[templateType] = defaults[templateType];
            document.getElementById('emailSubject').value = defaults[templateType].subject;
            document.getElementById('emailBody').value = defaults[templateType].body;
            this.saveSettings();
            this.showNotification('Email template reset to default', 'info');
        }
    }

    // Push Notification Functions
    togglePushNotifications() {
        const enabled = document.getElementById('pushNotifications').checked;
        this.settings.notifications.pushEnabled = enabled;
        this.saveSettings();
        
        if (enabled) {
            this.requestNotificationPermission();
        }
    }

    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                this.showNotification('Push notifications enabled!', 'success');
            } else {
                this.showNotification('Push notifications permission denied', 'warning');
            }
        }
    }

    testPushNotification() {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Test Notification', {
                body: 'This is a test notification from the admin panel!',
                icon: '/favicon.ico'
            });
            this.showNotification('Test notification sent!', 'success');
        } else {
            this.showNotification('Please enable push notifications first', 'warning');
        }
    }

    // File Upload Functions
    updateFileSizeLimit() {
        const size = document.getElementById('maxFileSize').value;
        this.settings.uploads.maxFileSize = parseInt(size);
        
        // Update file upload validation throughout the application
        localStorage.setItem('fileUploadSettings', JSON.stringify({
            maxFileSize: this.settings.uploads.maxFileSize,
            allowedTypes: this.settings.uploads.allowedTypes,
            storageLimit: this.settings.uploads.storageLimit
        }));
        
        this.saveSettings();
        this.showNotification(`File size limit updated to ${size}MB`, 'success');
    }

    // Validate file upload
    validateFileUpload(file) {
        // Check file size
        if (file.size > this.settings.uploads.maxFileSize * 1024 * 1024) {
            this.showNotification(`File size exceeds limit of ${this.settings.uploads.maxFileSize}MB`, 'error');
            return false;
        }
        
        // Check file type
        const fileType = file.type.toLowerCase();
        const allowedTypes = [];
        
        if (this.settings.uploads.allowedTypes.images) {
            allowedTypes.push('image/png', 'image/jpeg', 'image/jpg', 'image/gif');
        }
        if (this.settings.uploads.allowedTypes.docs) {
            allowedTypes.push('application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain');
        }
        if (this.settings.uploads.allowedTypes.videos) {
            allowedTypes.push('video/mp4', 'video/avi', 'video/mov');
        }
        if (this.settings.uploads.allowedTypes.audio) {
            allowedTypes.push('audio/mp3', 'audio/wav', 'audio/mpeg');
        }
        
        if (allowedTypes.length > 0 && !allowedTypes.includes(fileType)) {
            this.showNotification('File type not allowed', 'error');
            return false;
        }
        
        return true;
    }

    // Cache Functions
    clearBrowserCache() {
        if ('caches' in window) {
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
            }).then(() => {
                this.showNotification('Browser cache cleared successfully!', 'success');
                this.refreshCacheInfo();
            }).catch(error => {
                console.error('Error clearing browser cache:', error);
                this.showNotification('Error clearing browser cache', 'error');
            });
        } else {
            // Fallback for browsers without Cache API
            this.showNotification('Browser cache cleared (simulated)', 'success');
            this.refreshCacheInfo();
        }
    }

    clearAppCache() {
        try {
            // Clear localStorage
            const keysToKeep = ['adminSettings', 'currentUser', 'users']; // Keep essential data
            const allKeys = Object.keys(localStorage);
            
            allKeys.forEach(key => {
                if (!keysToKeep.includes(key)) {
                    localStorage.removeItem(key);
                }
            });
            
            // Clear sessionStorage
            sessionStorage.clear();
            
            this.showNotification('Application cache cleared successfully!', 'success');
            this.refreshCacheInfo();
        } catch (error) {
            console.error('Error clearing app cache:', error);
            this.showNotification('Error clearing application cache', 'error');
        }
    }

    clearAllCache() {
        this.clearBrowserCache();
        setTimeout(() => {
            this.clearAppCache();
        }, 500);
    }

    refreshCacheInfo() {
        // Simulate cache size calculation with more realistic values
        const calculateCacheSize = () => {
            let totalSize = 0;
            
            // Calculate localStorage size
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    totalSize += localStorage[key].length + key.length;
                }
            }
            
            // Calculate sessionStorage size
            for (let key in sessionStorage) {
                if (sessionStorage.hasOwnProperty(key)) {
                    totalSize += sessionStorage[key].length + key.length;
                }
            }
            
            return totalSize;
        };
        
        const appCacheBytes = calculateCacheSize();
        const appCacheMB = (appCacheBytes / (1024 * 1024)).toFixed(1);
        
        // Simulate browser cache (can't accurately measure in all browsers)
        const browserCacheMB = (Math.random() * 5 + 1).toFixed(1);
        const totalCacheMB = (parseFloat(browserCacheMB) + parseFloat(appCacheMB)).toFixed(1);
        
        // Update display
        const browserCacheElement = document.getElementById('browserCacheSize');
        const appCacheElement = document.getElementById('appCacheSize');
        const totalCacheElement = document.getElementById('totalCacheSize');
        
        if (browserCacheElement) browserCacheElement.textContent = browserCacheMB + ' MB';
        if (appCacheElement) appCacheElement.textContent = appCacheMB + ' MB';
        if (totalCacheElement) totalCacheElement.textContent = totalCacheMB + ' MB';
    }

    // Terms of Service Functions
    saveTermsOfService() {
        const content = document.getElementById('termsContent').value;
        this.settings.termsOfService.content = content;
        this.settings.termsOfService.lastUpdated = new Date().toISOString();
        
        document.getElementById('termsLastUpdated').textContent = new Date().toLocaleDateString();
        
        this.saveSettings();
        this.showNotification('Terms of Service saved successfully!', 'success');
    }

    previewTermsOfService() {
        const content = document.getElementById('termsContent').value;
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="immersive-glass rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                <h3 class="text-xl font-semibold text-white mb-4">Terms of Service Preview</h3>
                <div class="bg-white/10 rounded-lg p-6">
                    <div class="text-white whitespace-pre-wrap">${content}</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="mt-4 immersive-button text-white px-4 py-2 rounded-lg">
                    Close Preview
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    resetTermsOfService() {
        const defaultTerms = 'Welcome to our platform! By using our service, you agree to the following terms and conditions:\n\n1. Acceptance of Terms\nBy accessing and using this platform, you accept and agree to be bound by the terms and provision of this agreement.\n\n2. Use License\nPermission is granted to temporarily download one copy of the materials on our platform for personal, non-commercial transitory viewing only.\n\n3. Disclaimer\nThe materials on our platform are provided on an \'as is\' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.\n\n4. Limitations\nIn no event shall our company or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our platform.\n\n5. Privacy Policy\nYour privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use our platform.\n\n6. Revisions and Errata\nThe materials appearing on our platform could include technical, typographical, or photographic errors. We do not warrant that any of the materials on its platform are accurate, complete, or current.\n\n7. Governing Law\nThese terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which our platform operates.';
        
        this.settings.termsOfService.content = defaultTerms;
        this.settings.termsOfService.lastUpdated = new Date().toISOString();
        
        document.getElementById('termsContent').value = defaultTerms;
        document.getElementById('termsLastUpdated').textContent = new Date().toLocaleDateString();
        
        this.saveSettings();
        this.showNotification('Terms of Service reset to default', 'info');
    }

    // Save all settings
    saveAllSettings() {
        // Collect all form values
        this.settings.maintenance.message = document.getElementById('maintenanceText').value;
        this.settings.theme.preset = document.getElementById('themePreset').value;
        this.settings.theme.layout = document.getElementById('layoutStyle').value;
        this.settings.theme.fontSize = document.getElementById('fontSize').value;
        this.settings.theme.animationSpeed = document.getElementById('animationSpeed').value;
        this.settings.datetime.format = document.getElementById('dateFormat').value;
        this.settings.datetime.timeFormat = document.getElementById('timeFormat').value;
        this.settings.datetime.timezone = document.getElementById('timezone').value;
        this.settings.datetime.firstDay = document.getElementById('firstDay').value;
        this.settings.cache.expiration = document.getElementById('cacheExpiration').value;
        
        // Notification settings
        this.settings.notifications.types.messages = document.getElementById('notifyMessages').checked;
        this.settings.notifications.types.users = document.getElementById('notifyUsers').checked;
        this.settings.notifications.types.system = document.getElementById('notifySystem').checked;
        this.settings.notifications.types.moderation = document.getElementById('notifyModeration').checked;
        this.settings.notifications.quietHours.start = document.getElementById('quietStart').value;
        this.settings.notifications.quietHours.end = document.getElementById('quietEnd').value;
        
        // Upload settings
        this.settings.uploads.allowedTypes.images = document.getElementById('allowImages').checked;
        this.settings.uploads.allowedTypes.docs = document.getElementById('allowDocs').checked;
        this.settings.uploads.allowedTypes.videos = document.getElementById('allowVideos').checked;
        this.settings.uploads.allowedTypes.audio = document.getElementById('allowAudio').checked;
        
        this.saveSettings();
    }

    // Reset all settings
    resetAllSettings() {
        if (confirm('Are you sure you want to reset all settings to default values? This action cannot be undone.')) {
            localStorage.removeItem('adminSettings');
            this.settings = this.loadSettings();
            this.loadCurrentSettings();
            this.applySettings();
            this.showNotification('All settings have been reset to default values', 'info');
        }
    }

    // Load saved assets
    loadSavedAssets() {
        if (this.settings.site.logo) {
            this.showLogoPreview(this.settings.site.logo);
        }
        
        if (this.settings.site.background) {
            this.showBackgroundPreview(this.settings.site.background);
            this.applyBackgroundImage(this.settings.site.background);
        }
    }

    // Show notification
    showNotification(message, type = 'info') {
        if (window.realtimeManager) {
            window.realtimeManager.showNotification(message, type);
        } else {
            // Fallback notification
            const notification = document.createElement('div');
            notification.className = `fixed top-4 right-4 z-50 immersive-glass p-4 rounded-lg text-white animate-slide-in ${
                type === 'error' ? 'border-red-500/30' : 
                type === 'success' ? 'border-green-500/30' : 
                'border-blue-500/30'
            }`;
            notification.innerHTML = `
                <div class="flex items-center">
                    <i class="fas ${
                        type === 'error' ? 'fa-exclamation-circle' : 
                        type === 'success' ? 'fa-check-circle' : 
                        'fa-info-circle'
                    } mr-3"></i>
                    <div class="flex-1">${message}</div>
                    <button onclick="this.parentElement.parentElement.remove()" class="ml-3 text-white/70 hover:text-white">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 5000);
        }
    }
}

// Global functions for HTML onclick handlers
let adminSettings;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Admin Settings: DOM loaded, initializing...');
    
    // Wait a bit for other scripts to load
    setTimeout(() => {
        adminSettings = new AdminSettings();
        
        // Make it globally available
        window.adminSettings = adminSettings;
        
        console.log('Admin Settings: Initialized successfully');
        
        // Test that all functions are available
        console.log('Available functions:', Object.getOwnPropertyNames(AdminSettings.prototype));
    }, 100);
});

// Global function definitions with error handling
window.toggleMaintenanceMode = () => {
    if (adminSettings) adminSettings.toggleMaintenanceMode();
    else console.warn('AdminSettings not initialized');
};

window.changeThemePreset = () => {
    if (adminSettings) adminSettings.changeThemePreset();
    else console.warn('AdminSettings not initialized');
};

window.changeLayoutStyle = () => {
    if (adminSettings) adminSettings.changeLayoutStyle();
    else console.warn('AdminSettings not initialized');
};

window.updatePrimaryColor = () => {
    if (adminSettings) adminSettings.updatePrimaryColor();
    else console.warn('AdminSettings not initialized');
};

window.updatePrimaryColorFromHex = () => {
    if (adminSettings) adminSettings.updatePrimaryColorFromHex();
    else console.warn('AdminSettings not initialized');
};

window.updateAccentColor = () => {
    if (adminSettings) adminSettings.updateAccentColor();
    else console.warn('AdminSettings not initialized');
};

window.updateAccentColorFromHex = () => {
    if (adminSettings) adminSettings.updateAccentColorFromHex();
    else console.warn('AdminSettings not initialized');
};

window.updateFontSize = () => {
    if (adminSettings) adminSettings.updateFontSize();
    else console.warn('AdminSettings not initialized');
};

window.updateAnimationSpeed = () => {
    if (adminSettings) adminSettings.updateAnimationSpeed();
    else console.warn('AdminSettings not initialized');
};

window.handleLogoUpload = (event) => {
    if (adminSettings) adminSettings.handleLogoUpload(event);
    else console.warn('AdminSettings not initialized');
};

window.removeLogo = () => {
    if (adminSettings) adminSettings.removeLogo();
    else console.warn('AdminSettings not initialized');
};

window.handleBackgroundUpload = (event) => {
    if (adminSettings) adminSettings.handleBackgroundUpload(event);
    else console.warn('AdminSettings not initialized');
};

window.removeBackground = () => {
    if (adminSettings) adminSettings.removeBackground();
    else console.warn('AdminSettings not initialized');
};

window.restoreDefaultBackground = () => {
    if (adminSettings) adminSettings.restoreDefaultBackground();
    else console.warn('AdminSettings not initialized');
};

window.updateBackgroundOpacity = () => {
    if (adminSettings) adminSettings.updateBackgroundOpacity();
    else console.warn('AdminSettings not initialized');
};

window.updateBackgroundSize = () => {
    if (adminSettings) adminSettings.updateBackgroundSize();
    else console.warn('AdminSettings not initialized');
};

window.updateBackgroundPosition = () => {
    if (adminSettings) adminSettings.updateBackgroundPosition();
    else console.warn('AdminSettings not initialized');
};

window.updateDateFormat = () => {
    if (adminSettings) adminSettings.updateDateFormat();
    else console.warn('AdminSettings not initialized');
};

window.updateTimeFormat = () => {
    if (adminSettings) adminSettings.updateTimeFormat();
    else console.warn('AdminSettings not initialized');
};

window.updateTimezone = () => {
    if (adminSettings) adminSettings.updateTimezone();
    else console.warn('AdminSettings not initialized');
};

window.updateFirstDay = () => {
    if (adminSettings) adminSettings.updateFirstDay();
    else console.warn('AdminSettings not initialized');
};

window.loadEmailTemplate = () => {
    if (adminSettings) adminSettings.loadEmailTemplate();
    else console.warn('AdminSettings not initialized');
};

window.saveEmailTemplate = () => {
    if (adminSettings) adminSettings.saveEmailTemplate();
    else console.warn('AdminSettings not initialized');
};

window.previewEmailTemplate = () => {
    if (adminSettings) adminSettings.previewEmailTemplate();
    else console.warn('AdminSettings not initialized');
};

window.resetEmailTemplate = () => {
    if (adminSettings) adminSettings.resetEmailTemplate();
    else console.warn('AdminSettings not initialized');
};

window.togglePushNotifications = () => {
    if (adminSettings) adminSettings.togglePushNotifications();
    else console.warn('AdminSettings not initialized');
};

window.testPushNotification = () => {
    if (adminSettings) adminSettings.testPushNotification();
    else console.warn('AdminSettings not initialized');
};

window.updateFileSizeLimit = () => {
    if (adminSettings) adminSettings.updateFileSizeLimit();
    else console.warn('AdminSettings not initialized');
};

window.clearBrowserCache = () => {
    if (adminSettings) adminSettings.clearBrowserCache();
    else console.warn('AdminSettings not initialized');
};

window.clearAppCache = () => {
    if (adminSettings) adminSettings.clearAppCache();
    else console.warn('AdminSettings not initialized');
};

window.clearAllCache = () => {
    if (adminSettings) adminSettings.clearAllCache();
    else console.warn('AdminSettings not initialized');
};

window.refreshCacheInfo = () => {
    if (adminSettings) adminSettings.refreshCacheInfo();
    else console.warn('AdminSettings not initialized');
};

window.saveTermsOfService = () => {
    if (adminSettings) adminSettings.saveTermsOfService();
    else console.warn('AdminSettings not initialized');
};

window.previewTermsOfService = () => {
    if (adminSettings) adminSettings.previewTermsOfService();
    else console.warn('AdminSettings not initialized');
};

window.resetTermsOfService = () => {
    if (adminSettings) adminSettings.resetTermsOfService();
    else console.warn('AdminSettings not initialized');
};

window.saveAllSettings = () => {
    if (adminSettings) adminSettings.saveAllSettings();
    else console.warn('AdminSettings not initialized');
};

window.resetAllSettings = () => {
    if (adminSettings) adminSettings.resetAllSettings();
    else console.warn('AdminSettings not initialized');
};
