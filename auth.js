// Authentication and session management script
// Include this in all protected HTML files

// Global session variables
const activeSessions = JSON.parse(localStorage.getItem('activeSessions')) || {};
const persistentSessions = JSON.parse(localStorage.getItem('persistentSessions')) || {};

// Check authentication status
function checkAuth() {
    const loggedIn = sessionStorage.getItem('loggedIn');
    const userId = sessionStorage.getItem('userId');
    const loginTime = sessionStorage.getItem('loginTime');
    const sessionId = sessionStorage.getItem('sessionId');
    
    // If not logged in, check for persistent session
    if (loggedIn !== 'true' || !userId || !loginTime || !sessionId) {
        const persistentUserId = localStorage.getItem('persistentUserId');
        const persistentSessionId = localStorage.getItem('persistentSessionId');
        const persistentLoginTime = localStorage.getItem('persistentLoginTime');
        
        if (persistentUserId && persistentSessionId && persistentLoginTime) {
            // Check if persistent session is still valid (not expired)
            const now = new Date();
            const lastLogin = new Date(parseInt(persistentLoginTime));
            const sessionAge = now - lastLogin;
            const maxSessionAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
            
            if (sessionAge < maxSessionAge) {
                // Valid persistent session found, restore it
                sessionStorage.setItem('loggedIn', 'true');
                sessionStorage.setItem('userId', persistentUserId);
                sessionStorage.setItem('loginTime', persistentLoginTime);
                sessionStorage.setItem('sessionId', persistentSessionId);
                
                // Add to active sessions
                if (!activeSessions[persistentUserId]) {
                    activeSessions[persistentUserId] = {};
                }
                activeSessions[persistentUserId][persistentSessionId] = persistentLoginTime;
                localStorage.setItem('activeSessions', JSON.stringify(activeSessions));
                
                return true;
            } else {
                // Session expired, clear persistent data
                clearPersistentSession();
                redirectToLogin();
                return false;
            }
        } else {
            redirectToLogin();
            return false;
        }
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
    
    // Check if this session exists in active sessions
    if (activeSessions[userId] && activeSessions[userId][sessionId]) {
        // Session is valid
        return true;
    }
    
    // Invalid session
    logout();
    alert("Your session is invalid. Please login again.");
    return false;
}

// Clear persistent session data
function clearPersistentSession() {
    localStorage.removeItem('persistentUserId');
    localStorage.removeItem('persistentSessionId');
    localStorage.removeItem('persistentLoginTime');
}

// Redirect to login page
function redirectToLogin() {
    sessionStorage.clear();
    window.location.href = 'login.html';
}

// Logout function
function logout() {
    const userId = sessionStorage.getItem('userId');
    const sessionId = sessionStorage.getItem('sessionId');
    
    // Remove from active sessions if it exists there
    if (userId && sessionId && activeSessions[userId] && activeSessions[userId][sessionId]) {
        delete activeSessions[userId][sessionId];
        
        // If no more sessions for this user, remove the user entry
        if (Object.keys(activeSessions[userId]).length === 0) {
            delete activeSessions[userId];
        }
        
        localStorage.setItem('activeSessions', JSON.stringify(activeSessions));
    }
    
    // Clear persistent session if it exists
    if (userId === localStorage.getItem('persistentUserId')) {
        clearPersistentSession();
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
