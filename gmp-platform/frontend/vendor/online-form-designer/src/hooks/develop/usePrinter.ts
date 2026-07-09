import { message } from 'ant-design-vue';
import { useI18n } from '../web/useI18n';
import { useMessage } from '../web/useMessage';
import { postPrintGenerateZplCode } from '/@/apis/gct-apaas/PrintController';

const { createMessage } = useMessage();
const { t } = useI18n();

interface PrintZPLParams {
  /**
   * 测试变量
   */
  testVar?: object;
  /**
   * 业务服务key
   */
  bizServiceKey?: string;
  /**
   * 打印类型
   *
   * @author zhanghanrui
   * @date 2024-08-30 15:08:34
   * @type {string}
   */
  printType?: string;
}

export function usePrinter() {
  async function printLabelKey(
    labelKey?: string,
    data: any = {},
    { testVar, bizServiceKey }: PrintZPLParams = {},
  ) {
    const res = await postPrintGenerateZplCode({
      labelId: labelKey,
      data,
      testVar,
      bizServiceKey,
    });
    if (res && typeof res !== 'string') {
      const { code, printType, labelWidth, labelHeight } = res || {};
      if (printType === 'png') {
        const printWindow = window.open('', '_blank', 'height=500,width=800')!;
        printWindow.document.write(
          `<img style="width: ${labelWidth}mm;height: ${labelHeight}mm;position: absolute;top: 0;left: 0;" src="data:image/png;base64,${code}">`,
        );
        setTimeout(() => {
          printWindow.document.close();
          printWindow.print();
          printWindow.close();
        }, 300);
        return;
      }
    }
    BrowserPrint.getDefaultDevice(
      'printer',
      async function (device) {
        if (!device || !device.connection || !device.uid) {
          message.error(t('sys.printDeviceNotFound'));
          return;
        }
        if (!labelKey) {
          message.error(t('sys.labelNotFound'));
          return;
        }
        //device是默认设备
        // const zplCommand = await postPrintGenerateZplCode({
        //   labelKey,
        //   data,
        //   testVar,
        //   bizServiceKey,
        // });
        printZPL(device, res);
        //获取所有设备
        // BrowserPrint.getLocalDevices(
        //   function (device_list) {
        //     console.log(device_list);
        //   },
        //   function () {
        //     alert('Error getting local devices');
        //   },
        //   'printer',
        // );
      },
      function (error) {
        createMessage.error(t('sys.printDesigner.getDeviceError'));
      },
    );
  }

  function printZPL(device, zplCommand) {
    device.send(zplCommand, undefined, function (error) {
      createMessage.error(t('sys.printDesigner.printError'));
    });
  }
  return {
    printZPL,
    printLabelKey,
  };
}
