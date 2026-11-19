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

const SAVE_KEY = 'hanziFishing.progress';
// 進度存在瀏覽器裡的名字

const PLAYER_KEY = 'hanziFishing.player';
// 選的角色存在瀏覽器裡的名字


// ---------- 3. 讀取、儲存進度 ----------
// 進度存在瀏覽器的 localStorage 裡（關掉網頁再打開也還在，但換一台手機就沒有）
// 存的樣子像這樣：{ "山": { stage: 1, practiceCount: 3 }, "口": { stage: 0, practiceCount: 1 } }

function loadProgress() {
  // 讀出所有字的進度
  try {
    // try：試試看，如果出錯（例如瀏覽器不允許儲存）就跳到 catch
    const text = localStorage.getItem(SAVE_KEY);
    // 從瀏覽器拿出存的文字
    if (text === null) {
      return {};
      // 從來沒存過：回傳空的進度
    }
    return JSON.parse(text);
    // 把文字變回物件
  } catch (error) {
    return {};
    // 出錯了：當作沒有進度
  }
}

function saveProgress(progress) {
  // 把所有字的進度存起來
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(progress));
    // 把物件變成文字再存
  } catch (error) {
    // 存不了（例如無痕模式）就算了，遊戲還是可以玩
  }
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
    return '🎉「' + character + '」已經長大了，回去釣魚吧！';
    // 長大之後又重寫一次，還是告訴小朋友已經長大了
  }
  return growMessage(character, result);
}

function growMessage(character, result) {
  // 依照結果，做出一句給小朋友看的話
  if (result.newStage > result.oldStage) {
    return '🎉「' + character + '」長大了！變成' + STAGE_NAMES[result.newStage];
  }
  if (result.oldStage === 3) {
    return '✨ 複習完成！';
  }
  return '拿到 ' + STARS_TO_PASS[result.level] + ' 顆星以上，「' + character + '」就會長大喔！';
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
  // 回到釣魚畫面
  window.location.href = 'index.html';
}

function loadPlayer() {
  // 讀出上次選的角色（0 貓、1 企鵝、2 水獺；沒選過回傳 -1）
  try {
    const text = localStorage.getItem(PLAYER_KEY);
    if (text === null) {
      return -1;
    }
    return Number(text);
    // 把文字變成數字
  } catch (error) {
    return -1;
  }
}

function savePlayer(index) {
  // 記住選的角色
  try {
    localStorage.setItem(PLAYER_KEY, String(index));
  } catch (error) {
    // 存不了就算了
  }
}
