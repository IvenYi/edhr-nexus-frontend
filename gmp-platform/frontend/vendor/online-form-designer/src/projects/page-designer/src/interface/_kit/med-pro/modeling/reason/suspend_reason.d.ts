import {CommonFields ,NdoFields} from '../parent'

interface SuspendReason extends   NdoFields,CommonFields {
}


/**
 *模型名称：暂停原因
 *模型KEY:em_suspend_reason
 */
interface SuspendReasonMethods extends IModelService<SuspendReason> {
}
