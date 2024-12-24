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

// 「設定」関連は削除済み

// 質問フォーム入力
var sleepHours = document.getElementById('sleep_hours');  // 数値入力 (例: 3〜10)
const mentalState = document.querySelector('input[name="answer1"]:checked');


var bedtime = document.getElementById('bedtime');         // 質問 3, number: 0〜23
var answer2 = document.getElementById('answer2');         // 質問 5, number: 0〜23
var reason   = document.getElementById('reason');         // 質問 7j (text) → 必須チェックから除外

// 一時停止／再開ボタン
var pauseButton = document.getElementById('pause-button');
var resumeButton = document.getElementById('resume-button');

// 作業中か休憩中かを表示
var timerModeElement = document.getElementById('timer-mode');

// 現在何セット目か
var currentSetElement = document.getElementById('current-set');

// タイマー設定 (作業+休憩の合計を30分と仮定)
var totalTime = 30;
var workDuration = 0;
var breakDuration = 0;

// 一時停止フラグ
var isStop = 0;
var setCount = 0;     // 何セット完了したか
var timerInterval;    // タイマー用

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
// 質問 7j のテキスト (reason) は必須にしない。代わりに回答頻度 (answer13) は必須。
//
// すべてのラジオグループ名 (必須) をまとめる
// mental_state, work_time, answer1, answer3, answer4〜answer17 など
//
// ※ answer2, bedtime, sleep_hours などは数字入力なので別枠でチェック
//    7jテキスト(reason)は必須ではないため除外
var radioGroups = [
  'mental_state',
  'work_time',
  'answer1',
  'answer3',
  'answer4',
  'answer5',
  'answer6',
  'answer7',
  'answer8',
  'answer9',
  'answer10',
  'answer11',
  'answer12',
  'answer13',
  'answer14',
  'answer15',
  'answer16',
  'answer17'
];

// ラジオボタン全取得
var allRadios = document.querySelectorAll('#form-container input[type="radio"]');
// 数値入力 => sleep_hours(2か所?), bedtime, answer2, etc.
//   → ただし HTML で sleep_hours が2か所重複しないよう注意してください
//   → 今回は ID がかぶるといけないので "sleep_hours" が1つだけ使われる想定にする
var allNumbers = document.querySelectorAll('#form-container input[type="number"]');

// イベントリスナー登録
allRadios.forEach(function(radio) {
    radio.addEventListener('change', checkFormCompletion);
});
allNumbers.forEach(function(numInput) {
    numInput.addEventListener('input', checkFormCompletion);
});

// フォームがすべて埋まっているかをチェックする関数
function checkFormCompletion() {
    var allFilled = true;

    // 1) ラジオボタングループ (必須) がすべて選択されているか
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

    // 2) 数値入力 (必須) が入力されているか
    //    例えば sleep_hours, bedtime, answer2 など
    allNumbers.forEach(function(num) {
        if (!num.value || num.value === '') {
            allFilled = false;
        }
    });

    // 質問7j のテキスト (id="reason") は必須にしないのでチェックしない

    // 条件を満たせば「作業を開始する」ボタンを表示
    if (allFilled) {
        startWorkButton.style.display = 'block';
    } else {
        startWorkButton.style.display = 'none';
    }
}

// 「作業を開始する」ボタンのクリックイベント
startWorkButton.addEventListener('click', function () {
    // sleepHours.value などをもとに動的に作業時間を計算
    // 例として、メンタルと作業時間帯を考慮した既存ロジックを呼び出すことを想定
    // (ここでは簡単に sleepHours だけ使用する)
    workDuration = calculateTime(sleepHours.value, mentalState.value);
    breakDuration = totalTime - workDuration;

    // 質問フォームを隠す
    formContainer.style.display = 'none';
    // タイトルや画像を非表示
    content.style.display = 'none';
    imageContainer.style.display = 'none';

    // タイマー画面を表示
    timerContainer.style.display = 'block';

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
    var totalDuration = duration;

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
    var circumference = 2 * Math.PI * 90;
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

// ===== 作業時間を計算するサンプル関数 =====

// 実際には sleepHours.value, mentalState.value, workTime.value などを
// 使って、より複雑に演算してください
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

    //sleepTime
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
    if (mentalState == 5) {
        mentalStateRate = 0.2;
    } else if (mentalState == 4) {
        mentalStateRate = 0.1;
    } else if (mentalState == 3) {
        mentalStateRate = 0;
    } else if (mentalState == 2) {
        mentalStateRate = -0.1;
    } else if (mentalState == 1) {
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

    //psqiScore
    const psqiScore = calculateScoreExample(); 
    if (psqiScore < 6) {
        psqiRate = 0;
    } else {
        psqiRate = 0.1;
    }
    console.log('psqiScore', psqiScore);
    console.log('psqiRate', psqiRate);
    concentrationTime -= concentrationBaseTime * psqiRate;

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
}

function calculateTimeInBed(bedtime, wakeupTime) {
    // 床内時間を計算
    if (bedtime <= wakeupTime) {
        // 同じ日内
        return wakeupTime - bedtime;
    } else {
        // 日付をまたぐ
        return (24 - bedtime) + wakeupTime;
    }
}


// ピッツバーグ睡眠質問票の点数を取得し合計を計算する関数
function calculateScoreExample() {
    let score = 0;
    let score1 = 0;
    let score2 = 0;
    let score3 = 0;
    let score4 = 0;
    let score5 = 0;
    let score6 = 0;
    let score7 = 0;


    // 質問の選択肢を取得
    const answer1 = document.querySelector('input[name="answer1"]:checked');
    const answer3 = document.querySelector('input[name="answer3"]:checked');
    const answer4 = document.querySelector('input[name="answer4"]:checked');
    const answer5 = document.querySelector('input[name="answer5"]:checked');
    const answer6 = document.querySelector('input[name="answer6"]:checked');
    const answer7 = document.querySelector('input[name="answer7"]:checked');
    const answer8 = document.querySelector('input[name="answer8"]:checked');
    const answer9 = document.querySelector('input[name="answer9"]:checked');
    const answer10 = document.querySelector('input[name="answer10"]:checked');
    const answer11 = document.querySelector('input[name="answer11"]:checked');
    const answer12 = document.querySelector('input[name="answer12"]:checked');
    const answer13 = document.querySelector('input[name="answer13"]:checked');
    const answer14 = document.querySelector('input[name="answer14"]:checked');
    const answer15 = document.querySelector('input[name="answer15"]:checked');
    const answer16 = document.querySelector('input[name="answer16"]:checked');
    const answer17 = document.querySelector('input[name="answer17"]:checked');

    const answer2 = parseFloat(document.getElementById('answer2').value) || 0; // 入力されていない場合は0
    const sleep_hours = parseFloat(document.getElementById('sleep_hours').value) || 0; // 入力されていない場合は0
    const bedtime = parseFloat(document.getElementById('bedtime').value) || 0; // 入力されていない場合は0

    // スコアを加算（選択されていない場合は0をデフォルトとする）

    //c1
    score1 += answer14 ? parseInt(answer14.value) : 0;

    //c2
    score2 += answer1 ? parseInt(answer1.value) : 0;
    score2 += answer4 ? parseInt(answer4.value) : 0;

    switch (true) {
        case score2 === 0:
            score2 = 0;
            break;
        case score2 >= 1 && score2 <= 2:
            score2 = 1;
            break;
        case score2 >= 3 && score2 <= 4:
            score2 = 2;
            break;
        case score2 >= 5 && score2 <= 6:
            score2 = 3;
            break;
        default:
            // 他の範囲に該当する場合の処理が必要ならここに書く
            break;
    }

    //c3
    score3 += answer3 ? parseInt(answer3.value) : 0;

    //c4
    const timeInBed = calculateTimeInBed(bedtime, answer2);
    const sleepPercentage = (sleep_hours / timeInBed) * 100;

    switch (true) {
        case sleepPercentage >= 85:
            score4 = 0; // 85%以上なら0点
            break;
        case sleepPercentage >= 75 && sleepPercentage < 85:
            score4 = 1; // 75%以上85%未満なら1点
            break;
        case sleepPercentage >= 65 && sleepPercentage < 75:
            score4 = 2; // 65%以上75%未満なら2点
            break;
        case sleepPercentage < 65:
            score4 = 3; // 65%未満なら3点
            break;
        default:
            // 範囲外のケースが発生した場合（念のため）
            score4 = -1; // 不正な値の場合のエラー処理（オプション）
            break;
    }

    //c5
    score5 += answer5 ? parseInt(answer5.value) : 0;
    score5 += answer6 ? parseInt(answer6.value) : 0;
    score5 += answer7 ? parseInt(answer7.value) : 0;
    score5 += answer8 ? parseInt(answer8.value) : 0;
    score5 += answer9 ? parseInt(answer9.value) : 0;
    score5 += answer10 ? parseInt(answer10.value) : 0;
    score5 += answer11 ? parseInt(answer11.value) : 0;
    score5 += answer12 ? parseInt(answer12.value) : 0;
    score5 += answer13 ? parseInt(answer13.value) : 0;

    switch (true) {
        case (score5 === 0):
            score5 = 0;
            break;
        case (score5 >= 1 && score5 <= 9):
            score5 = 1;
            break;
        case (score5 >= 10 && score5 <= 18):
            score5 = 2;
            break;
        case (score5 >= 19 && score5 <= 27):
            score5 = 3;
            break;
    }

    //c6
    score6 += answer15 ? parseInt(answer15.value) : 0;

    //c7
    score7 += answer16 ? parseInt(answer16.value) : 0;
    score7 += answer17 ? parseInt(answer17.value) : 0;

    switch (true) {
        case (score7 === 0):
            score7 = 0;
            break;
        case (score7 >= 1 && score7 <= 2):
            score7 = 1;
            break;
        case (score7 >= 3 && score7 <= 4):
            score7 = 2;
            break;
        case (score7 >= 5 && score7 <= 6):
            score7 = 3;
            break;
        default:
            // その他の値が来た場合は特に処理しない
            break;
    }

    score = score1 + score2 + score3 + score4 + score5 + score6 + score7;

    return score;
}
