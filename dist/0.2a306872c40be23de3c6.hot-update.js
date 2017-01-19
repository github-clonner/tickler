exports.id = 0;
exports.modules = {

/***/ 603:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module, __dirname) {/* REACT HOT LOADER */ if (true) { (function () { var ReactHotAPI = __webpack_require__(2), RootInstanceProvider = __webpack_require__(10), ReactMount = __webpack_require__(12), React = __webpack_require__(97); module.makeHot = module.hot.data ? module.hot.data.makeHot : ReactHotAPI(function () { return RootInstanceProvider.getRootInstances(ReactMount); }, React); })(); } try { (function () {
	
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _async = __webpack_require__(604);
	
	var _async2 = _interopRequireDefault(_async);
	
	var _axios = __webpack_require__(605);
	
	var _axios2 = _interopRequireDefault(_axios);
	
	var _ytdlCore = __webpack_require__(645);
	
	var _ytdlCore2 = _interopRequireDefault(_ytdlCore);
	
	var _stream = __webpack_require__(589);
	
	var _stream2 = _interopRequireDefault(_stream);
	
	var _fs = __webpack_require__(567);
	
	var _fs2 = _interopRequireDefault(_fs);
	
	var _path = __webpack_require__(546);
	
	var _path2 = _interopRequireDefault(_path);
	
	var _electron = __webpack_require__(556);
	
	var _events = __webpack_require__(576);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var EchoStream = function (_Stream$Writable) {
	  _inherits(EchoStream, _Stream$Writable);
	
	  function EchoStream(options) {
	    _classCallCheck(this, EchoStream);
	
	    var _this = _possibleConstructorReturn(this, (EchoStream.__proto__ || Object.getPrototypeOf(EchoStream)).call(this, options));
	
	    _this.body = new Array();
	    return _this;
	  }
	
	  _createClass(EchoStream, [{
	    key: 'toBuffer',
	    value: function toBuffer() {
	      return Buffer.concat(this.body);
	    }
	  }, {
	    key: 'toBufferX',
	    value: function toBufferX() {
	      var buffers = [];
	      this._writableState.getBuffer().forEach(function (data) {
	        buffers.push(data.chunk);
	      });
	      return Buffer.concat(buffers);
	    }
	  }, {
	    key: 'toArray',
	    value: function toArray() {
	      var buffer = this.toBuffer();
	      return new Uint8Array(buffer);
	    }
	  }, {
	    key: 'toString',
	    value: function toString() {
	      return String.fromCharCode.apply(null, this.toArray());
	    }
	  }, {
	    key: 'end',
	    value: function end(chunk, encoding, callback) {
	      var ret = _stream2.default.Writable.prototype.end.apply(this, arguments);
	      if (!ret) this.emit('finish');
	    }
	  }]);
	
	  return EchoStream;
	}(_stream2.default.Writable);
	
	var YoutubeEvents = function (_EventEmitter) {
	  _inherits(YoutubeEvents, _EventEmitter);
	
	  function YoutubeEvents() {
	    var _ref;
	
	    _classCallCheck(this, YoutubeEvents);
	
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }
	
	    return _possibleConstructorReturn(this, (_ref = YoutubeEvents.__proto__ || Object.getPrototypeOf(YoutubeEvents)).call.apply(_ref, [this].concat(args)));
	  }
	
	  return YoutubeEvents;
	}(_events.EventEmitter);
	
	var Youtube = function () {
	  function Youtube(apiKey) {
	    _classCallCheck(this, Youtube);
	
	    this.apiKey = apiKey || 'AIzaSyAPBCwcnohnbPXScEiVMRM4jYWc43p_CZU';
	    this.axios = _axios2.default.create({
	      baseURL: 'https://www.googleapis.com/youtube/v3',
	      params: {
	        key: this.apiKey
	      }
	    });
	    this.events = new YoutubeEvents();
	  }
	
	  _createClass(Youtube, [{
	    key: 'getVideos',
	    value: function getVideos(ids) {
	      var part = 'id,snippet,contentDetails,player,recordingDetails,statistics,status,topicDetails';
	      var options = {
	        id: ids.join(','),
	        part: part
	      };
	      return this.axios({
	        method: 'GET',
	        url: '/videos',
	        params: options
	      }).then(function (response) {
	        return response.data;
	      });
	    }
	  }, {
	    key: 'getPlayListItems',
	    value: function getPlayListItems(playlistId) {
	      var _this3 = this;
	
	      var part = 'id,snippet,contentDetails';
	      var options = {
	        playlistId: playlistId,
	        part: part,
	        maxResults: 5,
	        pageToken: null
	      };
	      var items = [];
	      var nextPageToken = true;
	      return new Promise(function (resolve, reject) {
	        _async2.default.doWhilst(function (callback) {
	          _this3.axios({
	            method: 'GET',
	            url: '/playlistItems',
	            params: options
	          }).then(function (response) {
	            return callback(null, response.data);
	          }).catch(callback);
	        }, function (list, callback) {
	          items = items.concat(list.items);
	          options.pageToken = list.nextPageToken;
	          return list.nextPageToken;
	        }, function (error, result) {
	          if (error) {
	            return reject(error);
	          } else {
	            return resolve(items);
	          }
	        });
	      });
	    }
	  }, {
	    key: 'downloadVideo',
	    value: function downloadVideo(video) {
	      var _this4 = this;
	
	      var uri = 'http://www.youtube.com/watch?v=' + video.id;
	      var mux = new EchoStream({
	        writable: true
	      });
	      var output = _path2.default.resolve(__dirname, './media/sound.mp4');
	      return new Promise(function (resolve, reject) {
	        var yt = (0, _ytdlCore2.default)(uri).on('finish', function () {
	          console.log('donwload finish !');
	        });
	
	
	        yt.on('response', function (response) {
	          var size = response.headers['content-length'];
	          console.log('size: ', size);
	          yt.pipe(_fs2.default.createWriteStream('./media/sound.mp4'));
	
	          var dataRead = 0;
	          yt.on('data', function (data) {
	            dataRead += data.length;
	            var progress = dataRead / size;
	            _this4.events.emit('progress', progress);
	          });
	        });
	      });
	    }
	  }]);
	
	  return Youtube;
	}();
	
	exports.default = Youtube;
	
	/* REACT HOT LOADER */ }).call(this); } finally { if (true) { (function () { var foundReactClasses = module.hot.data && module.hot.data.foundReactClasses || false; if (module.exports && module.makeHot) { var makeExportsHot = __webpack_require__(559); if (makeExportsHot(module, __webpack_require__(97))) { foundReactClasses = true; } var shouldAcceptModule = true && foundReactClasses; if (shouldAcceptModule) { module.hot.accept(function (err) { if (err) { console.error("Cannot apply hot update to " + "Youtube.js" + ": " + err.message); } }); } } module.hot.dispose(function (data) { data.makeHot = module.makeHot; data.foundReactClasses = foundReactClasses; }); })(); } }
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)(module), "/"))

/***/ }

};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9jbGllbnQvc2NyaXB0cy9saWIvWW91dHViZS5qcz9jMjBjIl0sIm5hbWVzIjpbIkVjaG9TdHJlYW0iLCJvcHRpb25zIiwiYm9keSIsIkFycmF5IiwiQnVmZmVyIiwiY29uY2F0IiwiYnVmZmVycyIsIl93cml0YWJsZVN0YXRlIiwiZ2V0QnVmZmVyIiwiZm9yRWFjaCIsImRhdGEiLCJwdXNoIiwiY2h1bmsiLCJidWZmZXIiLCJ0b0J1ZmZlciIsIlVpbnQ4QXJyYXkiLCJTdHJpbmciLCJmcm9tQ2hhckNvZGUiLCJhcHBseSIsInRvQXJyYXkiLCJlbmNvZGluZyIsImNhbGxiYWNrIiwicmV0IiwiV3JpdGFibGUiLCJwcm90b3R5cGUiLCJlbmQiLCJhcmd1bWVudHMiLCJlbWl0IiwiWW91dHViZUV2ZW50cyIsImFyZ3MiLCJZb3V0dWJlIiwiYXBpS2V5IiwiYXhpb3MiLCJjcmVhdGUiLCJiYXNlVVJMIiwicGFyYW1zIiwia2V5IiwiZXZlbnRzIiwiaWRzIiwicGFydCIsImlkIiwiam9pbiIsIm1ldGhvZCIsInVybCIsInRoZW4iLCJyZXNwb25zZSIsInBsYXlsaXN0SWQiLCJtYXhSZXN1bHRzIiwicGFnZVRva2VuIiwiaXRlbXMiLCJuZXh0UGFnZVRva2VuIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJkb1doaWxzdCIsImNhdGNoIiwibGlzdCIsImVycm9yIiwicmVzdWx0IiwidmlkZW8iLCJ1cmkiLCJtdXgiLCJ3cml0YWJsZSIsIm91dHB1dCIsIl9fZGlybmFtZSIsInl0Iiwib24iLCJjb25zb2xlIiwibG9nIiwic2l6ZSIsImhlYWRlcnMiLCJwaXBlIiwiY3JlYXRlV3JpdGVTdHJlYW0iLCJkYXRhUmVhZCIsImxlbmd0aCIsInByb2dyZXNzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7S0FH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Q0EsaUJBQUlDLFdBQVdGLFdBQVdKLElBQTFCO0FBQ0Esb0JBQUtoQyxNQUFMLENBQVlWLElBQVosQ0FBaUIsVUFBakIsRUFBNkJnRCxRQUE3QjtBQUNELFlBSkQ7QUFLRCxVQVpEO0FBaUJILFFBdENNLENBQVA7QUF1Q0Q7Ozs7OzttQkEzR2tCN0MsTyIsImZpbGUiOiIwLjJhMzA2ODcyYzQwYmUyM2RlM2M2LmhvdC11cGRhdGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgYXN5bmMgZnJvbSAnYXN5bmMnO1xuaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJztcbmltcG9ydCB5dGRsIGZyb20gJ3l0ZGwtY29yZSc7XG5pbXBvcnQgU3RyZWFtIGZyb20gJ3N0cmVhbSc7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQge2lwY1JlbmRlcmVyfSBmcm9tICdlbGVjdHJvbic7XG5pbXBvcnQge0V2ZW50RW1pdHRlcn0gZnJvbSAnZXZlbnRzJztcblxuXG5jbGFzcyBFY2hvU3RyZWFtIGV4dGVuZHMgU3RyZWFtLldyaXRhYmxlIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHN1cGVyKG9wdGlvbnMpO1xuICAgIHRoaXMuYm9keSA9IG5ldyBBcnJheSgpO1xuICB9XG4gIHRvQnVmZmVyICgpIHtcbiAgICByZXR1cm4gQnVmZmVyLmNvbmNhdCh0aGlzLmJvZHkpO1xuICB9XG5cbiAgdG9CdWZmZXJYICgpIHtcbiAgICBsZXQgYnVmZmVycyA9IFtdO1xuICAgIHRoaXMuX3dyaXRhYmxlU3RhdGUuZ2V0QnVmZmVyKCkuZm9yRWFjaChmdW5jdGlvbihkYXRhKSB7XG4gICAgICBidWZmZXJzLnB1c2goZGF0YS5jaHVuayk7XG4gICAgfSk7XG4gICAgcmV0dXJuIEJ1ZmZlci5jb25jYXQoYnVmZmVycyk7XG4gIH1cblxuICB0b0FycmF5ICgpIHtcbiAgICBsZXQgYnVmZmVyID0gdGhpcy50b0J1ZmZlcigpO1xuICAgIHJldHVybiBuZXcgVWludDhBcnJheShidWZmZXIpO1xuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIHRoaXMudG9BcnJheSgpKTtcbiAgfVxuXG4gIGVuZCAoY2h1bmssIGVuY29kaW5nLCBjYWxsYmFjaykge1xuICAgIGxldCByZXQgPSBTdHJlYW0uV3JpdGFibGUucHJvdG90eXBlLmVuZC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmICghcmV0KSB0aGlzLmVtaXQoJ2ZpbmlzaCcpO1xuICB9XG59XG5cbmNsYXNzIFlvdXR1YmVFdmVudHMgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuICBjb25zdHJ1Y3RvciguLi5hcmdzKSB7XG4gICAgc3VwZXIoLi4uYXJncyk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgWW91dHViZSB7XG5cbiAgY29uc3RydWN0b3IoYXBpS2V5KSB7XG4gICAgdGhpcy5hcGlLZXkgPSBhcGlLZXkgfHwgJ0FJemFTeUFQQkN3Y25vaG5iUFhTY0VpVk1STTRqWVdjNDNwX0NaVSc7XG4gICAgdGhpcy5heGlvcyA9IGF4aW9zLmNyZWF0ZSh7XG4gICAgICBiYXNlVVJMOiAnaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20veW91dHViZS92MycsXG4gICAgICBwYXJhbXM6IHtcbiAgICAgICAga2V5OiB0aGlzLmFwaUtleVxuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMuZXZlbnRzID0gbmV3IFlvdXR1YmVFdmVudHMoKTtcbiAgfVxuXG4gIGdldFZpZGVvcyhpZHMpIHtcbiAgICBsZXQgcGFydCA9ICdpZCxzbmlwcGV0LGNvbnRlbnREZXRhaWxzLHBsYXllcixyZWNvcmRpbmdEZXRhaWxzLHN0YXRpc3RpY3Msc3RhdHVzLHRvcGljRGV0YWlscyc7XG4gICAgbGV0IG9wdGlvbnMgPSB7XG4gICAgICBpZDogaWRzLmpvaW4oJywnKSxcbiAgICAgIHBhcnQ6IHBhcnRcbiAgICB9O1xuICAgIHJldHVybiB0aGlzLmF4aW9zKHtcbiAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICB1cmw6ICcvdmlkZW9zJyxcbiAgICAgIHBhcmFtczogb3B0aW9uc1xuICAgIH0pXG4gICAgLnRoZW4ocmVzcG9uc2UgPT4gcmVzcG9uc2UuZGF0YSk7XG4gIH1cblxuICBnZXRQbGF5TGlzdEl0ZW1zKHBsYXlsaXN0SWQpIHtcbiAgICBsZXQgcGFydCA9ICdpZCxzbmlwcGV0LGNvbnRlbnREZXRhaWxzJztcbiAgICBsZXQgb3B0aW9ucyA9IHtcbiAgICAgIHBsYXlsaXN0SWQ6IHBsYXlsaXN0SWQsXG4gICAgICBwYXJ0OiBwYXJ0LFxuICAgICAgbWF4UmVzdWx0czogNSxcbiAgICAgIHBhZ2VUb2tlbjogbnVsbFxuICAgIH07XG4gICAgbGV0IGl0ZW1zID0gW107XG4gICAgbGV0IG5leHRQYWdlVG9rZW4gPSB0cnVlO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBhc3luYy5kb1doaWxzdChjYWxsYmFjayA9PiB7XG4gICAgICAgICB0aGlzLmF4aW9zKHtcbiAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICAgIHVybDogJy9wbGF5bGlzdEl0ZW1zJyxcbiAgICAgICAgICBwYXJhbXM6IG9wdGlvbnNcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsLCByZXNwb25zZS5kYXRhKVxuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goY2FsbGJhY2spO1xuICAgICAgfSwgZnVuY3Rpb24obGlzdCwgY2FsbGJhY2spIHtcbiAgICAgICAgaXRlbXMgPSBpdGVtcy5jb25jYXQobGlzdC5pdGVtcyk7XG4gICAgICAgIG9wdGlvbnMucGFnZVRva2VuID0gbGlzdC5uZXh0UGFnZVRva2VuO1xuICAgICAgICByZXR1cm4gbGlzdC5uZXh0UGFnZVRva2VuO1xuICAgICAgfSwgZnVuY3Rpb24oZXJyb3IsIHJlc3VsdCkge1xuICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0KGVycm9yKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZShpdGVtcylcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSlcbiAgfVxuXG4gIGRvd25sb2FkVmlkZW8odmlkZW8pIHtcbiAgICBsZXQgdXJpID0gYGh0dHA6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj0ke3ZpZGVvLmlkfWBcbiAgICBsZXQgbXV4ID0gbmV3IEVjaG9TdHJlYW0oe1xuICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9KTtcbiAgICB2YXIgb3V0cHV0ID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vbWVkaWEvc291bmQubXA0Jyk7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGxldCB5dCA9IHl0ZGwodXJpLyosIHtcbiAgICAgICAgICBmaWx0ZXI6IGZ1bmN0aW9uKGZvcm1hdCkge1xuICAgICAgICAgICAgcmV0dXJuIGZvcm1hdC5jb250YWluZXIgPT09ICdtcDQnICYmICFmb3JtYXQuZW5jb2Rpbmc7O1xuICAgICAgICAgIH1cbiAgICAgICAgfSovKVxuICAgICAgICAvLyAucGlwZShmcy5jcmVhdGVXcml0ZVN0cmVhbSgnLi9tZWRpYS9zb3VuZC5tcDQnKSlcbiAgICAgICAgLy8gLm9uKCdwcm9ncmVzcycsIHByb2dyZXNzID0+IHtcbiAgICAgICAgLy8gICBjb25zb2xlLmxvZygncHJvZ3Jlc3M6ICcsIHByb2dyZXNzKVxuICAgICAgICAvLyB9KVxuICAgICAgICAub24oJ2ZpbmlzaCcsICgpID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnZG9ud2xvYWQgZmluaXNoICEnKVxuICAgICAgICB9KVxuICAgICAgICAvLyAub24oJ2luZm8nLCBmdW5jdGlvbihpbmZvKSB7XG4gICAgICAgIC8vICAgY29uc29sZS5sb2coJ2luZm8nLCBpbmZvKTtcbiAgICAgICAgLy8gfSlcbiAgICAgICAgLy8gLm9uKCdlcnJvcicsIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgIC8vICAgY29uc29sZS5sb2coJ2Vycm9yOicsIGVycm9yKVxuICAgICAgICAvLyAgIHJldHVybiByZWplY3QoZXJyb3IpO1xuICAgICAgICAvLyB9KTtcblxuICAgICAgICB5dC5vbigncmVzcG9uc2UnLCByZXNwb25zZSA9PiB7XG4gICAgICAgICAgbGV0IHNpemUgPSByZXNwb25zZS5oZWFkZXJzWydjb250ZW50LWxlbmd0aCddO1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdzaXplOiAnLCBzaXplKVxuICAgICAgICAgIHl0LnBpcGUoZnMuY3JlYXRlV3JpdGVTdHJlYW0oJy4vbWVkaWEvc291bmQubXA0JykpO1xuXG4gICAgICAgICAgLy8gS2VlcCB0cmFjayBvZiBwcm9ncmVzcy5cbiAgICAgICAgICBsZXQgZGF0YVJlYWQgPSAwO1xuICAgICAgICAgIHl0Lm9uKCdkYXRhJywgZGF0YSA9PiB7XG4gICAgICAgICAgICBkYXRhUmVhZCArPSBkYXRhLmxlbmd0aDtcbiAgICAgICAgICAgIHZhciBwcm9ncmVzcyA9IGRhdGFSZWFkIC8gc2l6ZTtcbiAgICAgICAgICAgIHRoaXMuZXZlbnRzLmVtaXQoJ3Byb2dyZXNzJywgcHJvZ3Jlc3MpXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8qeXQub24oJ2VuZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdGaW5pc2hlZCcpO1xuICAgICAgICB9KSovXG4gICAgfSlcbiAgfVxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vY2xpZW50L3NjcmlwdHMvbGliL1lvdXR1YmUuanMiXSwic291cmNlUm9vdCI6IiJ9