const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', {alpha: false});
let canvasColorsArray = [];
let smallCanvasColorsArray = [];

let currentTool = '';
let frameRate = 12;
let currentCanvas;

let pixelSize = 1;
let currentFormat = 'png';

let firstColor = 'black';
let secondColor = 'white';
let draggableItems = document.getElementsByClassName('column');

let canvasSize = 32;
let gridElementWidth = 640 / canvasSize;
let smallGridWidth = 256 / canvasSize;

const canvases = document.getElementsByClassName('small-canvas');
const animation = document.getElementById('animation-canvas');
const actx = animation.getContext('2d');
let animationElementWidth = 512 / canvasSize;
let frame = 0;

function rgbToHex(r, g, b) {
  if (r > 255 || g > 255 || b > 255) { throw 'Invalid color component'; }
  return ((r << 16) | (g << 8) | b).toString(16);
}

function getCanvasColors() {
  canvasColorsArray = [];
  for (let i = 0; i < canvasSize; i++ ) {
    canvasColorsArray[i] = [];
    for (let j = 0; j < canvasSize; j++ ) {
      const p = ctx.getImageData(i * gridElementWidth, j * gridElementWidth, 1, 1).data;
      const hex = `#${(`000000${rgbToHex(p[0], p[1], p[2])}`).slice(-6)}`;
      canvasColorsArray[i][j] = hex;
    }
  }
}

function copyToCanvas(context, colorsArray, size) {
  for (let i = 0; i < canvasSize; i++ ) {
    for (let j = 0; j < canvasSize; j++ ) {
      context.fillStyle = colorsArray[i][j];
      context.fillRect(size * i, size * j, size, size);
    }
  }
}

function draw(context, size) {
  for (let i = 0; i < canvasSize; i++ ) {
    for (let j = 0; j < canvasSize; j++ ) {
      if (i % 2 === j % 2) {
        context.fillStyle = '#c9dce1';
        context.fillRect(size * i, size * j, size, size);
      } else {
        context.fillStyle = '#d2ebee';
        context.fillRect(size * i, size * j, size, size);
      }
    }
  }
}

function init() {
  draw(ctx, gridElementWidth);
  getCanvasColors();
  currentCanvas = document.getElementById('first-small');
  copyToCanvas(currentCanvas.getContext('2d'), canvasColorsArray, smallGridWidth);
}

function getMouseChords(c, evt) {
  const rect = c.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top,
  };
}

function copyPixel(x,y,size, pixelS) {
    const p = ctx.getImageData(x * gridElementWidth, y * gridElementWidth, 1, 1).data;
    const hex = `#${(`000000${rgbToHex(p[0], p[1], p[2])}`).slice(-6)}`;
    console.log(hex);
    const smally = currentCanvas.getContext('2d');
    smally.fillStyle = hex;
    smally.fillRect(size * x, size * y, size * pixelS, size * pixelS)
}

const canvasLabel = document.getElementById('canvas-label');

function canvasClick(e) {
  const pos = getMouseChords(canvas, e);
  const gridX = Math.floor(pos.x / gridElementWidth);
  const gridY = Math.floor(pos.y / gridElementWidth);
  canvasLabel.textContent = `X: ${gridX + 1} Y: ${gridY + 1}`;
  if (e.which) {
    if (currentTool === 'pixel') {
      switch (e.which) {
        case 1:
          ctx.fillStyle = firstColor;
          break;
        case 3:
          ctx.fillStyle = secondColor;
          break;
        default: break;
      }
      ctx.fillRect(gridX * gridElementWidth, gridY * gridElementWidth, gridElementWidth * pixelSize, gridElementWidth * pixelSize);
      copyPixel(gridX, gridY, smallGridWidth, pixelSize);
    }
    else if (currentTool === 'double-pixel') {
      switch (e.which) {
        case 1:
          ctx.fillStyle = firstColor;
          break;
        case 3:
          ctx.fillStyle = secondColor;
          break;
        default: break;
      }
      ctx.fillRect(gridX * gridElementWidth, gridY * gridElementWidth, gridElementWidth * pixelSize, gridElementWidth * pixelSize);
      ctx.fillRect((canvasSize - gridX) * gridElementWidth, gridY * gridElementWidth, gridElementWidth * pixelSize, gridElementWidth * pixelSize);
      copyPixel(gridX, gridY, smallGridWidth, pixelSize);
      copyPixel((canvasSize - gridX), gridY, smallGridWidth, pixelSize);
    }
    else if (currentTool === 'eraser') {
      switch (e.which) {
        case 1:
          ctx.fillStyle = firstColor;
          ctx.fillRect(gridX * gridElementWidth, gridY * gridElementWidth, gridElementWidth, gridElementWidth);
          if (gridX % 2 === gridY % 2) {
            ctx.fillStyle = '#c9dce1';
            ctx.fillRect(gridElementWidth * gridX, gridElementWidth * gridY, gridElementWidth, gridElementWidth);
          } else {
            ctx.fillStyle = '#d2ebee';
            ctx.fillRect(gridElementWidth * gridX, gridElementWidth * gridY, gridElementWidth, gridElementWidth);
          }
          break;
        default: break;
      }
      copyPixel(gridX, gridY, smallGridWidth, 1);
    }
    else if (currentTool === 'full-fill') {
      switch (e.which) {
        case 1:
          ctx.fillStyle = firstColor;
          break;
        case 3:
          ctx.fillStyle = secondColor;
          break;
        default: break;
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height); 
      getCanvasColors();
      copyToCanvas(currentCanvas.getContext('2d'), canvasColorsArray, smallGridWidth);
    }
  }
}

document.addEventListener('load', init());

canvas.addEventListener('click', canvasClick);
canvas.addEventListener('mousemove', canvasClick);

canvas.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});


function getSmallCanvasColors(clickedCanvas) {
  smallCanvasColorsArray = [];
  const context = clickedCanvas.getContext('2d');
  for (let i = 0; i < canvasSize; i++ ) {
    smallCanvasColorsArray[i] = [];
    for (let j = 0; j < canvasSize; j++ ) {
      const p = context.getImageData(i * smallGridWidth, j * smallGridWidth, 1, 1).data;
      const hex = `#${(`000000${rgbToHex(p[0], p[1], p[2])}`).slice(-6)}`;
      smallCanvasColorsArray[i][j] = hex;
    }
  }
}

const newFrameButton = document.getElementById('create-frame-button');

function smallCanvasClick(e) {
  const clickedElement = e.target.nodeName;
  if (clickedElement === 'CANVAS') {
    getSmallCanvasColors(e.target);
    currentCanvas = e.target;
    copyToCanvas(ctx, smallCanvasColorsArray, gridElementWidth);
  }
}

function CreateSmallCanvas() {
  const canvasList = document.getElementById('canvas-list');
  const li = document.createElement('li');
  li.classList.add('column');
  li.setAttribute('draggable', 'true');

  const createdCanvas = document.createElement('canvas');
  createdCanvas.classList.add('small-canvas');
  createdCanvas.setAttribute('width', 256);
  createdCanvas.setAttribute('height', 256);
  const copyCanvas = document.createElement('i');
  copyCanvas.classList.add('fas', 'fa-copy', 'copy');
  const deleteCanvas = document.createElement('i');
  deleteCanvas.classList.add('fas', 'fa-trash-alt', 'delete');
  li.appendChild(createdCanvas);
  li.appendChild(copyCanvas);
  li.append(deleteCanvas);
  canvasList.appendChild(li);
  document.body.appendChild(canvasList);
  canvasList.addEventListener('click', smallCanvasClick);

  const canvasCtx = canvases[canvases.length - 1].getContext('2d');
  draw(canvasCtx, smallGridWidth);
}

function updateRemoveButtons() {
  const removes = document.getElementsByClassName('delete');
  for (let i = 0; i < removes.length; i++ ) {
    removes[i].addEventListener('click', (e) => {
      e.target.parentNode.remove();
    });
  }
}

let dragSrcEl = null;

function swapCanvases(firstCanvas, secondCanvas) {
  const firtCtx = firstCanvas.getContext('2d');
  const secondCtx = secondCanvas.getContext('2d');

  for (let i = 0; i < canvasSize; i++ ) {
    for (let j = 0; j < canvasSize; j++ ) {
      const firstCanvasColor = firtCtx.getImageData(i * smallGridWidth, j * smallGridWidth, 1, 1).data;
      const firstHex = `#${(`000000${rgbToHex(firstCanvasColor[0], firstCanvasColor[1], firstCanvasColor[2])}`).slice(-6)}`;

      const secondCanvasColor = secondCtx.getImageData(i * smallGridWidth, j * smallGridWidth, 1, 1).data;
      const secondHex = `#${(`000000${rgbToHex(secondCanvasColor[0], secondCanvasColor[1], secondCanvasColor[2])}`).slice(-6)}`;

      firtCtx.fillStyle = secondHex;
      firtCtx.fillRect(smallGridWidth * i, smallGridWidth * j, smallGridWidth, smallGridWidth);

      secondCtx.fillStyle = firstHex;
      secondCtx.fillRect(smallGridWidth * i, smallGridWidth * j, smallGridWidth, smallGridWidth);
    }
  }
}

function handleDragStart() {
  dragSrcEl = this;
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }

  e.dataTransfer.dropEffect = 'move';

  return false;
}

function handleDragEnter() {
  this.classList.add('over');
}

function handleDragLeave() {
  this.classList.remove('over');
}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }

  if (dragSrcEl !== this) {
    swapCanvases(dragSrcEl.getElementsByClassName('small-canvas')[0], this.getElementsByClassName('small-canvas')[0]);
  }

  return false;
}

function handleDragEnd() {
  [].forEach.call(draggableItems, (draggableItem) => {
    draggableItem.classList.remove('over');
  });
}

function updateDragAndDrop() {
  draggableItems = document.getElementsByClassName('column');
  [].forEach.call(draggableItems, (draggableItem) => {
    draggableItem.addEventListener('dragstart', handleDragStart, false);
    draggableItem.addEventListener('dragenter', handleDragEnter, false);
    draggableItem.addEventListener('dragover', handleDragOver, false);
    draggableItem.addEventListener('dragleave', handleDragLeave, false);
    draggableItem.addEventListener('drop', handleDrop, false);
    draggableItem.addEventListener('dragend', handleDragEnd, false);
  });
}

function updateCopyButtons() {
  const copies = document.getElementsByClassName('copy');
  for (let i = 0; i < copies.length; i++ ) {
    copies[i].onclick = (e) => {
    const thisCanvas = e.target.parentNode.getElementsByClassName('small-canvas')[0];
    const thisCanvasContext = thisCanvas.getContext('2d');
    CreateSmallCanvas();
    const newCanvas = canvases[canvases.length - 1].getContext('2d');
    const copyArray = [];
    for (let j = 0; j < canvasSize; j++ ) {
      copyArray[j] = [];
      for (let k = 0; k < canvasSize; k++ ) {
        const p = thisCanvasContext.getImageData(j * smallGridWidth, k * smallGridWidth, 1, 1).data;
        const hex = `#${(`000000${rgbToHex(p[0], p[1], p[2])}`).slice(-6)}`;
        newCanvas.fillStyle = hex;
        newCanvas.fillRect(smallGridWidth * j, smallGridWidth * k, smallGridWidth, smallGridWidth);
      }
    }}
  }
}

newFrameButton.addEventListener('click', () => {
  CreateSmallCanvas();
});

const canvaslist = document.getElementById('canvas-list');
canvaslist.addEventListener('DOMNodeInserted', () => {
  updateRemoveButtons();
  updateCopyButtons();
  updateDragAndDrop();
});

function interval() {
  if (frame >= canvases.length) { frame = 0; }
  const animationArray = [];
  const context = canvases[frame].getContext('2d');
  for (let i = 0; i < canvasSize; i++ ) {
    animationArray[i] = [];
    for (let j = 0; j < canvasSize; j++ ) {
      const p = context.getImageData(i * smallGridWidth, j * smallGridWidth, 1, 1).data;
      const hex = `#${(`000000${rgbToHex(p[0], p[1], p[2])}`).slice(-6)}`;
      animationArray[i][j] = hex;
    }
  }
  for (let i = 0; i < canvasSize; i++ ) {
    for (let j = 0; j < canvasSize; j++ ) {
      if (animationArray[i][j] === '#c9dce1' || animationArray[i][j] === '#d2ebee') {
        actx.clearRect(animationElementWidth * i, animationElementWidth * j, animationElementWidth, animationElementWidth);
      }
      else {
        actx.fillStyle = animationArray[i][j];
        actx.fillRect(animationElementWidth * i, animationElementWidth * j, animationElementWidth, animationElementWidth);
      }
    }
  }
  frame++ ;
}

let timer;

const fullScreenButton = document.getElementById('fullscreen-button');

fullScreenButton.addEventListener('click', () => {
  if (animation.requestFullscreen) {
    animation.requestFullscreen();
  } else if (animation.webkitrequestFullscreen) {
    animation.webkitRequestFullscreen();
  } else if (animation.mozRequestFullscreen) {
    animation.mozRequestFullScreen();
  }
});

const fps = document.getElementById('fps');
const fpsLabel = document.getElementById('fps-label');
fps.addEventListener('input', () => {
  frameRate = fps.value;
  frame = 0;
  clearInterval(timer);
  timer = setInterval(interval, 1000 / frameRate);
  fpsLabel.textContent = `FPS: ${frameRate}`;
});

const pixel = document.getElementById('pixel');
pixel.addEventListener('click', () => {
  currentTool = 'pixel';
});


const eraser = document.getElementById('eraser');
eraser.addEventListener('click', () => {
  currentTool = 'eraser';
});

const fullFill = document.getElementById('full-fill');
fullFill.addEventListener('click', () => {
  currentTool = 'full-fill';
});

const firstColorChanger = document.getElementById('first-color');
firstColorChanger.addEventListener('change', () => { firstColor = firstColorChanger.value; });

const secondColorChanger = document.getElementById('second-color');
secondColorChanger.addEventListener('change', () => { secondColor = secondColorChanger.value; });


[].forEach.call(draggableItems, (draggableItem) => {
  draggableItem.addEventListener('dragstart', handleDragStart, false);
  draggableItem.addEventListener('dragenter', handleDragEnter, false);
  draggableItem.addEventListener('dragover', handleDragOver, false);
  draggableItem.addEventListener('dragleave', handleDragLeave, false);
  draggableItem.addEventListener('drop', handleDrop, false);
  draggableItem.addEventListener('dragend', handleDragEnd, false);
});

timer = setInterval(interval, 1000 / frameRate);


const canvasSizeModal = document.getElementById('canvas-size-modal');
const canvasSizeButton = document.getElementById('canvas-size');
const closeCanvas = document.getElementById('close-canvas-size-modal');
canvasSizeButton.addEventListener('click', () => { canvasSizeModal.style.display = 'block'; });
closeCanvas.addEventListener('click', () => { canvasSizeModal.style.display = 'none'; });

function clearCanvasList() {
  li = document.getElementsByTagName('li');
  while (li.length) {
    li[0].remove()
  }
}


const size32 = document.getElementById('32x32');
const size64 = document.getElementById('64x64');
const size128 = document.getElementById('128x128');

function resizeCanvas(newSize) {
  canvasSize = newSize;
  animationElementWidth = 512 / canvasSize;
  gridElementWidth = 640 / canvasSize;
  smallGridWidth = 256 / canvasSize;
  draw(ctx, gridElementWidth);
  clearCanvasList();
  CreateSmallCanvas();
  currentCanvas = document.getElementsByClassName('small-canvas')[0];
}

size32.addEventListener('click', () => {
  resizeCanvas(32);
});

size64.addEventListener('click', () => {
  resizeCanvas(64);
});

size128.addEventListener('click', () => {
  resizeCanvas(128);
});

const pixelSize1 = document.getElementById('1px');
pixelSize1.addEventListener('change', () => { pixelSize = 1; });

const pixelSize2 = document.getElementById('2px');
pixelSize2.addEventListener('change', () => { pixelSize = 2; });

const pixelSize3 = document.getElementById('3px');
pixelSize3.addEventListener('change', () => { pixelSize = 3; });

function rotate(matrix) {
  const origMatrix = matrix.slice();
  for (let i = 0; i < matrix.length; i++ ) {
    const row = matrix[i].map((x, j) => {
      const k = (matrix.length - 1) - j;
      return origMatrix[k][i];
    });
    matrix[i] = row;
  }
  return matrix;
}

const doublePixel = document.getElementById('double-pixel');
doublePixel.addEventListener('click', () => { currentTool = 'double-pixel'; });

const rotateButton = document.getElementById('rotate');
rotateButton.addEventListener('click', () => {
  getCanvasColors();
  rotate(canvasColorsArray);
  for (let i = 0; i < canvasSize; i++ ) {
    for (let j = 0; j < canvasSize; j++ ) {
      ctx.fillStyle = canvasColorsArray[i][j];
      ctx.fillRect(gridElementWidth * i, gridElementWidth * j, gridElementWidth, gridElementWidth);
    }
  }
  copyToCanvas(currentCanvas.getContext('2d'), canvasColorsArray, smallGridWidth);
});

const flipButton = document.getElementById('flip');
flipButton.addEventListener('click', () => {
  getCanvasColors();
  canvasColorsArray = canvasColorsArray.reverse();
  for (let i = 0; i < canvasSize; i++ ) {
    for (let j = 0; j < canvasSize; j++ ) {
      ctx.fillStyle = canvasColorsArray[i][j];
      ctx.fillRect(gridElementWidth * i, gridElementWidth * j, gridElementWidth, gridElementWidth);
    }
  }
  getCanvasColors();
  copyToCanvas(currentCanvas.getContext('2d'), canvasColorsArray, smallGridWidth);
});

const downloadImageLink = document.getElementById('download');

const pngRadio = document.getElementById('png');
pngRadio.addEventListener('change', () => { currentFormat = 'png'; });

const jpegRadio = document.getElementById('jpeg');
jpegRadio.addEventListener('change', () => { currentFormat = 'jpeg'; });

const gifRadio = document.getElementById('gif');
gifRadio.addEventListener('change', () => { currentFormat = 'webm'; });

function exportVid(blob) {
  const vid = document.createElement('video');
  const downloads = document.getElementsByClassName('animation')[0];
  vid.src = URL.createObjectURL(blob);
  vid.controls = true;
  vid.style.display = 'none';
  const a = document.createElement('a');
  a.download = 'myvid.webm';
  a.href = vid.src;
  a.textContent = 'your link';
  downloads.appendChild(a);
  a.addEventListener('click', (e) => { e.target.remove(); });
}

function startRecording() {
  const chunks = [];
  const stream = animation.captureStream();
  const rec = new MediaRecorder(stream);
  rec.ondataavailable = e => chunks.push(e.data);
  rec.onstop = () => exportVid(new Blob(chunks, { type: 'video/webm' }));

  rec.start();
  setTimeout(() => rec.stop(), 3000);
}
function download() {
  downloadImageLink.removeAttribute('download');

  if (currentFormat === 'webm') {
    startRecording();
  } else {
    const image = animation.toDataURL('image/png')
      .replace('image/png', 'image/octet-stream');
    downloadImageLink.setAttribute('download', `canvas.${currentFormat}`);

    downloadImageLink.setAttribute('href', image);
  }
}

downloadImageLink.addEventListener('click', download);

const closeStartModal = document.getElementById('close-start-modal');
closeStartModal.addEventListener('click', () => {
  const modal = document.getElementById('start-modal');
  modal.style.display = 'none';
});

let pixelKeyCode = 112;
let doublePixelKeyCode = 100;
let eraserKeyCode = 101;
let fullFillKeyCode = 102;
let rotateKeyCode = 114;
let flipKeyCode = 108;

function keyPress(key) {
  if (key.keyCode === pixelKeyCode) {
    currentTool = 'pixel';
  }

  if (key.keyCode === doublePixelKeyCode) {
    currentTool = 'double-pixel';
  }

  if (key.keyCode === eraserKeyCode) {
    currentTool = 'eraser';
  }

  if (key.keyCode === fullFillKeyCode) {
    currentTool = 'full-fill';
  }

  if (key.keyCode === rotateKeyCode) {
    getCanvasColors();
    rotate(canvasColorsArray);
    for (let i = 0; i < canvasSize; i++ ) {
      for (let j = 0; j < canvasSize; j++ ) {
        ctx.fillStyle = canvasColorsArray[i][j];
        ctx.fillRect(gridElementWidth * i, gridElementWidth * j, gridElementWidth, gridElementWidth);
      }
    }
  }

  if (key.keyCode === flipKeyCode) {
    getCanvasColors();
    canvasColorsArray = canvasColorsArray.reverse();
    for (let i = 0; i < canvasSize; i++ ) {
      for (let j = 0; j < canvasSize; j++ ) {
        ctx.fillStyle = canvasColorsArray[i][j];
        ctx.fillRect(gridElementWidth * i, gridElementWidth * j, gridElementWidth, gridElementWidth);
      }
    }
  }
}

document.addEventListener('keypress', keyPress);

const pixelKeyCodeChanger = document.getElementById('pixel-key');
const doublePixelKeyCodeChanger = document.getElementById('double-pixel-key');
const eraserKeyCodeChanger = document.getElementById('eraser-key');
const fullFillKeyCodeChanger = document.getElementById('full-fill-key');
const rotateKeyCodeChanger = document.getElementById('rotate-key');
const flipKeyCodeChanger = document.getElementById('flip-key');

pixelKeyCodeChanger.addEventListener('keypress', (e) => {
  pixelKeyCodeChanger.value = '';
  pixelKeyCode = e.keyCode;
});

doublePixelKeyCodeChanger.addEventListener('keypress', (e) => {
  doublePixelKeyCodeChanger.value = '';
  doublePixelKeyCode = e.keyCode;
});

eraserKeyCodeChanger.addEventListener('keypress', (e) => {
  eraserKeyCodeChanger.value = '';
  eraserKeyCode = e.keyCode;
});

fullFillKeyCodeChanger.addEventListener('keypress', (e) => {
  fullFillKeyCodeChanger.value = '';
  fullFillKeyCode = e.keyCode;
});

rotateKeyCodeChanger.addEventListener('keypress', (e) => {
  rotateKeyCodeChanger.value = '';
  rotateKeyCode = e.keyCode;
});

flipKeyCodeChanger.addEventListener('keypress', (e) => {
  flipKeyCodeChanger.value = '';
  flipKeyCode = e.keyCode;
});

const keyCodesButton = document.getElementById('key-codes');
const keyCodesModal = document.getElementById('key-codes-modal');
keyCodesButton.addEventListener('click', () => { keyCodesModal.style.display = 'block'; });
const closeKeyCodes = document.getElementById('close-key-codes-modal');
closeKeyCodes.addEventListener('click', () => { keyCodesModal.style.display = 'none'; });
