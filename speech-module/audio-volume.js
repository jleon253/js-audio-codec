let stream;
let audioContext;
let mediaStreamAudioSourceNode;
let analyserNode;

let pcmData;
let animationFrame;

let props = {
  'audio': true,
  'video': false
};

let startButton, stopButton, meter;

const getElements = () => { 
  startButton = document.getElementById('startMeter');
  stopButton = document.getElementById('stopMeter');
  meter = document.getElementById('meter');
  startButton.onclick = start;
  stopButton.onclick = stop;
};

const start = async () => { 
  startButton.disabled = true;
  stopButton.disabled = false;

  stream = await navigator.mediaDevices.getUserMedia(props);
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  mediaStreamAudioSourceNode = audioContext.createMediaStreamSource(stream);
  analyserNode = audioContext.createAnalyser();
  mediaStreamAudioSourceNode.connect(analyserNode);

  // console.log('stream', stream);
  // console.log('audioContext', audioContext);
  // console.log('mediaStreamAudioSourceNode', mediaStreamAudioSourceNode);
  // console.log('analyserNode', analyserNode);

  analyser();
};

const analyser = () => { 
  pcmData = new Float32Array(analyserNode?.fftSize);
  console.log('pcmData', pcmData);

  animationFrame = window.requestAnimationFrame(onFrame);
};

const onFrame = () => { 
  analyserNode.getFloatTimeDomainData(pcmData);
  let sumSquares = 0.0;
  for(const amplitude of pcmData) {
    sumSquares += amplitude * amplitude;
  }
  meter.value = Math.sqrt(sumSquares / pcmData.length);
  console.log('volume', (sumSquares / pcmData.length));
  animationFrame = window.requestAnimationFrame(onFrame);
};

const stop = () => {
  startButton.disabled = false;
  stopButton.disabled = true;

  window.cancelAnimationFrame(animationFrame);
  audioContext?.close();
  stream?.getTracks().forEach(track => track.stop());
};

getElements();
