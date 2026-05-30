document.addEventListener('DOMContentLoaded', () => {
  // --- Timer Logic ---
  let timerInterval;
  let remainingSeconds = 0;
  const timerDisplay = document.getElementById('timer-display');
  const timerBtns = document.querySelectorAll('.timer-btn:not(.stop-btn)');
  const stopBtn = document.getElementById('stop-timer-btn');
  let audioContext;

  function initAudio() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  function playAlarm() {
    initAudio();
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    // 3번의 짧은 비프음 발생
    for (let i = 0; i < 3; i++) {
      const osc = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioContext.currentTime + i * 0.4);
      
      gainNode.gain.setValueAtTime(1, audioContext.currentTime + i * 0.4);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + i * 0.4 + 0.3);
      
      osc.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      osc.start(audioContext.currentTime + i * 0.4);
      osc.stop(audioContext.currentTime + i * 0.4 + 0.3);
    }
  }

  function updateTimerDisplay() {
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function startTimer(seconds) {
    initAudio();
    clearInterval(timerInterval);
    timerDisplay.classList.remove('blink');
    remainingSeconds = seconds;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
      remainingSeconds--;
      updateTimerDisplay();

      if (remainingSeconds <= 0) {
        clearInterval(timerInterval);
        timerDisplay.classList.add('blink');
        playAlarm();
      }
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
    timerDisplay.classList.remove('blink');
  }

  timerBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const seconds = parseInt(btn.dataset.time, 10);
      startTimer(seconds);
    });
  });

  stopBtn.addEventListener('click', stopTimer);


  // --- Draw Logic ---
  const nameInput = document.getElementById('name-input');
  const excludeCheckbox = document.getElementById('exclude-checkbox');
  const drawBtn = document.getElementById('draw-btn');
  const drawResult = document.getElementById('draw-result');
  const pickedListEl = document.getElementById('picked-list');
  const resetPickedBtn = document.getElementById('reset-picked-btn');
  
  let pickedNames = [];
  let isRolling = false;

  function parseNames(text) {
    return text.split(',')
      .map(name => name.trim())
      .filter(name => name.length > 0);
  }

  function renderPickedList() {
    pickedListEl.innerHTML = '';
    pickedNames.forEach(name => {
      const li = document.createElement('li');
      li.textContent = name;
      pickedListEl.appendChild(li);
    });
  }

  drawBtn.addEventListener('click', () => {
    if (isRolling) return;

    const allNames = parseNames(nameInput.value);
    
    if (allNames.length === 0) {
      alert('발표자 명단을 쉼표로 구분하여 입력해주세요.');
      return;
    }

    let candidates = allNames;

    if (excludeCheckbox.checked) {
      candidates = allNames.filter(name => !pickedNames.includes(name));
      if (candidates.length === 0) {
        alert('입력한 모든 사람이 이미 뽑혔습니다! 제외 옵션을 해제하거나 명단을 초기화해주세요.');
        return;
      }
    }

    isRolling = true;
    drawBtn.disabled = true;
    
    // 두구두구 롤링 애니메이션
    let rollInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * candidates.length);
      drawResult.innerHTML = `<span class="rolling">${candidates[randomIndex]}</span>`;
    }, 100);

    // 2초 후 최종 추첨 결과 표시
    setTimeout(() => {
      clearInterval(rollInterval);
      
      const finalIndex = Math.floor(Math.random() * candidates.length);
      const winner = candidates[finalIndex];
      
      drawResult.innerHTML = `<span class="result-text pop-animation">${winner}</span>`;
      
      // 제외 옵션이 켜져 있으면 뽑힌 명단에 추가
      if (excludeCheckbox.checked && !pickedNames.includes(winner)) {
        pickedNames.push(winner);
        renderPickedList();
      }
      
      isRolling = false;
      drawBtn.disabled = false;
    }, 2000);
  });

  resetPickedBtn.addEventListener('click', () => {
    pickedNames = [];
    renderPickedList();
    if (excludeCheckbox.checked) {
      drawResult.innerHTML = '<span class="placeholder">추첨 대기 중...</span>';
    }
  });
});
