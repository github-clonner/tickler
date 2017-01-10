webpackHotUpdate(0,{

/***/ 556:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {/* REACT HOT LOADER */ if (true) { (function () { var ReactHotAPI = __webpack_require__(3), RootInstanceProvider = __webpack_require__(11), ReactMount = __webpack_require__(13), React = __webpack_require__(98); module.makeHot = module.hot.data ? module.hot.data.makeHot : ReactHotAPI(function () { return RootInstanceProvider.getRootInstances(ReactMount); }, React); })(); } try { (function () {
	
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _react = __webpack_require__(98);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _howler = __webpack_require__(557);
	
	var _Progress = __webpack_require__(558);
	
	var _Progress2 = _interopRequireDefault(_Progress);
	
	var _player = __webpack_require__(561);
	
	var _player2 = _interopRequireDefault(_player);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var Player = function (_React$Component) {
	  _inherits(Player, _React$Component);
	
	  function Player() {
	    var _ref;
	
	    _classCallCheck(this, Player);
	
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }
	
	    var _this = _possibleConstructorReturn(this, (_ref = Player.__proto__ || Object.getPrototypeOf(Player)).call.apply(_ref, [this].concat(args)));
	
	    _this.state = {
	      isPlaying: false,
	      isPause: false,
	      isLoading: false,
	      currentSongIndex: -1,
	      volume: 0.5,
	      duration: 0,
	      seek: 0
	    };
	
	    _this.howl = new _howler.Howl({
	      src: ['https://upload.wikimedia.org/wikipedia/commons/5/5b/Ludwig_van_Beethoven_-_Symphonie_5_c-moll_-_1._Allegro_con_brio.ogg'],
	      volume: _this.state.volume,
	      onload: _this.initSoundObjectCompleted.bind(_this)
	    });
	    return _this;
	  }
	
	  _createClass(Player, [{
	    key: 'componentWillMount',
	    value: function componentWillMount() {
	      console.log('howler: ', Object.keys(_player2.default));
	    }
	  }, {
	    key: 'componentDidMount',
	    value: function componentDidMount() {}
	  }, {
	    key: 'play',
	    value: function play() {
	      this.setState(function (prevState) {
	        return {
	          isPlaying: !prevState.isPlaying
	        };
	      });
	      if (!this.state.isPlaying) {
	        this.howl.play();
	        this.interval = setInterval(this.updateCurrentDuration.bind(this), 500);
	      } else {
	        this.howl.pause();
	        this.stopUpdateCurrentDuration();
	      }
	    }
	  }, {
	    key: 'updateCurrentDuration',
	    value: function updateCurrentDuration() {
	      this.setState({
	        seek: this.howl.seek()
	      });
	      console.log(this.state);
	    }
	  }, {
	    key: 'stopUpdateCurrentDuration',
	    value: function stopUpdateCurrentDuration() {
	      clearInterval(this.interval);
	    }
	  }, {
	    key: 'initSoundObjectCompleted',
	    value: function initSoundObjectCompleted() {
	      this.setState({
	        duration: this.howl.duration(),
	        isLoading: false
	      });
	    }
	  }, {
	    key: 'stop',
	    value: function stop() {
	      this.setState(function (prevState) {
	        return {
	          isPlaying: false,
	          seek: 0
	        };
	      });
	      this.stopUpdateCurrentDuration();
	      this.howl.stop();
	    }
	  }, {
	    key: 'render',
	    value: function render() {
	      return _react2.default.createElement(
	        'div',
	        { className: 'player' },
	        _react2.default.createElement(
	          'div',
	          { className: 'btn-group' },
	          _react2.default.createElement(
	            'button',
	            { type: 'button', className: 'btn btn-default', onClick: this.play.bind(this) },
	            'Play'
	          ),
	          _react2.default.createElement(
	            'button',
	            { disabled: !this.state.isPlaying, type: 'button', className: 'btn btn-default', onClick: this.stop.bind(this) },
	            'Stop'
	          ),
	          _react2.default.createElement(
	            'button',
	            { type: 'button', className: 'btn btn-default' },
	            'Right'
	          )
	        ),
	        _react2.default.createElement(_Progress2.default, { progress: this.state.seek / this.state.duration * 100 })
	      );
	    }
	  }]);
	
	  return Player;
	}(_react2.default.Component);
	
	exports.default = Player;
	
	/* REACT HOT LOADER */ }).call(this); } finally { if (true) { (function () { var foundReactClasses = module.hot.data && module.hot.data.foundReactClasses || false; if (module.exports && module.makeHot) { var makeExportsHot = __webpack_require__(552); if (makeExportsHot(module, __webpack_require__(98))) { foundReactClasses = true; } var shouldAcceptModule = true && foundReactClasses; if (shouldAcceptModule) { module.hot.accept(function (err) { if (err) { console.error("Cannot apply hot update to " + "Player.jsx" + ": " + err.message); } }); } } module.hot.dispose(function (data) { data.makeHot = module.makeHot; data.foundReactClasses = foundReactClasses; }); })(); } }
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)(module)))

/***/ }

})
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9jbGllbnQvc2NyaXB0cy9jb21wb25lbnRzL1BsYXllci5qc3g/ZjM0NiJdLCJuYW1lcyI6WyJQbGF5ZXIiLCJhcmdzIiwic3RhdGUiLCJpc1BsYXlpbmciLCJpc1BhdXNlIiwiaXNMb2FkaW5nIiwiY3VycmVudFNvbmdJbmRleCIsInZvbHVtZSIsImR1cmF0aW9uIiwic2VlayIsImhvd2wiLCJzcmMiLCJvbmxvYWQiLCJpbml0U291bmRPYmplY3RDb21wbGV0ZWQiLCJiaW5kIiwiY29uc29sZSIsImxvZyIsIk9iamVjdCIsImtleXMiLCJzZXRTdGF0ZSIsInByZXZTdGF0ZSIsInBsYXkiLCJpbnRlcnZhbCIsInNldEludGVydmFsIiwidXBkYXRlQ3VycmVudER1cmF0aW9uIiwicGF1c2UiLCJzdG9wVXBkYXRlQ3VycmVudER1cmF0aW9uIiwiY2xlYXJJbnRlcnZhbCIsInN0b3AiLCJDb21wb25lbnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7O0FBQ0E7O0FBRUE7Ozs7QUFDQTs7Ozs7Ozs7Ozs7O0tBRXFCQSxNOzs7QUFVbkIscUJBQXNCO0FBQUE7O0FBQUE7O0FBQUEsdUNBQU5DLElBQU07QUFBTkEsV0FBTTtBQUFBOztBQUFBLDRJQUNYQSxJQURXOztBQUFBLFdBVHRCQyxLQVNzQixHQVRkO0FBQ05DLGtCQUFXLEtBREw7QUFFTkMsZ0JBQVMsS0FGSDtBQUdOQyxrQkFBVyxLQUhMO0FBSU5DLHlCQUFrQixDQUFDLENBSmI7QUFLTkMsZUFBUSxHQUxGO0FBTU5DLGlCQUFVLENBTko7QUFPTkMsYUFBTTtBQVBBLE1BU2M7O0FBRXBCLFdBQUtDLElBQUwsR0FBWSxpQkFBUztBQUNuQkMsWUFBSyxDQUFDLHlIQUFELENBRGM7QUFFbkJKLGVBQVEsTUFBS0wsS0FBTCxDQUFXSyxNQUZBO0FBR25CSyxlQUFRLE1BQUtDLHdCQUFMLENBQThCQyxJQUE5QjtBQUhXLE1BQVQsQ0FBWjtBQUZvQjtBQVFyQjs7OzswQ0FFcUI7QUFDcEJDLGVBQVFDLEdBQVIsQ0FBWSxVQUFaLEVBQXdCQyxPQUFPQyxJQUFQLGtCQUF4QjtBQUNEOzs7eUNBRW1CLENBRW5COzs7NEJBRU07QUFDTCxZQUFLQyxRQUFMLENBQWM7QUFBQSxnQkFBYztBQUMxQmhCLHNCQUFXLENBQUNpQixVQUFVakI7QUFESSxVQUFkO0FBQUEsUUFBZDtBQUdBLFdBQUcsQ0FBQyxLQUFLRCxLQUFMLENBQVdDLFNBQWYsRUFBMEI7QUFDeEIsY0FBS08sSUFBTCxDQUFVVyxJQUFWO0FBQ0EsY0FBS0MsUUFBTCxHQUFnQkMsWUFBWSxLQUFLQyxxQkFBTCxDQUEyQlYsSUFBM0IsQ0FBZ0MsSUFBaEMsQ0FBWixFQUFtRCxHQUFuRCxDQUFoQjtBQUNELFFBSEQsTUFHTztBQUNMLGNBQUtKLElBQUwsQ0FBVWUsS0FBVjtBQUNBLGNBQUtDLHlCQUFMO0FBQ0Q7QUFDRjs7OzZDQUV3QjtBQUN2QixZQUFLUCxRQUFMLENBQWM7QUFDWlYsZUFBTSxLQUFLQyxJQUFMLENBQVVELElBQVY7QUFETSxRQUFkO0FBR0FNLGVBQVFDLEdBQVIsQ0FBWSxLQUFLZCxLQUFqQjtBQUNEOzs7aURBRTRCO0FBQzNCeUIscUJBQWMsS0FBS0wsUUFBbkI7QUFDRDs7O2dEQUUyQjtBQUMxQixZQUFLSCxRQUFMLENBQWM7QUFDWlgsbUJBQVUsS0FBS0UsSUFBTCxDQUFVRixRQUFWLEVBREU7QUFFWkgsb0JBQVc7QUFGQyxRQUFkO0FBSUQ7Ozs0QkFFTTtBQUNMLFlBQUtjLFFBQUwsQ0FBYztBQUFBLGdCQUFjO0FBQzFCaEIsc0JBQVcsS0FEZTtBQUUxQk0saUJBQU07QUFGb0IsVUFBZDtBQUFBLFFBQWQ7QUFJQSxZQUFLaUIseUJBQUw7QUFDQSxZQUFLaEIsSUFBTCxDQUFVa0IsSUFBVjtBQUNEOzs7OEJBRVM7QUFDUixjQUNFO0FBQUE7QUFBQSxXQUFLLFdBQVUsUUFBZjtBQUNFO0FBQUE7QUFBQSxhQUFLLFdBQVUsV0FBZjtBQUNFO0FBQUE7QUFBQSxlQUFRLE1BQUssUUFBYixFQUFzQixXQUFVLGlCQUFoQyxFQUFrRCxTQUFTLEtBQUtQLElBQUwsQ0FBVVAsSUFBVixDQUFlLElBQWYsQ0FBM0Q7QUFBQTtBQUFBLFlBREY7QUFFRTtBQUFBO0FBQUEsZUFBUSxVQUFVLENBQUMsS0FBS1osS0FBTCxDQUFXQyxTQUE5QixFQUF5QyxNQUFLLFFBQTlDLEVBQXVELFdBQVUsaUJBQWpFLEVBQW1GLFNBQVMsS0FBS3lCLElBQUwsQ0FBVWQsSUFBVixDQUFlLElBQWYsQ0FBNUY7QUFBQTtBQUFBLFlBRkY7QUFHRTtBQUFBO0FBQUEsZUFBUSxNQUFLLFFBQWIsRUFBc0IsV0FBVSxpQkFBaEM7QUFBQTtBQUFBO0FBSEYsVUFERjtBQU1FLDZEQUFVLFVBQVUsS0FBS1osS0FBTCxDQUFXTyxJQUFYLEdBQWtCLEtBQUtQLEtBQUwsQ0FBV00sUUFBN0IsR0FBd0MsR0FBNUQ7QUFORixRQURGO0FBVUQ7Ozs7R0EvRWlDLGdCQUFNcUIsUzs7bUJBQXJCN0IsTSIsImZpbGUiOiIwLjBkYWExZDVhZDdlMGQ4OWE2NGI2LmhvdC11cGRhdGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgSG93bCwgSG93bGVyIH0gZnJvbSAnaG93bGVyJztcblxuaW1wb3J0IFByb2dyZXNzIGZyb20gJy4vUHJvZ3Jlc3MnO1xuaW1wb3J0IHN0eWxlcyBmcm9tICcuLi8uLi9zdHlsZXMvcGxheWVyLmNzcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBsYXllciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHN0YXRlID0ge1xuICAgIGlzUGxheWluZzogZmFsc2UsXG4gICAgaXNQYXVzZTogZmFsc2UsXG4gICAgaXNMb2FkaW5nOiBmYWxzZSxcbiAgICBjdXJyZW50U29uZ0luZGV4OiAtMSxcbiAgICB2b2x1bWU6IDAuNSxcbiAgICBkdXJhdGlvbjogMCxcbiAgICBzZWVrOiAwXG4gIH1cbiAgY29uc3RydWN0b3IgKC4uLmFyZ3MpIHtcbiAgICBzdXBlciguLi5hcmdzKTtcbiAgICB0aGlzLmhvd2wgPSBuZXcgSG93bCh7XG4gICAgICBzcmM6IFsnaHR0cHM6Ly91cGxvYWQud2lraW1lZGlhLm9yZy93aWtpcGVkaWEvY29tbW9ucy81LzViL0x1ZHdpZ192YW5fQmVldGhvdmVuXy1fU3ltcGhvbmllXzVfYy1tb2xsXy1fMS5fQWxsZWdyb19jb25fYnJpby5vZ2cnXSxcbiAgICAgIHZvbHVtZTogdGhpcy5zdGF0ZS52b2x1bWUsXG4gICAgICBvbmxvYWQ6IHRoaXMuaW5pdFNvdW5kT2JqZWN0Q29tcGxldGVkLmJpbmQodGhpcyksXG4gICAgICAvL29uZW5kOiB0aGlzLnBsYXlFbmRcbiAgICB9KTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxNb3VudCAoKSB7XG4gICAgY29uc29sZS5sb2coJ2hvd2xlcjogJywgT2JqZWN0LmtleXMoc3R5bGVzKSk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcblxuICB9XG5cbiAgcGxheSgpIHtcbiAgICB0aGlzLnNldFN0YXRlKHByZXZTdGF0ZSA9PiAoe1xuICAgICAgaXNQbGF5aW5nOiAhcHJldlN0YXRlLmlzUGxheWluZ1xuICAgIH0pKTtcbiAgICBpZighdGhpcy5zdGF0ZS5pc1BsYXlpbmcpIHtcbiAgICAgIHRoaXMuaG93bC5wbGF5KCk7XG4gICAgICB0aGlzLmludGVydmFsID0gc2V0SW50ZXJ2YWwodGhpcy51cGRhdGVDdXJyZW50RHVyYXRpb24uYmluZCh0aGlzKSwgNTAwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5ob3dsLnBhdXNlKCk7XG4gICAgICB0aGlzLnN0b3BVcGRhdGVDdXJyZW50RHVyYXRpb24oKTtcbiAgICB9XG4gIH1cblxuICB1cGRhdGVDdXJyZW50RHVyYXRpb24gKCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgc2VlazogdGhpcy5ob3dsLnNlZWsoKVxuICAgIH0pO1xuICAgIGNvbnNvbGUubG9nKHRoaXMuc3RhdGUpXG4gIH1cblxuICBzdG9wVXBkYXRlQ3VycmVudER1cmF0aW9uICgpIHtcbiAgICBjbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWwpO1xuICB9XG5cbiAgaW5pdFNvdW5kT2JqZWN0Q29tcGxldGVkICgpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGR1cmF0aW9uOiB0aGlzLmhvd2wuZHVyYXRpb24oKSxcbiAgICAgIGlzTG9hZGluZzogZmFsc2VcbiAgICB9KTtcbiAgfVxuXG4gIHN0b3AoKSB7XG4gICAgdGhpcy5zZXRTdGF0ZShwcmV2U3RhdGUgPT4gKHtcbiAgICAgIGlzUGxheWluZzogZmFsc2UsXG4gICAgICBzZWVrOiAwXG4gICAgfSkpO1xuICAgIHRoaXMuc3RvcFVwZGF0ZUN1cnJlbnREdXJhdGlvbigpO1xuICAgIHRoaXMuaG93bC5zdG9wKCk7XG4gIH1cblxuICByZW5kZXIgKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInBsYXllclwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJ0bi1ncm91cFwiPlxuICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImJ0biBidG4tZGVmYXVsdFwiIG9uQ2xpY2s9e3RoaXMucGxheS5iaW5kKHRoaXMpfT5QbGF5PC9idXR0b24+XG4gICAgICAgICAgPGJ1dHRvbiBkaXNhYmxlZD17IXRoaXMuc3RhdGUuaXNQbGF5aW5nfSB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiYnRuIGJ0bi1kZWZhdWx0XCIgb25DbGljaz17dGhpcy5zdG9wLmJpbmQodGhpcyl9PlN0b3A8L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJidG4gYnRuLWRlZmF1bHRcIj5SaWdodDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPFByb2dyZXNzIHByb2dyZXNzPXt0aGlzLnN0YXRlLnNlZWsgLyB0aGlzLnN0YXRlLmR1cmF0aW9uICogMTAwfT48L1Byb2dyZXNzPlxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9jbGllbnQvc2NyaXB0cy9jb21wb25lbnRzL1BsYXllci5qc3giXSwic291cmNlUm9vdCI6IiJ9