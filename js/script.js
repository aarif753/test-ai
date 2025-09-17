document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const themeToggle = document.getElementById('themeToggle');
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const historyBtn = document.getElementById('historyBtn');
    const aiatsBtn = document.getElementById('aiatsBtn');
    const ftBtn = document.getElementById('ftBtn');
    const dateSearchBtn = document.getElementById('dateSearchBtn');
    
    // Theme Toggle
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
        saveToLocalStorage('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    });
    
    // Load saved theme
    const savedTheme = getFromLocalStorage('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    // Test data from JSON
    let testData = {};
    
    // Fetch test data from JSON file
    fetchTestData();

    async function fetchTestData() {
        try {
            const response = await fetch('test-series.json');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const jsonData = await response.json();
            testData = processTestData(jsonData);
            
            // Load recent tests from JSON
            loadRecentTests(jsonData.recentTests);
            
            // Load chat history
            loadChatHistory();
        } catch (error) {
            console.error('Error fetching test data:', error);
            addMessage("Sorry, I'm having trouble loading the test data. Please try again later.", 'ai');
        }
    }
    
    // Process JSON data into a more usable format
    function processTestData(jsonData) {
        const processedData = {};
        
        jsonData.tests.forEach(test => {
            processedData[test.id] = {
                name: test.name,
                date: test.date,
                phase: test.phase,
                batch: test.batch,
                category: test.category,
                link: test.link,
                topics: test.topics,
                duration: test.duration,
                questions: test.questions
            };
        });
        
        return processedData;
    }
    
    // Load recent tests from JSON
    function loadRecentTests(recentTestIds) {
        const testList = document.querySelector('.test-list');
        testList.innerHTML = ''; // Clear existing content
        
        recentTestIds.forEach(testId => {
            if (testData[testId]) {
                const test = testData[testId];
                const button = document.createElement('button');
                button.classList.add('test-btn');
                button.setAttribute('data-test', testId);
                button.innerHTML = `${test.name} <i class="fas fa-arrow-right"></i>`;
                button.addEventListener('click', () => {
                    addMessage(`Show me ${test.name}`, 'user');
                    setTimeout(() => {
                        addMessage(`Here's ${test.name} (Date: ${formatDate(test.date)}, Phase: ${test.phase}, Batch: ${test.batch}). <button class="inline-btn" onclick="accessTest('${testId}')">Click here to access the test</button>.`, 'ai');
                    }, 1000);
                });
                testList.appendChild(button);
            }
        });
    }
    
    // Send message function
    function sendMessage() {
        const message = userInput.value.trim();
        if (message === '') return;
        
        addMessage(message, 'user');
        userInput.value = '';
        
        // Simulate AI thinking with typing indicator
        showTypingIndicator();
        
        setTimeout(() => {
            hideTypingIndicator();
            processMessage(message);
        }, 1500);
    }
    
    // Show typing indicator
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.classList.add('message', 'ai-message');
        typingDiv.innerHTML = `
            <div class="typing">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Hide typing indicator
    function hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    // Process user message with advanced AI capabilities
    function processMessage(message) {
        const lowerMsg = message.toLowerCase();
        
        // Check for test-related queries
        if (lowerMsg.includes('aiats') || lowerMsg.includes('ft') || lowerMsg.includes('test') || 
            lowerMsg.includes('exam') || lowerMsg.includes('series')) {
            handleTestQuery(message);
        }
 
// Check for greetings (hi/hello with common typos and emojis)
else if (/(hello|helo|hllo|hlo|hi|hii|hy|hyy|hey|heyy)/i.test(lowerMsg)) {
    const greetings = [
        "Hello! 👋 How can I assist you with your test series today?",
        "Hi there! 😃 Ready to explore some test series?",
        "Hey! 🌟 How can I help you with AIATS or FT tests today?",
        "Hi! 🙌 Nice to see you here. How can I help?",
        "Hello! 🌸 Hope you're having a great day. Need any guidance?"
    ];
    addMessage(greetings[Math.floor(Math.random() * greetings.length)], 'ai');
}

        // Check for thank you
        else if (/(thanks|thank you|appreciate|grateful)/i.test(lowerMsg)) {
            const thanksResponses = [
                "You're welcome! Let me know if you need any more assistance with your test series.",
                "Happy to help! Feel free to ask if you have more questions about test series.",
                "Anytime! Don't hesitate to ask if you need more information about AIATS or FT tests."
            ];
            addMessage(thanksResponses[Math.floor(Math.random() * thanksResponses.length)], 'ai');
        }


// Check for good morning (fuzzy)
else if (/g.*o.*o.*d.*\s*m.*o.*r.*n.*i.*n.*g/i.test(lowerMsg) || /morning/i.test(lowerMsg)) {
    const goodMorningResponses = [
        "Good morning 🌞 May your day be filled with positivity and success!",
        "Morning! 🌸 Wishing you a productive and joyful day ahead.",
        "Good morning 🌟 Let's make today amazing and full of learning."
    ];
    addMessage(goodMorningResponses[Math.floor(Math.random() * goodMorningResponses.length)], 'ai');
}


// Check for how can you help me
else if (/how can you help me/i.test(lowerMsg)) {
    const helpResponses = [
        "I can assist you with test series guidance, AIATS tips, and FT preparation 📚.",
        "I provide study support, test info, and helpful advice for your exams 🌟.",
        "I’m here to answer your questions, guide you through test strategies, and keep you motivated 💡."
    ];
    addMessage(helpResponses[Math.floor(Math.random() * helpResponses.length)], 'ai');
}


// Check for AIATS
else if (/what is aiats/i.test(lowerMsg)) {
    const aiatsResponses = [
        "AIATS is a mock test series designed to help you prepare effectively 📝.",
        "AIATS stands for All India AI Test Series, aimed at boosting your exam readiness 🌟.",
        "It’s a structured set of practice tests to strengthen your skills and confidence 💡."
    ];
    addMessage(aiatsResponses[Math.floor(Math.random() * aiatsResponses.length)], 'ai');
}

// Check for FT tips
else if (/tips for ft|ft tips/i.test(lowerMsg)) {
    const ftTipsResponses = [
        "Focus on understanding concepts, practice regularly, and analyze mistakes 🧠.",
        "Time management and consistent revision are key for FT success ⏰.",
        "Take mock tests, note weak areas, and improve steadily 🌟."
    ];
    addMessage(ftTipsResponses[Math.floor(Math.random() * ftTipsResponses.length)], 'ai');
}

// Check for motivational quote
else if (/motivation|quote|inspire/i.test(lowerMsg)) {
    const quoteResponses = [
        "“Success is the sum of small efforts repeated day in and day out.” 🌟",
        "“Believe you can, and you’re halfway there.” 💡",
        "“Every day is a new opportunity to grow and shine.” ✨"
    ];
    addMessage(quoteResponses[Math.floor(Math.random() * quoteResponses.length)], 'ai');
}

// Check for stressed
else if (/stressed|stress|tensed|anxious/i.test(lowerMsg)) {
    const stressedResponses = [
        "Take a deep breath 🌬️ Everything will fall into place with patience and effort.",
        "Remember, small steps lead to big results 💪 Stay calm and keep going.",
        "Focus on what you can control today, and let go of what you can’t 🌸."
    ];
    addMessage(stressedResponses[Math.floor(Math.random() * stressedResponses.length)], 'ai');
}

// Check for happy
else if (/happy|glad|joy/i.test(lowerMsg)) {
    const happyResponses = [
        "That’s wonderful! 😊 Keep spreading positive vibes 🌟",
        "Happiness looks good on you 🌸 Enjoy every moment of it!",
        "I’m glad to hear that 😃 May your joy continue to grow."
    ];
    addMessage(happyResponses[Math.floor(Math.random() * happyResponses.length)], 'ai');
}

// Check for failed test
else if (/failed|didn't pass|unsuccessful/i.test(lowerMsg)) {
    const failureResponses = [
        "Don’t worry 🌱 Every failure is a step towards success. Learn and improve!",
        "It’s okay 😌 Mistakes teach valuable lessons. Keep going!",
        "Failure is temporary, but effort is permanent 💪 Keep trying."
    ];
    addMessage(failureResponses[Math.floor(Math.random() * failureResponses.length)], 'ai');
}







// Check for sorry / apology messages (typo-tolerant + synonyms + emojis)
else if (/(sorry|sory|soory|sr|apologies|apologize|apoligize|forgive me|forgiv me|forgive|pardon|pardn|excuse me|my bad|mybadd|oops|oopss|regret|regretful|regreted)/i.test(lowerMsg)) {
    const sorryResponses = [
        "No worries! 😊 Everything is fine, don’t stress.",
        "It's okay! 🙌 Everyone makes mistakes sometimes.",
        "No problem! 🌸 Let’s move forward together.",
        "All good! 😃 I understand and I’m here to help.",
        "Don't worry! 🌟 Everything can be fixed, just keep going.",
        "No need to apologize! 😌 Focus on moving ahead positively.",
        "It’s alright! 🌷 Mistakes happen, let’s keep learning.",
        "Nothing to worry about! 😄 We’re good."
    ];
    addMessage(sorryResponses[Math.floor(Math.random() * sorryResponses.length)], 'ai');
}

// Check for owner / creator related messages (typo-tolerant)
else if (/(owner|creator|made|who.*created|who.*own|who.*developed)/i.test(lowerMsg)) {
    const ownerResponses = [
        "The owner of this AI is @AarifAlam0105 🚀. Do you want to contact him?",
        "This AI was created by @AarifAlam0105 🌟. Would you like to reach out to him?",
        "My proud maker is @AarifAlam0105 💡. Do you want to connect with him?",
        "I was developed by @AarifAlam0105 🙌. Do you want to get in touch?",
        "@AarifAlam0105 is the owner of this AI 🌸. Do you want to contact him?"
    ];
    addMessage(ownerResponses[Math.floor(Math.random() * ownerResponses.length)], 'ai');
}


// Check for passed test
else if (/passed|success|cleared/i.test(lowerMsg)) {
    const successResponses = [
        "Congratulations 🎉 Your hard work paid off!",
        "Amazing! 🌟 Keep up the great effort and aim even higher.",
        "Well done 😃 Celebrate your success and continue learning."
    ];
    addMessage(successResponses[Math.floor(Math.random() * successResponses.length)], 'ai');
}

        // Check for help request
        else if (/(help|support|assist|guide)/i.test(lowerMsg)) {
            addMessage("I can help you with: <br>" +
                "- Finding AIATS or FT test series<br>" +
                "- Searching tests by date<br>" +
                "- Providing information about test phases and batches<br>" +
                "- Directing you to specific tests<br><br>" +
                "Try asking something like: 'Show me AIATS tests' or 'Find test on 10-09-2025'", 'ai');
        }

        // Default response with suggestions
        else {
            const defaultResponses = [
                "I'm not sure I understand. You can ask me about AIATS or FT test series, or type 'help' for assistance.",
                "I'm designed to help with test series. Try asking about AIATS or FT tests, or type 'help' for options.",
                "I specialize in test series assistance. You can ask me about AIATS, FT tests, or search by date."
            ];
            addMessage(defaultResponses[Math.floor(Math.random() * defaultResponses.length)], 'ai');
        }

    }

    
    // Advanced test query handling with error correction
    function handleTestQuery(message) {
        const lowerMsg = message.toLowerCase();
        
        // Check for specific test patterns with error tolerance
        const aiatsMatch = lowerMsg.match(/(aiats|aits|ait|aiat)\s*(\d+)/i);
        const ftMatch = lowerMsg.match(/(ft|full\s*test|full\s*tests|full\s*test\s*series)\s*(\d+)/i);
        const phaseMatch = lowerMsg.match(/(phase|phas|pahse|phse)\s*(\d+)/i);
        const batchMatch = lowerMsg.match(/(rm|batch|batch\s*number|bn)\s*(\d+)/i);
        const dateMatch = lowerMsg.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
        
        let testKey = null;
        let testNumber = null;
        let testCategory = null;
        
        // Determine test category and number
        if (aiatsMatch) {
            testCategory = "aiats";
            testNumber = aiatsMatch[2] || "1";
            testKey = `aiats${testNumber}`;
        } else if (ftMatch) {
            testCategory = "ft";
            testNumber = ftMatch[2] || "1";
            testKey = `ft${testNumber}`;
        } else if (lowerMsg.includes('aiats') || lowerMsg.includes('aits')) {
            testCategory = "aiats";
            addMessage("I have several AIATS tests available. Which specific AIATS test are you looking for? (e.g., AIATS 1, AIATS 2)", 'ai');
            return;
        } else if (lowerMsg.includes('ft')) {
            testCategory = "ft";
            addMessage("I have several FT tests available. Which specific FT test are you looking for? (e.g., FT 1, FT 2)", 'ai');
            return;
        } else {
            addMessage("I'm not sure which test you're looking for. Please specify AIATS or FT followed by the test number, or try searching by date.", 'ai');
            return;
        }
        
        // If we have a specific test key, try to find it
        if (testKey && testData[testKey]) {
            const test = testData[testKey];
            
            // Check if phase or batch was specified and matches
            let phaseFilter = null;
            let batchFilter = null;
            
            if (phaseMatch) {
                phaseFilter = `Phase ${phaseMatch[2]}`;
            }
            
            if (batchMatch) {
                batchFilter = `RM${batchMatch[2].padStart(2, '0')}`;
            }
            
            // If filters are specified but don't match, show appropriate message
            if ((phaseFilter && test.phase !== phaseFilter) || 
                (batchFilter && test.batch !== batchFilter)) {
                
                let message = `I found ${test.name}, but it doesn't match your criteria. `;
                
                if (phaseFilter && test.phase !== phaseFilter) {
                    message += `It's from ${test.phase} instead of ${phaseFilter}. `;
                }
                
                if (batchFilter && test.batch !== batchFilter) {
                    message += `It's for ${test.batch} instead of ${batchFilter}. `;
                }
                
                message += `Would you like to access it anyway? <button class="inline-btn" onclick="accessTest('${testKey}')">Yes, show me ${test.name}</button>`;
                
                addMessage(message, 'ai');
            } else {
                // Direct match found
                addMessage(`I found ${test.name} (Date: ${formatDate(test.date)}, Phase: ${test.phase}, Batch: ${test.batch}). <button class="inline-btn" onclick="accessTest('${testKey}')">Click here to access the test</button>`, 'ai');
            }
        } else {
            // Test not found, try to suggest alternatives
            let suggestions = "";
            let availableTests = [];
            
            if (testCategory === "aiats") {
                availableTests = Object.values(testData).filter(t => t.category === "aiats");
                suggestions = "Available AIATS tests: " + availableTests.map(t => t.name).join(", ");
            } else if (testCategory === "ft") {
                availableTests = Object.values(testData).filter(t => t.category === "ft");
                suggestions = "Available FT tests: " + availableTests.map(t => t.name).join(", ");
            }
            
            addMessage(`I couldn't find ${testCategory.toUpperCase()} ${testNumber}. ${suggestions}`, 'ai');
        }
    }
    
    // Format date to dd-mm-yyyy
    function formatDate(dateString) {
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
    }
    
    // Access test function (called from button clicks)
    function accessTest(testKey) {
        if (testData[testKey]) {
            const test = testData[testKey];
            // In a real implementation, this would redirect to the test page
            addMessage(`Taking you to ${test.name}... <a href="${test.link}" style="color: var(--primary-color); font-weight: bold;">Click here to start</a>`, 'ai');
            
            // Simulate navigation
            setTimeout(() => {
                // window.location.href = test.link;
                addMessage(`You are now accessing ${test.name} (${test.phase}, ${test.batch})`, 'ai');
            }, 1000);
        }
    }
    
    // Add message to chat
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        
        const messageText = document.createElement('div');
        messageText.innerHTML = text;
        
        const messageTime = document.createElement('div');
        messageTime.classList.add('message-time');
        messageTime.textContent = getCurrentTime();
        
        messageDiv.appendChild(messageText);
        messageDiv.appendChild(messageTime);
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Save to local storage
        saveMessageToHistory(text, sender);
    }
    
    // Get current time for message timestamp
    function getCurrentTime() {
        const now = new Date();
        return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    }
    
    // Save message to local storage
    function saveMessageToHistory(text, sender) {
        const messages = getFromLocalStorage('chatHistory') || [];
        messages.push({
            text,
            sender,
            time: getCurrentTime(),
            date: new Date().toISOString().split('T')[0]
        });
        saveToLocalStorage('chatHistory', messages);
    }
    
    // Load chat history
    function loadChatHistory() {
        const messages = getFromLocalStorage('chatHistory') || [];
        
        // Clear current messages
        chatMessages.innerHTML = '';
        
        if (messages.length === 0) {
            addMessage("Hello! I'm your advanced AI test assistant. I can help you find and access test series, answer your questions, and provide intelligent support. How can I help you today?", 'ai');
            return;
        }
        
        // Add all messages from history
        messages.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', `${msg.sender}-message`);
            
            const messageText = document.createElement('div');
            messageText.innerHTML = msg.text;
            
            const messageTime = document.createElement('div');
            messageTime.classList.add('message-time');
            messageTime.textContent = msg.time;
            
            messageDiv.appendChild(messageText);
            messageDiv.appendChild(messageTime);
            
            chatMessages.appendChild(messageDiv);
        });
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Clear chat history
    function clearChatHistory() {
        if (confirm("Are you sure you want to clear all chat history?")) {
            localStorage.removeItem('chatHistory');
            loadChatHistory();
        }
    }
    
    // Local storage functions
    function saveToLocalStorage(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
    
    function getFromLocalStorage(key) {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    }
    
    // Event listeners
    sendBtn.addEventListener('click', sendMessage);
    
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    historyBtn.addEventListener('click', () => {
        const history = getFromLocalStorage('chatHistory') || [];
        if (history.length === 0) {
            alert('No chat history found.');
        } else {
            let historyMessage = "Your recent conversations:\n\n";
            const today = new Date().toISOString().split('T')[0];
            
            history.forEach((msg, index) => {
                const datePrefix = msg.date === today ? "Today" : msg.date;
                historyMessage += `${datePrefix} ${msg.time} - ${msg.sender}: ${msg.text.replace(/<[^>]*>/g, '')}\n`;
            });
            
            alert(historyMessage);
        }
    });
    
    aiatsBtn.addEventListener('click', () => {
        addMessage("Show me AIATS tests", 'user');
        setTimeout(() => {
            const aiatsTests = Object.values(testData).filter(test => test.category === "aiats");
            let response = "Here are the available AIATS tests: <br>";
            
            aiatsTests.forEach(test => {
                response += `- <button class="inline-btn" onclick="accessTest('${test.category}${test.name.split(' ')[1]}')">${test.name}</button> (Date: ${formatDate(test.date)}, Phase: ${test.phase}, Batch: ${test.batch})<br>`;
            });
            
            addMessage(response, 'ai');
        }, 1000);
    });
    
    ftBtn.addEventListener('click', () => {
        addMessage("Show me FT tests", 'user');
        setTimeout(() => {
            const ftTests = Object.values(testData).filter(test => test.category === "ft");
            let response = "Here are the available FT tests: <br>";
            
            ftTests.forEach(test => {
                response += `- <button class="inline-btn" onclick="accessTest('${test.category}${test.name.split(' ')[1]}')">${test.name}</button> (Date: ${formatDate(test.date)}, Phase: ${test.phase}, Batch: ${test.batch})<br>`;
            });
            
            addMessage(response, 'ai');
        }, 1000);
    });
    
    dateSearchBtn.addEventListener('click', () => {
        const dateInput = document.getElementById('dateSearch').value;
        if (!dateInput) {
            alert('Please enter a date in DD-MM-YYYY format');
            return;
        }
        
        addMessage(`Find test on ${dateInput}`, 'user');
        setTimeout(() => {
            const [day, month, year] = dateInput.split('-');
            const searchDate = `${year}-${month}-${day}`;
            
            const foundTests = Object.values(testData).filter(test => {
                const testDate = new Date(test.date).toISOString().split('T')[0];
                return testDate === searchDate;
            });
            
            if (foundTests.length > 0) {
                let response = `Tests found on ${dateInput}: <br>`;
                
                foundTests.forEach(test => {
                    response += `- <button class="inline-btn" onclick="accessTest('${test.category}${test.name.split(' ')[1]}')">${test.name}</button> (${test.phase}, ${test.batch})<br>`;
                });
                
                addMessage(response, 'ai');
            } else {
                addMessage(`No tests found on ${dateInput}. Try searching for a different date.`, 'ai');
            }
        }, 1000);
    });
    
    // Make accessTest function available globally
    window.accessTest = accessTest;
});