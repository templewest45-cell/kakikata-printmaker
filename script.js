// Default values based on the object extracted in data.js
const hiraganaGroups = [
    ["あ", "い", "う", "え", "お"],
    ["か", "き", "く", "け", "こ"],
    ["さ", "し", "す", "せ", "そ"],
    ["た", "ち", "つ", "て", "と"],
    ["な", "に", "ぬ", "ね", "の"],
    ["は", "ひ", "ふ", "へ", "ほ"],
    ["ま", "み", "む", "め", "も"],
    ["や", "ゆ", "よ"],
    ["ら", "り", "る", "れ", "ろ"],
    ["わ", "を", "ん"]
];

const katakanaGroups = [
    ["ア", "イ", "ウ", "エ", "オ"],
    ["カ", "キ", "ク", "ケ", "コ"],
    ["サ", "シ", "ス", "セ", "ソ"],
    ["タ", "チ", "ツ", "テ", "ト"],
    ["ナ", "ニ", "ヌ", "ネ", "ノ"],
    ["ハ", "ヒ", "フ", "ヘ", "ホ"],
    ["マ", "ミ", "ム", "メ", "モ"],
    ["ヤ", "ユ", "ヨ"],
    ["ラ", "リ", "ル", "レ", "ロ"],
    ["ワ", "ヲ", "ン"]
];

// Helper to get current mode
function getCurrentMode() {
    return document.getElementById('char-mode').value;
}
function getCurrentGroups() {
    return getCurrentMode() === 'katakana' ? katakanaGroups : hiraganaGroups;
}
function getCurrentData() {
    return getCurrentMode() === 'katakana' ? KATAKANA_DATA : HIRAGANA_DATA;
}

// Helper to find which group a char belongs to
function getGroupForChar(char) {
    for (let group of getCurrentGroups()) {
        if (group.includes(char)) return group;
    }
    return [];
}

// Elements
const targetCharSelect = document.getElementById('target-char-select');
const practiceColsInput = document.getElementById('practice-cols');
const printBtn = document.getElementById('print-btn');

const charGroupDisplay = document.getElementById('char-group-display');
const bigCharDisplay = document.getElementById('big-char');
const practiceGridsContainer = document.getElementById('practice-grids-container');

// Word/Img Controls
const word1Select = document.getElementById('word1-select');
const word2Select = document.getElementById('word2-select');
const image1Upload = document.getElementById('image1-upload');
const image2Upload = document.getElementById('image2-upload');
const word1Img = document.getElementById('word1-img');
const word2Img = document.getElementById('word2-img');

const word1Initial = document.getElementById('word1-initial');
const word1Rest = document.getElementById('word1-rest');
const word2Initial = document.getElementById('word2-initial');
const word2Rest = document.getElementById('word2-rest');

const practiceDirectionSelect = document.getElementById('practice-direction');
const word1Custom = document.getElementById('word1-custom');
const word2Custom = document.getElementById('word2-custom');

// Pre-fill select options dynamically
function populateTargetChars() {
    targetCharSelect.innerHTML = '';
    let data = getCurrentData();
    for (let char in data) {
        let option = document.createElement('option');
        option.value = char;
        option.textContent = char;
        targetCharSelect.appendChild(option);
    }
    // Update label
    let label = document.getElementById('target-char-label');
    label.textContent = getCurrentMode() === 'katakana' ? '対象のカタカナ:' : '対象のひらがな:';
    // Update sidebar title
    let titleEl = document.getElementById('title-vertical');
    titleEl.textContent = getCurrentMode() === 'katakana' ? 'カタカナをれんしゅうしましょう。' : 'ひらがなをれんしゅうしましょう。';
}
populateTargetChars();

// Ensure the local references point to the right directory
// HIRAGANA_DATA uses "assets/anpan.png". We need to rewrite paths, but actually, the assets might be back in playground.
// Let's create an absolute proxy or assume we'll copy the assets over, or just keep the path if we launch a server in the parent dir.
// Since the prompt mentioned referring to C:\Users\templ\.gemini\antigravity\playground\giant-kepler\hiragana-learning-app, 
// we will resolve the path to Absolute File URL.
const BASE_ASSET_PATH = 'file:///' + 'C:/Users/templ/.gemini/antigravity/playground/giant-kepler/hiragana-learning-app/'.replace(/\\/g, '/');

// Initialize view
function updateWorksheet() {
    let target = targetCharSelect.value;
    let cols = parseInt(practiceColsInput.value) || 3;
    if (cols > 5) cols = 5;
    if (cols < 1) cols = 1;

    // 1. Update big char
    bigCharDisplay.textContent = target;

    // 2. Update char group
    let group = getGroupForChar(target);
    charGroupDisplay.innerHTML = '';
    group.forEach(c => {
        let span = document.createElement('span');
        span.textContent = c;
        if (c === target) span.className = 'highlighted';
        charGroupDisplay.appendChild(span);
    });

    // 3. Update practice grids
    practiceGridsContainer.innerHTML = '';
    // Let's create `cols` columns. Column goes Right to Left in vertical display usually, but `row-reverse` css handles visual order.
    // Box structure: 1st column: trace (trace-1, trace-2, trace-3, then empty if more rows). 
    // Wait, let's keep 4 rows per column.
    const ROWS_PER_COL = 4;
    for (let c = 0; c < cols; c++) {
        let colDiv = document.createElement('div');
        colDiv.className = 'practice-col';
        
        for (let r = 0; r < ROWS_PER_COL; r++) {
            let box = document.createElement('div');
            box.className = 'practice-grid-box';
            let bg = document.createElement('div'); bg.className = 'practice-grid-box-bg';
            box.appendChild(bg);
            
            let charSpan = document.createElement('span');
            charSpan.className = 'practice-char vertical-text';
            charSpan.textContent = target;

            let showSample = document.getElementById('show-sample').checked;
            let showTrace = document.getElementById('show-trace').checked;
            const tracesList = ['trace-1', 'trace-2', 'trace-3'];

            if (c === 0 && showSample) {
                // Entire first column is grey sample
                charSpan.classList.add('trace-sample');
            } else if (showTrace) {
                // Trace columns start from c=1 if sample is on, c=0 if sample is off
                let traceColIdx = showSample ? c - 1 : c;
                charSpan.classList.add(tracesList[traceColIdx % tracesList.length]);
            } else {
                charSpan.classList.add('trace-empty');
            }

            box.appendChild(charSpan);
            colDiv.appendChild(box);
        }
        practiceGridsContainer.appendChild(colDiv);
    }
}

function populateWords() {
    let target = targetCharSelect.value;
    let data = getCurrentData();
    let options = data[target];
    
    // Clear selects
    word1Select.innerHTML = '';
    word2Select.innerHTML = '';

    if (options && options.length > 0) {
        options.forEach(opt => {
            let op1 = document.createElement('option');
            op1.value = opt.word;
            op1.textContent = opt.word;
            word1Select.appendChild(op1);

            let op2 = document.createElement('option');
            op2.value = opt.word;
            op2.textContent = opt.word;
            word2Select.appendChild(op2);
        });
        
        // Add custom option
        let customOp1 = document.createElement('option');
        customOp1.value = 'custom';
        customOp1.textContent = '自分で入力...';
        word1Select.appendChild(customOp1);

        let customOp2 = document.createElement('option');
        customOp2.value = 'custom';
        customOp2.textContent = '自分で入力...';
        word2Select.appendChild(customOp2);
        
        // Pick first two distinct or duplicate if only 1
        let idx1 = 0;
        let idx2 = options.length > 1 ? 1 : 0;
        
        word1Select.selectedIndex = idx1;
        word2Select.selectedIndex = idx2;

        updateWordDisplay(options[idx1], 1);
        updateWordDisplay(options[idx2], 2);
    } else {
        updateWordDisplay(null, 1);
        updateWordDisplay(null, 2);
    }
}

function updateWordDisplay(opt, index) {
    let word = "";
    let imgSrc = "";
    let imgElem = index === 1 ? word1Img : word2Img;
    let practiceArea = index === 1 ? document.getElementById('word1-practice') : document.getElementById('word2-practice');

    if (opt) {
        word = opt.word;
        imgSrc = opt.image; // Using local relative since assets are copied
    }
    
    imgElem.src = imgSrc;
    generateWordPractice(word, practiceArea);
}

function generateWordPractice(word, container) {
    container.innerHTML = '';
    if (!word) return;

    let showSample = document.getElementById('show-sample').checked;
    let showTrace = document.getElementById('show-trace').checked;
    let direction = practiceDirectionSelect.value;
    
    // Hardcode 3 rows/cols for word practicing
    const WORD_PRACTICE_COUNT = 3;
    let groupsToCreate = [];
    
    if (showSample) groupsToCreate.push('trace-sample');
    
    let traceIdx = 0;
    while (groupsToCreate.length < WORD_PRACTICE_COUNT) {
        if (showTrace) {
            groupsToCreate.push(traceIdx === 0 ? 'trace-1' : traceIdx === 1 ? 'trace-2' : 'trace-3');
            traceIdx++;
        } else {
            groupsToCreate.push('trace-empty');
        }
    }
    
    for (let styleClass of groupsToCreate) {
        let group = document.createElement('div');
        if (direction === 'vertical') {
            group.className = 'practice-col word-practice-col'; // gives vertical layout + borders
        } else {
            group.className = 'word-practice-row'; // gives horizontal layout
        }
        
        for (let char of word) {
            let box = document.createElement('div');
            box.className = 'practice-grid-box word-grid-box';
            let bg = document.createElement('div'); bg.className = 'practice-grid-box-bg';
            box.appendChild(bg);
            
            let span = document.createElement('span');
            let spanClass = 'practice-char ' + styleClass;
            if (direction === 'vertical') {
                spanClass += ' vertical-text';
            }
            span.className = spanClass;
            span.textContent = char;
            box.appendChild(span);
            group.appendChild(box);
        }
        container.appendChild(group);
    }
    
    // Switch the word item container flow direction based on writing type
    if (direction === 'horizontal') {
        container.style.flexDirection = 'column';
    } else {
        container.style.flexDirection = 'row-reverse';
    }
}

function handleWordChange(index) {
    let target = targetCharSelect.value;
    let data = getCurrentData();
    let options = data[target] || [];
    let selectElem = index === 1 ? word1Select : word2Select;
    let customInput = index === 1 ? word1Custom : word2Custom;
    let selectedWord = selectElem.value;
    
    if (selectedWord === 'custom') {
        customInput.style.display = 'block';
        // When switching to custom, we just keep the image as is or update practice area
        // with the input text
        let practiceArea = index === 1 ? document.getElementById('word1-practice') : document.getElementById('word2-practice');
        generateWordPractice(customInput.value, practiceArea);
    } else {
        customInput.style.display = 'none';
        let opt = options.find(o => o.word === selectedWord);
        updateWordDisplay(opt, index);
    }
}

function handleCustomInput(index) {
    let customInput = index === 1 ? word1Custom : word2Custom;
    let practiceArea = index === 1 ? document.getElementById('word1-practice') : document.getElementById('word2-practice');
    generateWordPractice(customInput.value, practiceArea);
}

// Events
targetCharSelect.addEventListener('change', () => {
    updateWorksheet();
    populateWords();
});

practiceColsInput.addEventListener('input', updateWorksheet);
document.getElementById('show-sample').addEventListener('change', () => {
    updateWorksheet();
    handleWordChange(1);
    handleWordChange(2);
});
document.getElementById('show-trace').addEventListener('change', () => {
    updateWorksheet();
    handleWordChange(1);
    handleWordChange(2);
});

practiceDirectionSelect.addEventListener('change', () => {
    handleWordChange(1);
    handleWordChange(2);
});

word1Select.addEventListener('change', () => handleWordChange(1));
word2Select.addEventListener('change', () => handleWordChange(2));

word1Custom.addEventListener('input', () => handleCustomInput(1));
word2Custom.addEventListener('input', () => handleCustomInput(2));

// Init
updateWorksheet();
populateWords();

// Mode change handler
document.getElementById('char-mode').addEventListener('change', () => {
    populateTargetChars();
    updateWorksheet();
    populateWords();
});

// Image Export (PNG) - html2canvasでずれのない画像を生成
function exportImage() {
    let element = document.getElementById('worksheet');
    let target = targetCharSelect.value;
    let mode = getCurrentMode() === 'katakana' ? 'カタカナ' : 'ひらがな';
    let filename = mode + '_' + target + '_れんしゅう.png';

    // ボタンを一時的に無効化
    let btn = document.getElementById('pdf-btn');
    let originalText = btn.textContent;
    btn.textContent = '⏳ 画像を作成中...';
    btn.disabled = true;

    html2canvas(element, {
        scale: 3,              // 高解像度（300dpi相当）
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.offsetWidth,
        height: element.offsetHeight,
        windowWidth: element.offsetWidth,
        windowHeight: element.offsetHeight
    }).then(canvas => {
        // PNGとしてダウンロード
        let link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        link.click();

        // ボタンを元に戻す
        btn.textContent = originalText;
        btn.disabled = false;
    }).catch(err => {
        console.error('画像エクスポートエラー:', err);
        alert('画像の作成に失敗しました。もう一度お試しください。');
        btn.textContent = originalText;
        btn.disabled = false;
    });
}

// ----------------------------------------------------
// Image Upload Handlers
// ----------------------------------------------------
function handleImageUpload(e, imgElem) {
    const file = e.target.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        imgElem.src = url;
    }
}
image1Upload.addEventListener('change', (e) => handleImageUpload(e, word1Img));
image2Upload.addEventListener('change', (e) => handleImageUpload(e, word2Img));

// ----------------------------------------------------
// Camera Functionality
// ----------------------------------------------------
const cameraOverlay = document.getElementById('camera-overlay');
const liveVideo = document.getElementById('live-video');
const captureBtn = document.getElementById('capture-btn');
const cancelCameraBtn = document.getElementById('cancel-camera-btn');
const cameraCanvas = document.getElementById('camera-canvas');

let stream = null;
let currentCameraTarget = 1; // 1 or 2

document.querySelectorAll('.camera-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
        currentCameraTarget = parseInt(e.target.dataset.target);
        cameraOverlay.style.display = 'flex';
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            liveVideo.srcObject = stream;
        } catch (err) {
            alert('カメラのアクセスに失敗しました: ' + err.message);
            cameraOverlay.style.display = 'none';
        }
    });
});

cancelCameraBtn.addEventListener('click', stopCamera);

captureBtn.addEventListener('click', () => {
    if (!stream) return;
    cameraCanvas.width = liveVideo.videoWidth;
    cameraCanvas.height = liveVideo.videoHeight;
    const ctx = cameraCanvas.getContext('2d');
    
    // Flip horizontally if facing user, but using 'environment' so maybe no need. 
    // We already mirrored #live-video in CSS, we might need to mirror canvas
    ctx.translate(cameraCanvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(liveVideo, 0, 0, cameraCanvas.width, cameraCanvas.height);
    
    const dataUrl = cameraCanvas.toDataURL('image/png');
    if (currentCameraTarget === 1) {
        word1Img.src = dataUrl;
    } else {
        word2Img.src = dataUrl;
    }
    stopCamera();
});

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    cameraOverlay.style.display = 'none';
}
