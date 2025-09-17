// Reset Chat Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Create and add reset button to chat header
    const chatHeader = document.querySelector('.chat-header');
    const resetBtn = document.createElement('button');
    resetBtn.classList.add('chat-reset-btn');
    resetBtn.setAttribute('aria-label', 'Reset chat');
    resetBtn.innerHTML = '<i class="fas fa-trash"></i>';
    chatHeader.appendChild(resetBtn);
    
    // Reset chat function
    resetBtn.addEventListener('click', function() {
        if (confirm("Are you sure you want to reset the chat? This will clear all messages except the welcome message.")) {
            // Clear chat history from localStorage
            localStorage.removeItem('chatHistory');
            
            // Clear the chat messages container
            const chatMessages = document.getElementById('chatMessages');
            chatMessages.innerHTML = '';
            
            // Add the welcome message back
            const welcomeMessage = document.createElement('div');
            welcomeMessage.classList.add('message', 'ai-message');
            welcomeMessage.innerHTML = `
                <p>Hello! How can I assist you with your test preparation today?</p>
                <span class="message-time">Just now</span>
            `;
            chatMessages.appendChild(welcomeMessage);
        }
    });
});
