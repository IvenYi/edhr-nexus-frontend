import { reactive } from 'vue';
import { DeviceLink, DeviceLinkTmplUtil } from '../device-link';
import {
  getOnlineFormTmplGetCommunicationConfig,
  postOnlineFormTmplUpdateCommunicationConfigById,
  getOnlineFormTmplIsOcrGranted,
} from '/@/apis/gct-apaas/OnlineFormTmplController';
import { getLicenseModuleAuth } from '/@/apis/gct-platform/LicenseController';
import { cloneDeep } from 'lodash-es';
import { DeviceConnector } from './device-connector';

/**
 * 表单模板配置控制器
 * @export
 * @class FormTmplConfigController
 */
export class FormTmplConfigController {
  /** 设备连接器 */
  deviceConnector = new DeviceConnector();

  constructor(opts: { skipPermissions?: boolean } = {}) {
    if (!opts.skipPermissions) {
      this.initPermissions();
    }
  }

  /** 存储响应式变量  */
  state = reactive<{
    tmpls: DeviceLink.BasicTmpl[];
    /** 运行中的模板，目前是mqtt模板 */
    runningTmpls: DeviceLink.DeviceInterconnectionTmpl[];
    IOTPermission: boolean;
    OCRPermission: boolean;
  }>({
    tmpls: [],
    runningTmpls: [],
    IOTPermission: false,
    OCRPermission: false,
  });

  /** 表单模板id */
  tmplId: string = '';

  /** 是否手动模式,手动模式不触发接口 */
  isManual: boolean = false;

  /**
   * 初始化权限
   */
  async initPermissions() {
    try {
      this.state.IOTPermission =
        (await getLicenseModuleAuth({ module: 'IOT' }, { errorMessageMode: 'none' })) || false;
      this.state.OCRPermission =
        (await getOnlineFormTmplIsOcrGranted({ errorMessageMode: 'none' })) || false;
    } catch {
      this.state.IOTPermission = false;
      this.state.OCRPermission = false;
    }
  }

  /**
   * 初始化
   *
   * @param opts
   * - tmplId 表单模板id
   */
  async init(opts: { tmplId: string; isManual?: boolean }) {
    this.isManual = !!opts.isManual;
    this.tmplId = opts.tmplId;
    // 清空数据
    this.state.runningTmpls = [];
    if (!this.isManual) {
      await this.load();
    }
  }

  /**
   * 设置获取到的配置数据字符串
   * @param configStr
   */
  setConfigStr(configStr?: string) {
    console.log('配置信息', configStr);
    const config = configStr ? JSON.parse(configStr) : {};
    this.state.tmpls = config.tmpls || [];
  }

  getConfigStr() {
    const cloneTmpls = cloneDeep(this.state.tmpls);
    // 保存时把最终的提示词计算出来放在模板里面
    (cloneTmpls as any[]).forEach((tmpl: DeviceLink.AIOcrTmpl) => {
      if (tmpl.type === DeviceLink.TmplTypeEnum.AI_OCR) {
        tmpl.runtimePrompt = DeviceLinkTmplUtil.calcEntirePrompt(tmpl);
      }
    });
    const config = {
      tmpls: cloneTmpls,
    };
    console.log('保存数据', config);
    return JSON.stringify(config);
  }

  /** 调用接口加载数据 */
  protected async load() {
    const res = await getOnlineFormTmplGetCommunicationConfig({ id: this.tmplId });
    this.setConfigStr(res);
  }

  /** 调用接口保存数据 */
  async save() {
    const configStr = this.getConfigStr();
    await postOnlineFormTmplUpdateCommunicationConfigById(
      { id: this.tmplId },
      { communicationConfig: configStr },
    );
  }

  /** 调用接口刷新数据 */
  async refresh() {
    await this.load();
  }

  /** 添加或更新模板，并且调用接口保存并刷新数据 */
  async createOrUpdate(tmpl: DeviceLink.BasicTmpl) {
    const index = this.state.tmpls.findIndex((item) => item.id === tmpl.id);
    if (index > -1) {
      this.state.tmpls[index] = tmpl;
    } else {
      this.state.tmpls.push(tmpl);
    }
    if (!this.isManual) {
      await this.save();
      await this.refresh();
    }
  }

  /** 缓存运行中的模板 */
  cacheRunningTmpl(tmpl: DeviceLink.BasicTmpl) {
    if (tmpl.type === DeviceLink.TmplTypeEnum.DEVICE_INTERCONNECTION) {
      const index = this.state.runningTmpls.findIndex((item) => item.id === tmpl.id);
      if (index > -1) {
        this.state.runningTmpls[index] = tmpl as any;
      } else {
        this.state.runningTmpls.push(tmpl as any);
      }
    }
  }

  /**
   * disconnect断开连接，取消mqtt订阅，并且从运行中的模板中移除
   * @param tmpl
   */
  disconnect(tmpl: DeviceLink.BasicTmpl) {
    this.deviceConnector.unsubscribeMqtt(tmpl.id);
    const index = this.state.runningTmpls.findIndex((item) => item.id === tmpl.id);
    if (index > -1) {
      this.state.runningTmpls.splice(index, 1);
    }
  }
}
