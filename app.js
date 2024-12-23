
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

var currentImageIndex = 0;
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

var sleepHours = document.getElementById('sleep_hours');
var mentalState = document.getElementById('mental_state');
var workTime = document.getElementById('work_time');

// デフォルトのタイマー設定
var workDuration = sleepHours; // 分
var breakDuration = 0; // 分

const totalTime = 30; //分

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
    slideshowImage.style.transform = 'translateX(28%) scale(0.8)'; // 移動量を調整

    // 画像の移動が完了したらコンテンツをフェードイン
    setTimeout(function () {
        content.classList.add('content-isActive');
    }, 1000);
}

// 「はじめる」ボタンのクリックイベント
startButton.addEventListener('click', function () {
    formContainer.style.display = 'block';
    formContainer.scrollIntoView({ behavior: 'smooth' });
});

// フォームの入力チェック
var inputs = formContainer.getElementsByTagName('input');
for (var i = 0; i < inputs.length; i++) {
    inputs[i].addEventListener('input', checkFormCompletion);
}

function checkFormCompletion() {
    var allFilled = true;
    for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].value === '') {
            allFilled = false;
            break;
        }
    }
    if (allFilled) {
        startWorkButton.style.display = 'block';
    } else {
        // startWorkButton.style.display = 'none';
        startWorkButton.style.display = 'block';
    }
}

// 「作業を開始する」ボタンのクリックイベント
startWorkButton.addEventListener('click', function () {


    console.log(sleepHours.value, mentalState.value, workTime.value);
    workDuration = calculateTime(sleepHours.value, mentalState.value, workTime.value);
    // workDuration = calculateTime(3, 1, "morning");
    console.log(workDuration);
    // タイマー設定（回答結果に基づくロジックをここに追加可能）
    breakDuration = totalTime - workDuration;

    // testCalculateTime();

    // フォームを隠す
    formContainer.style.display = 'none';

    // タイマー画面を表示
    timerContainer.style.display = 'block';
    settingsButton.style.display = 'block';

    // タイマー画面にスクロール
    timerContainer.scrollIntoView({ behavior: 'smooth' });



    // 作業タイマーを開始
    console.log(workDuration * 60);
    console.log(breakDuration * 60);
    startTimer(workDuration * 60, 'work');


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
            if (mode === 'work') {
                // 休憩タイマーを開始
                startTimer(breakDuration * 60, 'break');
            } else {
                // 終了または再度作業タイマーを開始
                alert('タイマーが終了しました。');
            }
        }
    }, 1000);
}

// タイマー表示を更新
function updateTimerDisplay(seconds) {
    var minutes = Math.floor(seconds / 60);
    var secs = seconds % 60;
    timerText.textContent = ('0' + minutes).slice(-2) + ':' + ('0' + secs).slice(-2);
}

// プログレスバーを更新
function updateProgressBar(timeRemaining, totalDuration) {
    var progress = timeRemaining / totalDuration;
    var circumference = 2 * Math.PI * 90; // 半径90の円の円周
    var offset = circumference * (1 - progress);
    progressBar.style.strokeDasharray = circumference;
    progressBar.style.strokeDashoffset = offset;
}

// 設定ボタンのクリックイベント
settingsButton.addEventListener('click', function () {
    settingsModal.style.display = 'block';
    modalOverlay.style.display = 'block';
});

// 設定保存ボタンのクリックイベント
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

// ページ読み込み時にスライドショーを開始
window.onload = function () {
    startSlideshow();
};

// 時間設定をする関数
function calculateTime(sleepTime, mental, time) {
    const sleepHours = sleepTime;
    const mentalState = mental;
    const workTime = time;
    const concentrationBaseTime = 25;

    let concentrationTime = concentrationBaseTime;
    let concentrationRate = 0;
    var mentalStateRate = 0;
    let workRate = 0.0;
    let totalRate = 0.0;


    // 3つの項目から作業時間を計算

    // console.log(sleepTime);
    // console.log(mentalState);
    // console.log(workTime);

    if(sleepHours > concentrationBaseTime){
        concentrationRate = -0.1;
    }else if(sleepHours > 5){
        concentrationRate = 0
    }else if(sleepHours > 3){
        concentrationRate = 0.03;
    }else{
        concentrationRate = 0.1;
    }
    console.log(concentrationRate);


    concentrationTime -= concentrationBaseTime * concentrationRate;

    // mentalState
    if (mentalState === 5) {
        mentalStateRate = 0.2;
    } else if (mentalState === 4) {
        mentalStateRate = 0.1;
    } else if (mentalState === 3) {
        mentalStateRate = 0;
    } else if (mentalState === 2) {
        mentalStateRate = -0.1;
    } else if (mentalState === 1) {
        mentalStateRate = -0.2;
    }
    
    
    
    console.log('mentalState', mentalState);
    console.log('mentalStateRate', mentalStateRate);
    concentrationTime -= -concentrationBaseTime * mentalStateRate;

    // workTime
    switch(workTime) {
        case 'morning':
            workRate =  0.15;
            break;
        case 'afternoon':
            workRate = 0.05;
            break;
        case 'night':
            workRate = 0;
            break;
    }
    console.log('workRate',workRate);
    concentrationTime -= concentrationBaseTime * workRate;


    return concentrationTime;

    // const resultElement = document.getElementById('result');
    // resultElement.textContent = `推奨作業時間: ${ (concentrationTime).toFixed(0)} 分、推奨休憩時間: ${breakTime.toFixed(0)} 分`;
}


function testCalculateTime() {
    const sleepTimeValues = [0, 3, 4, 6, 8, 10];
    const mentalStateValues = [1, 2, 3, 4, 5];
    const workTimeValues = ['morning', 'afternoon', 'night'];

    const results = [];

    for (const sleepTime of sleepTimeValues) {
        for (const mental of mentalStateValues) {
            for (const time of workTimeValues) {
                const concentrationTime = calculateTime(sleepTime, mental, time);
                results.push({
                    sleepTime,
                    mental,
                    time,
                    concentrationTime: concentrationTime.toFixed(2),
                });
            }
        }
    }

    console.table(results);
}

