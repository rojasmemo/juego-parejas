class MemoryGame {
    constructor() {
        this.cards = [];
        this.moves = 0;
        this.timer = 0;
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.timerInterval = null;
        this.gameBoard = document.querySelector('.game-board');
        this.movesElement = document.querySelector('.moves');
        this.timerElement = document.querySelector('.timer');
        this.restartBtn = document.querySelector('.restart-btn');
        this.viewRankingBtn = document.querySelector('.view-ranking-btn');
        this.clearRankingBtn = document.querySelector('.clear-ranking-btn');
        this.rankingDiv = document.querySelector('.ranking');
        this.ranking = JSON.parse(localStorage.getItem('memoryGameRanking')) || [];
        
        this.init();
        this.addRankingEventListeners();
    }

    init() {
        // Crear array de 30 cartas (15 parejas)
        const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵'];
        this.cards = [...emojis, ...emojis];
        this.shuffleCards();
        this.renderCards();
        this.addEventListeners();
        this.startTimer();
    }

    shuffleCards() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    renderCards() {
        this.gameBoard.innerHTML = '';
        this.cards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('card');
            cardElement.dataset.index = index;
            cardElement.dataset.value = card;
            this.gameBoard.appendChild(cardElement);
        });
    }

    addEventListeners() {
        this.gameBoard.addEventListener('click', (e) => {
            const card = e.target.closest('.card');
            if (card && this.canFlipCard(card)) {
                this.flipCard(card);
            }
        });

        this.restartBtn.addEventListener('click', () => {
            this.restartGame();
        });
    }

    canFlipCard(card) {
        return !card.classList.contains('flipped') && 
               this.flippedCards.length < 2 &&
               !this.flippedCards.includes(card);
    }

    flipCard(card) {
        card.classList.add('flipped');
        card.textContent = card.dataset.value;
        this.flippedCards.push(card);

        if (this.flippedCards.length === 2) {
            this.moves++;
            this.movesElement.textContent = `Movimientos: ${this.moves}`;
            this.checkMatch();
        }
    }

    checkMatch() {
        const [card1, card2] = this.flippedCards;
        if (card1.dataset.value === card2.dataset.value) {
            this.matchedPairs++;
            this.flippedCards = [];
            if (this.matchedPairs === 15) {
                this.gameWon();
            }
        } else {
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                card1.textContent = '';
                card2.textContent = '';
                this.flippedCards = [];
            }, 1000);
        }
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.timerElement.textContent = `Tiempo: ${this.timer}s`;
        }, 1000);
    }

    gameWon() {
        clearInterval(this.timerInterval);
        const score = {
            moves: this.moves,
            time: this.timer,
            date: new Date().toLocaleDateString(),
            points: this.calculatePoints()
        };
        
        this.updateRanking(score);
        alert(`¡Felicitaciones! Completaste el juego en ${this.moves} movimientos y ${this.timer} segundos\nPuntuación: ${score.points} puntos`);
    }

    calculatePoints() {
        return Math.round(1000 * (15 / this.moves) * (1000 / this.timer));
    }

    updateRanking(score) {
        this.ranking.push(score);
        this.ranking.sort((a, b) => b.points - a.points);
        this.ranking = this.ranking.slice(0, 10);
        localStorage.setItem('memoryGameRanking', JSON.stringify(this.ranking));
        this.updateRankingDisplay();
    }

    updateRankingDisplay() {
        const rankingList = document.getElementById('ranking-list');
        rankingList.innerHTML = this.ranking
            .map((score, index) => `
                <li>
                    #${index + 1} - ${score.date}
                    <br>🏆 Puntos: ${score.points}
                    <br>🎯 Movimientos: ${score.moves}
                    <br>⏱️ Tiempo: ${score.time}s
                </li>
            `)
            .join('');
    }

    addRankingEventListeners() {
        this.viewRankingBtn.addEventListener('click', () => {
            const isHidden = this.rankingDiv.style.display === 'none';
            this.rankingDiv.style.display = isHidden ? 'block' : 'none';
            this.viewRankingBtn.textContent = isHidden ? 'Ocultar Ranking' : 'Ver Ranking';
            if (isHidden) {
                this.updateRankingDisplay();
            }
        });

        this.clearRankingBtn.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que quieres borrar el ranking?')) {
                localStorage.removeItem('memoryGameRanking');
                this.ranking = [];
                this.updateRankingDisplay();
                alert('Ranking borrado correctamente');
            }
        });
    }

    restartGame() {
        clearInterval(this.timerInterval);
        this.cards = [];
        this.moves = 0;
        this.timer = 0;
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.movesElement.textContent = 'Movimientos: 0';
        this.timerElement.textContent = 'Tiempo: 0';
        this.init();
    }
}

// Iniciar el juego cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();
});