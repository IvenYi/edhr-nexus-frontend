import { IObject } from '../base-type';

/**
 * 平台方法
 *
 * @interface IGctInvoke
 */
export interface IGctInvoke {
  /**
   * 将map对象转换成另外一个map
   *
   * @param data  原数据
   * @param params 字段映射关系
   * @example
   * GCT_INVOKE('convert.to', '[{'column1':'value1', 'column2':'value2'}]', '{'key1':'key1＇', 'key2':'key2＇'}')
   */
  'convert.toMap'(data: Array<IObject>, params: IObject): Array<IObject>;

  /**
   * 查询数据
   *
   * @param dsKey 数据源
   * @param sql 需要执行的 sql 语句
   * @example
   * GCT_INVOKE('dataSource.queryData', 'ds_aaa', 'select * from t_aaa')
   */
  'dataSource.queryData'(dsKey: string, sql: string): Array<IObject>;

  /**
   * 计算两个日期时间的时间差
   *
   * @param begin 开始时间
   * @param end 结束时间
   * @param unit 单位，取值范围：Nanos/Micros/Millis/Seconds/Minutes/Hours/Days/Weeks/Months/Years
   * @example
   * GCT_INVOKE('dateTime.between', '2020-01-01 11:11:11', '2020-01-01 11:12:11', 'Minutes')
   */
  'dateTime.between'(begin: string, end: string, unit: string): number;

  /**
   * 创建 edhr 实例
   *
   * @param  instParam [object] edhr 实例参数，其中 tmplId 必填
   * @example
   * GCT_INVOKE('edhr.createInstance', '{tmplId:xxx,materialStatus:xxx,materialNo:xxx,productId:xxx,params:xxx}')
   */
  'edhr.createInstance'(instParam: object): number;

  /**
   * 添加字典翻译
   *
   * @param modelKey 模型 key
   * @param data [object]/[list] 单条/多条数据
   * @example
   * GCT_INVOKE('em.addDict', 'em_xxx', '[{"id_":"xxx","refId":"xxx"}')]
   */
  'em.addDict'(modelKey: string, data: Array<IObject>): IObject;

  /**
   * ipaas webhook 调用
   *
   * @param method 请求方法
   * @param url 请求路径
   * @param headers 请求头
   * @param body 请求体
   * @example
   * GCT_INVOKE('ipaas.webhook', 'GET', 'http://xxx', '{"h1":"xxx"}', '{"k1":"xxx"}')
   */
  'ipaas.webhook'(method: string, url: string, headers: object, body: object): boolean;

  /**
   * 发送消息
   *
   * @param tmplKey 消息模板 key
   * @param rangeUsers 范围用户字段值
   * @param dataId 业务数据id
   * @example
   * GCT_INVOKE('message.send', 'tmpl1', 'ROLE:dnnS6DTHT6UerxsD,USER_GROUP:A2uXBcCdZr7kHKqp', 'dataId001')
   */
  'message.send'(tmplKey: string, rangeUsers: string, dataId: string): boolean;

  /**
   * 计算数值类型数据的加减乘除
   *
   * @param expression 计算公式
   * @example
   * GCT_INVOKE('number.calculate', '10*20-10')
   */
  'number.calculate'(expression: string): number;

  /**
   * zpl标签打印
   *
   * @param zplJson zpl标签设计json
   * @param data 数据
   * @param printerInfo 页面表单中选中的打印机信息
   * @param printNumber 打印份数, 不传默认一份
   * @example
   * GCT_INVOKE('print.printZplLabel', '{"xxxx":"yyyy"}', data, '{"id":"xxx"}', 1)
   */
  'print.printZplLabel'(
    zplJson: string,
    data: object,
    printerInfo: string,
    printNumber?: number,
  ): boolean;

  /**
   * 转换为指定版本引用格式 { baseId: id }
   *
   * @param refId rdo 引用 id
   * @param modelKey  模型 key
   * @example
   * GCT_INVOKE('rdo.convertToVersionSpecifiedRefId', 'xxxx', 'em_xxx')
   */
  'rdo.convertToVersionSpecifiedRefId'(refId: string, modelKey: string): object;
}
