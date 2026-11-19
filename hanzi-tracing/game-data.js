// ==========================================================
// game-data.js：所有頁面共用的資料和小工具
// 釣魚（index.html）、第一關、第二關、第三關都會載入這個檔案
// 想新增練習的字，只要改這個檔案的 WORDS 就好
// ==========================================================


// ---------- 1. 字表 ----------

const WORDS = [
  { character: '山', picture: '⛰️', zhuyin: 'ㄕㄢ' },
  { character: '口', picture: '👄', zhuyin: 'ㄎㄡˇ' },
  { character: '人', picture: '🧍', zhuyin: 'ㄖㄣˊ' },
  { character: '日', picture: '☀️', zhuyin: 'ㄖˋ' },
  { character: '大', picture: '<span style="font-size: 40%">🐭</span>🐘', zhuyin: 'ㄉㄚˋ' }
];
// character：字；picture：第一關的圖（emoji，可以寫 HTML）；zhuyin：注音


// ---------- 2. 魚的階段 ----------
// 每個字都有自己的階段，魚會隨著練習「長大」：
//   階段 0：小魚   → 釣到後去第一關（看圖選字）
//   階段 1：中魚   → 釣到後去第二關（描紅）
//   階段 2：大魚   → 釣到後去第三關（默寫）
//   階段 3：金色魚 → 已經學會，釣到後用第三關（默寫）複習

const STAGE_NAMES = ['小魚', '中魚', '大魚', '金色的魚'];
// 每個階段的名字

const LEVEL_NAMES = ['', '第一關：看圖選字', '第二關：描紅', '第三關：默寫'];
// 每一關的名字（第 0 個空著，這樣 LEVEL_NAMES[1] 就是第一關）

const STARS_TO_PASS = [0, 1, 2, 2];
// 每一關至少要幾顆星才能讓魚長大：第一關 1 顆（答對就好）、第二關 2 顆、第三關 2 顆

// ---------- 3. 存檔 ----------
// 同一台裝置可以有好幾個「檔案」，每個人的進度分開存：
//   玩家一（player1）、玩家二（player2）：會一直保存
//   訪客（guest）：每次選「訪客」都會重新開始
// 每個檔案存的樣子像這樣：
//   { player: 0, name: "小明", progress: { "山": { stage: 1, practiceCount: 3 } } }
//   player 是選的動物（0 貓、1 企鵝、2 水獺；-1 代表還沒選）；name 是小朋友輸入的名字
// 資料存在瀏覽器的 localStorage 裡（關掉網頁再打開也還在，但換一台裝置就沒有）

const SLOTS = ['player1', 'player2', 'guest'];
// 所有的檔案

const SLOT_NAMES = { player1: '玩家一', player2: '玩家二', guest: '訪客' };
// 每個檔案顯示的名字

const STORAGE_PREFIX = 'hanziFishing.';
// 存在瀏覽器裡的名字開頭，例如玩家一的檔案叫 hanziFishing.player1

const CURRENT_SLOT_KEY = 'hanziFishing.currentSlot';
// 記住「現在用的是哪一個檔案」

function readStorage(key) {
  // 從瀏覽器讀出一段文字（讀不到就回傳 null）
  try {
    // try：試試看，如果出錯（例如瀏覽器不允許儲存）就跳到 catch
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

function writeStorage(key, text) {
  // 把一段文字存進瀏覽器（text 是 null 的話就刪掉）
  try {
    if (text === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, text);
    }
  } catch (error) {
    // 存不了（例如無痕模式）就算了，遊戲還是可以玩
  }
}

function loadSlot(slot) {
  // 讀出某個檔案的資料
  const text = readStorage(STORAGE_PREFIX + slot);
  if (text === null) {
    return { player: -1, progress: {} };
    // 空的檔案
  }
  try {
    return JSON.parse(text);
    // 把文字變回物件
  } catch (error) {
    return { player: -1, progress: {} };
    // 資料壞掉了，當作空的檔案
  }
}

function saveSlot(slot, data) {
  // 把某個檔案的資料存起來
  writeStorage(STORAGE_PREFIX + slot, JSON.stringify(data));
  // 把物件變成文字再存
}

function clearSlot(slot) {
  // 清除某個檔案（變回空的）
  writeStorage(STORAGE_PREFIX + slot, null);
}

function getCurrentSlot() {
  // 現在用的是哪一個檔案（沒選過的話當作訪客）
  const slot = readStorage(CURRENT_SLOT_KEY);
  if (SLOTS.indexOf(slot) === -1) {
    return 'guest';
    // indexOf 找不到會回傳 -1：代表不是我們認識的檔案
  }
  return slot;
}

function setCurrentSlot(slot) {
  // 記住現在用哪一個檔案
  writeStorage(CURRENT_SLOT_KEY, slot);
}

function loadProgress() {
  // 讀出「目前檔案」所有字的進度
  return loadSlot(getCurrentSlot()).progress;
}

function saveProgress(progress) {
  // 把所有字的進度存進「目前檔案」
  const slot = getCurrentSlot();
  const data = loadSlot(slot);
  data.progress = progress;
  saveSlot(slot, data);
}

function countMastered(progress) {
  // 數一數學會了幾個字（金色的魚有幾條）
  let count = 0;
  for (let i = 0; i < WORDS.length; i++) {
    const record = progress[WORDS[i].character];
    if (record && record.stage === 3) {
      count = count + 1;
    }
  }
  return count;
}

function getStage(character) {
  // 查某個字現在是第幾階段（沒練過的字是 0，小魚）
  const progress = loadProgress();
  if (progress[character]) {
    return progress[character].stage;
  }
  return 0;
}

function levelForStage(stage) {
  // 這個階段的魚，釣到後要去第幾關
  if (stage >= 2) {
    return 3;
    // 大魚和金色的魚：第三關
  }
  return stage + 1;
  // 小魚（0）→ 第一關；中魚（1）→ 第二關
}

function recordResult(character, level, stars) {
  // 某個字在某一關拿到幾顆星，記錄下來，需要的話讓魚長大
  // 回傳 { oldStage: 原本的階段, newStage: 新的階段, level: 第幾關 }
  const progress = loadProgress();
  if (!progress[character]) {
    progress[character] = { stage: 0, practiceCount: 0 };
    // 第一次練這個字，先建立紀錄
  }
  const record = progress[character];
  const oldStage = record.stage;
  // 記下原本的階段
  record.practiceCount = record.practiceCount + 1;
  // 練習次數 +1（之後記錄本會用到）

  if (level === levelForStage(oldStage) && stars >= STARS_TO_PASS[level] && oldStage < 3) {
    // 條件：(1) 玩的是這條魚該玩的那一關 (2) 星星夠 (3) 還不是金色的魚
    record.stage = oldStage + 1;
    // 魚長大一級
  }
  // 沒過關的話，階段不變（不會降級）

  saveProgress(progress);
  // 存起來
  return { oldStage: oldStage, newStage: record.stage, level: level };
  // 也把是第幾關一起回傳，等一下做提示文字時要用
}

let grewThisVisit = false;
// 這一次進到關卡裡，魚是不是已經長大過了（同一關可以重寫好幾次）

function recordAndDescribe(character, level, stars) {
  // 記錄結果，並回傳一句給小朋友看的話（每一關按下「確定」或答對時呼叫）
  const result = recordResult(character, level, stars);
  if (result.newStage > result.oldStage) {
    grewThisVisit = true;
    // 記住：這次已經長大了
  } else if (grewThisVisit) {
    return '🎉「' + character + '」已經長\u{E01E1}大了，回去釣魚吧！';
    // 長大之後又重寫一次，還是告訴小朋友已經長大了
  }
  return growMessage(character, result);
}

function growMessage(character, result) {
  // 依照結果，做出一句給小朋友看的話
  if (result.newStage > result.oldStage) {
    return '🎉「' + character + '」長\u{E01E1}大了！<br>變成' + STAGE_NAMES[result.newStage];
    // <br> 讓「變成大魚」換到下一行，比較好讀
  }
  if (result.oldStage === 3) {
    return '✨ 複習完成！';
  }
  return '拿到 ' + STARS_TO_PASS[result.level] + ' 顆星以上，「' + character + '」就會長\u{E01E1}大喔！';
  // 還沒過關：告訴小朋友要幾顆星（可以當場再寫一次）
}


// ---------- 4. 其他小工具 ----------

function wordCharacters() {
  // 把字表裡所有的字排成一個清單，例如 ['山', '口', '人', '日', '大']
  const list = [];
  for (let i = 0; i < WORDS.length; i++) {
    list.push(WORDS[i].character);
  }
  return list;
}

function wordIndex(character) {
  // 某個字在字表裡是第幾個（找不到回傳 0）
  for (let i = 0; i < WORDS.length; i++) {
    if (WORDS[i].character === character) {
      return i;
    }
  }
  return 0;
}

function getWord(character) {
  // 從字表找出某個字的資料（找不到就回傳 null）
  for (let i = 0; i < WORDS.length; i++) {
    if (WORDS[i].character === character) {
      return WORDS[i];
    }
  }
  return null;
}

function getCharacterFromUrl() {
  // 從網址讀出要練習的字，例如 level1.html?char=山 → 回傳「山」
  // 網址沒有 ?char= 的話回傳 null（代表是直接打開這一關，用來測試）
  const params = new URLSearchParams(window.location.search);
  // 把網址問號後面的部分拆開
  return params.get('char');
}

function backToFishing() {
  // 回到釣魚畫面（?continue=1 代表「繼續玩」，不用再選檔案）
  window.location.href = 'index.html?continue=1';
}

function loadPlayer() {
  // 讀出目前檔案選的動物（0 貓、1 企鵝、2 水獺；還沒選回傳 -1）
  return loadSlot(getCurrentSlot()).player;
}

function savePlayer(index) {
  // 把選的動物存進目前檔案
  const slot = getCurrentSlot();
  const data = loadSlot(slot);
  data.player = index;
  saveSlot(slot, data);
}

function savePlayerName(name) {
  // 把名字存進目前檔案
  const slot = getCurrentSlot();
  const data = loadSlot(slot);
  data.name = name;
  saveSlot(slot, data);
}

function getPlayerName(slot) {
  // 某個檔案的名字（沒輸入過名字的話，用「玩家一」這種預設名字）
  const data = loadSlot(slot);
  if (data.name) {
    return data.name;
  }
  return SLOT_NAMES[slot];
}


// ---------- 5. 注音字型的破音字 ----------
// 注音字型會自動幫每個字加上注音，但有些字有好幾種讀音（破音字），字型不一定猜得對
// 在字的後面加上一個看不見的記號 \u{E01E1}，就是告訴字型「用這個字的第 2 種讀音」
// 這個遊戲裡用到的有：長\u{E01E1}大（ㄓㄤˇ）、重\u{E01E1}寫（ㄔㄨㄥˊ）、格子\u{E01E1}（˙ㄗ）、哎呀\u{E01E1}（˙ㄧㄚ）
// 在 HTML 裡要寫成 &#xE01E1;


// ---------- 6. 星星動畫 ----------

function starSVG(filled) {
  // 畫一顆星星的圖（filled 是 true：金色的星星；false：灰色的空框）
  let fill = 'none';
  // 空框：裡面不塗顏色
  let stroke = '#adb5bd';
  // 空框：灰色的邊
  if (filled) {
    fill = '#fcc419';
    // 亮起來：金黃色
    stroke = '#e67700';
    // 橘色的邊
  }
  return '<polygon points="12,2 15,9 22,9.5 16.5,14.5 18.5,21.5 12,17.5 5.5,21.5 7.5,14.5 2,9.5 9,9" fill="' + fill + '" stroke="' + stroke + '" stroke-width="1.8" stroke-linejoin="round"/>';
  // polygon 是用 10 個點連起來的多邊形（五角星有 5 個尖角 + 5 個凹進去的點）
}

function praiseFor(stars) {
  // 依照星星數給一句評語
  if (stars === 3) {
    return '太棒了！';
  }
  if (stars === 2) {
    return '很好喔！';
  }
  if (stars === 1) {
    return '不錯喔！';
  }
  return '再試一次！加油 💪';
}

function showStars(box, stars, detailHTML) {
  // 在 box 裡播放星星動畫：
  //   1. 三個空的星星框跳出來
  //   2. 拿到的星星一顆一顆亮起來
  //   3. 評語和說明（detailHTML）慢慢出現
  box.innerHTML = '';
  // 先清空
  const row = document.createElement('div');
  row.className = 'star-row';
  // 星星和評語在同一排
  const starIcons = [];
  for (let i = 0; i < 3; i++) {
    const star = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    // SVG 圖要用 createElementNS 建立（NS 是「命名空間」，告訴瀏覽器這是 SVG）
    star.setAttribute('viewBox', '0 0 24 24');
    star.setAttribute('class', 'star');
    star.style.animationDelay = (i * 0.12) + 's';
    // 三個框依序跳出來，每個晚 0.12 秒
    star.innerHTML = starSVG(false);
    // 先畫空框
    row.appendChild(star);
    starIcons.push(star);
  }
  const praise = document.createElement('span');
  // 評語（先空著）
  row.appendChild(praise);
  box.appendChild(row);
  const detail = document.createElement('div');
  // 說明（先空著）
  box.appendChild(detail);

  for (let i = 0; i < stars; i++) {
    setTimeout(function () {
      starIcons[i].innerHTML = starSVG(true);
      starIcons[i].setAttribute('class', 'star filled');
      // 第 i 顆星星亮起來，並播放「彈一下」的動畫
    }, 600 + i * 450);
    // 0.6 秒後亮第 1 顆，之後每 0.45 秒亮下一顆
  }

  setTimeout(function () {
    praise.textContent = praiseFor(stars);
    praise.className = 'fade-in';
    // 星星都亮完後，評語出現
    detail.innerHTML = detailHTML;
    detail.className = 'star-detail fade-in';
    // 說明也一起出現
  }, 700 + stars * 450);
}
