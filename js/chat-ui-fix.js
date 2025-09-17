// chat-ui-fix.js
document.addEventListener('DOMContentLoaded', function() {
    // Fix chat container height and scrolling
    function fixChatContainer() {
        const chatContainer = document.querySelector('.chat-container');
        const chatHeader = document.querySelector('.chat-header');
        const chatMessages = document.getElementById('chatMessages');
        const chatInput = document.querySelector('.chat-input');
        const header = document.querySelector('header');
        const welcomeMessage = document.querySelector('.welcome-message');
        const footer = document.querySelector('footer');
        const mainContent = document.querySelector('.main-content');
        
        if (chatContainer && chatMessages) {
            // Calculate available height for chat messages
            const windowHeight = window.innerHeight;
            const headerHeight = header ? header.offsetHeight : 0;
            const welcomeHeight = welcomeMessage ? welcomeMessage.offsetHeight : 0;
            const chatHeaderHeight = chatHeader ? chatHeader.offsetHeight : 0;
            const chatInputHeight = chatInput ? chatInput.offsetHeight : 0;
            const footerHeight = footer ? footer.offsetHeight : 0;
            
            // Calculate margins and paddings (approximate)
            const margins = 50;
            
            // Set the maximum height for the chat container
            const maxChatHeight = windowHeight - headerHeight - welcomeHeight - footerHeight - margins;
            chatContainer.style.maxHeight = maxChatHeight + 'px';
            
            // Set the height for chat messages area
            const messagesHeight = maxChatHeight - chatHeaderHeight - chatInputHeight;
            chatMessages.style.height = messagesHeight + 'px';
            chatMessages.style.overflowY = 'auto';
            
            // Add a CSS class for styling
            chatContainer.classList.add('fixed-chat-ui');
            
            // For mobile devices, adjust the layout
            if (window.innerWidth <= 900) {
                // Additional adjustments for mobile
                const testPanel = document.querySelector('.test-series-panel');
                if (testPanel) {
                    testPanel.style.maxHeight = 'none';
                }
                
                // Ensure messages are properly sized on mobile
                const messages = document.querySelectorAll('.message');
                messages.forEach(msg => {
                    msg.style.maxWidth = '90%';
                });
            }
        }
    }
    
    // Add CSS styles for the fixed chat UI
    function addChatUIStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .fixed-chat-ui {
                display: flex;
                flex-direction: column;
            }
            
            #chatMessages {
                flex-grow: 1;
                overflow-y: auto;
                padding: 15px;
                display: flex;
                flex-direction: column;
                gap: 15px;
                min-height: 300px;
            }
            
            .chat-input {
                flex-shrink: 0;
                margin-top: auto;
                padding: 15px;
            }
            
            /* Mobile responsiveness */
            @media (max-width: 900px) {
                .fixed-chat-ui {
                    max-height: 65vh !important;
                }
                
                .container {
                    padding: 10px;
                    gap: 15px;
                }
                
                .main-content {
                    gap: 20px;
                }
                
                .welcome-message {
                    padding: 20px;
                }
                
                .welcome-message h2 {
                    font-size: 1.5rem;
                }
                
                .welcome-message p {
                    font-size: 1rem;
                }
                
                .test-series-panel {
                    padding: 20px;
                }
                
                .chat-header {
                    padding: 15px;
                }
                
                .chat-header h2 {
                    font-size: 1.2rem;
                }
                
                .message {
                    padding: 12px 16px;
                    font-size: 0.95rem;
                }
                
                .message-time {
                    font-size: 0.7rem;
                }
                
                #userInput {
                    padding: 12px 18px;
                    font-size: 0.95rem;
                }
                
                .send-btn {
                    width: 45px;
                    height: 45px;
                    font-size: 1.1rem;
                }
            }
            
            @media (max-width: 600px) {
                .fixed-chat-ui {
                    max-height: 60vh !important;
                }
                
                #chatMessages {
                    padding: 12px;
                    gap: 12px;
                }
                
                .message {
                    max-width: 90% !important;
                    padding: 10px 14px;
                    font-size: 0.9rem;
                }
                
                .chat-input {
                    padding: 12px;
                }
                
                #userInput {
                    padding: 10px 16px;
                    font-size: 0.9rem;
                }
                
                .send-btn {
                    width: 40px;
                    height: 40px;
                    font-size: 1rem;
                    margin-left: 10px;
                }
                
                .test-buttons {
                    flex-direction: column;
                    gap: 12px;
                }
                
                .primary-btn, .secondary-btn {
                    width: 100%;
                    max-width: 250px;
                    margin: 0 auto;
                }
            }
            
            @media (max-width: 400px) {
                .fixed-chat-ui {
                    max-height: 55vh !important;
                }
                
                .logo h1 {
                    font-size: 1.3rem;
                }
                
                .theme-toggle {
                    width: 45px;
                    height: 45px;
                    font-size: 1.3rem;
                }
                
                .welcome-message h2 {
                    font-size: 1.3rem;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Make text responsive in messages
    function makeTextResponsive() {
        const messages = document.querySelectorAll('.message p');
        messages.forEach(message => {
            // Ensure text wraps properly
            message.style.wordWrap = 'break-word';
            message.style.overflowWrap = 'break-word';
        });
    }
    
    // Initialize the chat UI fixes
    function initChatUI() {
        addChatUIStyles();
        fixChatContainer();
        makeTextResponsive();
        
        // Recalculate on window resize
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                fixChatContainer();
                makeTextResponsive();
            }, 250);
        });
        
        // Scroll to bottom when new message is added
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    const chatMessages = document.getElementById('chatMessages');
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                    
                    // Reapply responsive text to new messages
                    setTimeout(makeTextResponsive, 100);
                }
            });
        });
        
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            observer.observe(chatMessages, { childList: true });
            
            // Initial scroll to bottom
            setTimeout(() => {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 500);
        }
    }
    
    // Initialize when DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChatUI);
    } else {
        initChatUI();
    }
});