// PADY Healthcare System - Firebase Version
// Main Application JavaScript

// ============================================
// 1. CONFIGURATION
// ============================================
const CONFIG = {
  APP_NAME: 'PADY Healthcare',
  VERSION: '2.0.0',
  REFRESH_INTERVAL: 30000 // 30 seconds
};

// ============================================
// 2. NOTIFICATION SYSTEM
// ============================================
function showNotification(type, message) {
  const container = document.getElementById('notification-container') || createNotificationContainer();
  
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  
  const icons = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ'
  };

  notification.innerHTML = `
    <span class="icon">${icons[type]}</span>
    <span class="message">${message}</span>
    <button class="close-btn" onclick="this.parentElement.remove()">×</button>
  `;

  container.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function createNotificationContainer() {
  const container = document.createElement('div');
  container.id = 'notification-container';
  document.body.appendChild(container);
  return container;
}

// ============================================
// 3. FORM VALIDATION
// ============================================
function validateForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return false;

  let isValid = true;
  const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');

  inputs.forEach(input => {
    clearError(input);
    
    if (!input.value.trim()) {
      showError(input, 'This field is required');
      isValid = false;
    } else if (input.type === 'email' && !isValidEmail(input.value)) {
      showError(input, 'Please enter a valid email');
      isValid = false;
    } else if (input.type === 'tel' && !isValidPhone(input.value)) {
      showError(input, 'Please enter a valid phone number');
      isValid = false;
    }
  });

  return isValid;
}

function showError(input, message) {
  input.classList.add('is-invalid');
  const error = document.createElement('div');
  error.className = 'error-message';
  error.textContent = message;
  input.parentElement.appendChild(error);
}

function clearError(input) {
  input.classList.remove('is-invalid');
  const error = input.parentElement.querySelector('.error-message');
  if (error) error.remove();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(phone);
}

// ============================================
// 4. SEARCH FUNCTIONALITY
// ============================================
function setupSearch(inputId, containerId) {
  const searchInput = document.getElementById(inputId);
  if (!searchInput) return;

  let allItems = [];
  const container = document.getElementById(containerId);
  
  if (container) {
    allItems = Array.from(container.children);
  }

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    
    allItems.forEach(item => {
      const text = item.textContent.toLowerCase();
      item.style.display = text.includes(query) ? '' : 'none';
    });

    const visibleCount = allItems.filter(item => item.style.display !== 'none').length;
    updateResultsCount(visibleCount, allItems.length);
  });
}

function updateResultsCount(visible, total) {
  const counter = document.getElementById('results-count');
  if (counter) {
    counter.textContent = `Showing ${visible} of ${total} results`;
  }
}

// ============================================
// 5. DASHBOARD UPDATES
// ============================================
async function updateDashboard() {
  try {
    const stats = await dbService.getDashboardStats();

    updateStat('total-patients', stats.totalPatients);
    updateStat('total-appointments', stats.totalAppointments);
    updateStat('today-appointments', stats.todayAppointments);
    updateStat('pending-appointments', stats.pendingAppointments);

    updateLastRefresh();
  } catch (error) {
    console.error('Error updating dashboard:', error);
  }
}

function updateStat(elementId, value) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = value;
    element.style.animation = 'pulse 0.5s';
    setTimeout(() => element.style.animation = '', 500);
  }
}

function updateLastRefresh() {
  const element = document.getElementById('last-updated');
  if (element) {
    const now = new Date();
    element.textContent = `Last updated: ${now.toLocaleTimeString()}`;
  }
}

// ============================================
// 6. TABLE SORTING
// ============================================
function makeTableSortable(tableId) {
  const table = document.getElementById(tableId);
  if (!table) return;

  const headers = table.querySelectorAll('th[data-sortable]');
  
  headers.forEach((header, index) => {
    header.style.cursor = 'pointer';
    header.innerHTML += ' <span class="sort-indicator">⇅</span>';
    
    header.addEventListener('click', () => {
      sortTable(table, index);
    });
  });
}

function sortTable(table, columnIndex) {
  const tbody = table.querySelector('tbody');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  const isAscending = table.dataset.sortOrder !== 'asc';

  rows.sort((a, b) => {
    const aValue = a.cells[columnIndex].textContent.trim();
    const bValue = b.cells[columnIndex].textContent.trim();

    const aNum = parseFloat(aValue);
    const bNum = parseFloat(bValue);

    let comparison = 0;
    if (!isNaN(aNum) && !isNaN(bNum)) {
      comparison = aNum - bNum;
    } else {
      comparison = aValue.localeCompare(bValue);
    }

    return isAscending ? comparison : -comparison;
  });

  rows.forEach(row => tbody.appendChild(row));
  table.dataset.sortOrder = isAscending ? 'asc' : 'desc';
}

// ============================================
// 7. LOADING STATES
// ============================================
function showLoading(elementId, message = 'Loading...') {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>${message}</p>
      </div>
    `;
  }
}

function hideLoading(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    const spinner = element.querySelector('.loading-spinner');
    if (spinner) spinner.remove();
  }
}

function setButtonLoading(button, loading = true) {
  if (loading) {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.innerHTML = '<span class="spinner-small"></span> Loading...';
  } else {
    button.disabled = false;
    button.textContent = button.dataset.originalText || 'Submit';
  }
}

// ============================================
// 8. MODAL HELPERS
// ============================================
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}

function setupModals() {
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      e.target.style.display = 'none';
      document.body.style.overflow = '';
    }
  });

  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal');
      if (modal) closeModal(modal.id);
    });
  });
}

// ============================================
// 9. PASSWORD TOGGLE
// ============================================
function setupPasswordToggles() {
  const toggleButtons = document.querySelectorAll('.toggle-password');
  
  toggleButtons.forEach(button => {
    button.addEventListener('click', () => {
      const input = button.parentElement.querySelector('input');
      if (input.type === 'password') {
        input.type = 'text';
        button.textContent = '👁️';
      } else {
        input.type = 'password';
        button.textContent = '👁️‍🗨️';
      }
    });
  });
}

// ============================================
// 10. UTILITY FUNCTIONS
// ============================================
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ============================================
// 11. INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  console.log(`${CONFIG.APP_NAME} v${CONFIG.VERSION} initialized`);

  // Setup password toggles
  setupPasswordToggles();

  // Setup modals
  setupModals();

  // Setup search if present
  if (document.getElementById('search-input')) {
    setupSearch('search-input', 'search-results');
  }

  // Make tables sortable
  document.querySelectorAll('table[data-sortable]').forEach(table => {
    makeTableSortable(table.id);
  });

  // Update dashboard if on dashboard page
  if (document.getElementById('dashboard')) {
    updateDashboard();
    setInterval(updateDashboard, CONFIG.REFRESH_INTERVAL);
  }
});

// ============================================
// 12. EXPOSE GLOBAL FUNCTIONS
// ============================================
window.PADY = {
  showNotification,
  validateForm,
  formatDate,
  formatTime,
  openModal,
  closeModal,
  authService,
  dbService
};

console.log('PADY Firebase app loaded successfully');
