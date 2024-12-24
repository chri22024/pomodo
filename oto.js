// 消音の状態を管理するフラグ
let isMuted = false;

// アラーム音の設定
const alarmSound = new Audio('alarm.mp3'); // アラーム音ファイルを設定
alarmSound.preload = 'auto';

// 消音ボタンの要素を作成
const muteButton = document.createElement('button');
muteButton.id = 'mute-button';
muteButton.textContent = '🔈'; // 初期状態は音あり
muteButton.style.position = 'fixed';
muteButton.style.top = '10px';
muteButton.style.right = '10px';
document.body.appendChild(muteButton);

// 消音ボタンのクリックイベント
muteButton.addEventListener('click', () => {
    isMuted = !isMuted;
    muteButton.textContent = isMuted ? '🔇' : '🔈'; // アイコンを切り替え
});

// タイマー機能
var timerInterval;

function startTimer(duration, mode) {
    var timeRemaining = duration;
    updateTimerDisplay(timeRemaining);
    updateProgressBar(timeRemaining, duration);

    timerInterval = setInterval(function () {
        timeRemaining--;
        updateTimerDisplay(timeRemaining);
        updateProgressBar(timeRemaining, duration);

        if (timeRemaining <= 0) {
            clearInterval(timerInterval);

            // アラームを鳴らす
            if (!isMuted) {
                alarmSound.currentTime = 0; // 再生位置をリセット
                alarmSound.play();
            }

            // 次のタイマーを開始
            if (mode === 'work') {
                alert('作業時間が終了しました！休憩を始めます。');
                startTimer(breakDuration * 60, 'break');
            } else {
                alert('休憩時間が終了しました！');
            }
        }
    }, 1000);
}

// タイマー表示を更新
function updateTimerDisplay(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const timerText = document.getElementById('timer-text');
    timerText.textContent = `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// プログレスバーを更新
function updateProgressBar(timeRemaining, totalDuration) {
    const progressBar = document.querySelector('.progress-bar');
    const progress = (1 - timeRemaining / totalDuration) * 100;
    progressBar.style.strokeDashoffset = 565.48 - (progress / 100) * 565.48;
}

// 初期化処理
document.addEventListener('DOMContentLoaded', () => {
    // 作業タイマーを開始
    startTimer(workDuration * 60, 'work');
});
