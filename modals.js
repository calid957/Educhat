// Custom Modal System
class CustomModal {
    constructor() {
        this.overlay = null;
        this.modal = null;
        this.resolveCallback = null;
        this.rejectCallback = null;
    }

    // Show alert modal
    showAlert(message, type = 'info', title = null) {
        return new Promise((resolve) => {
            this.createModal(type, title || this.getDefaultTitle(type), message, false, resolve);
        });
    }

    // Show confirm modal
    showConfirm(message, type = 'warning', title = null) {
        return new Promise((resolve, reject) => {
            this.createModal(type, title || this.getDefaultTitle(type), message, true, resolve, reject);
        });
    }

    // Show prompt modal
    showPrompt(message, defaultValue = '', type = 'info', title = null) {
        return new Promise((resolve, reject) => {
            this.createPromptModal(type, title || this.getDefaultTitle(type), message, defaultValue, resolve, reject);
        });
    }

    // Create modal
    createModal(type, title, message, hasButtons = false, resolveCallback = null, rejectCallback = null) {
        this.resolveCallback = resolveCallback;
        this.rejectCallback = rejectCallback;

        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'custom-modal-overlay';

        // Create modal
        this.modal = document.createElement('div');
        this.modal.className = 'custom-modal';

        // Get icon based on type
        const icon = this.getIcon(type);

        // Build modal content
        let modalContent = `
            <div class="custom-modal-header">
                <div class="custom-modal-icon ${type}">
                    <i class="fas ${icon}"></i>
                </div>
                <h3 class="custom-modal-title">${title}</h3>
            </div>
            <div class="custom-modal-body">
                ${message}
            </div>
        `;

        // Add buttons if needed
        if (hasButtons) {
            modalContent += `
                <div class="custom-modal-footer">
                    <button type="button" class="custom-modal-button secondary" onclick="customModal.closeModal(false)">
                        Cancel
                    </button>
                    <button type="button" class="custom-modal-button primary" onclick="customModal.closeModal(true)">
                        OK
                    </button>
                </div>
            `;
        } else {
            modalContent += `
                <div class="custom-modal-footer">
                    <button type="button" class="custom-modal-button primary" onclick="customModal.closeModal(true)">
                        OK
                    </button>
                </div>
            `;
        }

        this.modal.innerHTML = modalContent;

        // Add to DOM
        this.overlay.appendChild(this.modal);
        document.body.appendChild(this.overlay);

        // Show modal with animation
        setTimeout(() => {
            this.overlay.classList.add('show');
        }, 10);
    }

    // Create prompt modal
    createPromptModal(type, title, message, defaultValue, resolveCallback, rejectCallback) {
        this.resolveCallback = resolveCallback;
        this.rejectCallback = rejectCallback;

        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'custom-modal-overlay';

        // Create modal
        this.modal = document.createElement('div');
        this.modal.className = 'custom-modal';

        // Get icon based on type
        const icon = this.getIcon(type);

        // Build modal content
        this.modal.innerHTML = `
            <div class="custom-modal-header">
                <div class="custom-modal-icon ${type}">
                    <i class="fas ${icon}"></i>
                </div>
                <h3 class="custom-modal-title">${title}</h3>
            </div>
            <div class="custom-modal-body">
                <p>${message}</p>
                <input type="text" class="custom-modal-input" id="promptInput" value="${defaultValue}" placeholder="Enter your response...">
            </div>
            <div class="custom-modal-footer">
                <button type="button" class="custom-modal-button secondary" onclick="customModal.closePromptModal(false)">
                    Cancel
                </button>
                <button type="button" class="custom-modal-button primary" onclick="customModal.closePromptModal(true)">
                    OK
                </button>
            </div>
        `;

        // Add to DOM
        this.overlay.appendChild(this.modal);
        document.body.appendChild(this.overlay);

        // Show modal with animation
        setTimeout(() => {
            this.overlay.classList.add('show');
            // Focus on input
            const input = document.getElementById('promptInput');
            if (input) {
                input.focus();
                input.select();
            }
        }, 10);
    }

    // Close modal
    closeModal(result = null) {
        if (this.resolveCallback) {
            this.resolveCallback(result);
        }
        this.removeModal();
    }

    // Close prompt modal
    closePromptModal(result = null) {
        if (result) {
            const input = document.getElementById('promptInput');
            if (input) {
                if (this.resolveCallback) {
                    this.resolveCallback(input.value);
                }
            }
        } else {
            if (this.rejectCallback) {
                this.rejectCallback();
            }
        }
        this.removeModal();
    }

    // Remove modal from DOM
    removeModal() {
        if (this.overlay) {
            this.overlay.classList.remove('show');
            setTimeout(() => {
                if (this.overlay && this.overlay.parentNode) {
                    document.body.removeChild(this.overlay);
                }
                this.overlay = null;
                this.modal = null;
                this.resolveCallback = null;
                this.rejectCallback = null;
            }, 300);
        }
    }

    // Get icon based on type
    getIcon(type) {
        const icons = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'warning': 'fa-exclamation-triangle',
            'info': 'fa-info-circle'
        };
        return icons[type] || 'fa-info-circle';
    }

    // Get default title based on type
    getDefaultTitle(type) {
        const titles = {
            'success': 'Success',
            'error': 'Error',
            'warning': 'Warning',
            'info': 'Information'
        };
        return titles[type] || 'Information';
    }
}

// Create global instance
const customModal = new CustomModal();

// Override native alert, confirm, and prompt functions
window.showAlert = function(message, type = 'info', title = null) {
    return customModal.showAlert(message, type, title);
};

window.showConfirm = function(message, type = 'warning', title = null) {
    return customModal.showConfirm(message, type, title);
};

window.showPrompt = function(message, defaultValue = '', type = 'info', title = null) {
    return customModal.showPrompt(message, defaultValue, type, title);
};

// For backward compatibility, you can also override native functions if needed
// window.alert = function(message) {
//     return customModal.showAlert(message, 'info', 'Alert');
// };

// window.confirm = function(message) {
//     return customModal.showConfirm(message, 'warning', 'Confirm');
// };

// window.prompt = function(message, defaultValue) {
//     return customModal.showPrompt(message, defaultValue, 'info', 'Prompt');
// };

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CustomModal;
}
