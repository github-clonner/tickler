import React from 'react';
import { findDOMNode } from "react-dom";
import fetch from 'node-fetch';
const WaveSurfer = require('wavesurfer.js');

/*
class Spectrum {
  constructor(element) {
    this.context = new AudioContext();
    this.audioBuffer = null;
    this.sourceNode = null;
    this.analyser = null;
    this.javascriptNode = null;

    // get the context from the canvas to draw on
    let ctx = element.getContext('2d');
    // create a temp canvas we use for copying
    let tempCanvas = document.createElement('canvas');
    let tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width= 800;
    tempCanvas.height= 512;
    // used for color distribution
    let hot = new chroma.ColorScale({
        colors:['#000000', '#ff0000', '#ffff00', '#ffffff'],
        positions:[0, .25, .75, 1],
        mode:'rgb',
        limits:[0, 300]
    });

    setupAudioNodes();
  }

  setupAudioNodes() {
    // setup a javascript node
    this.javascriptNode = this.context.createScriptProcessor(2048, 1, 1);
    // connect to destination, else it isn't called
    this.javascriptNode.connect(this.context.destination);
    // setup a analyzer
    this.analyser = this.context.createAnalyser();
    this.analyser.smoothingTimeConstant = 0;
    this.analyser.fftSize = 1024;
    // create a buffer source node
    this.sourceNode = this.context.createBufferSource();
    this.sourceNode.connect(this.analyser);
    this.analyser.connect(this.javascriptNode);
    this.sourceNode.connect(this.context.destination);

    // when the javascript node is called
    // we use information from the analyzer node
    // to draw the volume
    this.javascriptNode.onaudioprocess = function () {
        // get the average for the first channel
        let array = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(array);
        // draw the spectrogram
        if (this.sourceNode.playbackState == this.sourceNode.PLAYING_STATE) {
            drawSpectrogram(array);
        }
    }
  }

  drawSpectrogram(array) {
    // copy the current canvas onto the temp canvas
    let canvas = document.getElementById('canvas');
    tempCtx.drawImage(canvas, 0, 0, 800, 512);
    // iterate over the elements from the array
    for (let i = 0; i < array.length; i++) {
      // draw each pixel with the specific color
      let value = array[i];
      //ctx.fillStyle = hot.getColor(value).hex();
      // draw the line at the right side of the canvas
      ctx.fillRect(800 - 1, 512 - i, 1, 1);
    }
    // set translate on the canvas
    ctx.translate(-1, 0);
    // draw the copied image
    ctx.drawImage(tempCanvas, 0, 0, 800, 512, 0, 0, 800, 512);
    // reset the transformation matrix
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }


  loadSound(url) {
    let request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    // When loaded decode the data
    request.onload = () => {
      // decode the data
      this.context.decodeAudioData(request.response, this.playSound, this.onError);
    }
    request.send();
  }

  playSound(buffer) {
    this.sourceNode.buffer = buffer;
    this.sourceNode.start(0);
    this.sourceNode.loop = true;
  }

  onError(error) {
    console.log(error);
  }
}
*/
/*
 * Copyright 2013 Boris Smus. All Rights Reserved.

 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


var WIDTH = 640;
var HEIGHT = 360;

// Interesting parameters to tweak!
var SMOOTHING = 0.8;
var FFT_SIZE = 2048;

class Visualizer {

  constructor(canvas, context) {
    this.canvas = canvas;
    this.context = context;
    this.analyser = context.createAnalyser();
    this.analyser.connect(context.destination);
    this.analyser.minDecibels = -140;
    this.analyser.maxDecibels = 0;
    this.freqs = new Uint8Array(this.analyser.frequencyBinCount);
    this.times = new Uint8Array(this.analyser.frequencyBinCount);

    this.isPlaying = false;
    this.startTime = 0;
    this.startOffset = 0;
  }

  togglePlayback (context, buffer) {
    if (this.isPlaying) {
      // Stop playback
      this.source[this.source.stop ? 'stop': 'noteOff'](0);
      this.startOffset += this.context.currentTime - this.startTime;
      console.log('paused at', this.startOffset);
      // Save the position of the play head.
    } else {
      this.startTime = this.context.currentTime;
      console.log('started at', this.startOffset);
      this.source = this.context.createBufferSource();
      // Connect graph
      this.source.connect(this.analyser);
      this.source.buffer = buffer;
      this.source.loop = true;
      // Start playback, but make sure we stay in bound of the buffer.
      this.source[this.source.start ? 'start' : 'noteOn'](0, this.startOffset % buffer.duration);
      // Start visualizer.
      window.requestAnimationFrame(this.draw.bind(this, this.canvas));
    }
    this.isPlaying = !this.isPlaying;
  }

  draw (canvas) {
    this.analyser.smoothingTimeConstant = SMOOTHING;
    this.analyser.fftSize = FFT_SIZE;

    // Get the frequency data from the currently playing music
    this.analyser.getByteFrequencyData(this.freqs);
    this.analyser.getByteTimeDomainData(this.times);

    let width = Math.floor(1/this.freqs.length, 10);

    var drawContext = canvas.getContext('2d');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    // Draw the frequency domain chart.
    for (let i = 0; i < this.analyser.frequencyBinCount; i++) {
      let value = this.freqs[i];
      let percent = value / 256;
      let height = HEIGHT * percent;
      let offset = HEIGHT - height - 1;
      let barWidth = WIDTH/this.analyser.frequencyBinCount;
      let hue = i/this.analyser.frequencyBinCount * 360;
      drawContext.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
      drawContext.fillRect(i * barWidth, offset, barWidth, height);
    }

    // Draw the time domain chart.
    for (let i = 0; i < this.analyser.frequencyBinCount; i++) {
      let value = this.times[i];
      let percent = value / 256;
      let height = HEIGHT * percent;
      let offset = HEIGHT - height - 1;
      let barWidth = WIDTH/this.analyser.frequencyBinCount;
      drawContext.fillStyle = 'white';
      drawContext.fillRect(i * barWidth, offset, 1, 2);
    }

    if (this.isPlaying) {
      window.requestAnimationFrame(this.draw.bind(this, this.canvas));
    }
  }
  getFrequencyValue (frequency) {
    var nyquist = context.sampleRate/2;
    var index = Math.round(frequency / nyquist * this.freqs.length);
    return this.freqs[index];
  }
}

// “reusable component”
function rect(props) {
  const {ctx, x, y, width, height} = props;
  ctx.fillRect(x, y, width, height);
}

export default class Spectrum extends React.Component {

  constructor (...args) {
    super(...args);
  }

  setupAudioNodes(context) {

    // setup a javascript node
    this.javascriptNode = context.createScriptProcessor(2048, 1, 1);
    // connect to destination, else it isn't called
    this.javascriptNode.connect(context.destination);
    // setup a analyzer
    this.analyser = context.createAnalyser();
    this.analyser.smoothingTimeConstant = 0;
    this.analyser.fftSize = 1024;
    // create a buffer source node
    this.sourceNode = context.createBufferSource();
    this.sourceNode.connect(this.analyser);
    this.analyser.connect(this.javascriptNode);
    this.sourceNode.connect(context.destination);

    // when the javascript node is called
    // we use information from the analyzer node
    // to draw the volume
    this.javascriptNode.onaudioprocess = () => {
        // get the average for the first channel
        let array = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(array);
        // draw the spectrogram
        if (this.sourceNode.playbackState == this.sourceNode.PLAYING_STATE) {
            //drawSpectrogram(array);
        }
    }
    this.ctx = context;
  }

  playSound(buffer) {
    this.sourceNode.buffer = buffer;
    this.sourceNode.start(0);
    this.sourceNode.loop = true;
    this.visualizer.togglePlayback(null, buffer);
  }

  onError(error) {
    console.log(error);
  }

  loadSound (url) {
    // var file = path.resolve(__dirname, 'media/sample.mp3');
    // if (!fs.fstatSync(file)){
    //   console.log('no file !')
    // }
    //let data = fs.readFileSync(__dirname, 'utf8');

    function copy(src)  {
      var dst = new ArrayBuffer(src.byteLength);
      new Uint8Array(dst).set(new Uint8Array(src));
      return dst;
  }

    fetch(url, {
      method: 'GET',
      mode: 'cors',
      cache: 'default'
    })
    //.then(res => res.body.buffer())
    .then(response => response.buffer())
    //.then(response => response.blob())
    //.then(response => response.arrayBuffer()) // Native works with audio arrayBuffer
    .then(response => {
      this.buffer = response;
      //window.ctx.decodeAudioData(response, this.playSound.bind(this), this.onError); // native works oks
      this.ctx.decodeAudioData(copy(response), this.playSound.bind(this), this.onError); // works with node-fetch
    })
  }

  componentDidMount () {
    //const canvas = findDOMNode(this.refs.canvas);
    /*this._wavesurfer = Object.create(WaveSurfer);
    let element = findDOMNode(this.refs.waves)
    this._wavesurfer.init({
      container: this.refs.waves,
      barWidth: 2,
      height: 256
    })
    this._wavesurfer.load('http://api.soundcloud.com/tracks/204082098/stream?client_id=17a992358db64d99e492326797fff3e8') //'https://cdn.rawgit.com/ArtskydJ/test-audio/master/audio/50775__smcameron__drips2.ogg'
    this.updateCanvas();

    this._wavesurfer.on('ready', () => {
        this._wavesurfer.params.container.style.opacity = 0.9;
        this._wavesurfer.play();
    });*/
    this.context = new AudioContext();
    this.setupAudioNodes(this.context);
    this.loadSound('http://api.soundcloud.com/tracks/204082098/stream?client_id=17a992358db64d99e492326797fff3e8');
    this.visualizer = new Visualizer(this.refs.canvas, this.context);
  }

  componentDidUpdate () {
    //this.updateCanvas();
  }

  updateCanvas () {
    const ctx = this.refs.canvas.getContext('2d');
    ctx.clearRect(0,0, 300, 300);
    // draw children “components”
    rect({ctx, x: 10, y: 10, width: 50, height: 50});
    rect({ctx, x: 110, y: 110, width: 50, height: 50});
  }

  render () {
    return (
      <div>
        <canvas id='canvas' ref='canvas' width='800' height='350'></canvas>
        <div ref="waves"></div>
      </div>
    );
  }
};

// create the audio context (chrome only for now)
