// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : MimeTypeInfo.js                                           //
// @summary      : Misc content-type utilities                               //
// @version      : 1.0.0                                                     //
// @project      : N/A                                                       //
// @description  : N/A                                                       //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 19 Oct 2017                                               //
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

const MimeType = {
  format: {
    video: {
      'mp4': {
        extension: 'mp4'
        codecs: ['avc1.42E01E, mp4a.40.2', 'avc1.58A01E, mp4a.40.2', 'avc1.4D401E, mp4a.40.2', 'avc1.64001E, mp4a.40.2', 'mp4v.20.8, mp4a.40.2', 'mp4v.20.240, mp4a.40.2']
      }
    },
    audio: {
      'mp4': {
        extension: 'mp4',
        codecs: []
      },
      'mpeg': {
        extension: 'mp3',
        codecs: []
      },
      'webm': {
        extension: 'webm',
        codecs: []
      },
      'ogg': {
        extension: 'oga',
        codecs: []
      },
      'wav': {
        extension: '',
        codecs: []
      },
      'ogg': {
        extension: '',
        codecs: []
      },
      'ogg': {
        extension: '',
        codecs: []
      },
      '3gpp': {
        extension: '',
        codecs: []
      }
    }
  }








