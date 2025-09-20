// Load quizConfig from JSON
let quizConfig = {};

fetch('quizConfig.json')
  .then(response => response.json())
  .then(config => {
    quizConfig = config;
    initQuiz(); // Start after config is loaded
  })
  .catch(error => {
    console.error('Error loading quizConfig:', error);
    // Show error to user
    document.getElementById('loadingScreen').innerHTML = `
      <div class="error-message">
        <h2>Error Loading Quiz</h2>
        <p>Failed to load quiz configuration. Please refresh the page.</p>
      </div>
    `;
  });

// Quiz State
const quizState = {
    currentQuestionIndex: 0,
    score: 0,
    totalMarks: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    skippedQuestions: 0,
    timeSpent: 0,
    questionTimes: [],
    startTime: null,
    endTime: null,
    answers: [],
    completed: false
};

// DOM Elements
const elements = {
    quizContainer: document.getElementById('quizContainer'),
    resultsContainer: document.getElementById('resultsContainer'),
    loadingScreen: document.getElementById('loadingScreen'),
    questionNumber: document.getElementById('questionNumber'),
    questionImage: document.getElementById('question-img'),
    optionsContainer: document.getElementById('optionsContainer'),
    explanationBtn: document.getElementById('explanationBtn'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    submitBtn: document.getElementById('submitBtn'),
    submitQuestionBtn: document.getElementById('submitQuestionBtn'),
    clock: document.getElementById('clock'),
    floatingClock: document.getElementById('floatingClock'),
    currentQuestion: document.getElementById('currentQuestion'),
    totalQuestions: document.getElementById('totalQuestions'),
    currentScore: document.getElementById('currentScore'),
    progressBar: document.getElementById('progressBar'),
    correctAnswers: document.getElementById('correctAnswers'),
    incorrectAnswers: document.getElementById('incorrectAnswers'),
    skippedAnswers: document.getElementById('skippedAnswers'),
    accuracy: document.getElementById('accuracy'),
    timeTaken: document.getElementById('timeTaken'),
    correctCount: document.getElementById('correctCount'),
    totalCount: document.getElementById('totalCount'),
    accuracyPercent: document.getElementById('accuracyPercent'),
    totalTimeSpent: document.getElementById('totalTimeSpent'),
    questionReview: document.getElementById('questionReview'),
    resultsProgressBar: document.getElementById('resultsProgressBar'),
    avgTimePerQuestion: document.getElementById('avgTimePerQuestion'),
    fastestQuestion: document.getElementById('fastestQuestion'),
    fastestTime: document.getElementById('fastestTime'),
    slowestQuestion: document.getElementById('slowestQuestion'),
    slowestTime: document.getElementById('slowestTime'),
    timeSpentChart: document.getElementById('timeSpentChart'),
    explanationModal: document.getElementById('explanationModal'),
    closeExplanation: document.getElementById('closeExplanation'),
    explanationImage: document.getElementById('explanation-img'),
    explanationText: document.getElementById('explanationText'),
    restartQuizBtn: document.getElementById('restartQuizBtn'),
    reviewAnswersBtn: document.getElementById('reviewAnswersBtn'),
    tabs: document.querySelectorAll('.tab'),
    tabContents: document.querySelectorAll('.tab-content'),
    jumpToQuestion: document.getElementById('jumpToQuestion'),
    jumpBtn: document.getElementById('jumpBtn'),
    totalMarksDisplay: document.getElementById('totalMarks'),
    timeAnalysisTab: document.getElementById('analysisTab')
};

// Timer Variables
let quizTimer;
let questionStartTime;

// Image preloading and visibility control
function preloadImages() {
    const imagePromises = [];
    
    for (let i = 1; i <= quizConfig.totalQuestions; i++) {
        const questionImg = new Image();
        const explanationImg = new Image();
        
        const questionPromise = new Promise((resolve) => {
            questionImg.onload = resolve;
            questionImg.onerror = resolve; // Resolve even on error to prevent blocking
            questionImg.src = `${quizConfig.questionPrefix}q${i}.jpg`;
        });
        
        const explanationPromise = new Promise((resolve) => {
            explanationImg.onload = resolve;
            explanationImg.onerror = resolve;
            explanationImg.src = `${quizConfig.explanationPrefix}e${i}.jpg`;
        });
        
        imagePromises.push(questionPromise, explanationPromise);
    }
    
    return Promise.all(imagePromises);
}

function loadImageWithFallback(imgElement, src, alt, fallbackSrc) {
    return new Promise((resolve) => {
        imgElement.style.visibility = 'hidden';
        imgElement.src = src;
        imgElement.alt = alt;

        imgElement.onload = function() {
            imgElement.style.visibility = 'visible';
            imgElement.style.opacity = '0';
            setTimeout(() => {
                imgElement.style.transition = 'opacity 0.5s ease';
                imgElement.style.opacity = '1';
            }, 50);
            resolve(true);
        };

        imgElement.onerror = function() {
            if (fallbackSrc) {
                imgElement.src = fallbackSrc;
                imgElement.onload = function() {
                    imgElement.style.visibility = 'visible';
                    resolve(true);
                };
                imgElement.onerror = function() {
                    imgElement.style.visibility = 'visible';
                    imgElement.style.backgroundColor = '#f0f0f0';
                    imgElement.style.display = 'flex';
                    imgElement.style.alignItems = 'center';
                    imgElement.style.justifyContent = 'center';
                    imgElement.innerHTML = `<span>Image not available</span>`;
                    resolve(false);
                };
            } else {
                imgElement.style.visibility = 'visible';
                imgElement.style.backgroundColor = '#f0f0f0';
                imgElement.style.display = 'flex';
                imgElement.style.alignItems = 'center';
                imgElement.style.justifyContent = 'center';
                imgElement.innerHTML = `<span>Image not available</span>`;
                resolve(false);
            }
        };
    });
}

// Initialize the quiz
function initQuiz() {
    quizState.questionTimes = new Array(quizConfig.totalQuestions).fill(0);
    quizState.answers = new Array(quizConfig.totalQuestions).fill(null);
    elements.totalQuestions.textContent = quizConfig.totalQuestions;
    elements.jumpToQuestion.max = quizConfig.totalQuestions;
    elements.jumpToQuestion.min = 1;
    
    preloadImages().then(() => {
        setTimeout(() => {
            elements.loadingScreen.style.display = 'none';
            elements.quizContainer.style.display = 'block';
            startQuiz();
        }, 1000);
    });
}

// Start the quiz
function startQuiz() {
    quizState.startTime = new Date();
    questionStartTime = new Date();
    startTimer();
    loadQuestion(quizState.currentQuestionIndex);
    updateProgressBar();
}

// Load a question
function loadQuestion(index) {
    if (index < 0 || index >= quizConfig.totalQuestions) return;
    
    // Record time spent on previous question
    if (questionStartTime && quizState.currentQuestionIndex !== index) {
        const now = new Date();
        const timeSpent = Math.floor((now - questionStartTime) / 1000);
        quizState.questionTimes[quizState.currentQuestionIndex] = timeSpent;
        quizState.timeSpent += timeSpent;
    }
    
    quizState.currentQuestionIndex = index;
    questionStartTime = new Date();
    
    elements.questionNumber.textContent = index + 1;
    elements.currentQuestion.textContent = index + 1;
    elements.jumpToQuestion.value = index + 1;
    
    const questionImg = `${quizConfig.questionPrefix}q${index + 1}.jpg`;
    loadImageWithFallback(
        elements.questionImage, 
        questionImg, 
        `Question ${index + 1}`,
        'placeholder.jpg'
    );
    
    elements.optionsContainer.innerHTML = '';
    
    // Create option buttons
    for (let i = 0; i < 4; i++) {
        const optionElement = document.createElement('button');
        optionElement.className = 'option';
        optionElement.textContent = `Option ${i + 1}`;
        optionElement.dataset.index = i;
        
        // If answer already submitted for this question
        if (quizState.answers[index] !== null) {
            if (quizState.answers[index] === i) {
                optionElement.classList.add('selected');
            }
            if (i === quizConfig.answers[index] - 1) {
                optionElement.classList.add('correct');
            } else if (quizState.answers[index] === i && quizState.answers[index] !== quizConfig.answers[index] - 1) {
                optionElement.classList.add('wrong');
            }
            optionElement.disabled = true;
        }
        
        optionElement.addEventListener('click', () => selectOption(i));
        elements.optionsContainer.appendChild(optionElement);
    }
    
    // Update navigation buttons
    elements.prevBtn.disabled = index === 0;
    elements.nextBtn.disabled = index === quizConfig.totalQuestions - 1;
    elements.submitBtn.style.display = index === quizConfig.totalQuestions - 1 ? 'inline-block' : 'none';
    elements.submitQuestionBtn.style.display = 'none';
    elements.explanationBtn.style.display = quizState.answers[index] !== null ? 'inline-block' : 'none';
    
    updateProgressBar();
}

// Select an option
function selectOption(optionIndex) {
    // Only allow selection if not already answered
    if (quizState.answers[quizState.currentQuestionIndex] !== null) return;
    
    document.querySelectorAll('.option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    const selectedOption = document.querySelector(`.option[data-index="${optionIndex}"]`);
    selectedOption.classList.add('selected');
    elements.submitQuestionBtn.style.display = 'inline-block';
}

// Submit answer for current question
function submitAnswer() {
    const selectedOption = document.querySelector('.option.selected');
    if (!selectedOption) {
        alert('Please select an answer first.');
        return;
    }

    const selectedIndex = parseInt(selectedOption.dataset.index);
    const questionIndex = quizState.currentQuestionIndex;
    const correctIndex = quizConfig.answers[questionIndex] - 1;

    quizState.answers[questionIndex] = selectedIndex;
    
    document.querySelectorAll('.option').forEach(option => option.disabled = true);
    
    // Mark correct and incorrect answers
    document.querySelectorAll('.option').forEach((option, i) => {
        if (i === correctIndex) {
            option.classList.add('correct');
        } else if (i === selectedIndex && i !== correctIndex) {
            option.classList.add('wrong');
        }
    });
    
    // Update scores
    if (selectedIndex === correctIndex) {
        quizState.correctAnswers++;
        quizState.totalMarks += quizConfig.correctMark;
    } else {
        quizState.incorrectAnswers++;
        quizState.totalMarks += quizConfig.incorrectPenalty;
    }
    
    // Calculate score percentage
    quizState.score = Math.round((quizState.totalMarks / quizConfig.maxMarks) * 100);
    elements.currentScore.textContent = quizState.score;
    
    elements.submitQuestionBtn.style.display = 'none';
    elements.explanationBtn.style.display = 'inline-block';
    
    // Auto-advance to next question after a delay if not the last question
    if (questionIndex < quizConfig.totalQuestions - 1) {
        setTimeout(() => {
            loadQuestion(questionIndex + 1);
        }, 1500);
    } else {
        // If it's the last question, show submit button
        elements.submitBtn.style.display = 'inline-block';
    }
}

// Show explanation
function showExplanation(questionIndex = null) {
    const index = questionIndex !== null ? questionIndex : quizState.currentQuestionIndex;
    const explanationImg = `${quizConfig.explanationPrefix}e${index + 1}.jpg`;
    
    loadImageWithFallback(
        elements.explanationImage, 
        explanationImg, 
        `Explanation ${index + 1}`,
        'explanation_placeholder.jpg'
    );
    
    elements.explanationText.textContent = `This is the explanation for question ${index + 1}. The correct answer is Option ${quizConfig.answers[index]}.`;
    
    elements.explanationModal.style.display = 'block';
    elements.explanationModal.style.opacity = '0';
    setTimeout(() => {
        elements.explanationModal.style.transition = 'opacity 0.3s ease';
        elements.explanationModal.style.opacity = '1';
    }, 50);
}

// Start the quiz timer
function startTimer() {
    clearInterval(quizTimer); // Clear any existing timer
    
    quizTimer = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now - quizState.startTime) / 1000);
        const hours = Math.floor(elapsed / 3600);
        const minutes = Math.floor((elapsed % 3600) / 60);
        const seconds = elapsed % 60;
        
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        elements.clock.textContent = timeString;
        elements.floatingClock.textContent = timeString;
        
        // Check if time limit exceeded
        if (quizConfig.timeLimit && elapsed >= quizConfig.timeLimit) {
            clearInterval(quizTimer);
            submitQuiz();
        }
    }, 1000);
}

// Submit the quiz
function submitQuiz() {
    clearInterval(quizTimer);
    quizState.endTime = new Date();
    quizState.completed = true;
    
    // Calculate final time spent
    const totalTime = Math.floor((quizState.endTime - quizState.startTime) / 1000);
    quizState.timeSpent = totalTime;
    
    // Calculate skipped questions
    quizState.skippedQuestions = quizConfig.totalQuestions - quizState.correctAnswers - quizState.incorrectAnswers;
    
    showResults();
    
    // Create confetti if passed
    if (quizState.score >= quizConfig.passingScore) {
        createConfetti();
    }
}

// Show results
function showResults() {
    elements.quizContainer.style.display = 'none';
    elements.resultsContainer.style.display = 'block';
    
    // Update results statistics
    elements.correctAnswers.textContent = quizState.correctAnswers;
    elements.incorrectAnswers.textContent = quizState.incorrectAnswers;
    elements.skippedAnswers.textContent = quizState.skippedQuestions;
    elements.totalMarksDisplay.textContent = quizState.totalMarks;
    
    // Format time spent
    const hours = Math.floor(quizState.timeSpent / 3600);
    const minutes = Math.floor((quizState.timeSpent % 3600) / 60);
    const seconds = quizState.timeSpent % 60;
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    elements.timeTaken.textContent = timeString;
    
    // Update accuracy and counts
    elements.correctCount.textContent = quizState.correctAnswers;
    elements.totalCount.textContent = quizConfig.totalQuestions;
    elements.accuracyPercent.textContent = quizState.score;
    elements.totalTimeSpent.textContent = Math.round(minutes + seconds / 60);
    
    // Update progress bar
    elements.resultsProgressBar.style.width = `${quizState.score}%`;
    
    // Generate detailed reports
    generateQuestionReview();
    generateTimeAnalysis();
}

// Generate question review
function generateQuestionReview() {
    elements.questionReview.innerHTML = '';
    
    for (let i = 0; i < quizConfig.totalQuestions; i++) {
        const userAnswer = quizState.answers[i];
        const isCorrect = userAnswer !== null && userAnswer === quizConfig.answers[i] - 1;
        const isSkipped = userAnswer === null;
        
        const reviewItem = document.createElement('div');
        reviewItem.className = 'review-item';
        if (isSkipped) reviewItem.classList.add('skipped');
        else if (isCorrect) reviewItem.classList.add('correct');
        else reviewItem.classList.add('incorrect');
        
        const reviewQuestion = document.createElement('div');
        reviewQuestion.className = 'review-question';
        
        const questionText = document.createElement('div');
        questionText.innerHTML = `<strong>Question ${i + 1}:</strong>`;
        
        const questionImg = document.createElement('img');
        questionImg.src = `${quizConfig.questionPrefix}q${i + 1}.jpg`;
        questionImg.alt = `Question ${i + 1}`;
        questionImg.style.maxWidth = '100%';
        questionImg.style.height = 'auto';
        questionImg.onerror = function() {
            this.style.display = 'none';
        };
        
        const status = document.createElement('div');
        status.className = `review-status ${isSkipped ? 'skipped-status' : isCorrect ? 'correct-status' : 'incorrect-status'}`;
        status.textContent = isSkipped ? 'Skipped' : isCorrect ? `Correct (+${quizConfig.correctMark})` : `Incorrect (${quizConfig.incorrectPenalty})`;
        
        questionText.appendChild(questionImg);
        reviewQuestion.appendChild(questionText);
        reviewQuestion.appendChild(status);
        
        const reviewOptions = document.createElement('div');
        reviewOptions.className = 'review-options';
        
        for (let j = 0; j < 4; j++) {
            const optionElement = document.createElement('div');
            optionElement.className = 'review-option';
            
            if (j === userAnswer) {
                optionElement.classList.add('selected-option');
            }
            if (j === quizConfig.answers[i] - 1) {
                optionElement.classList.add('correct-option');
            }
            
            optionElement.textContent = `Option ${j + 1}`;
            reviewOptions.appendChild(optionElement);
        }
        
        const timeInfo = document.createElement('div');
        timeInfo.className = 'time-info';
        timeInfo.innerHTML = `<strong>Time spent:</strong> ${quizState.questionTimes[i]} seconds`;
        
        const marksInfo = document.createElement('div');
        marksInfo.className = 'marks-info';
        marksInfo.innerHTML = `<strong>Marks:</strong> ${isSkipped ? '0' : isCorrect ? `+${quizConfig.correctMark}` : quizConfig.incorrectPenalty}`;
        
        const explanationBtn = document.createElement('button');
        explanationBtn.className = 'btn btn-explanation';
        explanationBtn.innerHTML = '<i class="fas fa-lightbulb"></i> Show Explanation';
        explanationBtn.onclick = () => {
            showExplanation(i);
        };
        
        reviewItem.appendChild(reviewQuestion);
        reviewItem.appendChild(reviewOptions);
        reviewItem.appendChild(timeInfo);
        reviewItem.appendChild(marksInfo);
        reviewItem.appendChild(explanationBtn);
        
        elements.questionReview.appendChild(reviewItem);
    }
}

// Generate time analysis
function generateTimeAnalysis() {
    // Filter out questions that weren't answered (time = 0)
    const answeredQuestions = quizState.questionTimes.filter(time => time > 0);
    const avgTime = answeredQuestions.length > 0 
        ? (answeredQuestions.reduce((a, b) => a + b, 0) / answeredQuestions.length).toFixed(1) 
        : 0;
    
    // Find fastest and slowest question times
    let fastestIndex = -1;
    let slowestIndex = -1;
    let fastestTime = answeredQuestions.length > 0 ? answeredQuestions[0] : 0;
    let slowestTime = answeredQuestions.length > 0 ? answeredQuestions[0] : 0;
    
    for (let i = 0; i < quizState.questionTimes.length; i++) {
        const time = quizState.questionTimes[i];
        if (time > 0) {
            if (fastestIndex === -1 || time < fastestTime) {
                fastestTime = time;
                fastestIndex = i;
            }
            if (slowestIndex === -1 || time > slowestTime) {
                slowestTime = time;
                slowestIndex = i;
            }
        }
    }
    
    // Update time analysis elements
    elements.avgTimePerQuestion.textContent = avgTime;
    elements.fastestQuestion.textContent = fastestIndex !== -1 ? fastestIndex + 1 : 'N/A';
    elements.fastestTime.textContent = fastestIndex !== -1 ? `${fastestTime}s` : 'N/A';
    elements.slowestQuestion.textContent = slowestIndex !== -1 ? slowestIndex + 1 : 'N/A';
    elements.slowestTime.textContent = slowestIndex !== -1 ? `${slowestTime}s` : 'N/A';
    
    // Create time spent chart
    elements.timeSpentChart.innerHTML = '';
    const maxTime = Math.max(...quizState.questionTimes, 1);
    
    quizState.questionTimes.forEach((time, index) => {
        const barContainer = document.createElement('div');
        barContainer.style.display = 'inline-block';
        barContainer.style.margin = '0 5px';
        barContainer.style.textAlign = 'center';
        barContainer.style.verticalAlign = 'bottom';
        barContainer.style.height = '150px';
        barContainer.style.position = 'relative';
        
        const bar = document.createElement('div');
        bar.style.height = time > 0 ? `${(time / maxTime) * 100}%` : '5px';
        bar.style.width = '20px';
        bar.style.backgroundColor = time === fastestTime && time > 0 ? '#4CAF50' : 
                                 time === slowestTime && time > 0 ? '#F44336' : 
                                 time > 0 ? '#2196F3' : '#cccccc';
        bar.style.position = 'absolute';
        bar.style.bottom = '25px';
        bar.style.left = '0';
        bar.style.right = '0';
        bar.style.margin = '0 auto';
        bar.title = `Q${index + 1}: ${time}s`;
        
        const label = document.createElement('div');
        label.textContent = index + 1;
        label.style.position = 'absolute';
        label.style.bottom = '5px';
        label.style.left = '0';
        label.style.right = '0';
        label.style.fontSize = '12px';
        label.style.textAlign = 'center';
        
        const timeLabel = document.createElement('div');
        timeLabel.textContent = `${time}s`;
        timeLabel.style.position = 'absolute';
        timeLabel.style.top = '-20px';
        timeLabel.style.left = '0';
        timeLabel.style.right = '0';
        timeLabel.style.fontSize = '10px';
        timeLabel.style.textAlign = 'center';
        
        barContainer.appendChild(bar);
        barContainer.appendChild(timeLabel);
        barContainer.appendChild(label);
        elements.timeSpentChart.appendChild(barContainer);
    });
}

// Update progress bar
function updateProgressBar() {
    const progress = ((quizState.currentQuestionIndex + 1) / quizConfig.totalQuestions) * 100;
    elements.progressBar.style.width = `${progress}%`;
}

// Create confetti effect
function createConfetti() {
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = `${Math.random() * 100}vw`;
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        confetti.style.width = `${Math.random() * 10 + 5}px`;
        confetti.style.height = `${Math.random() * 10 + 5}px`;
        confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            confetti.remove();
        }, 5000);
    }
}

// Event Listeners
elements.prevBtn.addEventListener('click', () => {
    if (quizState.currentQuestionIndex > 0) {
        loadQuestion(quizState.currentQuestionIndex - 1);
    }
});

elements.nextBtn.addEventListener('click', () => {
    if (quizState.currentQuestionIndex < quizConfig.totalQuestions - 1) {
        loadQuestion(quizState.currentQuestionIndex + 1);
    }
});

elements.submitBtn.addEventListener('click', submitQuiz);
elements.submitQuestionBtn.addEventListener('click', submitAnswer);
elements.explanationBtn.addEventListener('click', showExplanation);

elements.closeExplanation.addEventListener('click', () => {
    elements.explanationModal.style.transition = 'opacity 0.3s ease';
    elements.explanationModal.style.opacity = '0';
    setTimeout(() => {
        elements.explanationModal.style.display = 'none';
    }, 300);
});

window.addEventListener('click', (event) => {
    if (event.target === elements.explanationModal) {
        elements.explanationModal.style.transition = 'opacity 0.3s ease';
        elements.explanationModal.style.opacity = '0';
        setTimeout(() => {
            elements.explanationModal.style.display = 'none';
        }, 300);
    }
});

elements.restartQuizBtn.addEventListener('click', () => {
    // Reset quiz state
    quizState.currentQuestionIndex = 0;
    quizState.score = 0;
    quizState.totalMarks = 0;
    quizState.correctAnswers = 0;
    quizState.incorrectAnswers = 0;
    quizState.skippedQuestions = 0;
    quizState.timeSpent = 0;
    quizState.questionTimes = new Array(quizConfig.totalQuestions).fill(0);
    quizState.answers = new Array(quizConfig.totalQuestions).fill(null);
    quizState.completed = false;
    
    // Reset UI elements
    elements.currentScore.textContent = '0';
    elements.resultsContainer.style.display = 'none';
    elements.quizContainer.style.display = 'block';
    
    // Restart the quiz
    startQuiz();
});

elements.reviewAnswersBtn.addEventListener('click', () => {
    document.querySelector('.tab[data-tab="analysis"]').click();
});

elements.tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        elements.tabs.forEach(t => t.classList.remove('active'));
        elements.tabContents.forEach(c => c.classList.remove('active'));
        
        tab.classList.add('active');
        const tabId = tab.getAttribute('data-tab');
        document.getElementById(`${tabId}Tab`).classList.add('active');
    });
});

elements.jumpBtn.addEventListener('click', () => {
    const questionNum = parseInt(elements.jumpToQuestion.value);
    if (questionNum >= 1 && questionNum <= quizConfig.totalQuestions) {
        loadQuestion(questionNum - 1);
    } else {
        alert(`Please enter a question number between 1 and ${quizConfig.totalQuestions}`);
    }
});

elements.jumpToQuestion.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        elements.jumpBtn.click();
    }
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && quizState.currentQuestionIndex > 0) {
        loadQuestion(quizState.currentQuestionIndex - 1);
    } else if (e.key === 'ArrowRight' && quizState.currentQuestionIndex < quizConfig.totalQuestions - 1) {
        loadQuestion(quizState.currentQuestionIndex + 1);
    } else if (e.key === 'Enter' && document.querySelector('.option.selected') && 
               quizState.answers[quizState.currentQuestionIndex] === null) {
        submitAnswer();
    }
});

// Initialize the quiz when the page loads
window.addEventListener('load', () => {
    // Initialization is now handled by the fetch promise
});
