// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : GoogleApiDiscovery.js                                     //
// @summary      : Interface for Google API Discovery Service                //
// @version      : 0.0.1                                                     //
// @project      : N/A                                                       //
// @description  : Reference: developers.google.com/discovery/v1/reference   //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 22 Jul 2017                                               //
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

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import URITemplate from 'urijs/src/URITemplate';
import skeemas from 'skeemas';

/* Type Definitions */
import type { Axios } from 'axios';

export type DiscoveryParams = {
  path: string,
  name?: string, // The name of the API. (string)
  version?: string, // The version of the API. (string)
  params: {
    fields?: string, // Selector specifying which fields to include in a partial response.
    preferred?: boolean
  }
};

export type DirectoryItem = {
  discoveryRestUrl: string,
  version: string,
  documentationLink: string
};

const cache = new Map();

export default class ApiDiscovery {
  options: any;
  apiKey: string;
  $http: any = axios.create({
    baseURL: 'https://www.googleapis.com/discovery/v1/apis',
    paramsSerializer: this.serializer,
    params: {
      key: this.apiKey,
      prettyPrint: false,
      alt: 'json',
      fields: null
    }
  });

  constructor(apiKey: string, options: any) {
    this.apiKey = apiKey;
    this.options = options;
    this.$http.interceptors.response.use(response => {
      const { params } = response.config;
      if (!params) {
        return response.data;
      }
      else if (Array.isArray(params.fields) && params.fields.length) {
        console.log('fields skipped');
      } else if (params.fields && params.fields.length) {
        console.log('fields', params.fields.split(','));
      }
      return response.data;
    }, function (error) {
      // Do something with response error
      return Promise.reject(error);
    });
  }

  serializer (params: any)  {
    params = Object.assign({}, params);
    const { fields } = params;
    if (Array.isArray(fields) && fields.length) {
      params.fields = fields.join(',');
    }
    // clean null undefined
    const entries = Object.entries(params).filter(param => param.slice(-1).pop() != null);
    /* $FlowIssue */
    const searchParams: URLSearchParams = new URLSearchParams(entries);
    return searchParams.toString();
  }

  async getDiscoveryService (url?: string) {
    const params = {
      fields: 'basePath,baseUrl,parameters,resources,schemas'
    };
    const service = await this.get('discovery/v1/rest', params);
    const { schemas } = service;
    console.log('getDiscoveryService', service, schemas);
    return service;
  }

  async get (url?: string, params?: any) : any {
    try {
      return await this.$http.get(url, { params })//.then(response => response.data);
    } catch (error) {
      console.error(error);
    }
  }
}

export class GoogleApi<Auth, Options> {
  options: any;
  auth: any;
  $http: any = axios.create({
    baseURL: 'https://www.googleapis.com',
    paramsSerializer: this.serializer,
    params: {
      auth: this.auth
    }
  });

  constructor(auth?: Auth, options?: Options) {
    this.$http.interceptors.response.use(response => {
      const { params } = response.config;
      if (!params) {
        return response.data;
      }
      else if (Array.isArray(params.fields) && params.fields.length) {
        console.log('fields skipped');
      } else if (params.fields && params.fields.length) {
        console.log('fields', params.fields.split(','));
      }
      return response.data;
    }, function (error) {
      // Do something with response error
      return Promise.reject(error);
    });
  }

  serializer (params: any)  {
    params = Object.assign({}, params);
    const { fields } = params;
    if (Array.isArray(fields) && fields.length) {
      params.fields = fields.join(',');
    }
    // clean null undefined
    const entries = Object.entries(params).filter(param => param.slice(-1).pop() != null);
    /* $FlowIssue */
    const searchParams: URLSearchParams = new URLSearchParams(entries);
    return searchParams.toString();
  }

  async get (url?: string, params?: any) : Promise<*> {
    console.log('get', url, params, this.$http.defaults.baseURL);
    try {
      return await this.$http.get(url, { params })//.then(response => response.data);
    } catch (error) {
      console.error(error);
    }
  }
}

type Resource = {
  methods: any
};

export class ApiConsumer {

  options: Object;
  auth: any;
  apiKey: string;
  $http: Axios = axios.create({
    baseURL: 'https://www.googleapis.com',
    params: {
      auth: this.auth
    }
  });
  $resource: any = {};

  constructor(apiKey: string, options: Object, resources: Array<?Resource>) {
    this.apiKey = apiKey;
    const ApiProperties = require('../../schemas/youtube.json');
    this.buildResourceList(ApiProperties.resources);
  }

  buildResourceList (resources: Array<?Resource>) {
    for(let [entity, resource] of Object.entries(resources)) {
      const { methods } = (resource: any);
      this.$resource[entity] = Object.entries(methods).reduce((methods, [ name, config ]) => {
        const { parameters, httpMethod, path } = (config: any);

        /* Get required parameters */
        const $required = Object
        .entries(parameters)
        .filter(([ parameter, options ]) => {
          return (options: any).required;
        });

        /* Get default parameters */
        const $default = Object
        .entries(parameters)
        .filter(([ parameter, options ]) => {
          // return {
          //   [parameter]: (options: any).default || null
          // };
          return (options: any).default;
        })
        .map(([ parameter, options ]) => {
          return {
            [parameter]: (options: any).default
          };
        });

        return Object.assign(methods, {
          [name]: {
            method: httpMethod,
            url: path,
            params: {
              $default,
              $required
            }
          }
        });
      }, {});
    }
    return this.$resource;
  }
}

export type DirectoryList = {
  id: string,
  discoveryVersion?: string,
  items: Array<DirectoryItem>,
  kind: string,
  type: string
};

const SchemaKeys = {
  id: string,
  type: string,
  $ref: string,
  description: string,
  default: string,
  required: boolean,
  format: string,
  pattern: string,
  minimum: string,
  maximum: string,
  enum: Array<string>,
  enumDescriptions: Array<string>,
  repeated: boolean,
  location: string,
  properties: any,
  additionalProperties: any,
  items: any,
  annotations: {
    required: Array<string>,
  }
};

type Schema = $Keys<typeof SchemaKeys>;


/*

Retrieve the list of APIs supported at this endpoint. Try it now.

The discovery.apis.list method returns the list all APIs supported
by the Google APIs Discovery Service. The data for each entry is a subset
of the Discovery Document for that API, and the list provides a directory
of supported APIs.
If a specific API has multiple versions, each of the versions has its own entry in the list.

*/
export class ApiDirectory extends GoogleApi {
  apis: Array<DirectoryItem>;
  discoveryParams: DiscoveryParams = {
    path: '/discovery/{version}/apis',
    version: 'v1',
    params: {
      preferred: true
    }
  };

  constructor(...args: any) {
    super(...args);

    const { path, name, version, params } = this.discoveryParams;
    const template = URITemplate(path);
    const url = template.expand({ version });

    const apiDirectory = this.getApiDirectory(url, params);
  }

  async getApiDirectory (url: string, params?: any) {
    try {
      const result = await this.get(url, params);//.then(response => response.data);
      const schemas = await this.getShemas(result.items.find(item => item.name === 'youtube'));
      console.log('ApiDirectory', schemas);
      return result;
    } catch (error) {
      console.error(error);
    }
  }

  async getShemas (directory: DirectoryItem) : Promise<*> {
    const { discoveryRestUrl } = directory;
    const params = {
      fields: 'schemas'
    };
    try {
      const { schemas } = await this.get(discoveryRestUrl, params);//.then(response => response.data);
      return schemas;
    } catch (error) {
      console.error(error);
    }
  }

  async getParameters (directory: DirectoryItem) {

  }

  async getResources (directory: DirectoryItem) {

  }
}

// const { items } = directory;

// const apis = items
// .filter(item => {
//   return item.preferred
// })
// .reduce((dictionary, item) => {
//   return Object.assign(dictionary, {
//     [item.id]: item
//   });
// }, {});
// console.log('directoryList', apis);
// return apis;


const getApis = function () {
  const apiDirectory: ApiDirectory = new ApiDirectory();
  return apiDirectory;
}

const apiConsumer: ApiConsumer = new ApiConsumer('abc', {}, require('../../schemas/youtube.json').resources);
window.re = apiConsumer;
window.aes = getApis();