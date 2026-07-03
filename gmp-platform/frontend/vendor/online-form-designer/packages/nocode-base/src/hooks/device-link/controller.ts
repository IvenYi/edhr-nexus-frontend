import { cloneDeep, omit } from 'lodash-es';
import { uuid2 } from '../../_utils_';
import { DeviceLink } from './types';
import { getDeviceInterconnectionInfo } from '/@/apis/gct-platform/DeviceInterconnectionController';
import { DeviceInterconnectionResponse } from '/@/apis/gct-platform/model';

/**
 * 设备互联模板工具类
 *
 * @export
 * @class DeviceLinkTmplController
 */
export class DeviceLinkTmplUtil {
  /**
   * 创建模板数据
   * @param type
   * @return {*}
   */
  static createTmpl(type: DeviceLink.TmplTypeEnum): DeviceLink.BasicTmpl {
    const tmpl: DeviceLink.BasicTmpl = {
      id: uuid2(16),
      type: type,
    };
    if (type === DeviceLink.TmplTypeEnum.AI_OCR) {
      Object.assign(tmpl, {
        identifyParams: [
          {
            prompt: undefined as any,
            formField: undefined as any,
          },
        ],
        denoiseMethod: DeviceLink.DenoiseMethodEnum.GAUSSIAN,
        binarizeMethod: DeviceLink.BinarizeMethodEnum.ADAPTIVE,
      } as DeviceLink.AIOcrTmpl);
    }
    return tmpl;
  }

  /**
   * 计算完整的提示词
   * @static
   * @param tmpl
   * @return {*}
   */
  static calcEntirePrompt(tmpl: DeviceLink.AIOcrTmpl) {
    const paramsStr = tmpl.identifyParams
      ?.map((item) => {
        return `图中${item.prompt}绑定${item.formField.split('.')[1]}字段`;
      })
      .join('，');
    const jsonObj = tmpl.identifyParams?.reduce((acc, cur) => {
      acc[cur.formField.split('.')[1]] = {
        value: null,
      };
      return acc;
    }, {});
    const result = `这是一台${
      tmpl.deviceName ?? ''
    }设备/仪器图片，${paramsStr}，请识别图片中的读数，以\n${JSON.stringify(
      jsonObj,
      null,
      2,
    )}\n格式返回，${tmpl.extraPrompt ?? ''}`;
    return result;
  }

  /** 平台设备互联接口对象转换格式 */
  static transfer2DeviceLink(data: DeviceInterconnectionResponse): DeviceLink.IDeviceLink {
    const result: DeviceLink.IDeviceLink = {
      id: data.id!,
      name: data.name!,
      type: data.type! as any,
      params: data.schema ? [] : undefined,
    };

    if (data.schema) {
      const params: DeviceLink.IDeviceLinkParams[] = [];
      const obj = JSON.parse(data.schema);
      for (const key in obj.properties) {
        const temp: DeviceLink.IDeviceLinkParams = {
          code: key,
          name: obj.properties[key].description || $t('sys.developer.devive.arrayMapping'),
          type: obj.properties[key].type,
          remark: obj.properties[key].remark,
          children: [],
        };

        if (obj.properties[key].items && obj.properties[key].items.properties) {
          temp.children = [];
          for (const subkey in obj.properties[key].items.properties) {
            temp.children.push({
              code: subkey,
              name: obj.properties[key].items.properties[subkey].description,
              type: obj.properties[key].items.properties[subkey].type,
              remark: obj.properties[key].remark,
            });
          }
        }
        params.push(temp);
      }
      result.params = params;
    }
    return result;
  }

  /**
   * 通过设备id转换成IDeviceLink结构
   * - 请求获取完整的带参数的数据
   * - 把参数数据转换成IDeviceLink结构
   * @static
   * @param deviceId
   */
  static async getDeviceLink(deviceId: string) {
    const res = await getDeviceInterconnectionInfo({ id: deviceId });
    if (!res) {
      return;
    }
    return this.transfer2DeviceLink(res);
  }

  /**
   * 初始化设备字段和表单字段映射关系
   * @static
   * @param deviceLink
   */
  static initDevice2FormFieldMap(deviceLink: DeviceLink.IDeviceLink) {
    const fieldMap: DeviceLink.Device2FormFieldMap[] = [];
    deviceLink.params?.forEach((item) => {
      fieldMap.push({
        isSubField: item.type === 'Array',
        deviceField: item.code,
        deviceLinkParams: cloneDeep(omit(item, ['children'])), // 冗余参数自身的信息，不存子数据
        formField: undefined,
        children: item.children?.map((subItem) => {
          return {
            deviceField: subItem.code,
            deviceLinkParams: cloneDeep(subItem),
            formField: undefined,
          };
        }),
      });
    });
    return fieldMap;
  }
}
