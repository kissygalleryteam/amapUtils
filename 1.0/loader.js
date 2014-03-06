KISSY.add(function (S, Base) {
	function Loader (config) {
		Loader.superclass.constructor.call(this, config);

		if (!S.isPlainObject(config)) {
			S.error('【Amap.Loader】实例化失败（参数错误）');
		} else if (!S.isString(config.key) || config.key == '') {
            S.error('【Amap.Loader】实例化失败（key无效）');
        } else {
			this.set('config', S.mix(this.get('config'), config, true, undefined, true));
		}
	}

	S.extend(Loader, Base, {
			/**
			 * 加载高德地图脚本
			 * @param {Function} onSuccess 请求成功的回到
			 */
			load: function (onSuccess) {
				var that = this;
				var callbackName = 'mapInit_' + this.get('id') + '_' + S.guid();
                var AMap = window.AMap;

				window[callbackName] = function () {
					that.set('namespace', window.AMap);

					if (S.isFunction(onSuccess)) {
						onSuccess();
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
				 * @type {Object} config.key 开发者key
				 */
				config: {
					value: {
						key: ''
					},
					validator: function (value) {
						return S.isPlainObject(value) && S.isString(value.key);
					}
				},
				namespace: {
					value: null
				},
                id: {
                    value: S.guid(),
                    validator: function () {
                        return false;
                    }
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