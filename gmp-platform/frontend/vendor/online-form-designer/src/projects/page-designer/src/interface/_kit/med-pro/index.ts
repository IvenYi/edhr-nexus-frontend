import {ContainerMethods} from "./producing/container";
import {ContainerSpecMethods} from "./producing/container_spec";
import {MfgOrderMethods} from "./modeling/mfg_order/mfg_order";


interface IModelServiceMap{
  em_container: ContainerMethods,
  em_container_spec: ContainerSpecMethods,
  em_mfg_order: MfgOrderMethods,
}