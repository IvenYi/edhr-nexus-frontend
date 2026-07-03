import { GctPopup } from '@mobile/utils/popup';
import { MATERIAL_STATUS_ENUM, TASK_TYPE__ENUM } from '@mobile/views/edhr/_utils_/interface';
import { findContainerByName } from '@mobile/views/edhr/_hooks_/useApi';
import { showToast } from 'vant';
import { GctNative } from '@native/index';
import ReworkListPopup from './components/rework-list-popup.vue';
import SelectLotsnPopup from './components/produce-popup.vue';

export { MATERIAL_STATUS_ENUM, TASK_TYPE__ENUM };

/**选择的返工信息*/
export const rework_data = ref({});
/** 选择返工标题 */
export const selectRework = async (container_id_: string, rework_id?: string) => {
  return new Promise((resolve, rej) => {
    GctPopup.open(ReworkListPopup, {
      context: {
        container_id_,
        rework_id,
      },
      onOk: (res: string) => {
        resolve(res);
      },
    });
  });
};

/**
 * 选择批次或sn
 */
export const selectLotSn = (
  {
    material_status_,
    task_type_,
    isReworkProduce,
  }: {
    material_status_: MATERIAL_STATUS_ENUM;
    task_type_: TASK_TYPE__ENUM;
    isReworkProduce?: boolean;
  },
  name?: string,
): Promise<{ name_: string; id_: string }> => {
  return new Promise((resolve, rej) => {
    GctPopup.open(SelectLotsnPopup, {
      context: {
        material_status_,
        name,
        task_type_,
        isReworkProduce,
      },
      onOk: (res: { name_: string; id_: string }) => {
        resolve(res);
      },
    });
  });
};

/**
 * 扫描 加上校验
 */
export const checkedScanCode = (
  material_status_: MATERIAL_STATUS_ENUM,
): Promise<{ name_: string; id_: string }> => {
  return new Promise((resolve, reject) => {
    GctNative.CAMERA.scanCode({
      sourceType: ['album', 'camera'],
      scanType: ['qrCode', 'barCode'],
      success: async (value) => {
        const name = value.result?.trim();
        if (!name) {
          showToast('请扫描正确的生产批次');
          return;
        }
        /**验证是否存在或者扫的码是否正确 */
        const res = await findContainerByName(name);
        if (res.type_ !== material_status_) {
          showToast('请扫描正确的生产批次');
          return;
        }
        resolve(res);
      },
    });
  });
};
