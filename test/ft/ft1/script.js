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

// ... (rest of your script remains exactly the same, no other edits)

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
    totalMarksDisplay: document.getElementById('totalMarks')
};

// Timer Variables
let quizTimer;
let questionStartTime;

// Image preloading and visibility control
function preloadImages() {
    for (let i = 1; i <= quizConfig.totalQuestions; i++) {
        const img = new Image();
        img.src = `${quizConfig.questionPrefix}q${i}.jpg`;
    }
    for (let i = 1; i <= quizConfig.totalQuestions; i++) {
        const img = new Image();
        img.src = `${quizConfig.explanationPrefix}e${i}.jpg`;
    }
}

function loadImageWithFallback(imgElement, src, alt, fallbackSrc) {
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
    };

    imgElement.onerror = function() {
        if (fallbackSrc) {
            imgElement.src = fallbackSrc;
        } else {
            imgElement.style.visibility = 'visible';
            imgElement.style.backgroundColor = '#f0f0f0';
            imgElement.style.display = 'flex';
            imgElement.style.alignItems = 'center';
            imgElement.style.justifyContent = 'center';
            imgElement.innerHTML = `<span>Image not available</span>`;
        }
    };
}

// Initialize the quiz
function initQuiz() {
    quizState.questionTimes = new Array(quizConfig.totalQuestions).fill(0);
    quizState.answers = new Array(quizConfig.totalQuestions).fill(null);
    elements.totalQuestions.textContent = quizConfig.totalQuestions;
    elements.jumpToQuestion.max = quizConfig.totalQuestions;
    
    preloadImages();
    
    setTimeout(() => {
        elements.loadingScreen.style.display = 'none';
        elements.quizContainer.style.display = 'block';
        startQuiz();
    }, 1000);
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
    
    for (let i = 0; i < 4; i++) {
        const optionElement = document.createElement('button');
        optionElement.className = 'option';
        optionElement.textContent = `Option ${i + 1}`;
        optionElement.dataset.index = i;
        
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
    
    elements.prevBtn.disabled = index === 0;
    elements.nextBtn.disabled = index === quizConfig.totalQuestions - 1;
    elements.submitBtn.style.display = index === quizConfig.totalQuestions - 1 ? 'inline-block' : 'none';
    elements.submitQuestionBtn.style.display = quizState.answers[index] === null ? 'none' : 'none';
    elements.explanationBtn.style.display = quizState.answers[index] !== null ? 'inline-block' : 'none';
    updateProgressBar();
}

// Select an option
function selectOption(optionIndex) {
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
    
    document.querySelectorAll('.option').forEach((option, i) => {
        if (i === correctIndex) {
            option.classList.add('correct');
        } else if (i === selectedIndex && i !== correctIndex) {
            option.classList.add('wrong');
        }
    });
    
    if (selectedIndex === correctIndex) {
        quizState.correctAnswers++;
        quizState.totalMarks += quizConfig.correctMark;
    } else {
        quizState.incorrectAnswers++;
        quizState.totalMarks += quizConfig.incorrectPenalty;
    }
    
    quizState.score = Math.round((quizState.totalMarks / quizConfig.maxMarks) * 100);
    elements.currentScore.textContent = quizState.score;
    
    elements.submitQuestionBtn.style.display = 'none';
    elements.explanationBtn.style.display = 'inline-block';
    
    if (questionIndex < quizConfig.totalQuestions - 1) {
        setTimeout(() => {
            loadQuestion(questionIndex + 1);
        }, 1500);
    }
}

// Show explanation
function showExplanation() {
    const questionIndex = quizState.currentQuestionIndex;
    const explanationImg = `${quizConfig.explanationPrefix}e${questionIndex + 1}.jpg`;
    loadImageWithFallback(
        elements.explanationImage, 
        explanationImg, 
        `Explanation ${questionIndex + 1}`,
        'explanation_placeholder.jpg'
    );
    
    elements.explanationText.textContent = `This is the explanation for question ${questionIndex + 1}. The correct answer is Option ${quizConfig.answers[questionIndex]}.`;
    
    elements.explanationModal.style.display = 'block';
    elements.explanationModal.style.opacity = '0';
    setTimeout(() => {
        elements.explanationModal.style.transition = 'opacity 0.3s ease';
        elements.explanationModal.style.opacity = '1';
    }, 50);
}

// Start the quiz timer
function startTimer() {
    quizTimer = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now - quizState.startTime) / 1000);
        const hours = Math.floor(elapsed / 3600);
        const minutes = Math.floor((elapsed % 3600) / 60);
        const seconds = elapsed % 60;
        
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        elements.clock.textContent = timeString;
        elements.floatingClock.textContent = timeString;
        
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
    
    const totalTime = Math.floor((quizState.endTime - quizState.startTime) / 1000);
    quizState.timeSpent = totalTime;
    quizState.skippedQuestions = quizConfig.totalQuestions - quizState.correctAnswers - quizState.incorrectAnswers;
    
    showResults();
    
    if (quizState.score >= quizConfig.passingScore) {
        createConfetti();
    }
}

// Show results
function showResults() {
    elements.quizContainer.style.display = 'none';
    elements.resultsContainer.style.display = 'block';
    
    elements.correctAnswers.textContent = quizState.correctAnswers;
    elements.incorrectAnswers.textContent = quizState.incorrectAnswers;
    elements.skippedAnswers.textContent = quizState.skippedQuestions;
    elements.totalMarksDisplay.textContent = quizState.totalMarks;
    
    const hours = Math.floor(quizState.timeSpent / 3600);
    const minutes = Math.floor((quizState.timeSpent % 3600) / 60);
    const seconds = quizState.timeSpent % 60;
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    elements.timeTaken.textContent = timeString;
    
    elements.correctCount.textContent = quizState.correctAnswers;
    elements.totalCount.textContent = quizConfig.totalQuestions;
    elements.accuracyPercent.textContent = quizState.score;
    elements.totalTimeSpent.textContent = Math.round(minutes + seconds / 60);
    
    elements.resultsProgressBar.style.width = `${quizState.score}%`;
    
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
        questionText.innerHTML = `<strong>Question ${i + 1}:</strong> <img src="${quizConfig.questionPrefix}q${i + 1}.jpg" alt="Question ${i + 1}" style="max-width: 100%; height: auto;">`;
        
        const status = document.createElement('div');
        status.className = `review-status ${isSkipped ? 'skipped-status' : isCorrect ? 'correct-status' : 'incorrect-status'}`;
        status.textContent = isSkipped ? 'Skipped' : isCorrect ? 'Correct (+4)' : 'Incorrect (-1)';
        
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
        marksInfo.innerHTML = `<strong>Marks:</strong> ${isSkipped ? '0' : isCorrect ? '+4' : '-1'}`;
        
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
    const answeredQuestions = quizState.questionTimes.filter(time => time > 0);
    const avgTime = answeredQuestions.length > 0 
        ? (answeredQuestions.reduce((a, b) => a + b, 0) / answeredQuestions.length).toFixed(1) 
        : 0;
    
    let fastestIndex = 0;
    let slowestIndex = 0;
    let fastestTime = answeredQuestions.length > 0 ? answeredQuestions[0] : 0;
    let slowestTime = answeredQuestions.length > 0 ? answeredQuestions[0] : 0;
    
    for (let i = 1; i < answeredQuestions.length; i++) {
        if (answeredQuestions[i] < fastestTime) {
            fastestTime = answeredQuestions[i];
            fastestIndex = i;
        }
        if (answeredQuestions[i] > slowestTime) {
            slowestTime = answeredQuestions[i];
            slowestIndex = i;
        }
    }
    
    elements.avgTimePerQuestion.textContent = avgTime;
    elements.fastestQuestion.textContent = fastestIndex + 1;
    elements.fastestTime.textContent = fastestTime;
    elements.slowestQuestion.textContent = slowestIndex + 1;
    elements.slowestTime.textContent = slowestTime;
    
    elements.timeSpentChart.innerHTML = '';
    const maxTime = Math.max(...quizState.questionTimes, 1);
    
    quizState.questionTimes.forEach((time, index) => {
        const bar = document.createElement('div');
        bar.style.height = time > 0 ? `${(time / maxTime) * 100}%` : '5px';
        bar.style.width = '20px';
        bar.style.backgroundColor = time === fastestTime ? '#4CAF50' : 
                                 time === slowestTime ? '#F44336' : 
                                 time > 0 ? '#2196F3' : '#cccccc';
        bar.style.display = 'inline-block';
        bar.style.margin = '0 2px';
        bar.style.position = 'relative';
        bar.title = `Q${index + 1}: ${time}s`;
        
        const label = document.createElement('div');
        label.textContent = index + 1;
        label.style.position = 'absolute';
        label.style.bottom = '-20px';
        label.style.left = '0';
        label.style.fontSize = '10px';
        label.style.textAlign = 'center';
        label.style.width = '20px';
        
        bar.appendChild(label);
        elements.timeSpentChart.appendChild(bar);
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
    
    elements.currentScore.textContent = '0';
    elements.resultsContainer.style.display = 'none';
    elements.quizContainer.style.display = 'block';
    
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

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && quizState.currentQuestionIndex > 0) {
        loadQuestion(quizState.currentQuestionIndex - 1);
    } else if (e.key === 'ArrowRight' && quizState.currentQuestionIndex < quizConfig.totalQuestions - 1) {
        loadQuestion(quizState.currentQuestionIndex + 1);
    } else if (e.key === 'Enter' && quizState.currentQuestionIndex < quizConfig.totalQuestions - 1) {
        loadQuestion(quizState.currentQuestionIndex + 1);
    }
});

// Initialize the quiz when the page loads
window.addEventListener('load', initQuiz);
