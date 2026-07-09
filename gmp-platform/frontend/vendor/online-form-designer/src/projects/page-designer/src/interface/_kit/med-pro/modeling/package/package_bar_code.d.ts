import {CommonFields } from '../parent'

interface PackageBarCode extends CommonFields {
  /**
   * 使用状态
   *
   * @author zyl
   * @see {UsingStatus}
   * @type {string}
   */
status_: string,


  /**
   * 包装条码	
   *
   * @author zyl
   * @type {string}
   */
bar_code_: string,


  /**
   * 排序号
   *
   * @author zyl
   * @type {number}
   */
sort_num_: number,


  /**
   * 引用主模型数据id
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


}


/**
 *模型名称：包装条码
 *模型KEY:em_package_bar_code
 */
interface PackageBarCodeMethods extends IModelService<PackageBarCode> {
  /**
   * 查询可用的包装条码
   *
   * @param1 codes 条码数组
   * @param2 orderPackageRuleEntryId 包装规则配置id
   * @return string[]
   */
filterUsable(codes:string[],orderPackageRuleEntryId:string):string[];


  /**
   * 查询未使用的条码
   *
   * @param1 detailId 工单包装规则配置项id
   * @param2 count 数量
   * @return PackageBarCode[]
   */
listUnused(detailId:string,count:number):PackageBarCode[];


  /**
   * 批量修改条码状态
   *
   * @param1 codes 条码名称数组
   * @return void
   */
updateBatchToUsed(codes:string[]):void;


  /**
   * 校验条码是否重复
   *
   * @param1 nameList 条码名称数组
   * @return boolean
   */
validateBarCodeDuplicate(nameList:string[]):boolean;


}
