import {CommonFields ,NdoFields} from '../parent'

interface Shift extends   NdoFields,CommonFields {
}


/**
 *模型名称：定义班次
 *模型KEY:em_shift
 */
interface ShiftMethods extends IModelService<Shift> {
}
