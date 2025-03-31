const ANIMAL_EMOJIS = [
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
    '🐨', '🦁', '🐯', '🐸', '🦉', '🦒', '🦘'
];

let firstCard = null;
let secondCard = null;
let canFlip = true;
let moves = 0;
let timeElapsed = 0;
let timerInterval = null;
let matchedPairs = 0;

function createCards() {
    const gameBoard = document.querySelector('.game-board');
    const totalPairs = 15; // 30 cartas en total (15 pares)
    const cards = [];
    
    // Crear array con pares de animales
    for (let i = 0; i < totalPairs; i++) {
        cards.push(ANIMAL_EMOJIS[i], ANIMAL_EMOJIS[i]);
    }
    
    // Mezclar el array
    const shuffledCards = cards.sort(() => Math.random() - 0.5);
    
    // Limpiar el tablero
    gameBoard.innerHTML = '';
    
    // Crear las cartas
    shuffledCards.forEach((animal, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('data-animal', animal);
        
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front"></div>
                <div class="card-back">
                    <span class="card-content">${animal}</span>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => flipCard(card));
        gameBoard.appendChild(card);
    });
}

function flipCard(card) {
    if (!canFlip || card.classList.contains('flipped') || card === firstCard) return;
    
    card.classList.add('flipped');
    
    if (!firstCard) {
        firstCard = card;
        startTimer();
    } else {
        secondCard = card;
        canFlip = false;
        checkMatch();
    }
}

function checkMatch() {
    moves++;
    updateMoves();
    
    const firstAnimal = firstCard.getAttribute('data-animal');
    const secondAnimal = secondCard.getAttribute('data-animal');
    
    if (firstAnimal === secondAnimal) {
        matchedPairs++;
        resetCards();
        if (matchedPairs === 15) {
            endGame();
        }
    } else {
        setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            resetCards();
        }, 1000);
    }
}

function resetCards() {
    firstCard = null;
    secondCard = null;
    canFlip = true;
}

function updateMoves() {
    document.getElementById('moves-count').textContent = moves;
}

function startTimer() {
    if (!timerInterval) {
        timerInterval = setInterval(() => {
            timeElapsed++;
            document.getElementById('time-count').textContent = timeElapsed;
        }, 1000);
    }
}

function endGame() {
    clearInterval(timerInterval);
    saveScore();
    alert(`¡Felicitaciones! Has completado el juego en ${timeElapsed} segundos con ${moves} movimientos.`);
}

function restartGame() {
    firstCard = null;
    secondCard = null;
    canFlip = true;
    moves = 0;
    timeElapsed = 0;
    matchedPairs = 0;
    clearInterval(timerInterval);
    timerInterval = null;
    
    document.getElementById('moves-count').textContent = '0';
    document.getElementById('time-count').textContent = '0';
    
    createCards();
}

function saveScore() {
    const scores = JSON.parse(localStorage.getItem('scores') || '[]');
    scores.push({
        moves: moves,
        time: timeElapsed,
        date: new Date().toISOString()
    });
    scores.sort((a, b) => a.moves - b.moves);
    localStorage.setItem('scores', JSON.stringify(scores.slice(0, 10)));
    updateRanking();
}

function updateRanking() {
    const rankingList = document.getElementById('ranking-list');
    const scores = JSON.parse(localStorage.getItem('scores') || '[]');
    
    rankingList.innerHTML = scores.map((score, index) => `
        <li>
            #${index + 1} - Movimientos: ${score.moves}, Tiempo: ${score.time}s
        </li>
    `).join('');
}

function clearRanking() {
    localStorage.removeItem('scores');
    updateRanking();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    createCards();
    updateRanking();
    
    document.querySelector('.restart-btn').addEventListener('click', restartGame);
    document.querySelector('.clear-ranking-btn').addEventListener('click', clearRanking);
    document.querySelector('.view-ranking-btn').addEventListener('click', () => {
        const ranking = document.querySelector('.ranking');
        ranking.hidden = !ranking.hidden;
    });
});