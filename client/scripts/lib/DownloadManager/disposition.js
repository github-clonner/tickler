

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
