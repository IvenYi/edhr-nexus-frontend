import {CommonFields ,NdoFields} from '../parent'

interface Scheduling extends   NdoFields,CommonFields {
  /**
   * 生产排班配置
   *
   * @author zyl
   * @see {SchedulingEntry}
   * @type {string}
   */
entries_: string,


}


/**
 *模型名称：生产排班
 *模型KEY:em_scheduling
 */
interface SchedulingMethods extends IModelService<Scheduling> {
}
