// ------------ Variables -----------------

const options = {'audio': true};

let btnStartVoice, selectVisualType;
let canvas, canvasCtx, width, height;
let analyser, bufferLength, dataArray, drawVisual, source, visualType;

// ------------ Functions -----------------

const getElements = () => { 
  btnStartVoice = document.getElementById('btnStartVoice');
  canvas = document.getElementById('visualizer');
  selectVisualType = document.getElementById('visual');
};

const getCanvasContext = () => {
  canvasCtx = canvas.getContext('2d');
};

const setActions = () => { 
  btnStartVoice.addEventListener('click', startVoiceInput);
  selectVisualType.addEventListener('change', () => {
    window.cancelAnimationFrame(drawVisual);
    visualize();
  });
};

const startVoiceInput = () => {
  // btnStartVoice.disabled = true;

  navigator.mediaDevices.getUserMedia(options)
    .then(stream => {
      let audioContext = new (window.AudioContext || window.webkitAudioContext)();
      source = audioContext.createMediaStreamSource(stream);
      analyser = audioContext.createAnalyser();
      source.connect(analyser);
      visualize();
    });
};

const visualize = () => { 
  getCanvasSize();
  visualType = selectVisualType.value;

  if(visualType === 'wave') {
    setUpAnalyser(2048, visualType);
    drawWave();
  } else if(visualType === 'bars') {
    setUpAnalyser(256, visualType);
    drawBars();
  } else {
    resetCanvas();
  }
};

const getCanvasSize = () => {
  width = canvas.width;
  height = canvas.height;
};

const resetCanvas = () => { 
  canvasCtx.clearRect(0, 0, width, height);
  canvasCtx.fillRect(0, 0, width, height);
  canvasCtx.fillStyle = 'rgb(0, 0, 0)';
};

const setUpAnalyser = (value, type = '') => { 
  analyser.fftSize = value;
  bufferLength = type === 'wave' ? analyser.fftSize : analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
};

const drawWave = () => { 
  let sliceWidth = width * 1.0 / bufferLength;
  let x = 0;

  drawVisual = requestAnimationFrame(drawWave);
  analyser.getByteTimeDomainData(dataArray);

  canvasCtx.fillStyle = 'rgb(0, 0, 0)';
  canvasCtx.fillRect(0, 0, width, height);
  canvasCtx.lineWidth = 2;
  canvasCtx.strokeStyle = 'rgb(255,255,255)';
  canvasCtx.beginPath();

  for (let i = 0; i < bufferLength; i++) {
     var v = dataArray[i] / 128.0;
     var y = v * height/2;

      if(i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
  }

  canvasCtx.lineTo(canvas.width, canvas.height / 2);
  canvasCtx.stroke();
};

const drawBars = () => { 
  let barWidth = (width / bufferLength) * 2.5;
  let barHeight;
  let x = 0;

  drawVisual = requestAnimationFrame(drawBars);
  analyser.getByteFrequencyData(dataArray);

  canvasCtx.fillStyle = 'rgb(0, 0, 0)';
  canvasCtx.fillRect(0, 0, width, height);

  for(let i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i];

    canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
    canvasCtx.fillRect(x, height - barHeight / 2, barWidth, barHeight / 2);

    x += barWidth + 1;
  }
};

getElements();
getCanvasContext();
setActions();
