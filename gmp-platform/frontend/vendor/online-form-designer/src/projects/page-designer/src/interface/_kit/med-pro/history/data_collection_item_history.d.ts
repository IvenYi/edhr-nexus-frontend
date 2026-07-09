import {CommonFields } from '../parent'

interface DataCollectionItemHistory extends CommonFields {
  /**
   * 引用主模型数据 id
   *
   * @author zyl
   * @type {string}
   */
ref_master_id_: string,


  /**
   * 引用主模型key
   *
   * @author zyl
   * @type {string}
   */
ref_model_key_: string,


  /**
   * 引用主模型字段key
   *
   * @author zyl
   * @type {string}
   */
ref_field_key_: string,


  /**
   * 排序号
   *
   * @author zyl
   * @type {number}
   */
sort_num_: number,


  /**
   * 默认值
   *
   * @author zyl
   * @type {string}
   */
default_value_: string,


  /**
   * 值
   *
   * @author zyl
   * @type {string}
   */
value_: string,


  /**
   * 显示方式
   *
   * @author zyl
   * @type {string}
   */
show_type_: string,


  /**
   * 提示文本
   *
   * @author zyl
   * @type {string}
   */
tip_text_: string,


  /**
   * 整数值
   *
   * @author zyl
   * @type {number}
   */
int_value_: number,


  /**
   * 浮点值
   *
   * @author zyl
   * @type {number}
   */
double_value_: number,


  /**
   * 文本值
   *
   * @author zyl
   * @type {string}
   */
text_value_: string,


  /**
   * 布尔值
   *
   * @author zyl
   * @type {string}
   */
bool_value_: string,


  /**
   * 人员值
   *
   * @author zyl
   * @type {string}
   */
user_value_: string,


  /**
   * 部门值
   *
   * @author zyl
   * @type {string}
   */
org_value_: string,


  /**
   * 日期值
   *
   * @author zyl
   * @type {Date}
   */
date_value_: Date,


  /**
   * 日期时间值
   *
   * @author zyl
   * @type {Date}
   */
date_time_value_: Date,


  /**
   * 图片值
   *
   * @author zyl
   * @type {string}
   */
image_value_: string,


  /**
   * 附件值
   *
   * @author zyl
   * @type {string}
   */
attachment_value_: string,


  /**
   * 类型
   *
   * @author zyl
   * @type {string}
   */
type_: string,


  /**
   * 整数上限
   *
   * @author zyl
   * @type {number}
   */
max_int_: number,


  /**
   * 整数下限
   *
   * @author zyl
   * @type {number}
   */
min_int_: number,


  /**
   * 精度小数上限
   *
   * @author zyl
   * @type {number}
   */
max_decimal_: number,


  /**
   * 精度小数下限
   *
   * @author zyl
   * @type {number}
   */
min_decimal_: number,


  /**
   * 小数位数
   *
   * @author zyl
   * @type {number}
   */
digits_: number,


  /**
   * 布尔真
   *
   * @author zyl
   * @type {string}
   */
true_text_: string,


  /**
   * 布尔假
   *
   * @author zyl
   * @type {string}
   */
false_text_: string,


  /**
   * 模型对象
   *
   * @author zyl
   * @type {string}
   */
model_object_: string,


  /**
   * 自定义下拉选项
   *
   * @author zyl
   * @type {string}
   */
options_: string,


  /**
   * 日期时间格式化
   *
   * @author zyl
   * @type {string}
   */
pattern_: string,


  /**
   * 正则
   *
   * @author zyl
   * @type {string}
   */
regex_: string,


  /**
   * 自动修正
   *
   * @author zyl
   * @type {boolean}
   */
auto_fix_: boolean,


  /**
   * 开启提醒
   *
   * @author zyl
   * @type {boolean}
   */
remind_enabled_: boolean,


  /**
   * 上下限校验
   *
   * @author zyl
   * @type {boolean}
   */
validate_range_: boolean,


  /**
   * 布尔真校验
   *
   * @author zyl
   * @type {boolean}
   */
validate_true_: boolean,


  /**
   * 布尔假校验
   *
   * @author zyl
   * @type {boolean}
   */
validate_false_: boolean,


  /**
   * 是否必填
   *
   * @author zyl
   * @type {boolean}
   */
required_: boolean,


}


/**
 *模型名称：数据采集项历史
 *模型KEY:em_data_collection_item_history
 */
interface DataCollectionItemHistoryMethods extends IModelService<DataCollectionItemHistory> {
}
