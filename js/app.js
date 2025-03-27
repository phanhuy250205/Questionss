// Đảm bảo trang chủ hiển thị khi tải trang
document.addEventListener('DOMContentLoaded', function() {
    // Ẩn tất cả các container khác
    quizContainer.classList.add('hidden');
    quizQuestionContainer.classList.add('hidden');
    resultContainer.classList.add('hidden');
    statsContainer.classList.add('hidden');
    
    // Hiển thị trang chủ
    homeContainer.classList.remove('hidden');
    
    // Đã loại bỏ dòng này để cho phép cuộn trang
    // document.body.classList.add('home-active');
    
    // Tạo dữ liệu thống kê mẫu
    generateSampleStats();
});

let quizData = [];
let currentQuiz = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let timerInterval = null;
let timeElapsed = 0;
let timeLimit = 1800; // 20 phút (1200 giây)
let shuffledQuestions = [];
let wrongQuestions = [];
let isDarkMode = true;
const API_URL = 'API.json';


// Dữ liệu thống kê
let quizHistory = [];
let statsData = {
    completedQuizzes: 0,
    averageScore: 0,
    correctRate: 0,
    averageTime: 0,
    weeklyData: [],
    scoreDistribution: [0, 0, 0, 0, 0], // 0-2, 2-4, 4-6, 6-8, 8-10
    topicPerformance: {}
};

// DOM elements
const homeContainer = document.getElementById('homeContainer');
const quizContainer = document.getElementById('quizContainer');
const quizQuestionContainer = document.getElementById('quizQuestionContainer');
const resultContainer = document.getElementById('resultContainer');
const statsContainer = document.getElementById('statsContainer');
const quizList = document.getElementById('quizList');
const quizTitle = document.getElementById('quizTitle');
const quizDescription = document.getElementById('quizDescription');
const quizProgressText = document.getElementById('quizProgressText');
const timerDisplay = document.getElementById('timer');
const progressBar = document.getElementById('progressBar');
const questionNavigation = document.getElementById('questionNavigation');
const questionContainer = document.getElementById('questionContainer');
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');
const backButton = document.getElementById('backButton');
const resetProgressButton = document.getElementById('resetProgressButton');
const errorMessage = document.getElementById('errorMessage');
const scoreDisplay = document.getElementById('score');
const timeTakenDisplay = document.getElementById('timeTaken');
const wrongAnswersDisplay = document.getElementById('wrongAnswers');
const restartButton = document.getElementById('restartButton');
const reviewWrongButton = document.getElementById('reviewWrongButton');
const homeButton = document.getElementById('homeButton');
const homeLink = document.getElementById('homeLink');
const quizLink = document.getElementById('quizLink');
const statsLink = document.getElementById('statsLink');
const hamburgerBtn = document.getElementById('hamburgerBtn');
const mobileMenu = document.getElementById('mobileMenu');
const customModal = document.getElementById('customModal');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const modalButtons = document.getElementById('modalButtons');
const startQuizBtn = document.getElementById('startQuizBtn');
const particlesContainer = document.getElementById('particles');
const themeToggle = document.getElementById('themeToggle');
const confettiContainer = document.getElementById('confettiContainer');
const searchQuiz = document.getElementById('searchQuiz');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const noQuizzesFound = document.getElementById('noQuizzesFound');
const loadingQuizzes = document.getElementById('loadingQuizzes');
const correctCount = document.getElementById('correctCount');
const wrongCount = document.getElementById('wrongCount');
const totalCount = document.getElementById('totalCount');

// Thống kê elements
const completedQuizzes = document.getElementById('completedQuizzes');
const averageScore = document.getElementById('averageScore');
const correctRate = document.getElementById('correctRate');
const averageTime = document.getElementById('averageTime');
const completedQuizzesTrend = document.getElementById('completedQuizzesTrend');
const averageScoreTrend = document.getElementById('averageScoreTrend');
const correctRateTrend = document.getElementById('correctRateTrend');
const averageTimeTrend = document.getElementById('averageTimeTrend');
const recentQuizTable = document.getElementById('recentQuizTable');
const statsChart = document.getElementById('statsChart');

// Thống kê chi tiết elements
const statsCompletedQuizzes = document.getElementById('statsCompletedQuizzes');
const statsAverageScore = document.getElementById('statsAverageScore');
const statsCorrectRate = document.getElementById('statsCorrectRate');
const statsAverageTime = document.getElementById('statsAverageTime');
const statsCompletedQuizzesTrend = document.getElementById('statsCompletedQuizzesTrend');
const statsAverageScoreTrend = document.getElementById('statsAverageScoreTrend');
const statsCorrectRateTrend = document.getElementById('statsCorrectRateTrend');
const statsAverageTimeTrend = document.getElementById('statsAverageTimeTrend');
const quizHistoryTable = document.getElementById('quizHistoryTable');
const timelineChart = document.getElementById('timelineChart');
const scoreDistributionChart = document.getElementById('scoreDistributionChart');
const timeSpentChart = document.getElementById('timeSpentChart');
const topicPerformanceChart = document.getElementById('topicPerformanceChart');

// Theme toggle functionality
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    isDarkMode = document.body.classList.contains('dark');
    localStorage.setItem('darkMode', isDarkMode);
    
    // Update icon
    const icon = themeToggle.querySelector('i');
    if (isDarkMode) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
    
    // Cập nhật lại biểu đồ
    updateAllCharts();
});

// Check for saved theme preference
const savedTheme = localStorage.getItem('darkMode');
if (savedTheme === 'true') {
    document.body.classList.add('dark');
    isDarkMode = true;
    const icon = themeToggle.querySelector('i');
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
}

// Create floating particles for home page
function createParticles() {
    const colors = ['#8b5cf6', '#6366f1', '#ec4899', '#d946ef', '#06b6d4'];
    const particleCount = 30;
    
    particlesContainer.innerHTML = '';
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Random properties
        const size = Math.random() * 20 + 5;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const left = Math.random() * 100;
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;
        
        // Apply styles
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.backgroundColor = color;
        particle.style.left = `${left}%`;
        particle.style.bottom = `-${size}px`;
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `${delay}s`;
        
        particlesContainer.appendChild(particle);
    }
}

// Create confetti effect
function createConfetti() {
    confettiContainer.innerHTML = '';
    const colors = ['#8b5cf6', '#6366f1', '#ec4899', '#d946ef', '#06b6d4', '#10b981', '#f59e0b'];
    const confettiCount = 100;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        
        // Random properties
        const size = Math.random() * 10 + 5;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const left = Math.random() * 100;
        const duration = Math.random() * 3 + 1;
        const delay = Math.random() * 0.5;
        
        // Apply styles
        confetti.style.width = `${size}px`;
        confetti.style.height = `${size}px`;
        confetti.style.backgroundColor = color;
        confetti.style.left = `${left}%`;
        confetti.style.top = '-10px';
        confetti.style.opacity = '1';
        confetti.style.transform = 'translateY(0)';
        confetti.style.transition = `transform ${duration}s ease, opacity ${duration}s ease`;
        confetti.style.transitionDelay = `${delay}s`;
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        
        confettiContainer.appendChild(confetti);
        
        // Animate confetti
        setTimeout(() => {
            confetti.style.transform = `translateY(${window.innerHeight}px) rotate(${Math.random() * 360}deg)`;
            confetti.style.opacity = '0';
        }, 10);
    }
    
    // Clean up confetti after animation
    setTimeout(() => {
        confettiContainer.innerHTML = '';
    }, 4000);
}

// Đã loại bỏ hàm này vì không cần ngăn cuộn trang nữa
// function toggleHomePageScrolling() {
//     if (!homeContainer.classList.contains('hidden')) {
//         document.body.classList.add('home-active');
//     } else {
//         document.body.classList.remove('home-active');
//     }
// }

// Toggle Mobile Menu with improved animation
hamburgerBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
    mobileMenu.classList.toggle('hidden');
    
    // Toggle icon between bars and times
    const icon = hamburgerBtn.querySelector('i');
    if (mobileMenu.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
        hamburgerBtn.setAttribute('aria-expanded', 'true');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
    }
});

// Add window resize event listener to handle responsive menu
window.addEventListener('resize', () => {
    // Check if window width is larger than mobile breakpoint (768px for md: in Tailwind)
    if (window.innerWidth >= 768) {
        // Hide mobile menu when screen size increases to desktop size
        mobileMenu.classList.remove('active');
        mobileMenu.classList.add('hidden');
        
        // Reset hamburger icon
        const icon = hamburgerBtn.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
    }
});

document.addEventListener('click', (e) => {
    if (!hamburgerBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.remove('active');
        mobileMenu.classList.add('hidden');
        
        // Reset icon
        const icon = hamburgerBtn.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
    }
});

// Start Quiz Button
startQuizBtn.addEventListener('click', () => {
    homeContainer.classList.add('hidden');
    quizContainer.classList.remove('hidden');
    // Đã loại bỏ dòng này để cho phép cuộn trang
    // toggleHomePageScrolling();
    displayQuizList();
});

// Search functionality
searchQuiz.addEventListener('input', () => {
    const searchTerm = searchQuiz.value.toLowerCase().trim();
    filterQuizzes(searchTerm);
});

clearSearchBtn.addEventListener('click', () => {
    searchQuiz.value = '';
    filterQuizzes('');
});

function filterQuizzes(searchTerm) {
    const filteredQuizzes = quizData.filter(quiz => 
        quiz.title.toLowerCase().includes(searchTerm) || 
        quiz.description.toLowerCase().includes(searchTerm)
    );
    
    displayFilteredQuizzes(filteredQuizzes, searchTerm);
}

function displayFilteredQuizzes(filteredQuizzes, searchTerm) {
    if (searchTerm && filteredQuizzes.length === 0) {
        quizList.innerHTML = '';
        noQuizzesFound.classList.remove('hidden');
    } else {
        noQuizzesFound.classList.add('hidden');
        renderQuizList(filteredQuizzes);
    }
}

// Custom Alert and Confirm Functions
function showCustomAlert(message) {
    return new Promise((resolve) => {
        modalTitle.textContent = 'Thông báo';
        modalMessage.textContent = message;
        modalButtons.innerHTML = `
            <button class="modal-btn confirm" id="modalConfirm">OK</button>
        `;
        customModal.classList.remove('hidden');

        document.getElementById('modalConfirm').onclick = () => {
            customModal.classList.add('hidden');
            resolve(true);
        };
    });
}

function showCustomConfirm(message) {
    return new Promise((resolve) => {
        modalTitle.textContent = 'Xác nhận';
        modalMessage.textContent = message;
        modalButtons.innerHTML = `
            <button class="modal-btn confirm" id="modalConfirm">Đồng ý</button>
            <button class="modal-btn cancel" id="modalCancel">Hủy</button>
        `;
        customModal.classList.remove('hidden');

        document.getElementById('modalConfirm').onclick = () => {
            customModal.classList.add('hidden');
            resolve(true);
        };
        document.getElementById('modalCancel').onclick = () => {
            customModal.classList.add('hidden');
            resolve(false);
        };
    });
}

// Load quiz data from API
async function loadQuizData() {
    try {
        loadingQuizzes.classList.remove('hidden');
        quizList.innerHTML = '';
        
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Không thể tải dữ liệu từ API');
        }
        
        quizData = await response.json();
        
        loadingQuizzes.classList.add('hidden');
        // Xóa dòng này để không tự động hiển thị danh sách bài tập
        // displayQuizList();
    } catch (error) {
        console.error('Lỗi:', error);
        loadingQuizzes.classList.add('hidden');
        errorMessage.classList.remove('hidden');
        await showCustomAlert('Không thể tải dữ liệu! Vui lòng thử lại.');
    }
}

function shuffle(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    let timeRemaining = timeLimit - timeElapsed;
    timerDisplay.innerHTML = `<i class="far fa-clock"></i> ${formatTime(timeRemaining > 0 ? timeRemaining : 0)}`;
    
    timerInterval = setInterval(() => {
        timeElapsed++;
        timeRemaining = timeLimit - timeElapsed;
        if (timeRemaining <= 0) {
            stopTimer();
            showResult();
        } else {
            timerDisplay.innerHTML = `<i class="far fa-clock"></i> ${formatTime(timeRemaining)}`;
            
            // Add warning color when time is running low
            if (timeRemaining < 300) { // Less than 5 minutes
                timerDisplay.classList.add('text-red-500');
                timerDisplay.classList.add('animate-pulse');
            }
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function saveProgress() {
    const progress = {
        quizId: currentQuiz.id,
        currentQuestionIndex: currentQuestionIndex,
        userAnswers: userAnswers,
        timeElapsed: timeElapsed,
        shuffledQuestions: shuffledQuestions.map(q => q.id)
    };
    localStorage.setItem(`quizProgress_${currentQuiz.id}`, JSON.stringify(progress));
}

function loadProgress(quiz) {
    const savedProgress = localStorage.getItem(`quizProgress_${quiz.id}`);
    if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        currentQuestionIndex = progress.currentQuestionIndex;
        userAnswers = progress.userAnswers;
        timeElapsed = progress.timeElapsed;
        shuffledQuestions = progress.shuffledQuestions.map(id => quiz.questions.find(q => q.id === id) || quiz.questions[0]);
        return true;
    }
    return false;
}

function clearProgress(quizId) {
    localStorage.removeItem(`quizProgress_${quizId}`);
}

function areAllQuestionsAnswered() {
    return userAnswers.every(answer => answer !== null);
}

function renderQuizList(quizzes) {
    quizList.innerHTML = '';
    quizzes.forEach((quiz, index) => {
        const savedProgress = localStorage.getItem(`quizProgress_${quiz.id}`);
        const card = document.createElement('div');
        card.classList.add('quiz-card', 'slide-in');
        card.style.animationDelay = `${0.1 * index}s`;
        
        // Generate a random gradient for each quiz card
        const gradients = [
            'linear-gradient(45deg, #6366f1, #8b5cf6)',
            'linear-gradient(45deg, #ec4899, #8b5cf6)',
            'linear-gradient(45deg, #06b6d4, #10b981)',
            'linear-gradient(45deg, #f59e0b, #ef4444)',
            'linear-gradient(45deg, #10b981, #3b82f6)'
        ];
        const randomGradient = gradients[index % gradients.length];
        
        card.innerHTML = `
            <div class="quiz-card-header" style="background: ${randomGradient}">
                <i class="fas fa-book-open quiz-card-icon"></i>
                ${savedProgress ? '<span class="quiz-card-badge">Đang làm</span>' : ''}
            </div>
            <div class="quiz-card-body">
                <h3 class="quiz-card-title">${quiz.title}</h3>
                <p class="quiz-card-description text-sm mb-4">${quiz.description}</p>
                <div class="flex justify-between items-center mb-4">
                    <span class="text-xs quiz-card-info">
                        <i class="fas fa-question-circle mr-1"></i> ${quiz.questions.length} câu hỏi
                    </span>
                    <span class="text-xs quiz-card-info">
                        <i class="far fa-clock mr-1"></i> 30 phút
                    </span>
                </div>
                <div class="quiz-card-buttons">
                    <button class="quiz-btn quiz-btn-normal start-normal" data-quiz-id="${quiz.id}" aria-label="Làm bình thường">
                        <i class="fas fa-play-circle mr-1"></i> Làm bình thường
                    </button>
                    <button class="quiz-btn quiz-btn-random start-random" data-quiz-id="${quiz.id}" aria-label="Làm ngẫu nhiên">
                        <i class="fas fa-random mr-1"></i> Làm ngẫu nhiên
                    </button>
                    ${savedProgress ? `<button class="quiz-btn quiz-btn-reset reset-progress" data-quiz-id="${quiz.id}" aria-label="Xóa tiến trình">
                        <i class="fas fa-trash-alt mr-1"></i> Xóa tiến trình
                    </button>` : ''}
                </div>
            </div>
        `;
        quizList.appendChild(card);

        card.querySelector('.start-normal').onclick = () => startQuiz(quiz, false);
        card.querySelector('.start-random').onclick = () => startQuiz(quiz, true);
        const resetButton = card.querySelector('.reset-progress');
        if (resetButton) {
            resetButton.onclick = async (e) => {
                e.stopPropagation();
                const confirmed = await showCustomConfirm('Bạn có chắc chắn muốn xóa tiến trình của bài kiểm tra này?');
                if (confirmed) {
                    clearProgress(quiz.id);
                    displayQuizList();
                }
            };
        }
    });
}

function displayQuizList() {
    // Ẩn tất cả các container trước
    homeContainer.classList.add('hidden');
    quizContainer.classList.add('hidden');
    quizQuestionContainer.classList.add('hidden');
    resultContainer.classList.add('hidden');
    statsContainer.classList.add('hidden');
    
    // Chỉ hiển thị danh sách bài tập
    quizContainer.classList.remove('hidden');
    
    renderQuizList(quizData);
}

function startQuiz(quiz, isRandom = false) {
    currentQuiz = quiz;
    if (!loadProgress(quiz)) {
        currentQuestionIndex = 0;
        shuffledQuestions = isRandom ? shuffle([...quiz.questions]) : [...quiz.questions];
        userAnswers = new Array(shuffledQuestions.length).fill(null);
        timeElapsed = 0;
    }
    
    // Ẩn tất cả các container trước
    homeContainer.classList.add('hidden');
    quizContainer.classList.add('hidden');
    quizQuestionContainer.classList.add('hidden');
    resultContainer.classList.add('hidden');
    statsContainer.classList.add('hidden');
    
    // Chỉ hiển thị container câu hỏi
    quizQuestionContainer.classList.remove('hidden');
    
    quizTitle.textContent = quiz.title + (isRandom ? " (Ngẫu nhiên)" : "");
    quizDescription.textContent = quiz.description;
    startTimer();
    displayQuestion();
    mobileMenu.classList.remove('active');
    mobileMenu.classList.add('hidden');
    // Đã loại bỏ dòng này để cho phép cuộn trang
    // toggleHomePageScrolling();
}

function displayQuestionNavigation() {
    questionNavigation.innerHTML = '';
    shuffledQuestions.forEach((_, index) => {
        const btn = document.createElement('button');
        btn.textContent = index + 1;
        btn.classList.add('question-nav-btn');
        btn.setAttribute('aria-label', `Câu hỏi ${index + 1}`);
        if (index === currentQuestionIndex) btn.classList.add('active');
        if (userAnswers[index] !== null) btn.classList.add('answered');
        btn.addEventListener('click', () => {
            currentQuestionIndex = index;
            displayQuestion();
            saveProgress();
        });
        questionNavigation.appendChild(btn);
    });
}

function displayQuestion() {
    const question = shuffledQuestions[currentQuestionIndex];
    quizProgressText.textContent = `Câu ${currentQuestionIndex + 1} / ${shuffledQuestions.length}`;
    const timeRemaining = timeLimit - timeElapsed;
    timerDisplay.innerHTML = `<i class="far fa-clock"></i> ${formatTime(timeRemaining > 0 ? timeRemaining : 0)}`;
    const progressPercentage = ((currentQuestionIndex + 1) / shuffledQuestions.length) * 100;
    progressBar.style.width = `${progressPercentage}%`;

    questionContainer.innerHTML = `
        <div class="space-y-4">
            <h3 class="text-xl font-medium question-text mb-4">${question.question}</h3>
            <div class="space-y-3">
                ${question.options.map((option, index) => `
                    <div class="option-card ${userAnswers[currentQuestionIndex] === index ? 'selected' : ''}" data-index="${index}" tabindex="0" role="button" aria-pressed="${userAnswers[currentQuestionIndex] === index}">
                        <div class="flex items-start">
                            <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 mr-3 font-medium">
                                ${String.fromCharCode(65 + index)}
                            </span>
                            <div>${option}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    nextButton.innerHTML = currentQuestionIndex === shuffledQuestions.length - 1 
        ? `<i class="fas fa-check"></i> Hoàn thành` 
        : `<i class="fas fa-arrow-right"></i> Tiếp theo`;
    if (currentQuestionIndex === shuffledQuestions.length - 1) {
        nextButton.disabled = !areAllQuestionsAnswered();
    } else {
        nextButton.disabled = userAnswers[currentQuestionIndex] === null;
    }
    prevButton.classList.toggle('hidden', currentQuestionIndex === 0);

    displayQuestionNavigation();

    const optionCards = document.querySelectorAll('.option-card');
    optionCards.forEach(card => {
        card.addEventListener('click', (e) => {
            const selectedIndex = parseInt(e.currentTarget.getAttribute('data-index'));
            userAnswers[currentQuestionIndex] = selectedIndex;
            optionCards.forEach(c => {
                c.classList.remove('selected');
                c.setAttribute('aria-pressed', 'false');
            });
            e.currentTarget.classList.add('selected');
            e.currentTarget.setAttribute('aria-pressed', 'true');
            
            if (currentQuestionIndex === shuffledQuestions.length - 1) {
                nextButton.disabled = !areAllQuestionsAnswered();
            } else {
                nextButton.disabled = false;
            }
            saveProgress();
            displayQuestionNavigation();
        });
        
        // Keyboard accessibility
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });
    });
}

prevButton.onclick = () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
        saveProgress();
    }
};

nextButton.onclick = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
        saveProgress();
    } else if (areAllQuestionsAnswered()) {
        stopTimer();
        showResult();
    }
};

resetProgressButton.onclick = async () => {
    const confirmed = await showCustomConfirm('Bạn có chắc chắn muốn xóa tiến trình bài trắc nghiệm này?');
    if (confirmed) {
        stopTimer();
        clearProgress(currentQuiz.id);
        quizQuestionContainer.classList.add('hidden');
        quizContainer.classList.remove('hidden');
        homeContainer.classList.add('hidden');
        statsContainer.classList.add('hidden');
        displayQuizList();
        // Đã loại bỏ dòng này để cho phép cuộn trang
        // toggleHomePageScrolling();
    }
};

backButton.onclick = () => {
    stopTimer();
    saveProgress();
    quizQuestionContainer.classList.add('hidden');
    quizContainer.classList.remove('hidden');
    homeContainer.classList.add('hidden');
    statsContainer.classList.add('hidden');
    displayQuizList();
    // Đã loại bỏ dòng này để cho phép cuộn trang
    // toggleHomePageScrolling();
};

function showResult() {
    stopTimer();
    quizQuestionContainer.classList.add('hidden');
    resultContainer.classList.remove('hidden');

    let correctAnswersCount = 0;
    wrongQuestions = [];
    userAnswers.forEach((answer, index) => {
        if (answer === shuffledQuestions[index].correctAnswer) {
            correctAnswersCount++;
        } else if (answer !== null) {
            wrongQuestions.push(shuffledQuestions[index]);
        }
    });
    const totalQuestions = shuffledQuestions.length;
    const score = (correctAnswersCount / totalQuestions) * 10;
    
    // Create confetti effect for good scores
    if (score >= 7) {
        createConfetti();
    }
    
    // Add animation to score display
    scoreDisplay.textContent = '';
    let displayScore = 0;
    const scoreInterval = setInterval(() => {
        displayScore += 0.1;
        if (displayScore > score) {
            displayScore = score;
            clearInterval(scoreInterval);
        }
        scoreDisplay.textContent = `Điểm: ${displayScore.toFixed(1)}/10 (${correctAnswersCount}/${totalQuestions} câu đúng)`;
    }, 20);
    
    // Update counters
    correctCount.textContent = correctAnswersCount;
    wrongCount.textContent = totalQuestions - correctAnswersCount;
    totalCount.textContent = totalQuestions;
    
    timeTakenDisplay.textContent = `Thời gian hoàn thành: ${formatTime(timeElapsed)}`;

    wrongAnswersDisplay.innerHTML = '';
    userAnswers.forEach((answer, index) => {
        const question = shuffledQuestions[index];
        if (answer !== question.correctAnswer && answer !== null) {
            const wrongDiv = document.createElement('div');
            wrongDiv.classList.add('wrong-answer-item', 'slide-in');
            wrongDiv.style.animationDelay = `${0.1 * index}s`;
            wrongDiv.innerHTML = `
                <h4 class="wrong-answer-question">Câu ${index + 1}: ${question.question}</h4>
                <div class="wrong-answer-user">
                    <i class="fas fa-times-circle mr-2"></i> Bạn chọn: ${question.options[answer]}
                </div>
                <div class="wrong-answer-correct">
                    <i class="fas fa-check-circle mr-2"></i> Đáp án đúng: ${question.options[question.correctAnswer]}
                </div>
            `;
            wrongAnswersDisplay.appendChild(wrongDiv);
        }
    });
    if (wrongAnswersDisplay.innerHTML === '') {
        wrongAnswersDisplay.innerHTML = '<div class="p-6 bg-dark-50 dark:bg-dark-900/30 text-dark-600 dark:text-dark-400 rounded-lg text-center slide-in"><i class="fas fa-trophy text-4xl mb-3"></i><p class="text-xl font-semibold">Chúc mừng! Bạn trả lời đúng tất cả các câu.</p></div>';
        reviewWrongButton.classList.add('hidden');
    } else {
        reviewWrongButton.classList.remove('hidden');
    }
    
    // Lưu kết quả vào lịch sử
    saveQuizResult(score, correctAnswersCount, totalQuestions, timeElapsed);
    
    clearProgress(currentQuiz.id);
    // Đã loại bỏ dòng này để cho phép cuộn trang
    // toggleHomePageScrolling();
}

restartButton.onclick = () => {
    clearProgress(currentQuiz.id);
    startQuiz(currentQuiz, shuffledQuestions.length !== currentQuiz.questions.length);
};

reviewWrongButton.onclick = () => {
    if (wrongQuestions.length > 0) {
        const reviewQuiz = { ...currentQuiz, questions: wrongQuestions };
        startQuiz(reviewQuiz, false);
    }
};

homeButton.onclick = () => {
    resultContainer.classList.add('hidden');
    homeContainer.classList.remove('hidden');
    quizContainer.classList.add('hidden');
    statsContainer.classList.add('hidden');
    // Đã loại bỏ dòng này để cho phép cuộn trang
    // toggleHomePageScrolling();
    updateStatsDisplay();
}

function showHome() {
    // Ẩn tất cả các container trước
    homeContainer.classList.add('hidden');
    quizContainer.classList.add('hidden');
    quizQuestionContainer.classList.add('hidden');
    resultContainer.classList.add('hidden');
    statsContainer.classList.add('hidden');
    
    // Chỉ hiển thị trang chủ
    homeContainer.classList.remove('hidden');
    
    mobileMenu.classList.remove('active');
    mobileMenu.classList.add('hidden');
    // Đã loại bỏ dòng này để cho phép cuộn trang
    // toggleHomePageScrolling();
    updateStatsDisplay();
}

function showStats() {
    // Ẩn tất cả các container trước
    homeContainer.classList.add('hidden');
    quizContainer.classList.add('hidden');
    quizQuestionContainer.classList.add('hidden');
    resultContainer.classList.add('hidden');
    statsContainer.classList.add('hidden');
    
    // Chỉ hiển thị trang thống kê
    statsContainer.classList.remove('hidden');
    
    mobileMenu.classList.remove('active');
    mobileMenu.classList.add('hidden');
    // Đã loại bỏ dòng này để cho phép cuộn trang
    // toggleHomePageScrolling();
    updateDetailedStatsDisplay();
}

homeLink.onclick = (e) => {
    e.preventDefault();
    stopTimer();
    showHome();
};

quizLink.onclick = (e) => {
    e.preventDefault();
    stopTimer();
    homeContainer.classList.add('hidden');
    quizContainer.classList.remove('hidden');
    quizQuestionContainer.classList.add('hidden');
    resultContainer.classList.add('hidden');
    statsContainer.classList.add('hidden');
    displayQuizList();
    // Đã loại bỏ dòng này để cho phép cuộn trang
    // toggleHomePageScrolling();
};

statsLink.onclick = (e) => {
    e.preventDefault();
    stopTimer();
    showStats();
};

document.getElementById('mobileHomeLink').onclick = (e) => {
    e.preventDefault();
    homeLink.click();
};

document.getElementById('mobileQuizLink').onclick = (e) => {
    e.preventDefault();
    quizLink.click();
};

document.getElementById('mobileStatsLink').onclick = (e) => {
    e.preventDefault();
    statsLink.click();
};

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
    if (quizQuestionContainer.classList.contains('hidden')) return;
    
    if (e.key === 'ArrowLeft' && !prevButton.classList.contains('hidden')) {
        prevButton.click();
    } else if (e.key === 'ArrowRight' && !nextButton.disabled) {
        nextButton.click();
    } else if (e.key >= '1' && e.key <= '9') {
        const questionIndex = parseInt(e.key) - 1;
        if (questionIndex < shuffledQuestions.length) {
            currentQuestionIndex = questionIndex;
            displayQuestion();
            saveProgress();
        }
    }
});

// Thống kê
function saveQuizResult(score, correctAnswers, totalQuestions, timeSpent) {
    // Tạo đối tượng kết quả
    const result = {
        id: Date.now(),
        quizId: currentQuiz.id,
        quizTitle: currentQuiz.title,
        score: score,
        correctAnswers: correctAnswers,
        totalQuestions: totalQuestions,
        timeSpent: timeSpent,
        date: new Date().toISOString()
    };
    
    // Lấy lịch sử hiện tại
    let history = JSON.parse(localStorage.getItem('quizHistory') || '[]');
    
    // Thêm kết quả mới
    history.push(result);
    
    // Lưu lại lịch sử
    localStorage.setItem('quizHistory', JSON.stringify(history));
    
    // Cập nhật dữ liệu thống kê
    updateStats();
}

function updateStats() {
    // Lấy lịch sử làm bài
    quizHistory = JSON.parse(localStorage.getItem('quizHistory') || '[]');
    
    if (quizHistory.length === 0) {
        return;
    }
    
    // Tính toán thống kê
    statsData.completedQuizzes = quizHistory.length;
    
    // Tính điểm trung bình
    const totalScore = quizHistory.reduce((sum, item) => sum + item.score, 0);
    statsData.averageScore = totalScore / quizHistory.length;
    
    // Tính tỷ lệ đúng
    const totalCorrect = quizHistory.reduce((sum, item) => sum + item.correctAnswers, 0);
    const totalQuestions = quizHistory.reduce((sum, item) => sum + item.totalQuestions, 0);
    statsData.correctRate = (totalCorrect / totalQuestions) * 100;
    
    // Tính thời gian trung bình
    const totalTime = quizHistory.reduce((sum, item) => sum + item.timeSpent, 0);
    statsData.averageTime = totalTime / quizHistory.length;
    
    // Phân loại điểm số
    statsData.scoreDistribution = [0, 0, 0, 0, 0]; // 0-2, 2-4, 4-6, 6-8, 8-10
    quizHistory.forEach(item => {
        const scoreIndex = Math.min(Math.floor(item.score / 2), 4);
        statsData.scoreDistribution[scoreIndex]++;
    });
    
    // Tính hiệu suất theo chủ đề
    statsData.topicPerformance = {};
    quizData.forEach(quiz => {
        statsData.topicPerformance[quiz.title] = {
            correct: 0,
            total: 0
        };
    });
    
    quizHistory.forEach(item => {
        const quiz = quizData.find(q => q.id === item.quizId);
        if (quiz) {
            if (!statsData.topicPerformance[quiz.title]) {
                statsData.topicPerformance[quiz.title] = {
                    correct: 0,
                    total: 0
                };
            }
            statsData.topicPerformance[quiz.title].correct += item.correctAnswers;
            statsData.topicPerformance[quiz.title].total += item.totalQuestions;
        }
    });
    
    // Cập nhật dữ liệu 7 ngày gần đây
    const last7Days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        
        const dayResults = quizHistory.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate.toISOString().split('T')[0] === dateString;
        });
        
        if (dayResults.length > 0) {
            const dayScore = dayResults.reduce((sum, item) => sum + item.score, 0) / dayResults.length;
            const dayCorrect = dayResults.reduce((sum, item) => sum + item.correctAnswers, 0);
            const dayTotal = dayResults.reduce((sum, item) => sum + item.totalQuestions, 0);
            const dayRate = dayTotal > 0 ? (dayCorrect / dayTotal) * 100 : 0;
            
            last7Days.push({
                date: dateString,
                score: dayScore,
                correctRate: dayRate
            });
        } else {
            last7Days.push({
                date: dateString,
                score: 0,
                correctRate: 0
            });
        }
    }
    
    statsData.weeklyData = last7Days;
    
    // Cập nhật hiển thị thống kê
    updateStatsDisplay();
}

function updateStatsDisplay() {
    // Cập nhật các số liệu thống kê trên trang chủ
    completedQuizzes.textContent = statsData.completedQuizzes;
    averageScore.textContent = statsData.averageScore.toFixed(1);
    correctRate.textContent = `${statsData.correctRate.toFixed(1)}%`;
    averageTime.textContent = formatTime(Math.round(statsData.averageTime));
    
    // Giả lập xu hướng tăng/giảm
    completedQuizzesTrend.textContent = '12%';
    averageScoreTrend.textContent = '5%';
    correctRateTrend.textContent = '8%';
    averageTimeTrend.textContent = '10%';
    
    // Cập nhật bảng bài kiểm tra gần đây
    updateRecentQuizTable();
    
    // Cập nhật biểu đồ
    updateHomeChart();
}

function updateDetailedStatsDisplay() {
    // Cập nhật các số liệu thống kê chi tiết
    statsCompletedQuizzes.textContent = statsData.completedQuizzes;
    statsAverageScore.textContent = statsData.averageScore.toFixed(1);
    statsCorrectRate.textContent = `${statsData.correctRate.toFixed(1)}%`;
    statsAverageTime.textContent = formatTime(Math.round(statsData.averageTime));
    
    // Giả lập xu hướng tăng/giảm
    statsCompletedQuizzesTrend.textContent = '12%';
    statsAverageScoreTrend.textContent = '5%';
    statsCorrectRateTrend.textContent = '8%';
    statsAverageTimeTrend.textContent = '10%';
    
    // Cập nhật bảng lịch sử làm bài
    updateQuizHistoryTable();
    
    // Cập nhật các biểu đồ
    updateTimelineChart();
    updateScoreDistributionChart();
    updateTimeSpentChart();
    updateTopicPerformanceChart();
}

function updateRecentQuizTable() {
    recentQuizTable.innerHTML = '';
    
    // Lấy 5 bài kiểm tra gần đây nhất
    const recentQuizzes = [...quizHistory].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    
    if (recentQuizzes.length === 0) {
        recentQuizTable.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    Chưa có bài kiểm tra nào được hoàn thành
                </td>
            </tr>
        `;
        return;
    }
    
    recentQuizzes.forEach(quiz => {
        const date = new Date(quiz.date);
        const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        
        const row = document.createElement('tr');
        row.className = 'bg-white dark:bg-gray-800';
        
        let statusClass = '';
        let statusText = '';
        
        if (quiz.score >= 8) {
            statusClass = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            statusText = 'Xuất sắc';
        } else if (quiz.score >= 6.5) {
            statusClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            statusText = 'Tốt';
        } else if (quiz.score >= 5) {
            statusClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            statusText = 'Đạt';
        } else {
            statusClass = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            statusText = 'Chưa đạt';
        }
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900 dark:text-white">${quiz.quizTitle}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500 dark:text-gray-400">${formattedDate}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900 dark:text-white">${quiz.score.toFixed(1)}/10</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500 dark:text-gray-400">${formatTime(quiz.timeSpent)}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                    ${statusText}
                </span>
            </td>
        `;
        
        recentQuizTable.appendChild(row);
    });
}

function updateQuizHistoryTable() {
    quizHistoryTable.innerHTML = '';
    
    // Sắp xếp lịch sử theo thời gian gần nhất
    const sortedHistory = [...quizHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (sortedHistory.length === 0) {
        quizHistoryTable.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    Chưa có bài kiểm tra nào được hoàn thành
                </td>
            </tr>
        `;
        return;
    }
    
    sortedHistory.forEach(quiz => {
        const date = new Date(quiz.date);
        const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        
        const row = document.createElement('tr');
        row.className = 'bg-white dark:bg-gray-800';
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900 dark:text-white">${quiz.quizTitle}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500 dark:text-gray-400">${formattedDate}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900 dark:text-white">${quiz.score.toFixed(1)}/10</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500 dark:text-gray-400">${formatTime(quiz.timeSpent)}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 dark:text-white">${quiz.correctAnswers}/${quiz.totalQuestions}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3" data-quiz-id="${quiz.quizId}">
                    <i class="fas fa-redo"></i> Làm lại
                </button>
                <button class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" data-result-id="${quiz.id}">
                    <i class="fas fa-trash"></i> Xóa
                </button>
            </td>
        `;
        
        quizHistoryTable.appendChild(row);
        
        // Thêm sự kiện cho nút làm lại
        const retryButton = row.querySelector(`button[data-quiz-id="${quiz.quizId}"]`);
        retryButton.addEventListener('click', () => {
            const quizToRetry = quizData.find(q => q.id === quiz.quizId);
            if (quizToRetry) {
                startQuiz(quizToRetry, false);
            }
        });
        
        // Thêm sự kiện cho nút xóa
        const deleteButton = row.querySelector(`button[data-result-id="${quiz.id}"]`);
        deleteButton.addEventListener('click', async () => {
            const confirmed = await showCustomConfirm('Bạn có chắc chắn muốn xóa kết quả này?');
            if (confirmed) {
                deleteQuizResult(quiz.id);
            }
        });
    });
}

function deleteQuizResult(resultId) {
    // Lấy lịch sử hiện tại
    let history = JSON.parse(localStorage.getItem('quizHistory') || '[]');
    
    // Lọc ra kết quả cần xóa
    history = history.filter(item => item.id !== resultId);
    
    // Lưu lại lịch sử
    localStorage.setItem('quizHistory', JSON.stringify(history));
    
    // Cập nhật dữ liệu thống kê
    updateStats();
    
    // Cập nhật hiển thị
    updateDetailedStatsDisplay();
}

function updateHomeChart() {
    // Tạo biểu đồ cho trang chủ
    const ctx = statsChart.getContext('2d');
    
    // Hủy biểu đồ cũ nếu có
    if (window.homeChart) {
        window.homeChart.destroy();
    }
    
    // Dữ liệu cho biểu đồ
    const labels = statsData.weeklyData.map(item => {
        const date = new Date(item.date);
        return `${date.getDate()}/${date.getMonth() + 1}`;
    });
    
    const scores = statsData.weeklyData.map(item => item.score);
    const rates = statsData.weeklyData.map(item => item.correctRate);
    
    // Màu sắc cho biểu đồ
    const primaryColor = isDarkMode ? 'rgba(139, 92, 246, 0.8)' : 'rgba(139, 92, 246, 0.8)';
    const secondaryColor = isDarkMode ? 'rgba(16, 185, 129, 0.8)' : 'rgba(16, 185, 129, 0.8)';
    
    // Tạo biểu đồ mới
    window.homeChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Điểm số',
                    data: scores,
                    borderColor: primaryColor,
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Tỷ lệ đúng (%)',
                    data: rates,
                    borderColor: secondaryColor,
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'
                    }
                },
                x: {
                    grid: {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'
                    }
                }
            }
        }
    });
}

function updateTimelineChart() {
    // Tạo biểu đồ dòng thời gian
    const ctx = timelineChart.getContext('2d');
    
    // Hủy biểu đồ cũ nếu có
    if (window.tlChart) {
        window.tlChart.destroy();
    }
    
    // Sắp xếp lịch sử theo thời gian
    const sortedHistory = [...quizHistory].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Dữ liệu cho biểu đồ
    const labels = sortedHistory.map(item => {
        const date = new Date(item.date);
        return `${date.getDate()}/${date.getMonth() + 1}`;
    });
    
    const scores = sortedHistory.map(item => item.score);
    const correctRates = sortedHistory.map(item => (item.correctAnswers / item.totalQuestions) * 100);
    
    // Màu sắc cho biểu đồ
    const primaryColor = isDarkMode ? 'rgba(139, 92, 246, 0.8)' : 'rgba(139, 92, 246, 0.8)';
    const secondaryColor = isDarkMode ? 'rgba(16, 185, 129, 0.8)' : 'rgba(16, 185, 129, 0.8)';
    
    // Tạo biểu đồ mới
    window.tlChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Điểm số',
                    data: scores,
                    borderColor: primaryColor,
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Tỷ lệ đúng (%)',
                    data: correctRates,
                    borderColor: secondaryColor,
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'
                    }
                },
                x: {
                    grid: {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'
                    }
                }
            }
        }
    });
}

function updateScoreDistributionChart() {
    // Tạo biểu đồ phân bố điểm số
    const ctx = scoreDistributionChart.getContext('2d');
    
    // Hủy biểu đồ cũ nếu có
    if (window.sdChart) {
        window.sdChart.destroy();
    }
    
    // Dữ liệu cho biểu đồ
    const labels = ['0-2', '2-4', '4-6', '6-8', '8-10'];
    const data = statsData.scoreDistribution;
    
    // Màu sắc cho biểu đồ
    const colors = [
        'rgba(239, 68, 68, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(139, 92, 246, 0.8)'
    ];
    
    // Tạo biểu đồ mới
    window.sdChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Số lượng bài kiểm tra',
                    data: data,
                    backgroundColor: colors,
                    borderColor: colors.map(color => color.replace('0.8', '1')),
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        title: function(tooltipItems) {
                            return `Điểm: ${tooltipItems[0].label}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        stepSize: 1,
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'
                    }
                },
                x: {
                    grid: {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'
                    }
                }
            }
        }
    });
}

function updateTimeSpentChart() {
    // Tạo biểu đồ thời gian làm bài
    const ctx = timeSpentChart.getContext('2d');
    
    // Hủy biểu đồ cũ nếu có
    if (window.tsChart) {
        window.tsChart.destroy();
    }
    
    // Sắp xếp lịch sử theo thời gian
    const sortedHistory = [...quizHistory].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Dữ liệu cho biểu đồ
    const labels = sortedHistory.map(item => {
        const date = new Date(item.date);
        return `${date.getDate()}/${date.getMonth() + 1}`;
    });
    
    const timeSpent = sortedHistory.map(item => Math.round(item.timeSpent / 60)); // Chuyển đổi sang phút
    
    // Màu sắc cho biểu đồ
    const primaryColor = isDarkMode ? 'rgba(245, 158, 11, 0.8)' : 'rgba(245, 158, 11, 0.8)';
    
    // Tạo biểu đồ mới
    window.tsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Thời gian (phút)',
                    data: timeSpent,
                    backgroundColor: primaryColor,
                    borderColor: 'rgba(245, 158, 11, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'
                    }
                },
                x: {
                    grid: {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'
                    }
                }
            }
        }
    });
}

function updateTopicPerformanceChart() {
    // Tạo biểu đồ hiệu suất theo chủ đề
    const ctx = topicPerformanceChart.getContext('2d');
    
    // Hủy biểu đồ cũ nếu có
    if (window.tpChart) {
        window.tpChart.destroy();
    }
    
    // Dữ liệu cho biểu đồ
    const topics = Object.keys(statsData.topicPerformance);
    const rates = topics.map(topic => {
        const performance = statsData.topicPerformance[topic];
        return performance.total > 0 ? (performance.correct / performance.total) * 100 : 0;
    });
    
    // Màu sắc cho biểu đồ
    const colors = [
        'rgba(139, 92, 246, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)'
    ];
    
    // Tạo biểu đồ mới
    window.tpChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: topics,
            datasets: [
                {
                    label: 'Tỷ lệ đúng (%)',
                    data: rates,
                    backgroundColor: 'rgba(139, 92, 246, 0.2)',
                    borderColor: 'rgba(139, 92, 246, 0.8)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(139, 92, 246, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(139, 92, 246, 1)'
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'
                    }
                }
            },
            scales: {
                r: {
                    angleLines: {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    },
                    grid: {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    },
                    pointLabels: {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'
                    },
                    ticks: {
                        backdropColor: 'transparent',
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'
                    }
                }
            }
        }
    });
}

function updateAllCharts() {
    // Cập nhật tất cả các biểu đồ
    if (window.homeChart) {
        updateHomeChart();
    }
    
    if (window.tlChart) {
        updateTimelineChart();
    }
    
    if (window.sdChart) {
        updateScoreDistributionChart();
    }
    
    if (window.tsChart) {
        updateTimeSpentChart();
    }
    
    if (window.tpChart) {
        updateTopicPerformanceChart();
    }
}

// Tạo dữ liệu thống kê mẫu
function generateSampleStats() {
    // Kiểm tra xem đã có dữ liệu thống kê chưa
    if (localStorage.getItem('quizHistory')) {
        // Nếu đã có, cập nhật thống kê
        updateStats();
        return;
    }
    
    // Tạo dữ liệu mẫu
    const sampleHistory = [];
    const today = new Date();
    
    // Tạo 10 kết quả mẫu
    // for (let i = 0; i < 10; i++) {
    //     const date = new Date(today);
    //     date.setDate(today.getDate() - Math.floor(Math.random() * 14)); // Trong vòng 2 tuần
        
    //     const quizId = Math.floor(Math.random() * 4) + 1; // ID từ 1-4
    //     const quizTitle = quizData.length > 0 ? 
    //         quizData.find(q => q.id === quizId)?.title || `Bài kiểm tra ${quizId}` : 
    //         `Bài kiểm tra ${quizId}`;
        
    //     const totalQuestions = Math.floor(Math.random() * 20) + 10; // 10-30 câu hỏi
    //     const correctAnswers = Math.floor(Math.random() * (totalQuestions + 1)); // 0-totalQuestions câu đúng
    //     const score = (correctAnswers / totalQuestions) * 10;
    //     const timeSpent = Math.floor(Math.random() * 900) + 300; // 5-20 phút
        
    //     sampleHistory.push({
    //         id: Date.now() + i,
    //         quizId: quizId,
    //         quizTitle: quizTitle,
    //         score: score,
    //         correctAnswers: correctAnswers,
    //         totalQuestions: totalQuestions,
    //         timeSpent: timeSpent,
    //         date: date.toISOString()
    //     });
    // }
    
    // Lưu lịch sử mẫu
    localStorage.setItem('quizHistory', JSON.stringify(sampleHistory));
    
    // Cập nhật thống kê
    updateStats();
}

function init() {
    // Ẩn tất cả các container trừ trang chủ
    quizContainer.classList.add('hidden');
    quizQuestionContainer.classList.add('hidden');
    resultContainer.classList.add('hidden');
    statsContainer.classList.add('hidden');
    
    // Hiển thị trang chủ
    homeContainer.classList.remove('hidden');
    
    loadQuizData();
    createParticles();
    
    // Reset hamburger icon
    const icon = hamburgerBtn.querySelector('i');
    icon.classList.remove('fa-times');
    icon.classList.add('fa-bars');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    
    // Đã loại bỏ dòng này để cho phép cuộn trang
    // document.body.classList.add('home-active');
    
    // Đảm bảo các transition hoạt động
    document.querySelectorAll('.quiz-transition').forEach(el => {
        if (el.id !== 'homeContainer') {
            el.classList.add('hidden');
        }
    });
}

init();
