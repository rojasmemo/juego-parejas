class MemoryGame {
    // Constantes del juego
    static EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵'];
    static FLIP_DELAY = 1000;
    static MAX_RANKING_ITEMS = 10;
    static STORAGE_KEY = 'memoryGameRanking';

    constructor() {
        this.initializeProperties();
        this.initializeDOMElements();
        this.init();
        this.addRankingEventListeners();
    }

    initializeProperties() {
        this.cards = [];
        this.moves = 0;
        this.timer = 0;
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.timerInterval = null;
        this.ranking = this.loadRanking();
    }

    initializeDOMElements() {
        this.gameBoard = document.querySelector('.game-board');
        this.movesElement = document.querySelector('.moves');
        this.timerElement = document.querySelector('.timer');
        this.restartBtn = document.querySelector('.restart-btn');
        this.viewRankingBtn = document.querySelector('.view-ranking-btn');
        this.clearRankingBtn = document.querySelector('.clear-ranking-btn');
        this.rankingDiv = document.querySelector('.ranking');
    }

    loadRanking() {
        return JSON.parse(localStorage.getItem(MemoryGame.STORAGE_KEY)) || [];
    }

    init() {
        this.initializeCards();
        this.shuffleCards();
        this.renderCards();
        this.addEventListeners();
        this.startTimer();
    }

    initializeCards() {
        this.cards = [...MemoryGame.EMOJIS, ...MemoryGame.EMOJIS];
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
            const cardElement = this.createCard(index, card);
            this.gameBoard.appendChild(cardElement);
        });
    }

    createCard(id, image) {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.id = id;
        
        const cardFront = document.createElement('div');
        cardFront.className = 'card-front';
        
        const cardBack = document.createElement('div');
        cardBack.className = 'card-back';
        
        const cardContent = document.createElement('div');
        cardContent.className = 'card-content';
        cardContent.textContent = image;
        
        cardBack.appendChild(cardContent);
        card.appendChild(cardFront);
        card.appendChild(cardBack);
        
        return card;
    }

    addEventListeners() {
        this.gameBoard.addEventListener('click', this.handleCardClick.bind(this));
        this.restartBtn.addEventListener('click', this.restartGame.bind(this));
    }

    handleCardClick(e) {
        const card = e.target.closest('.card');
        if (card && this.canFlipCard(card)) {
            this.flipCard(card);
        }
    }

    canFlipCard(card) {
        return !card.classList.contains('flipped') && 
               this.flippedCards.length < 2 &&
               !this.flippedCards.includes(card);
    }

    flipCard(card) {
        card.classList.add('flipped');
        this.flippedCards.push(card);

        if (this.flippedCards.length === 2) {
            this.updateMoves();
            this.checkMatch();
        }
    }

    updateMoves() {
        this.moves++;
        this.movesElement.textContent = `Movimientos: ${this.moves}`;
    }

    checkMatch() {
        const [card1, card2] = this.flippedCards;
        const [value1, value2] = [
            this.cards[card1.dataset.id],
            this.cards[card2.dataset.id]
        ];
        
        if (value1 === value2) {
            this.handleMatch();
        } else {
            this.handleMismatch(card1, card2);
        }
    }

    handleMatch() {
        this.matchedPairs++;
        this.flippedCards = [];
        if (this.matchedPairs === MemoryGame.EMOJIS.length) {
            this.gameWon();
        }
    }

    handleMismatch(card1, card2) {
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            this.flippedCards = [];
        }, MemoryGame.FLIP_DELAY);
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimerDisplay();
        }, 1000);
    }

    updateTimerDisplay() {
        this.timerElement.textContent = `Tiempo: ${this.timer}s`;
    }

    gameWon() {
        clearInterval(this.timerInterval);
        const score = this.calculateScore();
        this.updateRanking(score);
        this.showWinMessage(score);
    }

    calculateScore() {
        return {
            moves: this.moves,
            time: this.timer,
            date: new Date().toLocaleDateString(),
            points: this.calculatePoints()
        };
    }

    calculatePoints() {
        return Math.round(1000 * (MemoryGame.EMOJIS.length / this.moves) * (1000 / this.timer));
    }

    showWinMessage(score) {
        alert(`¡Felicitaciones! 
               Completaste el juego en ${score.moves} movimientos y ${score.time} segundos
               Puntuación: ${score.points} puntos`);
    }

    updateRanking(score) {
        this.ranking.push(score);
        this.ranking.sort((a, b) => b.points - a.points);
        this.ranking = this.ranking.slice(0, MemoryGame.MAX_RANKING_ITEMS);
        this.saveRanking();
        this.updateRankingDisplay();
    }

    saveRanking() {
        localStorage.setItem(MemoryGame.STORAGE_KEY, JSON.stringify(this.ranking));
    }

    updateRankingDisplay() {
        const rankingList = document.getElementById('ranking-list');
        rankingList.innerHTML = this.ranking
            .map(this.createRankingItem)
            .join('');
    }

    createRankingItem(score, index) {
        return `
            <li>
                #${index + 1} - ${score.date}
                <br>🏆 Puntos: ${score.points}
                <br>🎯 Movimientos: ${score.moves}
                <br>⏱️ Tiempo: ${score.time}s
            </li>
        `;
    }

    addRankingEventListeners() {
        this.viewRankingBtn.addEventListener('click', this.toggleRanking.bind(this));
        this.clearRankingBtn.addEventListener('click', this.clearRanking.bind(this));
    }

    toggleRanking() {
        const isHidden = this.rankingDiv.style.display === 'none';
        this.rankingDiv.style.display = isHidden ? 'block' : 'none';
        this.viewRankingBtn.textContent = isHidden ? 'Ocultar Ranking' : 'Ver Ranking';
        if (isHidden) this.updateRankingDisplay();
    }

    clearRanking() {
        if (confirm('¿Estás seguro de que quieres borrar el ranking?')) {
            localStorage.removeItem(MemoryGame.STORAGE_KEY);
            this.ranking = [];
            this.updateRankingDisplay();
            alert('Ranking borrado correctamente');
        }
    }

    restartGame() {
        clearInterval(this.timerInterval);
        this.initializeProperties();
        this.resetDisplay();
        this.init();
    }

    resetDisplay() {
        this.movesElement.textContent = 'Movimientos: 0';
        this.timerElement.textContent = 'Tiempo: 0';
    }
}

// Inicialización del juego
document.addEventListener('DOMContentLoaded', () => new MemoryGame());