import { clipboard, ipcRenderer } from 'electron';
import { EventEmitter } from 'events';
import querystring from 'querystring';
import url from 'url';

///////////////////////////////////////////////////////////////////////////////
// create single EventEmitter instance                                       //
///////////////////////////////////////////////////////////////////////////////
class ClipBoardDataEvents extends EventEmitter {
  constructor(...args) {
    super(...args);
  }
}

const clipBoardDataEvents = new ClipBoardDataEvents();

export default class ClipBoardData {
  constructor() {
    this.clipboard = clipboard;
    this.events = clipBoardDataEvents;
    this.link = null;
    this.init();
  }

  setInterval = (interval = 500) => {
    this.timer = window.setInterval(() => {
      const data = this.decode(this.clipboard);
    }, interval);
    return this.timer;
  }

  clearInterval = (timer = this.timer) => {
    return window.clearInterval(timer);
  }

  init () {
    window.addEventListener('focus', event => { 
      this.setInterval();
    }, false);
    window.addEventListener('blur', event => { 
      this.clearInterval();
    }, false);
  }

  decode () {
    const formats = this.clipboard.availableFormats();
    if (formats.indexOf('text/plain') > -1) {
      const link = this.clipboard.readText();
      const video = new RegExp(/(?:youtube\.com.*(?:\?|&)(?:v)=|youtube\.com.*embed\/|youtube\.com.*v\/|youtu\.be\/)((?!videoseries)[a-zA-Z0-9_]*)/g);
      const list = new RegExp(/(?:youtube\.com.*(?:\?|&)(?:list)=)((?!videoseries)[a-zA-Z0-9_]*)/g);

      if (this.link === link) {
        return null;
      }
      if (link.match(video) || link.match(list)) {
        this.link = link;
        const uri = url.parse(link);
        const query = querystring.parse(uri.query);
        this.events.emit('data', query);
        return query;
      } else {
        return null;
      }
    }
  }
}