import { MaterialEnum } from '/@/enums/appEnum';
import { Platform } from '/@page-designer/enum';

export const deviceEvent = [
  {
    name: 'afterDeviceFill',
    title: 'sys.pageDesigner.afterDeviceFill',
    params: ['value', 'deviceData', 'formData'],
    hidden: (widget) => {
      return (
        widget.platform !== Platform.WEB ||
        ![MaterialEnum.MaterialFormField].includes(widget.materialType)
      );
    },
  },
];
