// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : PlayList.js                                               //
// @summary      : PlayList flow type definition                             //
// @version      : 0.0.1                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 12 Sep 2017                                               //
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

export type Artist = {
  id: string;
  name: string;
  genres?: Array<string>;
  uri?: string;
};

export type Thumbnail = {
  height?: number;
  url: string;
  width?: number;
};

export type Thumbnails = {
  default: Thumbnail;
  high?: Thumbnail;
  maxres?: Thumbnail;
  medium?: Thumbnail;
  standard?: Thumbnail;
};

export type Album = {
  id: string;
  type?: "album" | "single" | "compilation";
  name: string;
  artists?: Array<Artist>;
  genres: Array<string>;
  copyrights?: Array<{
    text?: string;
    type?: string;
  }>;
};

export type Track = {
  id: string;
  artists: Array<Artist>;
  name: string;
  album?: Album;
  year?: string;
  comment?: string;
  thumbnails: Thumbnails;
  genre?: string;
  lyrics?: string;
  duration?: number | string;
  file?: string;
  playing?: boolean;
  progress?: number;
  status?: string;
  stars?: number;
};

export type PlayList = {
  id: string;
  name: string;
  description?: string | null;
  href?: string;
  tracks: Array<Track>;
};