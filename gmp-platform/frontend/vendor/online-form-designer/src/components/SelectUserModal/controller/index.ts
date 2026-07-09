import { inject, provide, Ref } from 'vue';
import { OrgDTO } from '../type';
import { PaasController } from './paas-controller';
import { BaseController } from './base-controller';
import { EdhrController } from './edhr-controller';

export const ControllerKey = 'SelectUserController' as const;
/** 使用场景 */
export enum SceneType {
  /** 平台租户可见范围 */
  Paas = 'Paas',
  /** 电子批记录有租户权限 */
  Edhr_Granted = 'Edhr_Granted',
  /** 电子批记录没有有租户权限 */
  Edhr_UnGranted = 'Edhr_UnGranted',
}

export function useController(opts: { sceneType: SceneType; orgData: Ref<OrgDTO[]> }) {
  let controller: BaseController;
  switch (opts.sceneType) {
    case SceneType.Edhr_Granted:
      controller = new EdhrController({ ...opts, isGranted: true });
      break;
    case SceneType.Edhr_UnGranted:
      controller = new EdhrController({ ...opts, isGranted: false });
      break;
    case SceneType.Paas:
    default:
      controller = new PaasController(opts);
  }
  provide(ControllerKey, controller);
  return controller;
}

export function getController() {
  return inject(ControllerKey) as BaseController;
}
