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
import jsonata from 'jsonata';
import skeemas from 'skeemas';

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

  async list () {
    const directory = await this.get();
    const { items } = directory;
    console.log('directoryList', items);
    return items;
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

  constructor(auth: Auth, options: Options) {
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


  async list () : any {
    const directory = await this.get();
    const { items } = directory;
    console.log('directoryList', items);
    return items;
  }

  async get (url?: string, params?: any) : any {
    try {
      return await this.$http.get(url, { params })//.then(response => response.data);
    } catch (error) {
      console.error(error);
    }
  }
}
