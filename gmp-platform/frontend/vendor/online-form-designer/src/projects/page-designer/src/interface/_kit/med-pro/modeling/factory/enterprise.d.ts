import {CommonFields ,NdoFields} from '../parent'

interface Enterprise extends   NdoFields,CommonFields {
}


/**
 *模型名称：公司
 *模型KEY:em_enterprise
 */
interface EnterpriseMethods extends IModelService<Enterprise> {
}
