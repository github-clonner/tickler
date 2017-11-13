// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : disposition.js                                            //
// @summary      : HTTP Content-* headers parsing                            //
// @version      : 1.0.0                                                     //
// @project      :                                                           //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 13 Nov 2017                                               //
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

/* inspired from: https://github.com/hapijs/content */
/*
  RFC 6266 Section 4.1 (http://tools.ietf.org/html/rfc6266#section-4.1)
  content-disposition = "Content-Disposition" ":" disposition-type *( ";" disposition-parm )
  disposition-type    = "inline" | "attachment" | token                                           ; case-insensitive
  disposition-parm    = filename-parm | token [ "*" ] "=" ( token | quoted-string | ext-value)    ; ext-value defined in [RFC5987], Section 3.2
  Content-Disposition header field values with multiple instances of the same parameter name are invalid.
  Note that due to the rules for implied linear whitespace (Section 2.1 of [RFC2616]), OPTIONAL whitespace
  can appear between words (token or quoted-string) and separator characters.
  Furthermore, note that the format used for ext-value allows specifying a natural language (e.g., "en"); this is of limited use
  for filenames and is likely to be ignored by recipients.
*/
const contentDispositionRegex = /^\s*form-data\s*(?:;\s*(.+))?$/i;
//                                        1: name     2: *            3: ext-value                      4: quoted  5: token
const contentDispositionParamRegex = /([^\=\*\s]+)(\*)?\s*\=\s*(?:([^;'"\s]+\'[\w-]*\'[^;\s]+)|(?:\"([^"]*)\")|([^;\s]*))(?:\s*(?:;\s*)|$)/g;
const disposition = function (header) {
  if (!header) {
    throw new Error('Missing content-disposition header');
  }
  const match = header.match(contentDispositionRegex);
  if (!match) {
    throw new Error('Invalid content-disposition header format');
  }
  const parameters = match[1];
  if (!parameters) {
    throw new Error('Invalid content-disposition header missing parameters');
  }
  const result = {};
  const leftovers = parameters.replace(contentDispositionParamRegex, ($0, $1, $2, $3, $4, $5) => {
    if ($2) {
      if (!$3) {
        return 'error'; // Generate leftovers
      }
      try {
        result[$1] = decodeURIComponent($3.split('\'')[2]);
      } catch (err) {
        return 'error'; // Generate leftover
      }
    } else {
      result[$1] = $4 || $5 || '';
    }
    return '';
  });
  if (leftovers) {
    throw new Error('Invalid content-disposition header format includes invalid parameters');
  }
  if (!result.name) {
    throw new Error('Invalid content-disposition header missing name parameter');
  }
  return result;
};

module.exports = {
  disposition
};
