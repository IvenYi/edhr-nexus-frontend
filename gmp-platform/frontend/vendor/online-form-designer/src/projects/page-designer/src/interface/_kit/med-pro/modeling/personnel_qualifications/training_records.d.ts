import {CommonFields ,NdoFields} from '../parent'

interface TrainingRecords extends   NdoFields,CommonFields {
  /**
   * 培训导师
   *
   * @author zyl
   * @type {string}
   */
teacher_id_: string,


  /**
   * 培训学生
   *
   * @author zyl
   * @type {string}
   */
student_id_: string,


  /**
   * 培训结果
   *
   * @author zyl
   * @see {TrainingResult}
   * @type {string}
   */
training_result_: string,


  /**
   * 到期时间
   *
   * @author zyl
   * @type {Date}
   */
training_end_time_: Date,


  /**
   * 培训需求
   *
   * @author zyl
   * @see {TrainingRequirement}
   * @type {string}
   */
training_requirement_id_: string,


}


/**
 *模型名称：培训记录
 *模型KEY:em_training_records
 */
interface TrainingRecordsMethods extends IModelService<TrainingRecords> {
  /**
   * 获取学生培训合格记录
   *
   * @param1 userId 用户id
   * @return TrainingRecords[]
   */
getQualifiedByStudent(userId:string):TrainingRecords[];


  /**
   * 验证设备人员资质
   *
   * @param1 deviceId 设备id
   * @param2 userId 用户id
   * @return void
   */
validateDeviceTrainingResult(deviceId:string,userId:string):void;


  /**
   * 验证产品以及产品家族人员资质
   *
   * @param1 containerId 批次id
   * @param2 userId 用户id
   * @return void
   */
validateProductTrainingResult(containerId:string,userId:string):void;


  /**
   * 验证工艺工站人员资质
   *
   * @param1 containerId 批次id
   * @param2 userId 用户id
   * @param3 workflowStepId 工步id
   * @return void
   */
validateSpecAndOperationTrainingResult(containerId:string,userId:string,workflowStepId:string):void;


}
