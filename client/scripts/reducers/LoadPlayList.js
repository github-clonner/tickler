///////////////////////////////////////////////////////////////////////////////
// @file         : LoadPlayList.js                                           //
// @summary      : Load JSON playlists from disk                             //
// @version      : 0.0.1                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 17 Jul 2017                                               //
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

import electron from 'electron';
import path from 'path';
import fs from 'fs';
import jsonata from 'jsonata';

const schema = {
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "object",
  "title": "PlayList",
  "description": "Playlist Schema",
  "required": ["id"],
  "properties": {
    "name": {
      "type": "string",
      "description": "The name of the playlist."
    },
    "description": {
      "type": ["string", "null"],
      "description": "The playlist description. Only returned for modified, verified playlists, otherwise null."
    },
    "id": {
      "type": "string",
      "description": "The ID of the playlist."
    },
    "uri": {
      "type": ["string", "null"],
      "format": "uri",
      "description": "URI of the playlist."
    },
    "tracks": {
      "type": "array",
      "description": "Playlist tracks.",
      "items": {
        "description": "Playlist track",
        "$ref": "#/definitions/TrackDetails"
      }
    }
  },
  "definitions": {
    "ArtistDetails": {
      "type": "object",
      "description": "Artist object.",
      "properties": {
        "name": {
          "type": "string",
          "description": "The name of the artist."
        },
        "genres": {
          "type": "array",
          "description": "A list of the genres the artist is associated with. For example: 'Prog Rock', 'Post-Grunge'. (If not yet classified, the array is empty.)",
          "items": {
            "type": "string"
          }
        },
        "href": {
          "type": "string",
          "description": "A link to the Web API endpoint providing full details of the artist."
        }
      }
    },
    "Thumbnail": {
      "id": "Thumbnail",
      "type": "object",
      "description": "A thumbnail is an image representing a YouTube resource.",
      "properties": {
        "height": {
          "type": "integer",
          "description": "(Optional) Height of the thumbnail image.",
          "format": "uint32"
        },
        "url": {
          "type": "string",
          "description": "The thumbnail image's URL."
        },
        "width": {
          "type": "integer",
          "description": "(Optional) Width of the thumbnail image.",
          "format": "uint32"
        }
      }
    },
    "ThumbnailDetails": {
      "id": "ThumbnailDetails",
      "type": "object",
      "description": "Internal representation of thumbnails for a resource.",
      "properties": {
        "default": {
          "$ref": "#/definitions/Thumbnail",
          "description": "The default image for this resource."
        },
        "high": {
          "$ref": "#/definitions/Thumbnail",
          "description": "The high quality image for this resource."
        },
        "maxres": {
          "$ref": "#/definitions/Thumbnail",
          "description": "The maximum resolution quality image for this resource."
        },
        "medium": {
          "$ref": "#/definitions/Thumbnail",
          "description": "The medium quality image for this resource."
        },
        "standard": {
          "$ref": "#/definitions/Thumbnail",
          "description": "The standard quality image for this resource."
        }
      }
    },
    "AlbumDetails": {
      "type": "object",
      "description": "Album details",
      "properties": {
        "id": {
          "type": "string",
          "description": "The id for the album."
        },
        "type": {
          "type": "string",
          "description": "The type of the album: one of 'album', 'single', or 'compilation'."
        },
        "name": {
          "type": "string",
          "description": "The name of the album."
        },
        "artists": {
          "type": "array",
          "description": "The artists of the album. Each artist object includes a link in href to more detailed information about the artist.",
          "items": {
            "$ref": "#/definitions/ArtistDetails"
          }
        },
        "genres": {
          "type": "array",
          "description": "A list of the genres used to classify the album. For example: 'Prog Rock', 'Post-Grunge'. (If not yet classified, the array is empty.)",
          "items": {
            "type": "string"
          }
        },
        "href": {
          "type": "string",
          "description": "A link to the Web API endpoint providing full details of the album."
        },
        "copyrights": {
          "type": "array",
          "description": "The copyright statements of the album.",
          "items": {
            "type": "object",
            "properties": {
              "text": {
                "type": "string",
                "description": "The copyright text for this album."
              },
              "type": {
                "type": "string",
                "description": "The type of copyright: C = the copyright, P = the sound recording (performance) copyright."
              }
            }
          }
        }
      }
    },
    "TrackDetails": {
      "type": "object",
      "description": "Playlist track item.",
      "properties": {
        "id": {
          "type": "string",
          "description": "The ID of the track."
        },
        "artist": {
          "type": "array",
          "description": "The artists who performed the track. Each artist object includes a link in href to more detailed information about the artist.",
          "items": {
            "$ref": "#/definitions/ArtistDetails"
          }
        },
        "name": {
          "type": "string",
          "description": "The name of the track."
        },
        "album": {
          "$ref": "#/definitions/AlbumDetails",
          "description": "The album details."
        },
        "year": {
          "type": "string",
          "description": "The album release year."
        },
        "comment": {
          "type": "string",
          "description": "Track comments."
        },
        "thumbnails": {
          "$ref": "#/definitions/ThumbnailDetails",
          "description": "The cover art for the album in various sizes, widest first."
        },
        "genre": {
          "type": "string",
          "description": "The genre of the album."
        },
        "lyrics": {
          "type": "string",
          "description": "The track lyrics."
        },
        "duration": {
          "type": "integer",
          "description": "The track length in milliseconds."
        },
        "file": {
          "type": "string",
          "description": "A file path."
        },
        "playing": {
          "type": "boolean",
          "description": "The track playback status."
        },
        "progress": {
          "type": "number",
          "description": "Track playback progress",
          "default": 0,
          "minimu": 1,
          "minimum": 0
        },
        "status": {
          "type": "string",
          "description": "The status of the track."
        },
        "stars": {
          "type": "integer",
          "description": "Track rating",
          "default": 0,
          "minimu": 0,
          "minimum": 5
        }
      }
    }
  }
}

const read = function (path, options) {
  if (fs.existsSync(path)) {
    try {
      return JSON.parse(fs.readFileSync(path, options));
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
};

const write = function (path, content) {
  try {
    const str = JSON.stringify(content, 0, 2);
    return fs.writeFileSync(path, str);
  } catch (error) {
    console.error(error);
    throw error;
  }
};


export default class Settings extends Map {
  constructor (...args) {
    super(...args)
  }
}


