class MemoryGame {
    // Reducimos de 15 a 10 emojis
    static EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯'];
    // ...existing code...
    
    handleMatch() {
        this.matchedPairs++;
        this.flippedCards = [];
        // Cambiamos la condición de victoria a 10 parejas
        if (this.matchedPairs === 10) {
            this.gameWon();
        }
    }

    showWinMessage(score) {
        let position = this.getRankingPosition(score);
        let message = `¡Felicitaciones! 
                       Completaste el juego en ${score.moves} movimientos y ${score.time} segundos
                       Puntuación: ${score.points} puntos`;

        if (position <= 3) {
            const motivationalMessages = {
                1: "🏆 ¡INCREÍBLE! ¡Has conseguido el PRIMER PUESTO! Eres una verdadera leyenda del juego.",
                2: "🥈 ¡ESPECTACULAR! ¡Segundo puesto! Estás entre los mejores jugadores de todos los tiempos.",
                3: "🥉 ¡EXTRAORDINARIO! ¡Tercer puesto! Tu destreza mental es admirable."
            };
            message += `\n\n${motivationalMessages[position]}`;
        }

        alert(message);
    }

    getRankingPosition(score) {
        // Crear una copia del ranking actual más el nuevo score
        const allScores = [...this.ranking, score];
        // Ordenar por puntos de mayor a menor
        allScores.sort((a, b) => b.points - a.points);
        // Encontrar la posición del score actual
        return allScores.findIndex(s => s === score) + 1;
    }
    // ...existing code...
}

let firstCard = null;
let secondCard = null;
let canFlip = true;
let moves = 0;
let timeElapsed = 0;
let timerInterval = null;
let matchedPairs = 0;

function createCards() {
    const gameBoard = document.querySelector('.game-board');
    const totalPairs = 10; // Cambiado de 15 a 10 parejas (20 cartas en total)
    const cards = [];
    
    // Crear array con pares de animales
    for (let i = 0; i < totalPairs; i++) {
        cards.push(MemoryGame.EMOJIS[i], MemoryGame.EMOJIS[i]);
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
        if (matchedPairs === 10) { // Cambiado de 15 a 10
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
    const score = {
        moves: moves,
        time: timeElapsed,
        points: calculatePoints(moves, timeElapsed),
        date: new Date().toISOString()
    };
    saveScore(score);
    showWinMessage(score);
}

function calculatePoints(moves, time) {
    // Ajustamos la fórmula para dar más peso a menos movimientos y menor tiempo
    const basePoints = 10000;
    const movesPenalty = moves * 50;  // 50 puntos menos por cada movimiento
    const timePenalty = time * 10;    // 10 puntos menos por cada segundo
    
    return Math.max(basePoints - movesPenalty - timePenalty, 0);
}

function showWinMessage(score) {
    const position = getRankingPosition(score);
    let message = `¡Felicitaciones! 
                   Completaste el juego en ${score.moves} movimientos y ${score.time} segundos
                   Puntuación: ${score.points} puntos`;

    if (position <= 3) {
        const motivationalMessages = {
            1: "🏆 ¡INCREÍBLE! ¡Has conseguido el PRIMER PUESTO! Eres una verdadera leyenda del juego.",
            2: "🥈 ¡ESPECTACULAR! ¡Segundo puesto! Estás entre los mejores jugadores de todos los tiempos.",
            3: "🥉 ¡EXTRAORDINARIO! ¡Tercer puesto! Tu destreza mental es admirable."
        };
        message += `\n\n${motivationalMessages[position]}`;
    }

    alert(message);
}

function getRankingPosition(score) {
    const scores = JSON.parse(localStorage.getItem('scores') || '[]');
    const allScores = [...scores, score];
    // Ordenar por puntos de mayor a menor
    allScores.sort((a, b) => b.points - a.points);
    // Encontrar la posición del score actual
    return allScores.findIndex(s => 
        s.moves === score.moves && 
        s.time === score.time && 
        s.points === score.points
    ) + 1;
}

function saveScore(score) {
    let scores = JSON.parse(localStorage.getItem('scores') || '[]');
    scores.push(score);
    
    // Ordenar por puntos (mayor a menor) y en caso de empate por tiempo (menor a mayor)
    scores.sort((a, b) => {
        if (b.points === a.points) {
            return a.time - b.time;
        }
        return b.points - a.points;
    });
    
    // Mantener solo los 10 mejores
    scores = scores.slice(0, 10);
    
    localStorage.setItem('scores', JSON.stringify(scores));
    updateRanking();
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

function updateRanking() {
    const rankingList = document.getElementById('ranking-list');
    const scores = JSON.parse(localStorage.getItem('scores') || '[]');
    
    rankingList.innerHTML = scores.map((score, index) => `
        <li class="ranking-item">
            <div class="ranking-position">${index + 1}º</div>
            <div class="ranking-details">
                <span class="ranking-points">🏆 ${score.points} puntos</span>
                <span class="ranking-moves">🎯 ${score.moves} movimientos</span>
                <span class="ranking-time">⏱️ ${score.time} segundos</span>
                <span class="ranking-date">${new Date(score.date).toLocaleDateString()}</span>
            </div>
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