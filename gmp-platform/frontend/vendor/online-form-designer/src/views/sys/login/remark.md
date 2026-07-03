# 登录功能模块需求点

## 登录页面动态渲染

- 是否开启 AD 域
- 第三方登录动态
- 动态 title 背景 底部文案

## 登录方式

- AD 域登录
- 密码登录
- 第三方登录（企业微信，钉钉，飞书）

## 操作时长在线登录

- 监听页面是否操作
- 模态框倒计时
- 在线踢人

## 登录类型

- 普通登录
- 单应用登录

## 数据模块

- 用户信息模块
- 租户管理模块
- 权限管理模块

## 登录权限认证

- 接口校验

# 登录功能目前需要的依赖

#### 在线踢人

#### 动态加载 script

#### i18n

#### useRootSetting

- getPlatfromVersion 版本
- getPlatformCopyright 年份
- getLoginIDOAuthConfigs 第三方登录配置
- getLoginModeConfigs 系统登录类型权限
- getLoginSortJson 登录类型排序
- getDefaultAuthType 默认登录类型
- getSystemLogin 登录校验规则

#### useOrgSetting

- orgSetting 密码登录字段
