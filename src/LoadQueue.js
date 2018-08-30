/*
 * @Author: qiaer(huangyq2016@139.com)
 * @Create: 2018-08-30 11:46:15
 * @Last Modified by: qiaer
 * @Last Modified time: 2018-08-30 11:49:10
 */

/**
 * @namespace Class是提供类的创建的辅助工具。
 * @static
 * @module /Class
 */
var Class = (function () {

    /**
     * @language=zh
     * 根据参数指定的属性和方法创建类。
     * @param {Object} properties 要创建的类的相关属性和方法。主要有：
     * <ul>
     * <li><b>Extends</b> - 指定要继承的父类。</li>
     * <li><b>Mixes</b> - 指定要混入的成员集合对象。</li>
     * <li><b>Statics</b> - 指定类的静态属性或方法。</li>
     * <li><b>constructor</b> - 指定类的构造函数。</li>
     * <li>其他创建类的成员属性或方法。</li>
     * </ul>
     * @returns {Object} 创建的类。
     */
    var create = function (properties) {
        properties = properties || {};
        var clazz = properties.hasOwnProperty('constructor') ? properties.constructor : function () { };
        implement.call(clazz, properties);
        return clazz;
    };

    /**
     * @language=zh
     * @private
     */
    var implement = function (properties) {
        var proto = {}, key, value;
        for (key in properties) {
            value = properties[key];
            if (classMutators.hasOwnProperty(key)) {
                classMutators[key].call(this, value);
            } else {
                proto[key] = value;
            }
        }

        mix(this.prototype, proto);
    };

    var classMutators = /** @ignore */{
        Extends: function (parent) {
            var existed = this.prototype, proto = createProto(parent.prototype);
            //inherit static properites
            mix(this, parent);
            //keep existed properties
            mix(proto, existed);
            //correct constructor
            proto.constructor = this;
            //prototype chaining
            this.prototype = proto;
            //shortcut to parent's prototype
            this.superclass = parent.prototype;
        },

        Mixes: function (items) {
            items instanceof Array || (items = [items]);
            var proto = this.prototype, item;

            while (item = items.shift()) {
                mix(proto, item.prototype || item);
            }
        },

        Statics: function (properties) {
            mix(this, properties);
        }
    };

    /**
     * @language=zh
     * @private
     */
    var createProto = (function () {
        if (Object.__proto__) {
            return function (proto) {
                return { __proto__: proto };
            };
        } else {
            var Ctor = function () { };
            return function (proto) {
                Ctor.prototype = proto;
                return new Ctor();
            };
        }
    })();

    /**
     * @language=zh
     * 混入属性或方法。
     * @param {Object} target 混入目标对象。
     * @param {Object} source 要混入的属性和方法来源。可支持多个来源参数。
     * @returns {Object} 混入目标对象。
     */
    var mix = function (target) {
        for (var i = 1, len = arguments.length; i < len; i++) {
            var source = arguments[i], defineProps;
            for (var key in source) {
                var prop = source[key];
                if (prop && typeof prop === 'object') {
                    if (prop.value !== undefined || typeof prop.get === 'function' || typeof prop.set === 'function') {
                        defineProps = defineProps || {};
                        defineProps[key] = prop;
                        continue;
                    }
                }
                target[key] = prop;
            }
            if (defineProps) defineProperties(target, defineProps);
        }

        return target;
    };

    var defineProperty, defineProperties;
    try {
        defineProperty = Object.defineProperty;
        defineProperties = Object.defineProperties;
        defineProperty({}, '$', { value: 0 });
    } catch (e) {
        if ('__defineGetter__' in Object) {
            defineProperty = function (obj, prop, desc) {
                if ('value' in desc) obj[prop] = desc.value;
                if ('get' in desc) obj.__defineGetter__(prop, desc.get);
                if ('set' in desc) obj.__defineSetter__(prop, desc.set);
                return obj;
            };
            defineProperties = function (obj, props) {
                for (var prop in props) {
                    if (props.hasOwnProperty(prop)) {
                        defineProperty(obj, prop, props[prop]);
                    }
                }
                return obj;
            };
        }
    }

    return { create: create, mix: mix };

})();


/**
 * @language=zh
 * @class EventMixin是一个包含事件相关功能的mixin。可以通过 Class.mix(target, EventMixin) 来为target增加事件功能。
 * @static
 * @mixin
 * @module /EventMixin
 * @requires /Class
 */
var EventMixin = /** @lends EventMixin# */{
    _listeners: null,

    /**
     * @language=zh
     * 增加一个事件监听。
     * @param {String} type 要监听的事件类型。
     * @param {Function} listener 事件监听回调函数。
     * @param {Boolean} once 是否是一次性监听，即回调函数响应一次后即删除，不再响应。
     * @returns {Object} 对象本身。链式调用支持。
     */
    on: function (type, listener, once) {
        var listeners = (this._listeners = this._listeners || {});
        var eventListeners = (listeners[type] = listeners[type] || []);
        for (var i = 0, len = eventListeners.length; i < len; i++) {
            var el = eventListeners[i];
            if (el.listener === listener) return;
        }
        eventListeners.push({ listener: listener, once: once });
        return this;
    },

    /**
     * @language=zh
     * 删除一个事件监听。如果不传入任何参数，则删除所有的事件监听；如果不传入第二个参数，则删除指定类型的所有事件监听。
     * @param {String} type 要删除监听的事件类型。
     * @param {Function} listener 要删除监听的回调函数。
     * @returns {Object} 对象本身。链式调用支持。
     */
    off: function (type, listener) {
        //remove all event listeners
        if (arguments.length == 0) {
            this._listeners = null;
            return this;
        }

        var eventListeners = this._listeners && this._listeners[type];
        if (eventListeners) {
            //remove event listeners by specified type
            if (arguments.length == 1) {
                delete this._listeners[type];
                return this;
            }

            for (var i = 0, len = eventListeners.length; i < len; i++) {
                var el = eventListeners[i];
                if (el.listener === listener) {
                    eventListeners.splice(i, 1);
                    if (eventListeners.length === 0) delete this._listeners[type];
                    break;
                }
            }
        }
        return this;
    },

    /**
     * @language=zh
     * 发送事件。当第一个参数类型为Object时，则把它作为一个整体事件对象。
     * @param {String} type 要发送的事件类型。
     * @param {Object} detail 要发送的事件的具体信息，即事件随带参数。
     * @returns {Boolean} 是否成功调度事件。
     */
    fire: function (type, detail) {
        var event, eventType;
        if (typeof type === 'string') {
            eventType = type;
        } else {
            event = type;
            eventType = type.type;
        }

        var listeners = this._listeners;
        if (!listeners) return false;

        var eventListeners = listeners[eventType];
        if (eventListeners) {
            var eventListenersCopy = eventListeners.slice(0);
            event = event || new EventObject(eventType, this, detail);
            if (event._stopped) return false;

            for (var i = 0; i < eventListenersCopy.length; i++) {
                var el = eventListenersCopy[i];
                el.listener.call(this, event);
                if (el.once) {
                    var index = eventListeners.indexOf(el);
                    if (index > -1) {
                        eventListeners.splice(index, 1);
                    }
                }
            }

            if (eventListeners.length == 0) delete listeners[eventType];
            return true;
        }
        return false;
    }
};

/**
 * @language=zh
 * 事件对象类。当前仅为内部类，以后有需求的话可能会考虑独立为公开类。
 */
var EventObject = Class.create({
    constructor: function EventObject(type, target, detail) {
        this.type = type;
        this.target = target;
        this.detail = detail;
        this.timeStamp = +new Date();
    },

    type: null,
    target: null,
    detail: null,
    timeStamp: 0,

    stopImmediatePropagation: function () {
        this._stopped = true;
    }
});

//Trick: `stopImmediatePropagation` compatibility
var RawEvent = window.Event;
if (RawEvent) {
    var proto = RawEvent.prototype,
        stop = proto.stopImmediatePropagation;
    proto.stopImmediatePropagation = function () {
        stop && stop.call(this);
        this._stopped = true;
    };
}


/**
 * @language=zh
 * @private
 * @class 图片资源加载器。
 * @module /ImageLoader
 * @requires /Class
 */
var ImageLoader = Class.create({
    load: function (data) {
        var me = this;

        var image = new Image();
        if (data.crossOrigin) {
            image.crossOrigin = data.crossOrigin;
        }

        image.onload = function () {
            me.onLoad(image);
        };
        image.onerror = image.onabort = me.onError.bind(image);
        image.src = data.src + (data.noCache ? (data.src.indexOf('?') == -1 ? '?' : '&') + 't=' + (+new Date()) : '');
    },

    onLoad: function (image) {
        image.onload = image.onerror = image.onabort = null;
        return image;
    },

    onError: function (e) {
        var image = e.target;
        image.onload = image.onerror = image.onabort = null;
        return e;
    }

});


/**
 * @language=zh
 * @private
 * @class javascript或JSONP加载器。
 * @module /ScriptLoader
 * @requires /Class
 */
var ScriptLoader = Class.create({
    load: function (data) {
        var me = this, src = data.src, isJSONP = data.type == 'jsonp';

        if (isJSONP) {
            var callbackName = data.callbackName || 'callback';
            var callback = data.callback || 'jsonp' + (++ScriptLoader._count);
            var win = window;

            if (!win[callback]) {
                win[callback] = function (result) {
                    delete win[callback];
                };
            }

            src += (src.indexOf('?') == -1 ? '?' : '&') + callbackName + '=' + callback;
        }

        if (data.noCache) src += (src.indexOf('?') == -1 ? '?' : '&') + 't=' + (+new Date());

        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.onload = me.onLoad.bind(me);
        script.onerror = me.onError.bind(me);
        script.src = src;
        if (data.id) script.id = data.id;
        document.getElementsByTagName('head')[0].appendChild(script);
    },

    onLoad: function (e) {
        var script = e.target;
        script.onload = script.onerror = null;
        return script;
    },

    onError: function (e) {
        var script = e.target;
        script.onload = script.onerror = null;
        return e;
    },

    Statics: {
        _count: 0
    }

});


//TODO: 超时timeout，失败重连次数maxTries，更多的下载器Loader，队列暂停恢复等。

/**
 * @language=zh
 * @class LoadQueue是一个队列下载工具。
 * @mixes EventMixin
 * @borrows EventMixin#on as #on
 * @borrows EventMixin#off as #off
 * @borrows EventMixin#fire as #fire
 * @param {Object} source 要下载的资源。可以是单个资源对象或多个资源的数组。
 * @module /LoadQueue
 * @requires /Class
 * @requires /EventMixin
 * @requires /ImageLoader
 * @requires /ScriptLoader
 * @property {Int} maxConnections 同时下载的最大连接数。默认为2。
 */
var LoadQueue = Class.create(/** @lends LoadQueue.prototype */{
    Mixes: EventMixin,
    constructor: function(source){
        this._source = [];
        this.add(source);
    },

    maxConnections: 2, //TODO: 应该是每个host的最大连接数。

    _source: null,
    _loaded: 0,
    _connections: 0,
    _currentIndex: -1,

    /**
     * @language=zh
     * 增加要下载的资源。可以是单个资源对象或多个资源的数组。
     * @param {Object|Array} source 资源对象或资源对象数组。每个资源对象包含以下属性：
     * <ul>
     * <li><b>id</b> - 资源的唯一标识符。可用于从下载队列获取目标资源。</li>
     * <li><b>src</b> - 资源的地址url。</li>
     * <li><b>type</b> - 指定资源的类型。默认会根据资源文件的后缀来自动判断类型，不同的资源类型会使用不同的加载器来加载资源。</li>
     * <li><b>loader</b> - 指定资源的加载器。默认会根据资源类型来自动选择加载器，若指定loader，则会使用指定的loader来加载资源。</li>
     * <li><b>noCache</b> - 指示加载资源时是否增加时间标签以防止缓存。</li>
     * <li><b>size</b> - 资源对象的预计大小。可用于预估下载进度。</li>
     * <li><b>crossOrigin</b> - 是否需要跨域，例如：crossOrigin='anonymous'</li>
     * </ul>
     * @returns {LoadQueue} 下载队列实例本身。
     */
    add: function(source){
        var me = this;
        if(source){
            source = source instanceof Array ? source : [source];
            me._source = me._source.concat(source);
        }
        return me;
    },

    /**
     * @language=zh
     * 根据id或src地址获取资源对象。
     * @param {String} id 指定资源的id或src。
     * @returns {Object} 资源对象。
     */
    get: function(id){
        if(id){
            var source = this._source;
            for(var i = 0; i < source.length; i++){
                var item = source[i];
                if(item.id === id || item.src === id){
                    return item;
                }
            }
        }
        return null;
    },

    /**
     * @language=zh
     * 根据id或src地址获取资源内容。
     * @param {String} id 指定资源的id或src。
     * @returns {Object} 资源内容。
     */
    getContent: function(id){
        var item = this.get(id);
        return item && item.content;
    },

    /**
     * @language=zh
     * 开始下载队列。
     * @returns {LoadQueue} 下载队列实例本身。
     */
    start: function(){
        var me = this;
        me._loadNext();
        return me;
    },

    /**
     * @language=zh
     * @private
     */
    _loadNext: function(){
        var me = this, source = me._source, len = source.length;

        //all items loaded
        if(me._loaded >= len){
            me.fire('complete');
            return;
        }

        if(me._currentIndex < len - 1 && me._connections < me.maxConnections){
            var index = ++me._currentIndex;
            var item = source[index];
            var loader = me._getLoader(item);

            if(loader){
                var onLoad = loader.onLoad, onError = loader.onError;

                loader.onLoad = function(e){
                    loader.onLoad = onLoad;
                    loader.onError = onError;
                    var content = onLoad && onLoad.call(loader, e) || e.target;
                    me._onItemLoad(index, content);
                };
                loader.onError = function(e){
                    loader.onLoad = onLoad;
                    loader.onError = onError;
                    onError && onError.call(loader, e);
                    me._onItemError(index, e);
                };
                me._connections++;
            }

            me._loadNext();
            loader && loader.load(item);
        }
    },

    /**
     * @language=zh
     * @private
     */
    _getLoader: function(item){
        var loader = item.loader;
        if(loader) return loader;

        var type = item.type || getExtension(item.src);

        switch(type){
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'gif':
            case 'webp':
                loader = new ImageLoader();
                break;
            case 'js':
            case 'jsonp':
                loader = new ScriptLoader();
                break;
        }

        return loader;
    },

    /**
     * @language=zh
     * @private
     */
    _onItemLoad: function(index, content){
        var me = this, item = me._source[index];
        item.loaded = true;
        item.content = content;
        me._connections--;
        me._loaded++;
        me.fire('load', item);
        me._loadNext();
    },

    /**
     * @language=zh
     * @private
     */
    _onItemError: function(index, e){
        var me = this, item = me._source[index];
        item.error = e;
        me._connections--;
        me._loaded++;
        me.fire('error', item);
        me._loadNext();
    },

    /**
     * @language=zh
     * 获取全部或已下载的资源的字节大小。
     * @param {Boolean} loaded 指示是已下载的资源还是全部资源。默认为全部。
     * @returns {Number} 指定资源的字节大小。
     */
    getSize: function(loaded){
        var size = 0, source = this._source;
        for(var i = 0; i < source.length; i++){
            var item = source[i];
            size += (loaded ? item.loaded && item.size : item.size) || 0;
        }
        return size;
    },

    /**
     * @language=zh
     * 获取已下载的资源数量。
     * @returns {Uint} 已下载的资源数量。
     */
    getLoaded: function(){
        return this._loaded;
    },

    /**
     * @language=zh
     * 获取所有资源的数量。
     * @returns {Uint} 所有资源的数量。
     */
    getTotal: function(){
        return this._source.length;
    }

});

/**
 * @language=zh
 * @private
 */
function getExtension(src){
    var extRegExp = /\/?[^/]+\.(\w+)(\?\S+)?$/i, match, extension;
    if(match = src.match(extRegExp)){
        extension = match[1].toLowerCase();
    }
    return extension || null;
}

module.exports = LoadQueue;