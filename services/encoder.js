"use strict";
import { ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';
import ytdl from 'ytdl-core';
import { EventEmitter } from 'events';

class EncoderEvents extends EventEmitter {
  constructor(...args) {
    super(...args);
  }
}

const ffmpeg = require('fluent-ffmpeg');

function createSong(fileName, bitrate = 192) {
  return new Promise((resolve, reject) => {
    let x = new ffmpeg(fileName)
    .audioBitrate(bitrate)
    .saveToFile(fileName + '.mp3')
    .on('progress', function(info) {
      console.log('progress ' + info.percent + '%');
    })
    .on('end', function() {
      console.log('encoding finish')
      return resolve(fileName + '.mp3');
    });
  })
}

ipcMain.on('encode', (event, fileName) => {
  console.log('econde: ', fileName);
  createSong(fileName, 192)
  .then(newFileName => {
    event.sender.send('encoded', newFileName)
  });
})


export default class Encoder {
  constructor (...args) {
    this.events = new EncoderEvents();
  }

  encode (input, output, format) {
    return new Promise((resolve, reject) => {
      let job = new ffmpeg(input)
      .audioBitrate(bitrate)
      .saveToFile(output)
      .on('progress', progress => {
        this.events.emit('progress', progress);
      })
      .on('error', reject)
      .on('end', resolve);
    });
  }
}
