import {CommonFields ,NdoFields} from '../parent'

interface CheckLevel extends   NdoFields,CommonFields {
  /**
   * 检验级别配置
   *
   * @author zyl
   * @see {CheckLevelEntry}
   * @type {string}
   */
entries_: string,


}


/**
 *模型名称：检验级别
 *模型KEY:em_check_level
 */
interface CheckLevelMethods extends IModelService<CheckLevel> {
  /**
   * 获取检验级别对应的样本代码
   *
   * @param1 containerId 批次id
   * @param2 checkLevelId 检验级别id
   * @param3 samplingByOriginalQtyEnabled 以原始数量采样
   * @return void
   */
getSampleCode(containerId:string,checkLevelId:string,samplingByOriginalQtyEnabled:boolean):void;


}
