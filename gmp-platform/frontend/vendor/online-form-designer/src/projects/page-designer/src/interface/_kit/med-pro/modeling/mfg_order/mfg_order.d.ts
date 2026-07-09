import {CommonFields ,NdoFields} from '../parent'

interface MfgOrder extends   NdoFields,CommonFields {
  /**
   * 度量单位
   *
   * @author zyl
   * @see {Uom}
   * @type {string}
   */
uom_id_: string,


  /**
   * 生产日期
   *
   * @author zyl
   * @type {Date}
   */
manufacturing_date_: Date,


  /**
   * 生产顺序
   *
   * @author zyl
   * @type {number}
   */
manufacturing_sort_: number,


  /**
   * 产品
   *
   * @author zyl
   * @see {Product}
   * @type {string}
   */
product_id_: string,


  /**
   * 工厂
   *
   * @author zyl
   * @see {Factory}
   * @type {string}
   */
factory_id_: string,


  /**
   * 流水号
   *
   * @author zyl
   * @see {SnRule}
   * @type {string}
   */
sn_rule_id_: string,


  /**
   * 工作流
   *
   * @author zyl
   * @see {Workflow}
   * @type {string}
   */
workflow_id_: string,


  /**
   * 下发时间
   *
   * @author zyl
   * @type {Date}
   */
issue_date_time_: Date,


  /**
   * 数量
   *
   * @author zyl
   * @type {number}
   */
qty_: number,


  /**
   * 派工数量
   *
   * @author zyl
   * @type {number}
   */
dispatch_qty_: number,


  /**
   * 计划开始时间
   *
   * @author zyl
   * @type {Date}
   */
planned_start_date_: Date,


  /**
   * 计划完成时间
   *
   * @author zyl
   * @type {Date}
   */
planned_completion_date_: Date,


  /**
   * 打印方式
   *
   * @author zyl
   * @see {PrintType}
   * @type {string}
   */
print_type_: string,


  /**
   * 物料清单项
   *
   * @author zyl
   * @see {BomEntry}
   * @type {string}
   */
bom_entries_: string,


  /**
   * 生产指定项
   *
   * @author zyl
   * @see {ProductionSpecification}
   * @type {string}
   */
production_specification_entries_: string,


  /**
   * 工单类型
   *
   * @author zyl
   * @see {MfgOrderType}
   * @type {string}
   */
type_: string,


  /**
   * 设备
   *
   * @author zyl
   * @see {Device}
   * @type {string}
   */
f_device_r6df: string,


  /**
   * 车间
   *
   * @author zyl
   * @see {Shopfloor}
   * @type {string}
   */
f_shopfloor_r6df: string,


  /**
   * 工单状态
   *
   * @author zyl
   * @see {MfgOrderStatus}
   * @type {string}
   */
status_: string,


  /**
   * 工单总用时
   *
   * @author zyl
   * @type {number}
   */
total_time_: number,


  /**
   * 工单优先级
   *
   * @author zyl
   * @see {MfgOrderPriority}
   * @type {string}
   */
f_priority_r6df: string,


  /**
   * 进度
   *
   * @author zyl
   * @type {number}
   */
progress_: number,


  /**
   * erp指定sn
   *
   * @author zyl
   * @see {OrderSnEntry}
   * @type {string}
   */
sn_entries_: string,


  /**
   * 包装规则详情
   *
   * @author zyl
   * @see {OrderPackageRuleEntry}
   * @type {string}
   */
package_rule_entries_: string,


  /**
   * 工单配方详情
   *
   * @author zyl
   * @see {MfgOrderRecipeEntry}
   * @type {string}
   */
recipe_entries_: string,


  /**
   * 按顺序投料
   *
   * @author zyl
   * @type {boolean}
   */
in_sequence_: boolean,


}


/**
 *模型名称：工单
 *模型KEY:em_mfg_order
 */
interface MfgOrderMethods extends IModelService<MfgOrder> {
  /**
   * 增加派工数
   *
   * @param1 orderId 工单id
   * @param2 addQty 增加派工数
   * @return void
   */
addDispatchQty(orderId:string,addQty:number):void;


  /**
   * 计算进度
   *
   * @param1 orderId 工单id
   * @return void
   */
computeProgress(orderId:string):void;


  /**
   * 完成工单
   *
   * @param1 orderId 工单id
   * @return void
   */
finish(orderId:string):void;


  /**
   * 获取BOM列表
   *
   * @param1 orderId 工单id
   * @param2 changeEnabled 是否有变更
   * @return BomEntry[]
   */
getBomEntries(orderId:string,changeEnabled:boolean):BomEntry[];


  /**
   * 根据工单获取物料产品
   *
   * @param 
   * @return void
   */
getMaterialList():void;


  /**
   * 获取流水码规则Id
   *
   * @param1 productId 产品id
   * @return string
   */
getSnRuleId(productId:string):string;


  /**
   * 获取工作流Id
   *
   * @param1 orderId 工单id
   * @return string
   */
getWorkflowId(orderId:string):string;


  /**
   * 创建表单默认参数
   *
   * @param1 releaseTaskId 放行任务id
   * @return Object
   */
makeFormDefaultParams(releaseTaskId:string):Object;


  /**
   * 根据工单的物料品类进行物料齐套
   *
   * @param1 orderId 工单id
   * @return void
   */
validateMaterialKitByCategory(orderId:string):void;


  /**
   * 更新下发时间
   *
   * @param1 orderId 工单id
   * @return void
   */
updateIssueDateTime(orderId:string):void;


  /**
   * 更新sn使用状态
   *
   * @param1 orderId 工单id
   * @param2 snList SN号数组
   * @return void
   */
updateSnToUsed(orderId:string,snList:string[]):void;


  /**
   * 更新状态为未完成
   *
   * @param 
   * @return void
   */
updateStatusToUnfinished():void;


}
