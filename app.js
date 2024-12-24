// 画像のパスを配列で定義（実際の画像パスに置き換えてください）
var images = [
    'pictures/1.jpg',
    'pictures/2.jpg',
    'pictures/3.jpg',
    'pictures/4.jpg',
    'pictures/5.jpg',
    'pictures/6.jpg',
    'pictures/7.jpg',
    'pictures/8.jpg'
];

// 要素の取得
var currentImageIndex = 0;
var imageContainer = document.getElementById('image-container');
var slideshowImage = document.getElementById('slideshow-image');
var content = document.getElementById('content');
var startButton = document.getElementById('start-button');
var formContainer = document.getElementById('form-container');
var startWorkButton = document.getElementById('start-work-button');
var timerContainer = document.getElementById('timer-container');
var timerText = document.getElementById('timer-text');
var progressBar = document.querySelector('.progress-bar');
var settingsButton = document.getElementById('settings-button');
var settingsModal = document.getElementById('settings-modal');
var modalOverlay = document.getElementById('modal-overlay');
var saveSettingsButton = document.getElementById('save-settings-button');
var workDurationInput = document.getElementById('work-duration');
var breakDurationInput = document.getElementById('break-duration');

// 質問フォーム入力
var sleepHours = document.getElementById('sleep_hours');

// 一時停止／再開ボタン
var pauseButton = document.getElementById('pause-button');
var resumeButton = document.getElementById('resume-button');

// 作業中か休憩中かを表示
var timerModeElement = document.getElementById('timer-mode');

// 現在何セット目か
var currentSetElement = document.getElementById('current-set');

// タイマー設定
var totalTime = 30; // (作業+休憩)の合計を30分と仮定
var workDuration = 0;  // 実際にはユーザ入力で計算
var breakDuration = 0;

// 一時停止フラグ
var isStop = 0;

// 何セット完了したか
var setCount = 0;

// タイマー用
var timerInterval;

// ページ読み込み時にスライドショーを開始
window.onload = function () {
    startSlideshow();
};

// スライドショーを開始する関数
function startSlideshow() {
    slideshowImage.src = images[currentImageIndex];
    var slideshowInterval = setInterval(function () {
        currentImageIndex++;
        if (currentImageIndex < images.length) {
            slideshowImage.src = images[currentImageIndex];
        } else {
            clearInterval(slideshowInterval);
            shiftImageRight();
        }
    }, 450);
}

// 画像を右側に寄せてコンテンツを表示
function shiftImageRight() {
    slideshowImage.style.transition = 'transform 1s ease';
    slideshowImage.style.transform = 'translateX(28%) scale(0.8)';

    // 移動が完了したらコンテンツをフェードイン
    setTimeout(function () {
        content.classList.add('content-isActive');
    }, 1000);
}

// 「はじめる」ボタンを押したら質問フォームを表示
startButton.addEventListener('click', function () {
    formContainer.style.display = 'block';
    formContainer.scrollIntoView({ behavior: 'smooth' });
});

// ==================== 入力チェック ====================
// ラジオボタンや number 入力を総合的にチェックする
// 全てのラジオグループ名 (name属性) をまとめる
var radioGroups = [
  'answer1', 'answer2', 'answer3', 'answer4' // など必要な分
];
var allRadios = document.querySelectorAll('#form-container input[type="radio"]');
var allNumberOrText = document.querySelectorAll('#form-container input[type="number"], #form-container input[type="text"]');

// ラジオボタンには change イベント、テキスト/数値には input イベントを登録
allRadios.forEach(function(r) {
    r.addEventListener('change', checkFormCompletion);
});
allNumberOrText.forEach(function(nt) {
    nt.addEventListener('input', checkFormCompletion);
});

// フォームがすべて埋まっているかをチェックする関数
function checkFormCompletion() {
    var allFilled = true;

    // 1) ラジオグループごとに "どれか一つが選択されている" か確認
    for (var i = 0; i < radioGroups.length; i++) {
        var groupName = radioGroups[i];
        var radios = document.getElementsByName(groupName);
        var groupChecked = false;
        for (var j = 0; j < radios.length; j++) {
            if (radios[j].checked) {
                groupChecked = true;
                break;
            }
        }
        if (!groupChecked) {
            allFilled = false;
            break;
        }
    }

    // 2) number, text の入力チェック
    allNumberOrText.forEach(function(el) {
        if (!el.value) {
            allFilled = false;
        }
    });

    // 条件を満たせば「作業を開始する」ボタンを表示
    if (allFilled) {
        startWorkButton.style.display = 'block';
    } else {
        startWorkButton.style.display = 'none';
    }
}

// 「作業を開始する」ボタンのクリックイベント
startWorkButton.addEventListener('click', function () {
    // sleepHours.valueなどをもとに動的に作業時間を計算
    workDuration = calculateTime(sleepHours.value);
    breakDuration = totalTime - workDuration;

    // フォームを隠す
    formContainer.style.display = 'none';
    //タイトル画面も非表示にする
    content.style.display = 'none';
    //画像も隠しちゃう
    imageContainer.style.display = 'none';


    // タイマー画面を表示
    timerContainer.style.display = 'block';
    settingsButton.style.display = 'block';

    // タイマー画面にスクロール
    timerContainer.scrollIntoView({ behavior: 'smooth' });

    // セット数初期化
    setCount = 0;
    currentSetElement.textContent = `現在 ${setCount} セット目`;

    // 作業タイマー開始
    startTimer(workDuration * 60, 'work');
});

// タイマー開始
function startTimer(duration, mode) {
    var timeRemaining = duration;
    var totalDuration = duration; // プログレスバーの計算用に保持

    // モード表示を更新
    if (mode === 'work') {
        timerModeElement.textContent = '作業中';
        timerModeElement.classList.remove('mode-break');
        timerModeElement.classList.add('mode-work');
    } else {
        timerModeElement.textContent = '休憩中';
        timerModeElement.classList.remove('mode-work');
        timerModeElement.classList.add('mode-break');
    }

    updateTimerDisplay(timeRemaining);
    updateProgressBar(timeRemaining, totalDuration);

    timerInterval = setInterval(function () {
        if (!isStop) {
            timeRemaining--;
            updateTimerDisplay(timeRemaining);
            updateProgressBar(timeRemaining, totalDuration);
        }

        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            if (mode === 'work') {
                // 作業終了 → 休憩タイマー開始
                startTimer(breakDuration * 60, 'break');
            } else {
                // 休憩終了 → 1セット完了
                setCount++;
                currentSetElement.textContent = `現在 ${setCount} セット目`;

                // 必要に応じて再度作業タイマーを呼ぶ or 終了する
                alert('1セット終了しました。');
            }
        }
    }, 1000);
}

// タイマーの表示を更新
function updateTimerDisplay(seconds) {
    var minutes = Math.floor(seconds / 60);
    var secs = seconds % 60;
    timerText.textContent = ('0' + minutes).slice(-2) + ':' + ('0' + secs).slice(-2);
}

// プログレスバーを更新
function updateProgressBar(timeRemaining, totalDuration) {
    var progress = timeRemaining / totalDuration;
    var circumference = 2 * Math.PI * 90; // 半径90の円の周
    var offset = circumference * (1 - progress);
    progressBar.style.strokeDasharray = circumference;
    progressBar.style.strokeDashoffset = offset;
}

// 一時停止ボタン
pauseButton.addEventListener('click', function () {
    isStop = 1;
    pauseButton.style.display = 'none';
    resumeButton.style.display = 'block';
});

// 再開ボタン
resumeButton.addEventListener('click', function () {
    isStop = 0;
    resumeButton.style.display = 'none';
    pauseButton.style.display = 'block';
});

// 設定ボタン
settingsButton.addEventListener('click', function () {
    settingsModal.style.display = 'block';
    modalOverlay.style.display = 'block';
});

// 設定モーダル保存ボタン
saveSettingsButton.addEventListener('click', function () {
    workDuration = parseInt(workDurationInput.value) || 10;
    breakDuration = parseInt(breakDurationInput.value) || 5;
    settingsModal.style.display = 'none';
    modalOverlay.style.display = 'none';
});

// モーダル外クリックで閉じる
modalOverlay.addEventListener('click', function () {
    settingsModal.style.display = 'none';
    modalOverlay.style.display = 'none';
});

// ===== 作業時間を計算するサンプル関数 =====
// 実際には sleepHours.value, mentalState.value, workTime.value などを
// 使って、より複雑に演算してください
function calculateTime(sleepTime) {
    var baseWorkTime = 25; // 作業時間(分)
    var sVal = parseFloat(sleepTime) || 5;
    // 例: 睡眠時間が短いほど作業時間を短くする → 単純な例
    if (sVal < 5) {
        baseWorkTime -= 5;
    }
    if (baseWorkTime < 10) {
        baseWorkTime = 10; // 最小10分
    }
    return baseWorkTime;
}
