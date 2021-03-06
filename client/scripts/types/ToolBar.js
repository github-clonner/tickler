// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : ToolBar.js                                                //
// @summary      : ToolBar flow types                                        //
// @version      : 0.0.1                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 07 Sep 2017                                               //
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

export const ToolBarActionKeys = {
  ADD: 'TOOLBAR_ADD',
  SET: 'TOOLBAR_SET',
  CREATE: 'TOOLBAR_CREATE',
  REMOVE: 'TOOLBAR_REMOVE',
  HIDE: 'TOOLBAR_HIDE'
};

type ToolBarIcon = {
  url: string,
  width: number,
  height: number
};

export type ToolBarButton = {
  name: string,
  hint?: string,
  active?: bool,
  icon?: ToolBarIcon
};

export type ToolBar = {
  equalizer: bool,
  levels: bool,
  coverflow: bool
};

export type ToolBarActions =
  | Action<typeof ToolBarActionKeys.ADD, ToolBar>
  | Action<typeof ToolBarActionKeys.SET, ToolBar>
  | Action<typeof ToolBarActionKeys.CREATE, ToolBar>
  | Action<typeof ToolBarActionKeys.REMOVE, ToolBar>
  | Action<typeof ToolBarActionKeys.HIDE, ToolBar>
  ;
