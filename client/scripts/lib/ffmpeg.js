///////////////////////////////////////////////////////////////////////////////
// @file         : ffmpeg.js                                                 //
// @summary      : Platform independent binary installer                     //
// @version      : 1.0.0                                                     //
// @project      : N/A                                                       //
// @description  : Installs a binary of ffmpeg for the current platform      //
//                 and provides a path and version.                          //
//                 Supports Linux, Windows and Mac OS/X.                     //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 16 Oct 2017                                               //
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

/*
 * Online Service to find binaries: http://ffbinaries.com/
 *
 */

/*
 * Inspiration:
 * https://github.com/vot/ffbinaries-node (best)
 * https://github.com/eugeneware/ffmpeg-static (hardcoded version)
 * https://github.com/kribblo/node-ffmpeg-installer (bash based)
 */

const os = require('os');
const fs = require('fs');
const path = require('path');
const platform = os.platform();
const arch = os.arch();
const ffbinaries = require('ffbinaries');

const installer = {
  ffmpeg: {
    'darwin': {
      arch: {
        'x64': {
          host: 'https://evermeet.cx',
          path: '/pub/ffmpeg'
        }
      }
    },
    'linux': {
      arch: {
        'x64': {
          host: 'https://johnvansickle.com',
          path: '/ffmpeg/releases',
          name: 'ffmpeg-release-64bit-static.tar.xz'
        },
        'ia32': {
          host: 'https://johnvansickle.com',
          path: '/ffmpeg/releases',
          name: 'ffmpeg-release-32bit-static.tar.xz'
        },
      }
    },
    'win32': {
      arch: {
        'x64': {
          host: 'https://ffmpeg.zeranoe.com',
          path: '/builds/win64/static',
          name: 'ffmpeg-latest-win64-static.zip'
        },
        'ia32': {
          host: 'https://ffmpeg.zeranoe.com',
          path: '/builds/win64/static',
          name: 'ffmpeg-latest-win32-static.zip'
        },
      }
    }
  },
  ffprobe: {

  }
};

const script = `
echo 'windows x64'
echo '  downloading from ffmpeg.zeranoe.com'
download 'https://ffmpeg.zeranoe.com/builds/win64/static/ffmpeg-latest-win64-static.zip' win32-x64.zip
echo '  extracting'
unzip -o -d ../bin/win32/x64 -j win32-x64.zip '**/ffmpeg.exe'

echo 'windows ia32'
echo '  downloading from ffmpeg.zeranoe.com'
download 'https://ffmpeg.zeranoe.com/builds/win32/static/ffmpeg-latest-win32-static.zip' win32-ia32.zip
echo '  extracting'
unzip -o -d ../bin/win32/ia32 -j win32-ia32.zip '**/ffmpeg.exe'

echo 'linux x64'
echo '  downloading from johnvansickle.com'
download 'https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-64bit-static.tar.xz' linux-x64.tar.xz
echo '  extracting'
$tar_exec -x -C ../bin/linux/x64 --strip-components 1 -f linux-x64.tar.xz --wildcards '*/ffmpeg'

echo 'linux ia32'
echo '  downloading from johnvansickle.com'
download 'https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-32bit-static.tar.xz' linux-ia32.tar.xz
echo '  extracting'
$tar_exec -x -C ../bin/linux/ia32 --strip-components 1 -f linux-ia32.tar.xz --wildcards '*/ffmpeg'

# todo: find latest version
echo 'darwin x64 – downloading from evermeet.cx'
download 'https://evermeet.cx/pub/ffmpeg/ffmpeg-3.3.3.7z' darwin-x64-ffmpeg.7z
7zr e -y -bd -o../bin/darwin/x64 darwin-x64-ffmpeg.7z >/dev/null`;
