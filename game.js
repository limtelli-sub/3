document.addEventListener('DOMContentLoaded', () => {
  const emojis = ['🍎', '🍌', '🍉', '🍇', '🍓', '🥑', '🥕', '🌽'];
  let cardsArray = [...emojis, ...emojis];
  
  const gameBoard = document.getElementById('game-board');
  const movesEl = document.getElementById('moves');
  const timeEl = document.getElementById('time');
  const restartBtn = document.getElementById('restart-btn');
  const modalRestartBtn = document.getElementById('modal-restart-btn');
  const victoryModal = document.getElementById('victory-modal');
  
  let firstCard = null;
  let secondCard = null;
  let hasFlippedCard = false;
  let lockBoard = false;
  
  let moves = 0;
  let matchedPairs = 0;
  let seconds = 0;
  let timer;

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function createBoard() {
    gameBoard.innerHTML = '';
    shuffle(cardsArray);
    
    cardsArray.forEach((emoji) => {
      const card = document.createElement('div');
      card.classList.add('card');
      card.dataset.emoji = emoji;
      
      const cardFront = document.createElement('div');
      cardFront.classList.add('card-face', 'card-front');
      cardFront.textContent = '❔';
      
      const cardBack = document.createElement('div');
      cardBack.classList.add('card-face', 'card-back');
      cardBack.textContent = emoji;
      
      card.appendChild(cardFront);
      card.appendChild(cardBack);
      
      card.addEventListener('click', flipCard);
      gameBoard.appendChild(card);
    });
  }

  function startTimer() {
    clearInterval(timer);
    seconds = 0;
    timeEl.textContent = '00:00';
    timer = setInterval(() => {
      seconds++;
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      timeEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, 1000);
  }

  function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    this.classList.add('flipped');

    if (!hasFlippedCard) {
      hasFlippedCard = true;
      firstCard = this;
      
      // 첫 클릭 시 타이머가 돌고 있지 않다면 시작
      if (moves === 0 && seconds === 0) {
        startTimer();
      }
      return;
    }

    secondCard = this;
    moves++;
    movesEl.textContent = moves;
    checkForMatch();
  }

  function checkForMatch() {
    let isMatch = firstCard.dataset.emoji === secondCard.dataset.emoji;

    if (isMatch) {
      disableCards();
    } else {
      unflipCards();
    }
  }

  function disableCards() {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    
    matchedPairs++;
    if (matchedPairs === emojis.length) {
      clearInterval(timer);
      setTimeout(showVictoryModal, 500);
    }
    resetBoard();
  }

  function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
      firstCard.classList.remove('flipped');
      secondCard.classList.remove('flipped');
      resetBoard();
    }, 1000);
  }

  function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
  }

  function showVictoryModal() {
    document.getElementById('final-moves').textContent = moves;
    document.getElementById('final-time').textContent = timeEl.textContent;
    victoryModal.classList.add('active');
  }

  function restartGame() {
    victoryModal.classList.remove('active');
    moves = 0;
    matchedPairs = 0;
    movesEl.textContent = moves;
    clearInterval(timer);
    timeEl.textContent = '00:00';
    seconds = 0;
    createBoard();
  }

  restartBtn.addEventListener('click', restartGame);
  modalRestartBtn.addEventListener('click', restartGame);

  // Initialize
  createBoard();
});
