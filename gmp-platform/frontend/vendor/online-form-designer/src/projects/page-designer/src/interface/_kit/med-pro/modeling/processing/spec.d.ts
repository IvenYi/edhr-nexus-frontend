import {CommonFields ,RdoFields} from '../parent'

interface Spec extends RdoFields,CommonFields {
  /**
   * 工艺编码
   *
   * @author zyl
   * @type {string}
   */
code_: string,


  /**
   * BASE_ID
   *
   * @author zyl
   * @type {string}
   */
base_id_: string,


  /**
   * 工站
   *
   * @author zyl
   * @see {Operation}
   * @type {string}
   */
operation_id_: string,


  /**
   * 设备组
   *
   * @author zyl
   * @see {DeviceGroup}
   * @type {string}
   */
device_group_id_: string,


  /**
   * 文档集
   *
   * @author zyl
   * @see {DocumentSet}
   * @type {string}
   */
document_set_id_: string,


  /**
   * 培训需求组
   *
   * @author zyl
   * @see {TrainingRequirementGroup}
   * @type {string}
   */
training_requirement_group_id_: string,


  /**
   * 在线表单模版
   *
   * @author zyl
   * @type {string}
   */
online_form_tmpl_id_: string,


  /**
   * 验证进站检验
   *
   * @author zyl
   * @type {boolean}
   */
validate_move_in_check_: boolean,


  /**
   * 标准工时
   *
   * @author zyl
   * @type {number}
   */
standard_work_hours_: number,


  /**
   * 验证配方投料
   *
   * @author zyl
   * @type {boolean}
   */
validate_recipe_feeding_: boolean,


  /**
   * 电子放行
   *
   * @author zyl
   * @type {boolean}
   */
release_: boolean,


  /**
   * 自动出站
   *
   * @author zyl
   * @type {boolean}
   */
auto_move_: boolean,


  /**
   * 验证物料消耗
   *
   * @author zyl
   * @type {boolean}
   */
validate_material_consumption_: boolean,


  /**
   * 验证出站清场
   *
   * @author zyl
   * @type {boolean}
   */
validate_move_cleaning_: boolean,


  /**
   * 签名
   *
   * @author zyl
   * @see {SpecSignEntry}
   * @type {string}
   */
sign_entries_: string,


  /**
   * SN配置
   *
   * @author zyl
   * @see {SpecSnEntry}
   * @type {string}
   */
sn_entries_: string,


  /**
   * 按类型拆分
   *
   * @author zyl
   * @type {boolean}
   */
f_split_by_sort_r6df: boolean,


  /**
   * 允许超报工
   *
   * @author zyl
   * @type {boolean}
   */
allow_over_report_: boolean,


  /**
   * 验证出站报工
   *
   * @author zyl
   * @type {boolean}
   */
validate_move_report_: boolean,


  /**
   * 同步报工数量
   *
   * @author zyl
   * @type {boolean}
   */
synchronize_report_qty_: boolean,


  /**
   * 拆分为批次
   *
   * @author zyl
   * @type {boolean}
   */
f_split_to_container_r6df: boolean,


  /**
   * 以SN生成数采
   *
   * @author zyl
   * @type {boolean}
   */
trigger_data_collection_by_sn_: boolean,


  /**
   * 以SN生成检验
   *
   * @author zyl
   * @type {boolean}
   */
trigger_check_by_sn_: boolean,


  /**
   * 拆分成SN
   *
   * @author zyl
   * @type {boolean}
   */
split_to_sn_: boolean,


  /**
   * 以批次过站
   *
   * @author zyl
   * @type {boolean}
   */
move_by_container_: boolean,


  /**
   * SN置换
   *
   * @author zyl
   * @type {boolean}
   */
sn_replace_enabled_: boolean,


  /**
   * 允许报工不足
   *
   * @author zyl
   * @type {boolean}
   */
allow_under_report_: boolean,


  /**
   * 自动进站
   *
   * @author zyl
   * @type {boolean}
   */
auto_move_in_: boolean,


  /**
   * 电子签名
   *
   * @author zyl
   * @type {boolean}
   */
sign_: boolean,


  /**
   * 验证出站检验
   *
   * @author zyl
   * @type {boolean}
   */
validate_move_check_: boolean,


  /**
   * 验证进站清场
   *
   * @author zyl
   * @type {boolean}
   */
validate_move_in_cleaning_: boolean,


}


/**
 *模型名称：工艺
 *模型KEY:em_spec
 */
interface SpecMethods extends IRdoModelService<Spec> {
  /**
   * 触发电子放行
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @param3 defaultParamMap 放行单默认参数
   * @return Object
   */
triggerRelease(containerId:string,workflowStepId:string,defaultParamMap:Object):Object;


  /**
   * 有多个sn批次的生产批次是否配置以批次过站
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @return boolean
   */
isContainerHasMoveByContainer(containerId:string,workflowStepId:string):boolean;


  /**
   * 是否需要以批次过站
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @return boolean
   */
isMoveByContainerRequired(containerId:string,workflowStepId:string):boolean;


  /**
   * 是否sn单独进出站
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @return boolean
   */
isMoveBySingleSnRequired(containerId:string,workflowStepId:string):boolean;


}
