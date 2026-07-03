import { DeviceLinkTmplUtil } from '@gct/nocode-base';
import DeviceSelectModal from './device-select-modal.vue';
import { DeviceInterconnectionResponse } from '/@/apis/gct-platform/model';

/**
 * 打开选择模态框
 * @export
 * @return {*}
 */
export async function openDeviceSelectModal() {
  const res = await gct.openUtil.modal<{
    ok: boolean;
    data: DeviceInterconnectionResponse;
  }>(
    DeviceSelectModal,
    {},
    {
      title: $t('sys.onlineForm.deviceSelect'),
      width: 800,
      height: 764,
    },
  );
  console.log('openDeviceSelectModal', res);
  return res;
}

/**
 * 编辑模板时使用
 * 选择并初始化对应的设备字段和表单字段映射关系
 * @export
 */
export async function selectAndInitFieldMap() {
  const res = await openDeviceSelectModal();
  if (!res.ok || !res.data) {
    return;
  }
  const deviceLink = await DeviceLinkTmplUtil.getDeviceLink(res.data.id!);
  if (!deviceLink) {
    return;
  }
  return DeviceLinkTmplUtil.initDevice2FormFieldMap(deviceLink);
}
