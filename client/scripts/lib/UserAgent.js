///////////////////////////////////////////////////////////////////////////////
// @file         : UserAgent.js                                              //
// @summary      : User Agent Constructor                                    //
// @version      : 1.0.0                                                     //
// @project      :                                                           //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 18 Nov 2017                                               //
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

const os = require('os');
const path = require('path');
const fs = require('fs');
const { version, name, homepage } = require('package.json');

class Browser {
  chrome(arch) {
    var safari = version_string.safari(),
      os_ver = (arch === 'mac') ? '(Macintosh; ' + randomProc('mac') + ' Mac OS X ' + version_string.osx('_') + ') ' : (arch === 'win') ? '(Windows; U; Windows NT ' + version_string.nt() + ')' : '(X11; Linux ' + randomProc(arch);
    return 'Mozilla/5.0 ' + os_ver + ' AppleWebKit/' + safari + ' (KHTML, like Gecko) Chrome/' + version_string.chrome() + ' Safari/' + safari;
  }
};
export default class UserAgent {

  static defaults() {

  }

  /* Gets the detected device category */
  static get deviceCategory() {

  };
  /* Gets the family of an user agent */
  static get family() {

  };
  /* Gets the icon name of an user agent */
  static get icon() {

  };
  /* Gets the name of an user agent */
  static get name() {

  };
  /* Gets the operating system on which the user agent is running */
  static get operatingSystem() {
    // return `(${process.platform}; ${process.arch})`;
    return [
      os.platform(),
      os.arch(),
      os.release()
    ]
  };
  /* Returns the manufacturer of an user agent */
  static get producer() {

  };
  /* Returns the URL to the main website of the manufacturer of an user agent */
  static get producerUrl() {

  };
  /* Returns the type of an user agent, for example, mobile browser or email client */
  static get type() {

  };
  /* Returns the type name of an user agent, for example, mobile browser or email client */
  static get typeName() {

  };
  /* Returns the URL to the product or information page of an user agent */
  static get url() {

  };
  /* Gets the version number of an user agent */
  static get versionNumer() {
    return version || process.version.slice(1);
  };

  static createUserAgent() {
    return [ baseInfo, systemInfo, libraryInfo, contactInfo ]
    .filter(Boolean)
    .join(' ');
  }

  constructor () {

  }
}
UserAgent build()

DeviceCategory  getDeviceCategory()
UserAgentFamily getFamily()
java.lang.String  getIcon()
java.lang.String  getName()
OperatingSystem getOperatingSystem()
java.lang.String  getProducer()
java.lang.String  getProducerUrl()
UserAgentType getType()
java.lang.String  getTypeName()
java.lang.String  getUrl()
java.lang.String  getUserAgentString()
VersionNumber getVersionNumber()
UserAgent.Builder setDeviceCategory(DeviceCategory deviceCategory)
UserAgent.Builder setFamily(UserAgentFamily family)
UserAgent.Builder setIcon(java.lang.String icon)
UserAgent.Builder setName(java.lang.String name)
UserAgent.Builder setOperatingSystem(OperatingSystem operatingSystem)
UserAgent.Builder setOperatingSystem(ReadableOperatingSystem os)
UserAgent.Builder setProducer(java.lang.String producer)
UserAgent.Builder setProducerUrl(java.lang.String producerUrl)
UserAgent.Builder setType(UserAgentType type)
UserAgent.Builder setTypeName(java.lang.String typeName)
UserAgent.Builder setUrl(java.lang.String url)
UserAgent.Builder setUserAgentString(java.lang.String userAgentString)
UserAgent.Builder setVersionNumber(VersionNumber versionNumber)

