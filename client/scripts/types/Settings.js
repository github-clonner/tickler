// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : Settings.js                                               //
// @summary      : Settings flow type definition                             //
// @version      : 0.0.1                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 13 Sep 2017                                               //
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

import type { Action } from './Action';

export type Audio = {
  volume?: number;
};

export type Player = {
  autoplay?: boolean;
};

export type Provider = {
  name?: string;
  security?: any;
};

export type PlayList = {
  folders?: Array<'music' | 'videos' | 'userData'>;
  folder?: string;
  formats?: Array<'mp3' | 'mp4' | 'm4a' | 'aac' | 'flac' | 'wav' | 'ogg' | '3gpp'>;
  current?: string | null;
};

export type Settings = {
  audio?: Audio;
  player?: Player;
  playlist?: PlayList;
  providers?: Provider;
  createdAt?: string | null;
  modifiedAt?: string | null;
};


export const SettingsActionKeys = {
  SETTINGS_GET: 'SETTINGS_GET',
  SETTINGS_SET: 'SETTINGS_SET'
};


export type SettingsActions =
  | Action<typeof SettingsActionKeys.SET_CONTEXT, any>
  | Action<typeof SettingsActionKeys.SETTINGS_SET, any>
  ;
