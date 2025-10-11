// js/worker-api.js - Cloudflare Worker Integration
class WorkerAPI {
    constructor() {
        this.isActive = false;
        this.workerUrl = 'https://test-ai-0105.kumar8948rahul.workers.dev/';
        this.currentModel = 'default';
    }

    async initialize() {
        this.setupEventListeners();
        this.updateUI();
        this.integrateWithChat();
    }

    setupEventListeners() {
        const modelSelect = document.getElementById('modelSelect');
        const apiStatus = document.getElementById('apiStatus');

        modelSelect.addEventListener('change', (e) => {
            this.currentModel = e.target.value;
            this.isActive = this.currentModel === 'deepseek';
            this.updateUI();
            this.showModelChangeNotification();
        });

        apiStatus.addEventListener('click', () => {
            this.testConnection();
        });
    }

    integrateWithChat() {
        const sendBtn = document.getElementById('sendBtn');
        const userInput = document.getElementById('userInput');
        
        const handleSend = async () => {
            const message = userInput.value.trim();
            if (!message) return;

            if (this.isActive) {
                await this.processWorkerMessage(message);
            } else {
                // Use default chat behavior (your existing functionality)
                this.processDefaultMessage(message);
            }
        };

        sendBtn.addEventListener('click', handleSend);
        
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSend();
            }
        });
    }

    async processWorkerMessage(message) {
        const chatMessages = document.getElementById('chatMessages');
        
        // Add user message
        const userMessageDiv = document.createElement('div');
        userMessageDiv.className = 'message user-message';
        userMessageDiv.innerHTML = `
            <p>${this.escapeHtml(message)}</p>
            <span class="message-time">${this.getCurrentTime()}</span>
        `;
        chatMessages.appendChild(userMessageDiv);
        
        // Add loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message ai-message loading';
        loadingDiv.innerHTML = `
            <p><i class="fas fa-spinner fa-spin"></i> DeepSeek AI is thinking...</p>
        `;
        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Clear input
        document.getElementById('userInput').value = '';
        
        try {
            const response = await this.sendToWorker(message);
            
            // Remove loading indicator
            loadingDiv.remove();
            
            // Add AI response
            const aiMessageDiv = document.createElement('div');
            aiMessageDiv.className = 'message ai-message';
            aiMessageDiv.innerHTML = `
                <p>${response}</p>
                <span class="message-time">${this.getCurrentTime()}</span>
            `;
            chatMessages.appendChild(aiMessageDiv);
            
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
        } catch (error) {
            // Remove loading indicator
            loadingDiv.remove();
            
            // Show error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'message ai-message error';
            errorDiv.innerHTML = `
                <p>Sorry, I encountered an error connecting to DeepSeek AI. Please try again.</p>
                <span class="message-time">${this.getCurrentTime()}</span>
            `;
            chatMessages.appendChild(errorDiv);
            
            chatMessages.scrollTop = chatMessages.scrollHeight;
            console.error('Worker API Error:', error);
        }
    }

    async sendToWorker(message) {
        try {
            const response = await fetch(this.workerUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message
                })
            });

            if (!response.ok) {
                throw new Error(`Worker request failed: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            return data.response || 'No response received from AI';
        } catch (error) {
            console.error('Worker API Error:', error);
            throw new Error('Failed to connect to AI service');
        }
    }

    async testConnection() {
        if (!this.isActive) {
            alert('Please select DeepSeek AI mode first.');
            return;
        }

        try {
            const testResponse = await this.sendToWorker('Hello, are you working?');
            if (testResponse && testResponse.length > 0) {
                alert('DeepSeek AI connection successful!');
            } else {
                throw new Error('Empty response');
            }
        } catch (error) {
            alert('DeepSeek AI connection failed. Please check your worker configuration.');
        }
    }

    processDefaultMessage(message) {
        // Your existing chat functionality from script.js
        // This will use your default AI responses
        const chatMessages = document.getElementById('chatMessages');
        
        // Add user message
        const userMessageDiv = document.createElement('div');
        userMessageDiv.className = 'message user-message';
        userMessageDiv.innerHTML = `
            <p>${this.escapeHtml(message)}</p>
            <span class="message-time">${this.getCurrentTime()}</span>
        `;
        chatMessages.appendChild(userMessageDiv);
        
        // Add default AI response
        const aiMessageDiv = document.createElement('div');
        aiMessageDiv.className = 'message ai-message';
        aiMessageDiv.innerHTML = `
            <p>I'm your default AI assistant. For advanced AI features, please switch to DeepSeek AI mode using the dropdown above.</p>
            <span class="message-time">${this.getCurrentTime()}</span>
        `;
        chatMessages.appendChild(aiMessageDiv);
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
        document.getElementById('userInput').value = '';
    }

    updateUI() {
        const currentModel = document.getElementById('currentModel');
        const apiStatus = document.getElementById('apiStatus');
        
        currentModel.textContent = this.isActive ? 'DeepSeek AI' : 'Default AI';
        
        if (this.isActive) {
            apiStatus.innerHTML = '<i class="fas fa-circle" style="color: #4CAF50;"></i>';
            apiStatus.title = 'DeepSeek AI Connected';
        } else {
            apiStatus.innerHTML = '<i class="fas fa-circle" style="color: #ff4444;"></i>';
            apiStatus.title = 'Default AI Mode';
        }
    }

    showModelChangeNotification() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.isActive ? '#4CAF50' : '#2196F3'};
            color: white;
            padding: 12px 20px;
            border-radius: 5px;
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        notification.textContent = `Switched to ${this.isActive ? 'DeepSeek AI' : 'Default AI'} mode`;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getCurrentTime() {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
}

// Initialize Worker API when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.workerAPI = new WorkerAPI();
    window.workerAPI.initialize();
});
