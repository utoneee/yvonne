// ==========================================================
// scene-background.js：在關卡頁面的最底層，畫出跟釣魚畫面一樣的點陣風景
// （天空、太陽、雲、山、樹、草地、湖水）
// 畫法和顏色都跟 index.html 的 drawBackground 一樣，只是不會動（關卡頁面不需要動畫）
// 使用方法：在網頁 </body> 前面加上 <script src="scene-background.js"></script>
// ==========================================================


const SCENE_GAME_WIDTH = 72;
// 手機直放時，橫的方向有幾「格」（跟釣魚畫面一樣）

const SCENE_MIN_HEIGHT = 120;
// 直的方向至少要有幾格（跟釣魚畫面一樣）

const SCENE_TREE = [
  '..T..',
  '.TTT.',
  '.TTT.',
  'TTTTT',
  '.TTT.',
  'TTTTT',
  'TTTTT',
  '..W..'
];
// 松樹的點陣圖（T 葉子、W 樹幹）

const SCENE_TREE_COLORS = { T: '#2b8a3e', W: '#7f5539' };
// 松樹的顏色

const sceneCanvas = document.createElement('canvas');
// 做一張新的畫布
sceneCanvas.id = 'sceneBackground';
// 取名字，CSS（game-style.css）會把它固定在最底層、佔滿整個螢幕
document.body.insertBefore(sceneCanvas, document.body.firstChild);
// 放到網頁最前面（畫面最底層）
const sceneContext = sceneCanvas.getContext('2d');
// 畫筆


function drawScene() {
  // 依照現在的螢幕大小，畫一次風景
  const ratio = window.devicePixelRatio || 1;
  // 螢幕的像素倍數
  const width = window.innerWidth;
  const height = window.innerHeight;
  sceneCanvas.style.width = width + 'px';
  sceneCanvas.style.height = height + 'px';
  sceneCanvas.width = Math.round(width * ratio);
  sceneCanvas.height = Math.round(height * ratio);
  sceneContext.setTransform(ratio, 0, 0, ratio, 0, 0);
  // 之後都用「看起來的像素」來畫

  const unit = Math.min(width / SCENE_GAME_WIDTH, height / SCENE_MIN_HEIGHT);
  // 一格有多大（跟釣魚畫面同一個算法）
  const gameWidth = width / unit;
  // 螢幕寬有幾格
  const gameHeight = height / unit;
  // 螢幕高有幾格
  const waterTop = Math.round(gameHeight * 0.38);
  // 水面在 38% 的高度

  function rect(x, y, w, h, color) {
    // 用「格」為單位畫一個方塊（跟釣魚畫面的 rect 一樣）
    const left = Math.round(x * unit);
    const top = Math.round(y * unit);
    const right = Math.round((x + w) * unit);
    const bottom = Math.round((y + h) * unit);
    sceneContext.fillStyle = color;
    sceneContext.fillRect(left, top, right - left, bottom - top);
  }

  // 天空：上深下淺的三條藍色帶
  rect(0, 0, gameWidth, waterTop, '#4dabf7');
  rect(0, waterTop * 0.25, gameWidth, waterTop, '#74c0fc');
  rect(0, waterTop * 0.45, gameWidth, waterTop, '#a5d8ff');

  // 太陽：用方塊拼成的圓
  for (let dy = -4; dy <= 4; dy++) {
    for (let dx = -4; dx <= 4; dx++) {
      if (dx * dx + dy * dy <= 17) {
        rect(gameWidth - 12 + dx, 6 + dy, 1, 1, '#ffe066');
      }
    }
  }

  // 雲：固定在幾個位置（用畫面寬的幾成，畫面大小不同也會排好）
  const clouds = [[0.08, 0.10], [0.42, 0.04], [0.70, 0.16]];
  // 每朵雲的 [左右位置, 上下位置]（都是「幾成」）
  for (let i = 0; i < clouds.length; i++) {
    const x = Math.round(gameWidth * clouds[i][0]);
    const y = Math.round(waterTop * clouds[i][1]) + 2;
    rect(x + 2, y, 8, 2, '#ffffff');
    rect(x, y + 2, 13, 2, '#ffffff');
    // 兩個白色長方塊疊在一起，就是一朵點陣雲
  }

  // 山：一格一格算出每一直排的山有多高
  const mountainBase = Math.round(waterTop * 0.68);
  const peaks = [[gameWidth * 0.13, 12], [gameWidth * 0.45, 16], [gameWidth * 0.8, 13]];
  // 三座山的 [位置, 高度]
  for (let x = 0; x < gameWidth; x++) {
    let mountain = 0;
    for (let p = 0; p < peaks.length; p++) {
      const h = peaks[p][1] - Math.abs(x - peaks[p][0]) * 0.8;
      // 離山頂越遠越矮
      if (h > mountain) {
        mountain = h;
      }
    }
    mountain = Math.round(mountain);
    if (mountain > 0) {
      rect(x, mountainBase - mountain, 1, mountain, '#4c6ef5');
      // 山的本體
      rect(x, mountainBase - mountain, 1, Math.min(3, mountain), '#dbe4ff');
      // 山頂的白雪
    }
  }

  // 遠方的草地和樹
  rect(0, mountainBase, gameWidth, waterTop - mountainBase, '#82c91e');
  for (let x = -2, i = 0; x < gameWidth; x = x + 6, i++) {
    // 每隔 6 格種一棵樹（i 用來讓樹的高低有一點變化）
    const treeY = Math.round(waterTop * 0.62) - (i % 2);
    // 單數棵比雙數棵高 1 格，看起來比較自然
    drawTree(Math.round(x), treeY);
  }
  rect(0, waterTop * 0.78, gameWidth, waterTop * 0.22, '#94d82d');
  // 近處比較亮的草地
  for (let i = 0; i < 12; i++) {
    const fx = Math.round((i * 37) % gameWidth);
    const fy = Math.round(waterTop * 0.8 + (i * 13) % Math.max(1, waterTop * 0.16));
    rect(fx, fy, 1, 1, i % 2 === 0 ? '#ffffff' : '#ffe066');
    // 小花：用固定的算式決定位置（不用隨機，每次畫都一樣）
  }
  rect(0, waterTop - 2, gameWidth, 2, '#5c940d');
  // 岸邊深綠色的邊

  // 水：上淺下深的藍色帶
  rect(0, waterTop, gameWidth, gameHeight - waterTop, '#339af0');
  rect(0, waterTop + (gameHeight - waterTop) * 0.35, gameWidth, gameHeight, '#228be6');
  rect(0, waterTop + (gameHeight - waterTop) * 0.7, gameWidth, gameHeight, '#1c7ed6');
  for (let i = 0; i < 14; i++) {
    const rx = Math.round((i * 23) % gameWidth);
    const ry = Math.round(waterTop + 2 + (i * 17) % Math.max(1, gameHeight - waterTop - 4));
    rect(rx, ry, 3 + (i % 5), 1, 'rgba(255, 255, 255, 0.25)');
    // 淡淡的白色水波紋
  }

  function drawTree(x, y) {
    // 畫一棵點陣松樹
    for (let row = 0; row < SCENE_TREE.length; row++) {
      for (let col = 0; col < SCENE_TREE[row].length; col++) {
        const letter = SCENE_TREE[row][col];
        if (letter !== '.') {
          rect(x + col, y + row, 1, 1, SCENE_TREE_COLORS[letter]);
        }
      }
    }
  }
}


drawScene();
// 網頁打開時畫一次
window.addEventListener('resize', drawScene);
// 螢幕大小改變時（例如平板轉向）重畫
