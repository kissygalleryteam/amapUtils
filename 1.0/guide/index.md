## 综述

AmapUtils是针对基于高德API的二次开发的辅助工具集合：

1. AmapUtils.Loader， 对核心脚本异步加载的封装；
2. AmapUtils.MapWrapper，简化了地图对象的初始化，选择性的提供地图方法调用的快捷方式。

* 版本：1.0
* 作者：牧云
* demo：[http://gallery.kissyui.com/amapUtils/1.0/demo/index.html](http://gallery.kissyui.com/amapUtils/1.0/demo/index.html)

## 初始化组件

### Loader

    S.use('gallery/amapUtils/1.0/loader', function (S, loader) {
         var loader = new loader({
            key: ''
         });

         loader.load(function () {
            // your code
         });
    })

### MapWrapper

    S.use('gallery/amapUtils/1.0/mapWrapper', function (S, MapWrapper) {
         var mapWrapper = new MapWrapper('#map-container', {
            key: '',
            map: {},
            plugins: {}
         });

         mapWrapper.on('ready', function () {
            // your code
         });
    })

## API说明

### AmapUtils.Loader

#### Constructor

@param {Object} config
@param {string} config.key 开发者key

#### Methods

##### load

加载地图脚本

@param {Function} 调用成功的回调函数

#### Attributes

##### config

@type {Object} 配置参数


##### id

@type {string} 标识

##### namespace

@type {Object} AMap对象

### AmapUtils.MapWrapper

选择以下任一方式初始化地图：

* 在config.map中设置level，在render的时候传入中心经纬度；
* 在render的时候传入地址；
* 在render的时候指定geolocation。

否则默认会通过IP定位。

#### Constructor

@param {string | DOMNode | KISSY-Node} mapContainer 地图容器
@param {Object} config 配置
@param {Object} config.key 开发者key
@param {Object} config.map 地图配置
@param {Object} config.plugins 插件配置

#### Methods

##### render

渲染地图

@param {Object} centerData 中心配置

##### addListener

为地图添加事件监听

@param {string} eventName
@param {Function} eventHandler

##### plugin

调用插件

@param {string | Array.<string>} plugins 插件名
@param {Function} callback 调用成功后的回调

#### Attributes

##### container

@type {KISSY-Node} 地图容器

##### id

@type {string} 标识

##### map

@type {AMap.Map} 地图对象

##### config

@type {Object} 配置参数

#### Events

##### complete

地图加载完成

##### ready

初始化完成

##### plugin:ready

插件加载完成