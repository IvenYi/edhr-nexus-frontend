import {CommonFields ,NdoFields} from '../parent'

interface MaintenanceReason extends   NdoFields,CommonFields {
}


/**
 *模型名称：保养原因
 *模型KEY:em_maintenance_reason
 */
interface MaintenanceReasonMethods extends IModelService<MaintenanceReason> {
}
