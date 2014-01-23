KISSY.add(function (S, Base) {
	function Loader (config) {
		Loader.superclass.constructor.call(this, config);

		// 参数
		if (!S.isPlainObject(config)) {
			S.error('【Loader】实例化失败（参数错误）');
		} else {
			this.set('config', S.mix(this.get('config'), config, true, undefined, true));
		}

		this._isAMapLoaded = !!window.AMap;
	}

	S.extend(Loader, Base, {
			/**
			 * 请求高德地图脚本
			 * @param {Function} onSuccess 请求成功的回到
			 */
			load: function (onSuccess) {
				var that = this;
				var callbackName = 'mapInit_' + S.guid();
				var AMap = this.get('AMap')

				window[callbackName] = function () {
					var AMap = that.get('AMap');

					if (!AMap) {
						AMap = window.AMap;
						that.set('AMap', AMap);
					}
					if (S.isFunction(onSuccess)) {
						onSuccess(AMap);
					}
				};

				if (!AMap) {
					S.getScript(S.substitute('http://webapi.amap.com/maps?v=1.2&key={key}&callback={callback}', {
						key: this.get('config').key,
						callback: callbackName
					}));
				} else {
					window[callbackName](AMap);
				}
			}
		},
		{
			ATTRS: /** @lends Loader*/{
				/**
				 * 配置参数
				 * @type {Object} config
				 * @type {Object} config.key开发者key
				 */
				config: {
					value: {
						key: ''
					},
					validator: function (value) {
						return S.isPlainObject(value) && S.isString(value.key);
					}
				},
				AMap: {
					value: null
				}
			}
		}
	);

	return Loader;
}, {
	requires: [
		'base'
	]
});