<a name="GctNative"></a>

## GctNative
GctNative类，用于定义应用与基座的交互Api

**Kind**: global class  

* [GctNative](#GctNative)
    * [.open(config)](#GctNative.open)
    * [.reload(config)](#GctNative.reload)
    * [.chooseImage(config)](#GctNative.chooseImage)
    * [.chooseVideo(config)](#GctNative.chooseVideo)
    * [.chooseFile(config)](#GctNative.chooseFile)
    * [.upload(config)](#GctNative.upload)
    * [.download(config)](#GctNative.download)
    * [.readFile(config)](#GctNative.readFile)
    * [.sqliteExecute(config)](#GctNative.sqliteExecute)
    * [.scanCode(config)](#GctNative.scanCode)
    * [.mqttSubscribe(config)](#GctNative.mqttSubscribe)
    * [.mqttUnsubscribe(config)](#GctNative.mqttUnsubscribe)
    * [.onMqttMessage()](#GctNative.onMqttMessage)
    * [.updateNative(config)](#GctNative.updateNative)
    * [.updateApp(config)](#GctNative.updateApp)
    * [.getLang(config)](#GctNative.getLang)
    * [.getLocation(config)](#GctNative.getLocation)
    * [.onNotifyClick()](#GctNative.onNotifyClick)

<a name="GctNative.open"></a>

### GctNative.open(config)
开启webview页面，并打开指定文件

**Kind**: static method of [<code>GctNative</code>](#GctNative)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> |  |
| config.path | <code>string</code> | 静态资源地址 |
| [config.success] | <code>function</code> | 执行成功的回调 |
| [config.fail] | <code>function</code> | 执行失败的回调 |
| [config.complete] | <code>function</code> | 执行完成的回调 |

**Example**  
```js
dsbridge.call("openWebview", config);
```
<a name="GctNative.reload"></a>

### GctNative.reload(config)
重新加载webview页面

**Kind**: static method of [<code>GctNative</code>](#GctNative)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> |  |
| config.path | <code>string</code> | 静态资源地址 |
| [config.success] | <code>function</code> | 执行成功的回调 |
| [config.fail] | <code>function</code> | 执行失败的回调 |
| [config.complete] | <code>function</code> | 执行完成的回调 |

**Example**  
```js
dsbridge.call("reload", config);
```
<a name="GctNative.chooseImage"></a>

### GctNative.chooseImage(config)
图片选择接口

**Kind**: static method of [<code>GctNative</code>](#GctNative)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| config | <code>Object</code> |  |  |
| [config.count] | <code>number</code> | <code>1</code> | 最多可以选择的图片张数 |
| [config.sizeType] | <code>string</code> | <code>&quot;original&quot;</code> | 尺寸，original原图、compressed压缩图 |
| [config.sourceType] | <code>string</code> | <code>&quot;album&quot;</code> | 来源，album相册、camera相机 |
| [config.success] | <code>function</code> |  | 执行成功的回调 |
| [config.fail] | <code>function</code> |  | 执行失败的回调 |
| [config.complete] | <code>function</code> |  | 执行完成的回调 |

**Example**  
```js
dsbridge.call("chooseImage", config);
```
<a name="GctNative.chooseVideo"></a>

### GctNative.chooseVideo(config)
视频选择接口

**Kind**: static method of [<code>GctNative</code>](#GctNative)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| config | <code>Object</code> |  |  |
| [config.sourceType] | <code>string</code> | <code>&quot;album&quot;</code> | 来源，album相册、camera相机 |
| [config.maxDuration] | <code>number</code> | <code>60</code> | 最长拍摄时间，单位秒 |
| [config.success] | <code>function</code> |  | 执行成功的回调 |
| [config.fail] | <code>function</code> |  | 执行失败的回调 |
| [config.complete] | <code>function</code> |  | 执行完成的回调 |

**Example**  
```js
dsbridge.call("chooseVideo", config);
```
<a name="GctNative.chooseFile"></a>

### GctNative.chooseFile(config)
文件选择接口

**Kind**: static method of [<code>GctNative</code>](#GctNative)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| config | <code>Object</code> |  |  |
| [config.count] | <code>number</code> | <code>1</code> | 最多可选文件数量 |
| [config.ext] | <code>Array</code> |  | 根据文件扩展名过滤，默认不过滤 |
| [config.success] | <code>function</code> |  | 执行成功的回调 |
| [config.fail] | <code>function</code> |  | 执行失败的回调 |
| [config.complete] | <code>function</code> |  | 执行完成的回调 |

**Example**  
```js
dsbridge.call("chooseFile", config);
```
<a name="GctNative.upload"></a>

### GctNative.upload(config)
文件上传接口，基座执行上传动作并且返回相关接口数据

**Kind**: static method of [<code>GctNative</code>](#GctNative)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> |  |
| config.url | <code>string</code> | url |
| config.headers | <code>Object</code> | 请求头 |
| config.paths | <code>Array.&lt;string&gt;</code> | 文件本地路径 |
| [config.success] | <code>function</code> | 执行成功的回调 |
| [config.fail] | <code>function</code> | 执行失败的回调 |
| [config.complete] | <code>function</code> | 执行完成的回调 |

**Example**  
```js
dsbridge.call("upload", config);
```
<a name="GctNative.download"></a>

### GctNative.download(config)
下载文件到本地，返回本地地址

**Kind**: static method of [<code>GctNative</code>](#GctNative)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>object</code> |  |
| config.path | <code>string</code> | 下载地址 |
| [config.success] | <code>function</code> | 执行成功的回调 |
| [config.fail] | <code>function</code> | 执行失败的回调 |
| [config.complete] | <code>function</code> | 执行完成的回调 |

**Example**  
```js
dsbridge.call("download", config);
```
<a name="GctNative.readFile"></a>

### GctNative.readFile(config)
读取本地文件内容

**Kind**: static method of [<code>GctNative</code>](#GctNative)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>object</code> |  |
| config.path | <code>string</code> | 本地文件地址 |
| [config.success] | <code>function</code> | 执行成功的回调 |
| [config.fail] | <code>function</code> | 执行失败的回调 |
| [config.complete] | <code>function</code> | 执行完成的回调 |

**Example**  
```js
dsbridge.call("readFile", config);
```
<a name="GctNative.sqliteExecute"></a>

### GctNative.sqliteExecute(config)
执行db下的sql，success中包含执行结果

**Kind**: static method of [<code>GctNative</code>](#GctNative)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> |  |
| config.db | <code>string</code> |  |
| config.sql | <code>string</code> |  |
| [config.success] | <code>function</code> | 执行成功的回调 |
| [config.fail] | <code>function</code> | 执行失败的回调 |
| [config.complete] | <code>function</code> | 执行完成的回调 |

**Example**  
```js
dsbridge.call("sqliteExecute", config);
```
<a name="GctNative.scanCode"></a>

### GctNative.scanCode(config)
扫码接口

**Kind**: static method of [<code>GctNative</code>](#GctNative)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| config | <code>Object</code> |  |  |
| [config.onlyFromCamera] | <code>boolean</code> | <code>false</code> | 是否只能从相机扫码，不允许从相册选择图片 |
| [config.scanType] | <code>Array.&lt;string&gt;</code> | <code>[&#x27;qrCode&#x27;,&#x27;barCode&#x27;]</code> | 扫码类型，qrCode二维码、barCode一维码 |
| [config.success] | <code>function</code> |  | 执行成功的回调 |
| [config.fail] | <code>function</code> |  | 执行失败的回调 |
| [config.complete] | <code>function</code> |  | 执行完成的回调 |

**Example**  
```js
dsbridge.call("scanCode", config);
```
<a name="GctNative.mqttSubscribe"></a>

### GctNative.mqttSubscribe(config)
Mqtt订阅

**Kind**: static method of [<code>GctNative</code>](#GctNative)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> |  |
| config.address | <code>string</code> |  |
| config.port | <code>string</code> |  |
| config.username | <code>string</code> |  |
| config.password | <code>string</code> |  |
| config.topics | <code>Array.&lt;string&gt;</code> | 主题 |
| [config.success] | <code>function</code> | 执行成功的回调 |
| [config.fail] | <code>function</code> | 执行失败的回调 |
| [config.complete] | <code>function</code> | 执行完成的回调 |

**Example**  
```js
dsbridge.call("mqttSubscribe", config);
```
<a name="GctNative.mqttUnsubscribe"></a>

### GctNative.mqttUnsubscribe(config)
Mqtt取消订阅

**Kind**: static method of [<code>GctNative</code>](#GctNative)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> |  |
| config.topics | <code>Array.&lt;string&gt;</code> | 主题 |
| [config.success] | <code>function</code> | 执行成功的回调 |
| [config.fail] | <code>function</code> | 执行失败的回调 |
| [config.complete] | <code>function</code> | 执行完成的回调 |

**Example**  
```js
dsbridge.call("mqttUnsubscribe", config);
```
<a name="GctNative.onMqttMessage"></a>

### GctNative.onMqttMessage()
监听Mqtt消息

**Kind**: static method of [<code>GctNative</code>](#GctNative)  
**Example**  
```js
dsbridge.resister("onMqttMesssage", () => {});
```
<a name="GctNative.updateNative"></a>

### GctNative.updateNative(config)
基座更新

**Kind**: static method of [<code>GctNative</code>](#GctNative)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> |  |
| config.path | <code>string</code> | 下载地址 |
| [config.success] | <code>function</code> | 执行成功的回调 |
| [config.fail] | <code>function</code> | 执行失败的回调 |
| [config.complete] | <code>function</code> | 执行完成的回调 |

**Example**  
```js
dsbridge.call("updateNative", config);
```
<a name="GctNative.updateApp"></a>

### GctNative.updateApp(config)
应用更新

**Kind**: static method of [<code>GctNative</code>](#GctNative)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> |  |
| config.path | <code>string</code> | 下载地址 |
| [config.success] | <code>function</code> | 执行成功的回调 |
| [config.fail] | <code>function</code> | 执行失败的回调 |
| [config.complete] | <code>function</code> | 执行完成的回调 |

**Example**  
```js
dsbridge.call("updateApp", config);
```
<a name="GctNative.getLang"></a>

### GctNative.getLang(config)
获取系统语言

**Kind**: static method of [<code>GctNative</code>](#GctNative)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> |  |
| [config.success] | <code>function</code> | 执行成功的回调 |
| [config.fail] | <code>function</code> | 执行失败的回调 |
| [config.complete] | <code>function</code> | 执行完成的回调 |

**Example**  
```js
dsbridge.call("getLang", config);
```
<a name="GctNative.getLocation"></a>

### GctNative.getLocation(config)
获取经纬度

**Kind**: static method of [<code>GctNative</code>](#GctNative)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> |  |
| [config.success] | <code>function</code> | 执行成功的回调 |
| [config.fail] | <code>function</code> | 执行失败的回调 |
| [config.complete] | <code>function</code> | 执行完成的回调 |

**Example**  
```js
dsbridge.call("getLocation", config);
```
<a name="GctNative.onNotifyClick"></a>

### GctNative.onNotifyClick()
监听系统消息点击

**Kind**: static method of [<code>GctNative</code>](#GctNative)  
**Example**  
```js
dsbridge.resister("onNotifyClick", () => {});
```
