import React from 'react';
import { findDOMNode } from "react-dom";
import fetch from 'node-fetch';

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
// “reusable component”
function rect(props) {
  const {ctx, x, y, width, height} = props;
  ctx.fillRect(x, y, width, height);
}

export default class Spectrum extends React.Component {

  constructor (...args) {
    super(...args);
    this.context = new AudioContext();
    this.setupAudioNodes();
    this.name = new Object({name: 'ben'});
    this.loadSound2('http://api.soundcloud.com/tracks/204082098/stream?client_id=17a992358db64d99e492326797fff3e8')
    alert(Object.keys(this.context))
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
    this.javascriptNode.onaudioprocess = () => {
        // get the average for the first channel
        let array = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(array);
        // draw the spectrogram
        if (this.sourceNode.playbackState == this.sourceNode.PLAYING_STATE) {
            //drawSpectrogram(array);
        }
    }
    console.log('audio loaded', this.context)
    window.ctx = this.context;
  }

  playSound(buffer) {
    console.log(this);
    this.sourceNode.buffer = buffer;
    this.sourceNode.start(0);
    this.sourceNode.loop = true;
  }

  onError(error) {
    console.log(error);
  }

  loadSound2 (url) {
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
      console.log(response);
      //window.ctx.decodeAudioData(response, this.playSound.bind(this), this.onError); // native works oks
      window.ctx.decodeAudioData(copy(response), this.playSound.bind(this), this.onError); // works with node-fetch
    })
  }

  loadSound(url) {
    let request = new XMLHttpRequest();
    var self = this;
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    // When loaded decode the data
    console.log('audio loaded', self.context)
    request.onload = function () {
      self.onError('woot')
      // decode the data
      window.ctx.decodeAudioData(request.response, self.playSound.bind(self), self.onError);
    };
    request.send();
  }

  componentDidMount () {
    //const canvas = findDOMNode(this.refs.canvas);
    this.updateCanvas();
  }

  componentDidUpdate () {
    this.updateCanvas();
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
      </div>
    );
  }
};

// create the audio context (chrome only for now)
