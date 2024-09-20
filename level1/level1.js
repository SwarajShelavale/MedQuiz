const question = document.getElementById('question');
const choices = Array.from(document.getElementsByClassName('choice-text'));
const progressText = document.getElementById('progressText');
const scoreText = document.getElementById('score');
const progressBarFull = document.getElementById('progressBarFull');
const loader = document.getElementById('loader');
const game = document.getElementById('game');

let currentQuestion = {};
let acceptingAnswers = false;
let score = 0;
let questionCounter = 0;
let availableQuesions = [];

let questions = [];

// Progress Bar
const CORRECT_BONUS = 10;
let MAX_QUESTIONS = 30;

fetch('questions.json')  // Adjusted path for GitHub Pages
    .then((res) => {
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
    })
    .then((loadedQuestions) => {
        if (!loadedQuestions || !loadedQuestions.results) {
            throw new Error("Invalid JSON structure");
        }

        questions = loadedQuestions.results.map((loadedQuestion) => {
            MAX_QUESTIONS = loadedQuestions.results.length;

            const formattedQuestion = {
                question: loadedQuestion.question,
            };

            const answerChoices = [...loadedQuestion.incorrect_answers];
            formattedQuestion.answer = Math.floor(Math.random() * 4) + 1;
            answerChoices.splice(
                formattedQuestion.answer - 1,
                0,
                loadedQuestion.correct_answer
            );

            answerChoices.forEach((choice, index) => {
                formattedQuestion['choice' + (index + 1)] = choice;
            });

            return formattedQuestion;
        });

        startGame();
    })
    .catch((err) => {
        console.error("Error fetching the questions:", err.message);
    });

startGame = () => {
    questionCounter = 0;
    score = 0;
    availableQuesions = [...questions];
    getNewQuestion();
    game.classList.remove('hidden');
    loader.classList.add('hidden');
};

getNewQuestion = () => {
    if (availableQuesions.length === 0 || questionCounter >= MAX_QUESTIONS) {
        localStorage.setItem('mostRecentScore', score);
        return window.location.assign('end.html');
    }
    questionCounter++;
    progressText.innerText = `Question ${questionCounter}/${MAX_QUESTIONS}`;
    progressBarFull.style.width = `${(questionCounter / MAX_QUESTIONS) * 100}%`;

    choices.forEach((choice) => {
        choice.parentElement.classList.remove('correct', 'incorrect');
    });

    const questionIndex = Math.floor(Math.random() * availableQuesions.length);
    currentQuestion = availableQuesions[questionIndex];
    question.innerText = currentQuestion.question;

    choices.forEach((choice) => {
        const number = choice.dataset['number'];
        choice.innerText = currentQuestion['choice' + number];
    });

    availableQuesions.splice(questionIndex, 1);
    acceptingAnswers = true;
};

const submitButton = document.getElementById('submit-button');

choices.forEach((choice) => {
    choice.addEventListener('click', (e) => {
        if (!acceptingAnswers) return;

        acceptingAnswers = false;
        const selectedChoice = e.target;
        const selectedAnswer = selectedChoice.dataset['number'];
        const correctAnswer = currentQuestion.answer;

        const classToApply = selectedAnswer == correctAnswer ? 'correct' : 'incorrect';

        if (correctAnswer != selectedAnswer) {
            const correctChoice = document.querySelector(
                `.choice-text[data-number="${correctAnswer}"]`
            );
            correctChoice.parentElement.classList.add('correct');
        }

        if (classToApply === 'correct') {
            incrementScore(CORRECT_BONUS);
        }

        selectedChoice.parentElement.classList.add(classToApply);
    });
});

submitButton.addEventListener('click', () => {
    setTimeout(() => {
        getNewQuestion();
    }, 1000);
});

incrementScore = (num) => {
    score += num;
    scoreText.innerText = score;
};
