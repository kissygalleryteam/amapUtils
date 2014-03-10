/*!build time : 2014-03-07 5:40:06 PM*/
KISSY.add("gallery/amapUtils/1.0/loader",function(a,b){function c(b){c.superclass.constructor.call(this,b),a.isPlainObject(b)?a.isString(b.key)&&""!=b.key?this.set("config",a.mix(this.get("config"),b,!0,void 0,!0)):a.error("\u3010Amap.Loader\u3011\u5b9e\u4f8b\u5316\u5931\u8d25\uff08key\u65e0\u6548\uff09"):a.error("\u3010Amap.Loader\u3011\u5b9e\u4f8b\u5316\u5931\u8d25\uff08\u53c2\u6570\u9519\u8bef\uff09")}return a.extend(c,b,{load:function(b){var c=this,d="mapInit_"+this.get("id")+"_"+a.guid(),e=window.AMap;window[d]=function(){c.set("namespace",window.AMap),a.isFunction(b)&&b()},e?window[d](e):a.getScript(a.substitute("http://webapi.amap.com/maps?v=1.2&key={key}&callback={callback}",{key:this.get("config").key,callback:d}))}},{ATTRS:{config:{value:{key:""},validator:function(b){return a.isPlainObject(b)&&a.isString(b.key)}},namespace:{value:null},id:{value:a.guid(),validator:function(){return!1}}}}),c},{requires:["base"]}),KISSY.add("gallery/amapUtils/1.0/mapWrapper",function(a,b,c,d){"use strict";function e(c,f){e.superclass.constructor.call(this,c,f),c?this.set("container",b.one(c)):a.error("Map\u5b9e\u4f8b\u5316\u5931\u8d25\uff1a\u7f3a\u5c11\u5bb9\u5668"),a.isPlainObject(f)?this.set("config",a.mix(this.get("config"),f,!0,void 0,!0)):a.error("Map\u5b9e\u4f8b\u5316\u5931\u8d25\uff1a\u53c2\u6570\u9519\u8bef"),this.set("loader",new d({key:this.get("config").key})),this.on("afterCoordinateChange",function(b){var c,d=this.get("marker"),e=MapLocator.lngLatOTC(b.newVal);a.log("[\u4e8b\u4ef6]\u6807\u8bb0\u4f4d\u7f6e\u53d8\u66f4"),d||this._initMarker(),d=this.get("marker"),d.setPosition(e),this._initInfoWindow(),this.get("infoWindow").open(this.get("map"),e),this.get("map").setCenter(e),this.get("map").setFitView([d,c])}),this.on("map:ready",function(){this.set("bounds",this.get("map").getBounds())})}var f=navigator.geolocation,g=["ToolBar","OverView","Scale","MapType"];return a.extend(e,c,{render:function(a){var b=this,c=this.get("loader");c.load(function(){b.set("namespace",c.get("namespace")),b._init(a)})},_init:function(b){var c=this,d=this.get("map"),e=c.get("config"),g=e.map,h=this.get("namespace");d&&c.clear(),g&&a.isPlainObject(g.center)&&a.isNumber(g.center.lat)&&a.isNumber(g.center.lng)&&(g.center=new h.LngLat(g.center.lng,g.center.lat)),g&&a.isPlainObject(g.tileLayer)&&(g.tileLayer=new h.TileLayer(g.tileLayer)),d=new h.Map(c.get("container").getDOMNode(),g),this.set("map",d),this.addListener("complete",function(e){b&&a.isNumber(b.lng)&&a.isNumber(b.lat)?(a.isNumber(b.level)?d.setZoomAndCenter(b.level,new h.LngLat(b.lng,b.lat)):d.setCenter(new h.LngLat(b.lng,b.lat)),c.fire("map:ready")):b&&b.address?c.locateByAddress(b.address,function(){c.fire("map:ready")}):f&&c._locateByGeolocation(b.geolocation),c.fire("map:load",{eventData:e})}),c._initPlugin()},_initPlugin:function(){var b=this,c=this.get("map"),d=this.get("config"),e=window.AMap,f=[];a.isObject(d.plugins)&&(a.each(d.plugins,function(b,c){a.inArray(c,g)&&b&&f.push(c)}),c.plugin(a.map(f,function(a){return"AMap."+a}),function(){a.each(f,function(a){var f=b._processPluginData(a,d.plugins[a]),g=new e[a](f);c.addControl(g),b.addAttr(a,{value:g})}),b.fire("plugin:ready")}))},_processPluginData:function(b,c){var d,e=this.get("AMap");return c===!0&&(c={}),"ToolBar"==b?(d=a.mix({},c),a.isArray(d.offset)&&(d.offset=new e.Pixel(d.offset[0],d.offset[1]))):"MapType"==b?(d=a.mix({},c),a.isArray(d.offset)&&(d.offset=new e.Pixel(d.offset[0],d.offset[1]))):d=c,d},locateByAddress:function(b){var c=this,d=window.AMap;b=a.trim(b),d&&a.isString(b)&&""!=b&&(a.log(a.substitute("Map\u901a\u8fc7\u5730\u5740\u5b9a\u4f4d\uff1a{address}",{address:b})),c._addressToLatLng(b,function(b){{var c=b.geocodes[0].location;new d.LngLat(c.lng,c.lat)}a.log(a.substitute("Map\u5f97\u5230\u5750\u6807\uff1a{lng},{lat}",{lng:c.lng,lat:c.lat}))}))},_locateByGeolocation:function(b){var c=this;this.plugin(["AMap.Geolocation"],function(){b=a.mix(this.get("config").geolocation,centerData.geolocationConfig);var d=new AMap.Geolocation(b);c.addAttr("geolocation",{value:d}),AMap.event.addListener(d,"complete",function(d){a.log(a.substitute("\u5b9a\u4f4d\u7ed3\u679c\uff1a{lng}\uff0c{lat}",d.lngLat)),a.log(a.substitute("\u7cbe\u5ea6\u8303\u56f4\uff1a{accuracy}",d)),a.log(a.substitute("{foo}\u7ecf\u8fc7\u5750\u6807\u7ea0\u504f",{foo:d.isConverted?"":"\u6ca1\u6709"})),d.isConverted&&"CONVERT_FAILED"==d.info&&a.log("\u5750\u6807\u7ea0\u504f\u5931\u8d25"),b.panToLocation||c.get("map").getCenter(d.lngLat)}),AMap.event.addListener(d,"error",function(b){a.log(a.substitute("\u5b9a\u4f4d\u5931\u8d25\uff1a{info}",b)),c._locateByIP()}),d.getCurrentPosition()})},_locateByIP:function(){map.plugin(["AMap.CitySearch"],function(){var b=new AMap.CitySearch;AMap.event.addListener(b,"complete",function(a){"NO_DATA"!=a.info&&map.setBounds(a.bounds),that.fire("map:ready")}),AMap.event.addListener(b,"error",function(b){a.error(a.substitute("Map\u63d2\u4ef6CitySearch\u8bf7\u6c42\u5931\u8d25\uff1a{type},{info}",b))}),b.getLocalCity(),that.addAttr("citySearch",{value:b})})},_addressToLatLng:function(b,c){function d(){e.getLocation(encodeURIComponent(b))}var e,f=this,g=window.AMap;e=f.get("geocoder"),e?d():f.get("map").plugin(["AMap.Geocoder"],function(){e=new g.Geocoder,g.event.addListener(e,"complete",function(b){a.isFunction(c)&&c(b)}),d(),f.addAttr("geocoder",{value:e})})},clear:function(){this.get("map").destroy(),this.set("map",null),this.get("container").html("")},restore:function(){this.get("map").setBounds(this.get("bounds"))},addListener:function(a,b){this.get("namespace").event.addListener(this.get("map"),a,b)},plugin:function(b,c){var d=this.get("namespace"),e=[];a.isString(b)&&(b=[b]),a.isArray(b)&&a.each(b,function(b){var c=b.match(/^(.*)\.(.*)$/);a.isArray(c)&&3==c.length&&(d[c[2]]||e.push(c[2]))}),this.get("map").plugin(e,c)}},{ATTRS:{id:{value:a.guid()},container:{value:null},map:{value:null},bounds:{value:null},config:{value:{map:{level:15},key:"",plugins:{},geolocation:{timeout:5e3,showButton:!1,showMarker:!1,showCircle:!1}}},loader:{value:null},namespace:{value:null}},convertCoordinateToObj:function(a){return{lat:a.getLat(),lng:a.getLng()}},convertObjToCoordinate:function(b){var c;try{c=new AMap.LngLat(b.lng,b.lat)}catch(d){a.error("\u5b9e\u4f8b\u5316AMap.LngLat\u5931\u8d25\uff1a"+d.msg)}return c}}),e},{requires:["node","base","./loader"]}),KISSY.add("gallery/amapUtils/1.0/index",function(a,b,c){return{Loader:b,MapWrapper:c}},{requires:["./loader","./mapWrapper"]});