// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : Modal.js                                               //
// @summary      : Modal actions                                          //
// @version      : 1.0.0                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 05 Dec 2017                                               //
// @license:     : MIT                                                       //
// ------------------------------------------------------------------------- //
//                                                                           //
// Copyright 2017 Benjamin Maggi <benjaminmaggi@gmail.com>                   //
//                                                                           //
//                                                                           //
// License:                                                                  //
// Permission is hereby granted, free of charge, to any person obtaining a   //
// copy of this software and associated documentation files                  //
// (the "Software"), to deal in the Software without restriction, including  //
// without limitation the rights to use, copy, modify, merge, publish,       //
// distribute, sublicense, and/or sell copies of the Software, and to permit //
// persons to whom the Software is furnished to do so, subject to the        //
// following conditions:                                                     //
//                                                                           //
// The above copyright notice and this permission notice shall be included   //
// in all copies or substantial portions of the Software.                    //
//                                                                           //
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS   //
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF                //
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.    //
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY      //
// CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,      //
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE         //
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.                    //
//                                                                           //
///////////////////////////////////////////////////////////////////////////////

import {
  Modal
} from '../../lib';

export const MediaInfo = (media) => {
  const options = {
    window: {
      title: 'Media information'
    },
    behavior: {
      type: 'SAVE_DISCARD_CANCEL',
      autosave: false
    }
  };
  return async function(dispatch, getState) {
    const { PlayListItems } = getState();
    try {
      // const INFOX = await getYoutubeMediaInfo(media.id);
      // console.log('INFOX', JSON.stringify(INFOX, 0, 2))
      const info = {id:"tEJpLDEOivA",title:"Daft Punk - Voyager",name:"Daft Punk - Voyager",filename:"Daft Punk - Voyager",description:"Daft Punk - Voyager",image:"https://i.ytimg.com/vi/tEJpLDEOivA/hqdefault.jpg",related:[{id:"dh3jFRvYvDE",duration:346,type:"media",image:"https://i.ytimg.com/vi/dh3jFRvYvDE/hqdefault.jpg",title:"Daft Punk - Veridis Quo",views:"1.4M views",author:"Costa Ntino"},{list:"RDtEJpLDEOivA",type:"list",image:"https://i.ytimg.com/vi/tEJpLDEOivA/hqdefault.jpg",title:"Mix - Daft Punk - Voyager",size:0},{id:"zNRbP7U0Iq8",duration:241,type:"media",image:"https://i.ytimg.com/vi/zNRbP7U0Iq8/hqdefault.jpg",title:"Daft Punk - Face To Face",views:"4.4M views",author:"Costa Ntino"},{id:"QOngRDVtEQI",duration:299,type:"media",image:"https://i.ytimg.com/vi/QOngRDVtEQI/hqdefault.jpg",title:"Daft Punk - Digital Love",views:"10M views",author:"Costa Ntino"},{id:"mCnJ2_xN2jU",duration:209,type:"media",image:"https://i.ytimg.com/vi/mCnJ2_xN2jU/hqdefault.jpg",title:"Daft Punk - Aerodynamic",views:"5.2M views",author:"Costa Ntino"},{list:"PLjIuADMrDKIb_TAE3RsW8kffG9N9LxjrU",type:"list",image:"https://i.ytimg.com/vi/n6RTF4OPzf8/hqdefault.jpg",title:"Daft Punk - Discovery full album",size:14},{id:"yca6UsllwYs",duration:431,type:"media",image:"https://i.ytimg.com/vi/yca6UsllwYs/hqdefault.jpg",title:"Daft Punk - Around The World",views:"30M views",author:"Costa Ntino"},{id:"Oq77lLDEFGY",duration:601,type:"media",image:"https://i.ytimg.com/vi/Oq77lLDEFGY/hqdefault.jpg",title:"Daft Punk - Too Long",views:"982K views",author:"Costa Ntino"},{id:"sIv17mT9pBc",duration:232,type:"media",image:"https://i.ytimg.com/vi/sIv17mT9pBc/hqdefault.jpg",title:"Daft Punk - Something About Us",views:"2.5M views",author:"Costa Ntino"},{id:"X4fa44_sq2E",duration:239,type:"media",image:"https://i.ytimg.com/vi/X4fa44_sq2E/hqdefault.jpg",title:"Daft Punk - Superheroes",views:"1.4M views",author:"Costa Ntino"},{id:"TBXv37PFcAQ",duration:350,type:"media",image:"https://i.ytimg.com/vi/TBXv37PFcAQ/hqdefault.jpg",title:"Daft Punk - Lose Yourself To Dance",views:"43M views",author:"neonwiretv"},{id:"GDpmVUEjagg",duration:225,type:"media",image:"https://i.ytimg.com/vi/GDpmVUEjagg/hqdefault.jpg",title:"Daft Punk - Harder, Better, Faster, Stronger",views:"26M views",author:"Costa Ntino"}],formats:[{quality:"hd720",type:'video/mp4; codecs="avc1.64001F, mp4a.40.2"',container:"mp4",resolution:"720p",encoding:"H.264",profile:"high",bitrate:"2-3",audioEncoding:"aac",audioBitrate:192},{quality:"medium",type:'video/webm; codecs="vp8.0, vorbis"',container:"webm",resolution:"360p",encoding:"VP8",profile:null,bitrate:"0.5-0.75",audioEncoding:"vorbis",audioBitrate:128},{quality:"medium",type:'video/mp4; codecs="avc1.42001E, mp4a.40.2"',container:"mp4",resolution:"360p",encoding:"H.264",profile:"baseline",bitrate:"0.5",audioEncoding:"aac",audioBitrate:96},{quality:"small",type:'video/3gpp; codecs="mp4v.20.3, mp4a.40.2"',container:"3gp",resolution:"240p",encoding:"MPEG-4 Visual",profile:"simple",bitrate:"0.175",audioEncoding:"aac",audioBitrate:32},{quality:"small",type:'video/3gpp; codecs="mp4v.20.3, mp4a.40.2"',container:"3gp",resolution:"144p",encoding:"MPEG-4 Visual",profile:"simple",bitrate:"0.05",audioEncoding:"aac",audioBitrate:24},{quality:"1080p",fps:"25",type:'video/mp4; codecs="avc1.640028"',size:"1920x1080",container:"mp4",resolution:"1080p",encoding:"H.264",profile:"high",bitrate:"2.5-3",audioEncoding:null,audioBitrate:null},{quality:"1080p",fps:"25",type:'video/webm; codecs="vp9"',size:"1920x1080",container:"webm",resolution:"1080p",encoding:"VP9",profile:"profile 0",bitrate:"1.5",audioEncoding:null,audioBitrate:null},{quality:"720p",fps:"25",type:'video/mp4; codecs="avc1.4d401f"',size:"1280x720",container:"mp4",resolution:"720p",encoding:"H.264",profile:"main",bitrate:"1-1.5",audioEncoding:null,audioBitrate:null},{quality:"720p",fps:"25",type:'video/webm; codecs="vp9"',size:"1280x720",container:"webm",resolution:"720p",encoding:"VP9",profile:"profile 0",bitrate:"0.7-0.8",audioEncoding:null,audioBitrate:null},{quality:"480p",fps:"25",type:'video/mp4; codecs="avc1.4d401e"',size:"854x480",container:"mp4",resolution:"480p",encoding:"H.264",profile:"main",bitrate:"0.5-1",audioEncoding:null,audioBitrate:null},{quality:"480p",fps:"25",type:'video/webm; codecs="vp9"',size:"854x480",container:"webm",resolution:"480p",encoding:"VP9",profile:"profile 0",bitrate:"0.5",audioEncoding:null,audioBitrate:null},{quality:"360p",fps:"25",type:'video/mp4; codecs="avc1.4d401e"',size:"640x360",container:"mp4",resolution:"360p",encoding:"H.264",profile:"main",bitrate:"0.3-0.4",audioEncoding:null,audioBitrate:null},{quality:"360p",fps:"25",type:'video/webm; codecs="vp9"',size:"640x360",container:"webm",resolution:"360p",encoding:"VP9",profile:"profile 0",bitrate:"0.25",audioEncoding:null,audioBitrate:null},{quality:"240p",fps:"25",type:'video/mp4; codecs="avc1.4d4015"',size:"426x240",container:"mp4",resolution:"240p",encoding:"H.264",profile:"main",bitrate:"0.2-0.3",audioEncoding:null,audioBitrate:null},{quality:"240p",fps:"25",type:'video/webm; codecs="vp9"',size:"426x240",container:"webm",resolution:"240p",encoding:"VP9",profile:"profile 0",bitrate:"0.1-0.2",audioEncoding:null,audioBitrate:null},{quality:"144p",fps:"25",type:'video/mp4; codecs="avc1.4d400c"',size:"256x144",container:"mp4",resolution:"144p",encoding:"H.264",profile:"main",bitrate:"0.1",audioEncoding:null,audioBitrate:null},{quality:"144p",fps:"13",type:'video/webm; codecs="vp9"',size:"256x144",container:"webm",resolution:"144p 15fps",encoding:"VP9",profile:"profile 0",bitrate:"0.08",audioEncoding:null,audioBitrate:null},{quality:"",type:'audio/webm; codecs="opus"',container:"webm",resolution:null,encoding:null,profile:null,bitrate:null,audioEncoding:"opus",audioBitrate:160},{quality:"",type:'audio/mp4; codecs="mp4a.40.2"',container:"m4a",resolution:null,encoding:null,profile:null,bitrate:null,audioEncoding:"aac",audioBitrate:128},{quality:"",type:'audio/webm; codecs="vorbis"',container:"webm",resolution:null,encoding:null,profile:null,bitrate:null,audioEncoding:"vorbis",audioBitrate:128},{quality:"",type:'audio/webm; codecs="opus"',container:"webm",resolution:null,encoding:null,profile:null,bitrate:null,audioEncoding:"opus",audioBitrate:64},{quality:"",type:'audio/webm; codecs="opus"',container:"webm",resolution:null,encoding:null,profile:null,bitrate:null,audioEncoding:"opus",audioBitrate:48},{quality:"",container:"mp4",resolution:null,encoding:null,profile:null,bitrate:null,audioEncoding:"aac",audioBitrate:48}],keywords:["Discovery","Daft Punk (Musical Group)","Voyager"],rating:4.91556906451,views:2634455,author:{id:"UCIVB9h04X5FXmx7r9zatZJQ",name:"Costa Ntino",avatar:"https://yt3.ggpht.com/-lZQMUToQIF8/AAAAAAAAAAI/AAAAAAAAAAA/qnfriszfzlY/s88-c-k-no-mo-rj-c0xffffff/photo.jpg",user:"aimo10",channel_url:"https://www.youtube.com/channel/UCIVB9h04X5FXmx7r9zatZJQ",user_url:"https://www.youtube.com/user/aimo10"},status:"ok"};
      const modal = new Modal('/modal/media/metadata', info, options);
    } catch (error) {
      console.error(error);
      return dispatch({ type: 'ERROR', error });
    }
  };
};

export const Related = (media) => {
  const options = {
    window: {
      title: 'Related media'
    },
    behavior: {
      type: {
        // buttons: [
        //   {
        //     label: 'Close',
        //     style: 'secondary',
        //     events: {
        //       onClick: 'close'
        //     }
        //   },
        //   {
        //     label: 'Save',
        //     style: 'primary',
        //     events: {
        //       onClick: 'save'
        //     }
        //   }
        // ],
        icon: 'backup'
      }
    }
  };
  return async function(dispatch, getState) {
    try {
      const info = {id:"tEJpLDEOivA",title:"Daft Punk - Voyager",name:"Daft Punk - Voyager",filename:"Daft Punk - Voyager",description:"Daft Punk - Voyager",image:"https://i.ytimg.com/vi/tEJpLDEOivA/hqdefault.jpg",related:[{id:"dh3jFRvYvDE",duration:346,type:"media",image:"https://i.ytimg.com/vi/dh3jFRvYvDE/hqdefault.jpg",title:"Daft Punk - Veridis Quo",views:"1.4M views",author:"Costa Ntino"},{list:"RDtEJpLDEOivA",type:"list",image:"https://i.ytimg.com/vi/tEJpLDEOivA/hqdefault.jpg",title:"Mix - Daft Punk - Voyager",size:0},{id:"zNRbP7U0Iq8",duration:241,type:"media",image:"https://i.ytimg.com/vi/zNRbP7U0Iq8/hqdefault.jpg",title:"Daft Punk - Face To Face",views:"4.4M views",author:"Costa Ntino"},{id:"QOngRDVtEQI",duration:299,type:"media",image:"https://i.ytimg.com/vi/QOngRDVtEQI/hqdefault.jpg",title:"Daft Punk - Digital Love",views:"10M views",author:"Costa Ntino"},{id:"mCnJ2_xN2jU",duration:209,type:"media",image:"https://i.ytimg.com/vi/mCnJ2_xN2jU/hqdefault.jpg",title:"Daft Punk - Aerodynamic",views:"5.2M views",author:"Costa Ntino"},{list:"PLjIuADMrDKIb_TAE3RsW8kffG9N9LxjrU",type:"list",image:"https://i.ytimg.com/vi/n6RTF4OPzf8/hqdefault.jpg",title:"Daft Punk - Discovery full album",size:14},{id:"yca6UsllwYs",duration:431,type:"media",image:"https://i.ytimg.com/vi/yca6UsllwYs/hqdefault.jpg",title:"Daft Punk - Around The World",views:"30M views",author:"Costa Ntino"},{id:"Oq77lLDEFGY",duration:601,type:"media",image:"https://i.ytimg.com/vi/Oq77lLDEFGY/hqdefault.jpg",title:"Daft Punk - Too Long",views:"982K views",author:"Costa Ntino"},{id:"sIv17mT9pBc",duration:232,type:"media",image:"https://i.ytimg.com/vi/sIv17mT9pBc/hqdefault.jpg",title:"Daft Punk - Something About Us",views:"2.5M views",author:"Costa Ntino"},{id:"X4fa44_sq2E",duration:239,type:"media",image:"https://i.ytimg.com/vi/X4fa44_sq2E/hqdefault.jpg",title:"Daft Punk - Superheroes",views:"1.4M views",author:"Costa Ntino"},{id:"TBXv37PFcAQ",duration:350,type:"media",image:"https://i.ytimg.com/vi/TBXv37PFcAQ/hqdefault.jpg",title:"Daft Punk - Lose Yourself To Dance",views:"43M views",author:"neonwiretv"},{id:"GDpmVUEjagg",duration:225,type:"media",image:"https://i.ytimg.com/vi/GDpmVUEjagg/hqdefault.jpg",title:"Daft Punk - Harder, Better, Faster, Stronger",views:"26M views",author:"Costa Ntino"}],formats:[{quality:"hd720",type:'video/mp4; codecs="avc1.64001F, mp4a.40.2"',container:"mp4",resolution:"720p",encoding:"H.264",profile:"high",bitrate:"2-3",audioEncoding:"aac",audioBitrate:192},{quality:"medium",type:'video/webm; codecs="vp8.0, vorbis"',container:"webm",resolution:"360p",encoding:"VP8",profile:null,bitrate:"0.5-0.75",audioEncoding:"vorbis",audioBitrate:128},{quality:"medium",type:'video/mp4; codecs="avc1.42001E, mp4a.40.2"',container:"mp4",resolution:"360p",encoding:"H.264",profile:"baseline",bitrate:"0.5",audioEncoding:"aac",audioBitrate:96},{quality:"small",type:'video/3gpp; codecs="mp4v.20.3, mp4a.40.2"',container:"3gp",resolution:"240p",encoding:"MPEG-4 Visual",profile:"simple",bitrate:"0.175",audioEncoding:"aac",audioBitrate:32},{quality:"small",type:'video/3gpp; codecs="mp4v.20.3, mp4a.40.2"',container:"3gp",resolution:"144p",encoding:"MPEG-4 Visual",profile:"simple",bitrate:"0.05",audioEncoding:"aac",audioBitrate:24},{quality:"1080p",fps:"25",type:'video/mp4; codecs="avc1.640028"',size:"1920x1080",container:"mp4",resolution:"1080p",encoding:"H.264",profile:"high",bitrate:"2.5-3",audioEncoding:null,audioBitrate:null},{quality:"1080p",fps:"25",type:'video/webm; codecs="vp9"',size:"1920x1080",container:"webm",resolution:"1080p",encoding:"VP9",profile:"profile 0",bitrate:"1.5",audioEncoding:null,audioBitrate:null},{quality:"720p",fps:"25",type:'video/mp4; codecs="avc1.4d401f"',size:"1280x720",container:"mp4",resolution:"720p",encoding:"H.264",profile:"main",bitrate:"1-1.5",audioEncoding:null,audioBitrate:null},{quality:"720p",fps:"25",type:'video/webm; codecs="vp9"',size:"1280x720",container:"webm",resolution:"720p",encoding:"VP9",profile:"profile 0",bitrate:"0.7-0.8",audioEncoding:null,audioBitrate:null},{quality:"480p",fps:"25",type:'video/mp4; codecs="avc1.4d401e"',size:"854x480",container:"mp4",resolution:"480p",encoding:"H.264",profile:"main",bitrate:"0.5-1",audioEncoding:null,audioBitrate:null},{quality:"480p",fps:"25",type:'video/webm; codecs="vp9"',size:"854x480",container:"webm",resolution:"480p",encoding:"VP9",profile:"profile 0",bitrate:"0.5",audioEncoding:null,audioBitrate:null},{quality:"360p",fps:"25",type:'video/mp4; codecs="avc1.4d401e"',size:"640x360",container:"mp4",resolution:"360p",encoding:"H.264",profile:"main",bitrate:"0.3-0.4",audioEncoding:null,audioBitrate:null},{quality:"360p",fps:"25",type:'video/webm; codecs="vp9"',size:"640x360",container:"webm",resolution:"360p",encoding:"VP9",profile:"profile 0",bitrate:"0.25",audioEncoding:null,audioBitrate:null},{quality:"240p",fps:"25",type:'video/mp4; codecs="avc1.4d4015"',size:"426x240",container:"mp4",resolution:"240p",encoding:"H.264",profile:"main",bitrate:"0.2-0.3",audioEncoding:null,audioBitrate:null},{quality:"240p",fps:"25",type:'video/webm; codecs="vp9"',size:"426x240",container:"webm",resolution:"240p",encoding:"VP9",profile:"profile 0",bitrate:"0.1-0.2",audioEncoding:null,audioBitrate:null},{quality:"144p",fps:"25",type:'video/mp4; codecs="avc1.4d400c"',size:"256x144",container:"mp4",resolution:"144p",encoding:"H.264",profile:"main",bitrate:"0.1",audioEncoding:null,audioBitrate:null},{quality:"144p",fps:"13",type:'video/webm; codecs="vp9"',size:"256x144",container:"webm",resolution:"144p 15fps",encoding:"VP9",profile:"profile 0",bitrate:"0.08",audioEncoding:null,audioBitrate:null},{quality:"",type:'audio/webm; codecs="opus"',container:"webm",resolution:null,encoding:null,profile:null,bitrate:null,audioEncoding:"opus",audioBitrate:160},{quality:"",type:'audio/mp4; codecs="mp4a.40.2"',container:"m4a",resolution:null,encoding:null,profile:null,bitrate:null,audioEncoding:"aac",audioBitrate:128},{quality:"",type:'audio/webm; codecs="vorbis"',container:"webm",resolution:null,encoding:null,profile:null,bitrate:null,audioEncoding:"vorbis",audioBitrate:128},{quality:"",type:'audio/webm; codecs="opus"',container:"webm",resolution:null,encoding:null,profile:null,bitrate:null,audioEncoding:"opus",audioBitrate:64},{quality:"",type:'audio/webm; codecs="opus"',container:"webm",resolution:null,encoding:null,profile:null,bitrate:null,audioEncoding:"opus",audioBitrate:48},{quality:"",container:"mp4",resolution:null,encoding:null,profile:null,bitrate:null,audioEncoding:"aac",audioBitrate:48}],keywords:["Discovery","Daft Punk (Musical Group)","Voyager"],rating:4.91556906451,views:2634455,author:{id:"UCIVB9h04X5FXmx7r9zatZJQ",name:"Costa Ntino",avatar:"https://yt3.ggpht.com/-lZQMUToQIF8/AAAAAAAAAAI/AAAAAAAAAAA/qnfriszfzlY/s88-c-k-no-mo-rj-c0xffffff/photo.jpg",user:"aimo10",channel_url:"https://www.youtube.com/channel/UCIVB9h04X5FXmx7r9zatZJQ",user_url:"https://www.youtube.com/user/aimo10"},status:"ok"};
      const modal = new Modal('/modal/media/related', info, options);
    } catch (error) {
      console.error(error);
      return dispatch({ type: 'ERROR', error });
    }
  };
};


