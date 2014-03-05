KISSY.add(function (S, Node, Base, Loader) {
        'use strict';

        var IS_GEOLOCATION_SUPPORTED = navigator.geolocation;

		/**
		 * 支持的插件名
		 * @type {Array.<string>}
		 */
		var PLUGINS = [
			'ToolBar',
			'OverView',
			'Scale',
			'MapType'
		];

		function MapWrapper (container, config) {
			MapWrapper.superclass.constructor.call(this, container, config);

			// 参数
			if (container) {
				this.set('containerNode', Node.one(container));
			} else {
				S.error('Map实例化失败：缺少容器');
			}
			if (!S.isPlainObject(config)) {
				S.error('Map实例化失败：参数错误');
			} else {
				this.set('config', S.mix(this.get('config'), config, true, undefined, true));
			}

			this.set('loader', new Loader({
				key: this.get('config').key
			}));

			// 事件监听
			this.on('afterCoordinateChange', function (ev) {
				var marker = this.get('marker');
				var infoWindow;
				var position = MapLocator.lngLatOTC(ev.newVal);

				S.log('[事件]标记位置变更');

				if (!marker) {
					this._initMarker();
				}
				marker = this.get('marker');
				marker.setPosition(position);

				this._initInfoWindow();
				this.get('infoWindow').open(this.get('map'), position);

				this.get('map').setCenter(position);
				this.get('map').setFitView([marker, infoWindow]);
			});

			this.on('map:ready', function (ev) {
				this.set('bounds', this.get('map').getBounds());
			});

		}

		S.extend(MapWrapper, Base, {
				/**
				 * 渲染地图
				 * @param {Object} centerData 中心点数据
				 * @param {string} centerData.address 中心点的地址
				 * @param {number} centerData.lng 中心点经度
				 * @param {number} centerData.lat 中心点纬度
				 * @param {number} centerData.level 缩放级别
                 * @param {Object} centerData.geolocation geolocation定位参数
				 */
				render: function (centerData) {
					var that = this;
					var callbackName = 'mapInit_' + this.get('id') + '_' + S.guid();

					window[callbackName] = function () {
                        if (!this.get('namespace')) {
                            this.set('namespace', window.AMap);
                        }
						that._init(centerData);
					};

					if (!window.AMap) {
						S.getScript(S.substitute('http://webapi.amap.com/maps?v=1.2&key={key}&callback={callback}', {
							key: this.get('config').key,
							callback: callbackName
						}));
					} else {
						window[callbackName]();
					}
				},
				/**
				 * 初始化
				 * @private
				 * @param {Object} centerData 中心点数据
				 * @param {string} centerData.address 中心点的地址
				 * @param {number} centerData.lng 中心点经度
				 * @param {number} centerData.lat 中心点纬度
				 * @param {number} centerData.level 缩放级别
				 * @param {Object} centerData.geolocation geolocation定位参数
				 */
				_init: function (centerData) {
					var that = this;
					var map = this.get('map');
					var config = that.get('config');
					var options = config.map;
					var AMap = this.get('namespace');

					if (map) {
						that.clear();
					}

					if (options && S.isPlainObject(options.center) && S.isNumber(options.center.lat) && S.isNumber(options.center.lng)) {
						options.center = new AMap.LngLat(options.center.lng, options.center.lat);
					}
					if (options && S.isPlainObject(options.tileLayer)) {
						options.tileLayer = new AMap.TileLayer(options.tileLayer);
					}
					map = new AMap.Map(that.get('containerNode').getDOMNode(), options);

                    this.set('map', map);

					this.addListener('complete', function (ev) {

						if (centerData && S.isNumber(centerData.lng) && S.isNumber(centerData.lat)) {
							// 使用经纬度初始化地图中心位置
                            if (S.isNumber(centerData.level)) {
							    map.setZoomAndCenter(centerData.level, new AMap.LngLat(centerData.lng, centerData.lat));
                            } else {
							    map.setCenter(new AMap.LngLat(centerData.lng, centerData.lat));
                            }
							that.fire('map:ready');
						} else if (centerData && centerData.address) {
							// 使用地址初始化地图中心位置
							that.locateByAddress(centerData.address, function () {
								that.fire('map:ready');
							});
						} else if (IS_GEOLOCATION_SUPPORTED) {
                            // 使用HTML Geolocation API定位
                            that._locateByGeolocation(centerData.geolocation);
						} else {
							// ip定位

						}

						that.fire('map:load', {
							eventData: ev
						});
					});



					that._initPlugin();


				},
				/**
				 * 初始化插件
				 * @private
				 */
				_initPlugin: function () {
					var that = this;
					var map = this.get('map');
					var config = this.get('config');
					var AMap = window.AMap;
					var pluginNameArr = [];

					if (S.isObject(config.plugins)) {
						S.each(config.plugins, function (pluginData, pluginName) {
							if (S.inArray(pluginName, PLUGINS) && pluginData) {
								pluginNameArr.push(pluginName);
							}
						});

						map.plugin(S.map(pluginNameArr, function (pluginName) {
							return 'AMap.' + pluginName;
						}), function () {
							S.each(pluginNameArr, function (pluginName) {
                                var pluginData = that._processPluginData(pluginName, config.plugins[pluginName]);

								var plugin = new AMap[pluginName](pluginData);

								map.addControl(plugin);

								that.addAttr(pluginName, {
									value: plugin
								});
							});

							that.fire('plugin:ready');
						});
					}
				},
                _processPluginData: function (pluginName, pluginData) {
                    var data;
                    var AMap = this.get('AMap');

                    if (pluginData === true) {
                        pluginData = {};
                    }

                    if (pluginName == 'ToolBar') {
                        data = S.mix({}, pluginData);
                        if (S.isArray(data.offset)) {
                            data.offset = new AMap.Pixel(data.offset[0], data.offset[1]);
                        }
                    } else if (pluginName == 'MapType') {
                        data = S.mix({}, pluginData);
                        if (S.isArray(data.offset)) {
                            data.offset = new AMap.Pixel(data.offset[0], data.offset[1]);
                        }
                    } else {
                        data = pluginData;
                    }

                    return data;
                },
				/**
				 * 根据给定的地址进行定位
				 * @param {string} address 地址
				 * @param {Function} callback 回调
				 */
				locateByAddress: function (address, callback) {
					var that = this;
					var AMap = window.AMap;

					address = S.trim(address);

					if (AMap && S.isString(address) && address != '') {
						S.log(S.substitute('Map通过地址定位：{address}', {
							address: address
						}));
						that._addressToLatLng(address, function (result) {
							var location = result.geocodes[0].location;
							var lngLat = new AMap.LngLat(location.lng, location.lat);

							S.log(S.substitute('Map得到坐标：{lng},{lat}', {
								lng: location.lng,
								lat: location.lat
							}));
						});
					}
				},
                _locateByGeolocation: function (geolocationConfig) {
                    var that = this;

                    this.plugin(['AMap.Geolocation'], function () {
                        geolocationConfig = S.mix(this.get('config').geolocation, centerData.geolocationConfig);

                        var geolocation = new AMap.Geolocation(geolocationConfig);

                        that.addAttr('geolocation', {
                            value: geolocation
                        });

                        AMap.event.addListener(geolocation, 'complete', function(result) {
                            S.log(S.substitute('定位结果：{lng}，{lat}', result.lngLat));
                            S.log(S.substitute('精度范围：{accuracy}', result));
                            S.log(S.substitute('{foo}经过坐标纠偏', {
                                foo: result.isConverted ? '' : '没有'
                            }));
                            if (result.isConverted && result.info == 'CONVERT_FAILED') {
                                S.log('坐标纠偏失败');
                            }
                            if (!geolocationConfig.panToLocation) {
                                that.get('map').getCenter(result.lngLat);
                            }
                        });

                        AMap.event.addListener(geolocation, 'error', function (error) {
                            S.log(S.substitute('定位失败：{info}', error));
                            that._locateByIP();
                        });

                        geolocation.getCurrentPosition();
                    });
                },
                _locateByIP: function () {
                    map.plugin(['AMap.CitySearch'], function () {
                        var citySearch = new AMap.CitySearch();

                        AMap.event.addListener(citySearch, 'complete', function (citySearchResult) {
                            if (citySearchResult.info != 'NO_DATA') {
                                map.setBounds(citySearchResult.bounds);
                            }
                            that.fire('map:ready')
                        });

                        AMap.event.addListener(citySearch, 'error', function (errorStatus) {
                            // todo 错误处理
                            S.error(S.substitute('Map插件CitySearch请求失败：{type},{info}', errorStatus));
                        });

                        citySearch.getLocalCity();

                        that.addAttr('citySearch', {
                            value: citySearch
                        });
                    });
                },
				/**
				 * 将地址转化位坐标
				 * @param {string} address 地址
				 * @param {Function} callback 回调
				 * @private
				 */
				_addressToLatLng: function (address, callback) {
					var that = this;
					var geocoder;
					var AMap = window.AMap;

					function getLocation () {
						geocoder.getLocation(encodeURIComponent(address));
					}

					geocoder = that.get('geocoder');
					if (!geocoder) {
						that.get('map').plugin(['AMap.Geocoder'], function () {
							geocoder = new AMap.Geocoder();

							AMap.event.addListener(geocoder, 'complete', function (result) {
								S.isFunction(callback) && callback(result);
							});

							getLocation();

							that.addAttr('geocoder', {
								value: geocoder
							});
						});
					} else {
						getLocation();
					}
				},
				/**
				 * 销毁地图
				 * @private
				 */
				clear: function () {
					this.get('map').destroy();
					this.set('map', null);
					this.get('containerNode').html('');
				},
				restore: function () {
					this.get('map').setBounds(this.get('bounds'));
				},
                /**
                 * 为map对象添加事件，实际上就是AMap.event.addListener(mapObj, eventName, eventHandler)
                 * @param {string} eventName
                 * @param {Function} eventHandler
                 */
                addListener: function (eventName, eventHandler) {
                    this.get('namespace').event.addListener(this.get('map'), eventName, eventHandler);
                },
                /**
                 * 加载组件
                 * @param {string | Array.<string>} plugins
                 * @param {Function} callback
                 */
                plugin: function (plugins, callback) {
                    var AMap = this.get('namespace');
                    var pluginNameArr = [];

                    if (S.isString(plugins)) {
                        plugins = [plugins];
                    }
                    if (S.isArray(plugins)) {
                        S.each(plugins, function (pluginName) {
                            var arr = pluginName.match(/^(.*)\.(.*)$/);

                            if (S.isArray(arr) && arr.length == 3) {
                                if (!AMap[arr[2]]) {
                                    pluginNameArr.push(arr[2]);
                                }
                            }
                        });
                    }

                    this.get('map').plugin(pluginNameArr, callback);
                }
			},
			{
				ATTRS: /** @lends MapLocator*/{
                    /**
                     * id
                     * @type {string}
                     */
                    id: {
                        value: S.guid()
                    },
                    /**
					 * 地图容器
					 * @type {Node}
					 */
					containerNode: {
						value: null
					},
					/**
					 * 地图
					 * @type {AMap.Map}
					 */
					map: {
						value: null
					},
					bounds: {
						value: null
					},
					/**
					 * 地图参数
					 * @type {Object} config
					 * @type {Object} config.map 地图的配置参数，见[官方文档](http://api.amap.com/javascript/reference/map#MapOption)，其中依赖于AMap数据类型的参数需要传入javascript的数据类型
					 * @type {Object} config.map.center
					 * @type {number} config.map.center.lat
					 * @type {number} config.map.center.lng
					 * @type {Object} config.map.tileLayer
					 * @type {Array.<Object.<string, (boolean|Object)>} config.plugins
					 */
					config: {
						value: {
							map: {
								level: 15
							},
							key: '',
							plugins: {},
                            geolocation: {
                                timeout: 5000,
                                showButton: false,
                                showMarker: false,
                                showCircle: false
                            }
						}
					},
					loader: {
						value: null
					},
                    namespace: {
                        value: null
                    }
				},
				/**
				 * 将阿里云地图的经纬度对象转化为经纬度数据对象
				 * @param {AMap.LngLat} lngLat
				 * @returns {{lat: number, lng: number}}
				 */
				convertCoordinateToObj: function (lngLat) {
					return {
						lat: lngLat.getLat(),
						lng: lngLat.getLng()
					}
				},
				/**
				 * 将经纬度数据对象转化为阿里云地图的经纬度对象
				 * @param {Object} lngLat
				 * @param {number} lngLat.lat
				 * @param {number} lngLat.lng
				 * @desc 上下文中需要有AMap.LngLat类
				 * @returns {AMap.LngLat}
				 */
				convertObjToCoordinate: function (lngLat) {
					var re;
					try {
						re = new AMap.LngLat(lngLat.lng, lngLat.lat);
					} catch (e) {
						S.error('实例化AMap.LngLat失败：' + e.msg);
					}

					return re;
				}
			}
		);

		return MapWrapper;
	},
	{
		requires: [
			'node',
			'base',
			'./loader'
		]
	}
);