import {CommonFields ,NdoFields} from '../parent'

interface Supplier extends   NdoFields,CommonFields {
}


/**
 *模型名称：供应商
 *模型KEY:em_supplier
 */
interface SupplierMethods extends IModelService<Supplier> {
}
