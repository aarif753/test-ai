// Authentication and session management script
// Include this in all protected HTML files

// Global session variables
const activeSessions = JSON.parse(localStorage.getItem('activeSessions')) || {};

// Check authentication status
function checkAuth() {
    const loggedIn = sessionStorage.getItem('loggedIn');
    const userId = sessionStorage.getItem('userId');
    const loginTime = sessionStorage.getItem('loginTime');
    
    // If not logged in, redirect to login
    if (loggedIn !== 'true' || !userId || !loginTime) {
        redirectToLogin();
        return false;
    }
    
    // Check if session expired at midnight
    const now = new Date();
    const lastLogin = new Date(parseInt(loginTime));
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    
    if (now > midnight && lastLogin < midnight) {
        // Session expired
        logout();
        return false;
    }
    
    // Check if this is the active session
    if (!activeSessions[userId] || activeSessions[userId] !== parseInt(loginTime)) {
        // Another device/browser has logged in
        logout();
        alert("This account has been logged in from another device. You have been logged out.");
        return false;
    }
    
    return true;
}

// Redirect to login page
function redirectToLogin() {
    sessionStorage.clear();
    window.location.href = 'login.html';
}

// Logout function
function logout() {
    const userId = sessionStorage.getItem('userId');
    
    // Remove from active sessions
    if (userId && activeSessions[userId]) {
        delete activeSessions[userId];
        localStorage.setItem('activeSessions', JSON.stringify(activeSessions));
    }
    
    // Clear session storage
    sessionStorage.clear();
    
    // Redirect to login
    window.location.href = 'login.html';
}

// Auto-check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) {
        return;
    }
    
    // Set up auto-logout at midnight
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const timeUntilMidnight = midnight - now;
    
    setTimeout(function() {
        logout();
        alert("Your session has expired. Please login again.");
    }, timeUntilMidnight);
    
    // Add logout button if needed
    if (!document.getElementById('logoutBtn')) {
        const logoutBtn = document.createElement('button');
        logoutBtn.id = 'logoutBtn';
        logoutBtn.textContent = 'Logout';
        logoutBtn.style.position = 'fixed';
        logoutBtn.style.top = '10px';
        logoutBtn.style.right = '10px';
        logoutBtn.style.padding = '8px 15px';
        logoutBtn.style.background = '#f72585';
        logoutBtn.style.color = 'white';
        logoutBtn.style.border = 'none';
        logoutBtn.style.borderRadius = '5px';
        logoutBtn.style.cursor = 'pointer';
        logoutBtn.onclick = logout;
        
        document.body.appendChild(logoutBtn);
    }
});

// Prevent access via direct URL
if (window.location !== window.parent.location) {
    // Page is in an iframe
    redirectToLogin();
}