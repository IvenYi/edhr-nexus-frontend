// 此文件由脚本自动生成，请勿手动修改。

export type PagePermissionMap = {
  'OnlineForm': {
    /** 新建分类 */ InsertCate: boolean;
    /** 分类重命名 */ RenameCate: boolean;
    /** 删除分类 */ DeleteCate: boolean;
    /** 新建表单 */ Insert: boolean;
    /** 版本创建 */ InsertVer: boolean;
    /** 复制(携带默认版本) */ CopyDefaultVer: boolean;
    /** 版本编辑 */ UpdateVer: boolean;
    /** 复制(携带指定版本) */ CopyCurrentVer: boolean;
    /** 版本复制 */ CopyVer: boolean;
    /** 设计 */ Design: boolean;
    /** 版本删除 */ DeleteVer: boolean;
    /** 受控 */ Controller: boolean;
    /** 撤回 */ Withdraw: boolean;
    /** 流程设计 */ ProcessDesign: boolean;
    /** 按钮设计 */ ButtonsDesign: boolean;
    /** 生效日期 */ Effect: boolean;
    /** 版本对比 */ CompareVersion: boolean;
    /** 导入 */ Import: boolean;
    /** 导出 */ Export: boolean;
  };
  'eDHR': {
    /** 新建分类 */ InsertCate: boolean;
    /** 分类重命名 */ RenameCate: boolean;
    /** 删除分类 */ DeleteCate: boolean;
    /** 新建eDHR */ Insert: boolean;
    /** 版本创建 */ InsertVer: boolean;
    /** 复制(携带默认版本) */ CopyDefaultVer: boolean;
    /** 版本编辑 */ UpdateVer: boolean;
    /** 复制(携带指定版本) */ CopyCurrentVer: boolean;
    /** 版本复制 */ CopyVer: boolean;
    /** 设计 */ Design: boolean;
    /** 版本删除 */ DeleteVer: boolean;
    /** 受控 */ Controller: boolean;
    /** 撤回 */ Withdraw: boolean;
    /** 编辑 */ Update: boolean;
    /** 生效日期 */ Effect: boolean;
  };
  'document-filling': {
    /** 新建任务 */ Insert: boolean;
    /** 填报 */ Fill: boolean;
    /** 转发 */ Forward: boolean;
    /** 编辑 */ Update: boolean;
    /** 重新发送 */ Resend: boolean;
    /** 删除 */ Delete: boolean;
  };
  'document-task': {
    /** 处理 */ Handle: boolean;
  };
  'dhr-task': {
    /** 处理 */ Handle: boolean;
  };
  'change-task': {
    /** 处理 */ Handle: boolean;
  };
  'print-tmpl': {
    /** 新建 */ Insert: boolean;
    /** 设计 */ Design: boolean;
    /** 编辑 */ Update: boolean;
    /** 删除 */ Delete: boolean;
  };
  'file-task': {
    /** 下载 */ Download: boolean;
    /** 批量下载 */ BatchDownload: boolean;
    /** 批量删除 */ BatchDelete: boolean;
  };
  'my-file-task': {
    /** 下载 */ Download: boolean;
    /** 批量下载 */ BatchDownload: boolean;
    /** 批量删除 */ BatchDelete: boolean;
  };
  'edhr-tracked': {
    /** 反向追溯 */ Reverse: boolean;
  };
  'document-tracked': {
    /** 反向追溯 */ Reverse: boolean;
  };
  'user-management': {
    /** 新建 */ Insert: boolean;
    /** 导入 */ Import: boolean;
    /** 导出 */ Export: boolean;
    /** 编辑 */ Update: boolean;
    /** 重置密码 */ ResetPwd: boolean;
    /** 重置签名密码 */ ResetSignPwd: boolean;
    /** 删除 */ Delete: boolean;
  };
  'organization-member': {
    /** 添加下级部门 */ InsertOrg: boolean;
    /** 编辑下级部门 */ UpdateOrg: boolean;
    /** 删除下级部门 */ DeleteOrg: boolean;
    /** 添加用户 */ Insert: boolean;
    /** 导入 */ Import: boolean;
    /** 导出 */ Export: boolean;
    /** 编辑 */ Update: boolean;
  };
  'role-management': {
    /** 新建 */ Insert: boolean;
    /** 编辑 */ Update: boolean;
    /** 权限配置 */ Perm: boolean;
    /** 启用/禁用 */ EnableDisable: boolean;
    /** 删除 */ Delete: boolean;
  };
  'user-group': {
    /** 新建 */ Insert: boolean;
    /** 删除 */ Delete: boolean;
    /** 编辑 */ Update: boolean;
  };
  'user-granted': {
    /** 添加 */ Insert: boolean;
    /** 移除并交接 */ HandOver: boolean;
  };
  'ds-management': {
    /** 新建 */ Insert: boolean;
    /** 编辑/启用/禁用 */ Update: boolean;
    /** 删除 */ Delete: boolean;
  };
  'service-dictionary': {
    /** 新建 */ Insert: boolean;
    /** 编辑 */ Update: boolean;
    /** 删除 */ Delete: boolean;
  };
  'ReportDataSet': {
    /** 新建 */ Insert: boolean;
    /** 编辑 */ Update: boolean;
    /** 删除 */ Delete: boolean;
  };
  'edhr-filling': {
    /** 表单添加 */ ADD_FORM: boolean;
  };
  'approval-product-process-task': {
    /** 处理 */ Handle: boolean;
  };
  'approval-routing-task': {
    /** 处理 */ Handle: boolean;
  };
  'approval-doc-task': {
    /** 处理 */ Handle: boolean;
  };
  'ipaas-flow': {
    /** 新建分类 */ AddCate: boolean;
    /** 分类重命名 */ RenameCate: boolean;
    /** 删除分类 */ DeleteCate: boolean;
    /** 新建连接流 */ AddIpaas: boolean;
    /** 导入 */ Import: boolean;
    /** 导出 */ Export: boolean;
    /** 编辑 */ Edit: boolean;
    /** 设计 */ Design: boolean;
    /** 删除 */ Delete: boolean;
    /** 重试 */ Recall: boolean;
  };
  'ipaas-connector': {
    /** 新建分类 */ AddCate: boolean;
    /** 分类重命名 */ RenameCate: boolean;
    /** 删除分类 */ DeleteCate: boolean;
    /** 新建连接器 */ AddConnector: boolean;
    /** 导入 */ Import: boolean;
    /** 导出 */ Export: boolean;
    /** 配置 */ Config: boolean;
    /** 编辑 */ Edit: boolean;
    /** 删除 */ Delete: boolean;
    /** 清空调试日志 */ ClearLog: boolean;
  };
  'device-interconnection': {
    /** 新建设备 */ AddDevice: boolean;
    /** 导入设备 */ ImportDevice: boolean;
    /** 批量导出设备 */ BatchExportDevice: boolean;
    /** 编辑设备 */ EditDevice: boolean;
    /** 复制设备 */ CopyDevice: boolean;
    /** 删除设备 */ DeleteDevice: boolean;
    /** 新建参数 */ AddParams: boolean;
    /** 导入参数 */ ImportParams: boolean;
    /** 批量导出参数 */ BatchExportParams: boolean;
    /** 编辑参数 */ EditParams: boolean;
    /** 删除参数 */ DeleteParams: boolean;
  };
  'audit-center': {
    /** 表单审核 */ FormHandle: boolean;
    /** 模板审核 */ TmplHandle: boolean;
    /** 变更审核 */ ChangeHandle: boolean;
  };
};

export type PagePermissionKey = keyof PagePermissionMap;