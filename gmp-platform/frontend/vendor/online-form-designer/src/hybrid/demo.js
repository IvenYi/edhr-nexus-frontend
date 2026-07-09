/**
 * 下载并更新基座
 */
dsBridge.call('NATIVE.update', {
  path: 'xxxxx.apk',
});

/**
 * 下载并更新应用（逻辑需要修改）
 * 下载zip并解压到固定目录/
 *
 *
 */
dsBridge.call('APP.update', {
  path: 'asdasd/xxxxx.zip',
});

/**
 * 下载并更新应用db（新增Api）
 * 更新应用db时自动断开连接、db名为下载的文件名
 */
dsBridge.call('DATABASE.update', {
  path: 'asdasd/xxxxx.db',
});

/**
 * 返回初始启动页面
 */
dsBridge.call('WEBVIEW.relaunch', {
  replace: true, //是否保留历史记录
});

/**
 * 请求代理
 */
dsBridge.call('HTTP', {
  // `url` 是用于请求的服务器 URL
  url: '',
  timeout: 1000, //请求超时 微秒
  method: 'get', //请求方式
  // `data` 是作为请求体被发送的数据
  // 仅适用 'PUT', 'POST', 'DELETE 和 'PATCH' 请求方法
  data: {}, //post 请求参数
  // `params` 是与请求一起发送的 URL 参数
  // 必须是一个简单对象或 URLSearchParams 对象
  params: {}, //get 请求参数
  headers: {
    //自定义请求头
    TOKEN: 'xxx',
  },
  success: function (res) {
    console.log(res);
  },
  fail: function (err) {},
});
