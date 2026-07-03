import LoadDeviceBtn from './load-device-btn.vue';
import cameraPreview from './tmpl/camera-preview.vue';

export { LoadDeviceBtn };

export async function openCameraPreview() {
  const res = await gct.openUtil.modal<{
    ok: boolean;
    data: any;
  }>(
    cameraPreview,
    {},
    {
      title: $t('sys.onlineForm.cameraScreenshot'),
      width: '800px',
      height: '678px',
    },
  );
  if (res.ok) {
    return res.data;
  }
  return Promise.reject();
}
