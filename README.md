# LoadQueue.js 是一个队列下载工具
## Example

var queue = new LoadQueue();

queue.maxConnections = 1;
queue.add(['imgurl',...]);
queue.on('load', function (e) {
    // console.log('load:', e.detail.src, queue.getLoaded(), queue.getTotal());
}).on('complete', function (e) {
    
}).on('error', function (e) {
    
});
queue.start();

## Documentation

属性:
    maxConnections:Int 同时下载的最大连接数。默认为2。

方法:

    add(source:Object|Array):LoadQueue
        增加要下载的资源。可以是单个资源对象或多个资源的数组。
        parameters
        source:Object|Array — 资源对象或资源对象数组。每个资源对象包含以下属性：
        id - 资源的唯一标识符。可用于从下载队列获取目标资源。
        src - 资源的地址url。
        type - 指定资源的类型。默认会根据资源文件的后缀来自动判断类型，不同的资源类型会使用不同的加载器来加载资源。
        loader - 指定资源的加载器。默认会根据资源类型来自动选择加载器，若指定loader，则会使用指定的loader来加载资源。
        noCache - 指示加载资源时是否增加时间标签以防止缓存。
        size - 资源对象的预计大小。可用于预估下载进度。
        crossOrigin - 是否需要跨域，例如：crossOrigin='anonymous'

    fire(type:String, detail:Object):Boolean
        发送事件。当第一个参数类型为Object时，则把它作为一个整体事件对象。
        parameters
        type:String — 要发送的事件类型。
        detail:Object — 要发送的事件的具体信息，即事件随带参数。
        return
        Boolean — 是否成功调度事件。
    
    get(id:String):Object
        根据id或src地址获取资源对象。
        parameters
        id:String — 指定资源的id或src。
        return
        Object — 资源对象。

    getContent(id:String):Object
        根据id或src地址获取资源内容。
        parameters
        id:String — 指定资源的id或src。
        return
        Object — 资源内容。
    
    getLoaded():Uint
        获取已下载的资源数量。
        return
        Uint — 已下载的资源数量。

    getSize(loaded:Boolean):Number
        获取全部或已下载的资源的字节大小。
        parameters
        loaded:Boolean — 指示是已下载的资源还是全部资源。默认为全部。
        return
        Number — 指定资源的字节大小。

    getTotal():Uint
        获取所有资源的数量。
        return
        Uint — 所有资源的数量。

    off(type:String, listener:Function):Object
        删除一个事件监听。如果不传入任何参数，则删除所有的事件监听；如果不传入第二个参数，则删除指定类型的所有事件监听。
        parameters
        type:String — 要删除监听的事件类型。
        listener:Function — 要删除监听的回调函数。
        return
        Object — 对象本身。链式调用支持。

    on(type:String, listener:Function, once:Boolean):Object
        增加一个事件监听。
        parameters
        type:String — 要监听的事件类型。
        listener:Function — 事件监听回调函数。
        once:Boolean — 是否是一次性监听，即回调函数响应一次后即删除，不再响应。
        return
        Object — 对象本身。链式调用支持。

    start():LoadQueue
        开始下载队列。
        return
        LoadQueue — 下载队列实例本身。

## Thanks

参考自Hilo[@mourner](http://hiloteam.github.io/Hilo/docs/api-zh/index.html)/LoadQueue.