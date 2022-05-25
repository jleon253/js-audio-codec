// ------------ Variables -----------------

const options = {'audio': true};

let btnStartRecord, btnStopRecord, selectVisualType;
let canvasGraph, canvasGraphCtx, canvasWidth, canvasHeight;
let analyser, audioContext, bufferLength, dataArray, drawVisual, gainNode, source, streamVoice, visualType;

// ------------ Functions -----------------

const getElements = () => { 
  btnStartRecord = document.getElementById('btnStartRecord');
  btnStopRecord = document.getElementById('btnStopRecord');
  canvasGraph = document.getElementById('canvasGraph');
  selectVisualType = document.getElementById('selectVisualType');
};

const getCanvasContext = () => {
  canvasGraphCtx = canvasGraph.getContext('2d');
};

const setActions = () => { 
  btnStartRecord.addEventListener('click', startVoiceInput);
  btnStopRecord.addEventListener('click', stopVoiceInput);
  selectVisualType.addEventListener('change', () => {
    window.cancelAnimationFrame(drawVisual);
    visualize();
  });
};

const startVoiceInput = () => {
  // btnStartVoice.disabled = true;

  navigator.mediaDevices.getUserMedia(options)
    .then(stream => {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      source = audioContext.createMediaStreamSource(stream);
      streamVoice = stream;

      analyser = audioContext.createAnalyser();
      gainNode = audioContext.createGain();

      gainNode.connect(analyser);
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
  canvasWidth = canvasGraph.width;
  canvasHeight = canvasGraph.height;
};

const resetCanvas = () => { 
  canvasGraphCtx.clearRect(0, 0, canvasWidth, canvasHeight);
  canvasGraphCtx.fillRect(0, 0, canvasWidth, canvasHeight);
  canvasGraphCtx.fillStyle = 'rgb(0, 0, 0)';
};

const setUpAnalyser = (value, type = '') => { 
  analyser.fftSize = value;
  bufferLength = type === 'wave' ? analyser.fftSize : analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
};

const drawWave = () => { 
  let sliceWidth = canvasWidth * 1.0 / bufferLength;
  let x = 0;

  drawVisual = requestAnimationFrame(drawWave);
  analyser.getByteTimeDomainData(dataArray);

  canvasGraphCtx.fillStyle = 'rgb(0, 0, 0)';
  canvasGraphCtx.fillRect(0, 0, canvasWidth, canvasHeight);
  canvasGraphCtx.lineWidth = 2;
  canvasGraphCtx.strokeStyle = 'rgb(255,255,255)';
  canvasGraphCtx.beginPath();

  for (let i = 0; i < bufferLength; i++) {
     var v = dataArray[i] / 128.0;
     var y = v * canvasHeight/2;

      if(i === 0) {
        canvasGraphCtx.moveTo(x, y);
      } else {
        canvasGraphCtx.lineTo(x, y);
      }

      x += sliceWidth;
  }

  canvasGraphCtx.lineTo(canvasGraph.width, canvasGraph.height / 2);
  canvasGraphCtx.stroke();
};

const drawBars = () => { 
  let barWidth = (canvasWidth / bufferLength) * 2.5;
  let barHeight;
  let x = 0;

  drawVisual = requestAnimationFrame(drawBars);
  analyser.getByteFrequencyData(dataArray);

  canvasGraphCtx.fillStyle = 'rgb(0, 0, 0)';
  canvasGraphCtx.fillRect(0, 0, canvasWidth, canvasHeight);

  for(let i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i];

    canvasGraphCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
    canvasGraphCtx.fillRect(x, canvasHeight - barHeight / 2, barWidth, barHeight / 2);

    x += barWidth + 1;
  }
};

const stopVoiceInput = () => { 
  window.cancelAnimationFrame(drawVisual);
  audioContext?.close();
  streamVoice?.getTracks().forEach(track => track.stop());
};

getElements();
getCanvasContext();
setActions();
