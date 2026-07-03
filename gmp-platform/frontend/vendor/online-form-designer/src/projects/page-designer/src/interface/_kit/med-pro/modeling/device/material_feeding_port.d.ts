import {CommonFields ,NdoFields} from '../parent'

interface MaterialFeedingPort extends   NdoFields,CommonFields {
  /**
   * 上料口设备
   *
   * @author zyl
   * @see {MaterialFeedingPortEntry}
   * @type {string}
   */
material_feeding_port_entry: string,


}


/**
 *模型名称：上料口
 *模型KEY:em_material_feeding_port
 */
interface MaterialFeedingPortMethods extends IModelService<MaterialFeedingPort> {
}
