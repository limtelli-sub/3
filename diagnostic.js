// diagnostic.js
// Simple keyword‑based electric fault diagnosis with safety warnings and alarm sound

document.addEventListener('DOMContentLoaded', () => {
  const inputEl = document.getElementById('problem-input');
  const diagnoseBtn = document.getElementById('diagnose-btn');
  const modal = document.getElementById('result-modal');
  const resultTitle = document.getElementById('result-title');
  const resultText = document.getElementById('result-text');
  const closeBtn = document.getElementById('close-modal');

  // ---- Audio (short alarm) ----
  let audioCtx;
  function initAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  function playAlarm() {
    initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  }

  // ---- Diagnosis data ----
  const adviceMap = {
    '스위치 안 켜짐': '전원 스위치를 확인하고 회로 차단기가 내려갔는지 확인하세요.',
    '누전': '전선 절연 상태를 점검하고 멀티미터로 누전 여부를 확인하세요.',
    '과부하': '과부하 차단기가 작동했을 수 있습니다. 차단기를 리셋하고 부하를 줄이세요.',
    '전기 냄새': '전기 화재 위험이 있습니다! 즉시 전원을 차단하고 전문가에게 연락하세요.',
    '스파크': '전기 스파크가 발생했습니다! 위험하니 즉시 전원을 차단하고 전문가에게 상담하세요.'
  };

  const safetyKeywords = ['화재', '스파크', '전기 냄새', '연기', '불꽃', '폭발', '스파크가 크게 튀는', '누전 (전류 누출)', '단락 (합선)', '과전류(과부하)', '접촉 불량', '절연 파괴 및 노후화'];

  function diagnose(text) {
    const lowered = text.toLowerCase();
    // safety check first
    for (const kw of safetyKeywords) {
      if (lowered.includes(kw)) {
        return { type: 'danger', message: '※ 주의! 위험 상황이 감지되었습니다. 즉시 전원을 차단하고 전문가에게 연락하세요.' };
      }
    }
    // find any known advice keyword
    for (const key in adviceMap) {
      if (lowered.includes(key)) {
        return { type: 'normal', message: adviceMap[key] };
      }
    }
    // fallback
    return { type: 'unknown', message: '정확한 진단이 어렵습니다. 전력공사 123으로 상담을 권장합니다.' };
  }

  function showResult(res) {
    resultTitle.textContent = res.type === 'danger' ? '⚠️ 안전 경고' : '진단 결과';
    resultText.textContent = res.message;
    if (res.type === 'danger') {
      resultText.classList.add('blink');
      playAlarm();
    } else {
      resultText.classList.remove('blink');
    }
    modal.style.display = 'flex';
  }

  diagnoseBtn.addEventListener('click', () => {
    const txt = inputEl.value.trim();
    if (!txt) return alert('문제를 입력해주세요.');
    const result = diagnose(txt);
    showResult(result);
  });

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });
});
