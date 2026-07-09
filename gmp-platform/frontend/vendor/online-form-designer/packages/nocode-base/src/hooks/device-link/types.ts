/** 设备互联命名空间 */
export namespace DeviceLink {
  /**
   * 设备互联模板类型枚举
   * @export
   * @enum {number}
   */
  export enum TmplTypeEnum {
    /** 设备互联 */
    DEVICE_INTERCONNECTION = 'DEVICE_INTERCONNECTION',
    /** AI OCR 识别 */
    AI_OCR = 'AI_OCR',
  }

  /**
   * 降噪方法类型枚举
   * @export
   * @enum {number}
   */
  export enum DenoiseMethodEnum {
    /** 高斯模糊 */
    GAUSSIAN = 'gaussian',
    /** 双边滤波 */
    BILATERAL = 'bilateral',
    /** 中值滤波 */
    MEDIAN = 'bilateral',
  }

  /**
   * 二值化方法类型枚举
   * @export
   * @enum {number}
   */
  export enum BinarizeMethodEnum {
    /** 自适应阈值 */
    ADAPTIVE = 'adaptive',
    /** Otsu 自适应 */
    OTSU = 'otsu',
    /** 简单阈值 */
    SIMPLE = 'simple',
  }

  /** ai 识别输入方式枚举 */
  export enum AiInputModeEnum {
    /** 图片上传 */
    UPLOAD = 'UPLOAD',
    /** 摄像头 */
    CAMERA = 'CAMERA',
  }

  /**
   * 设备互联回写方式枚举
   * @export
   * @enum {number}
   */
  export enum WriteBackModeEnum {
    /** 常规 */
    ROUTINE = 'ROUTINE',
    /** 鼠标焦点 */
    MOUSE_FOCUS = 'MOUSE_FOCUS',
  }

  /** 模板配置的通用结构 */
  export interface BasicTmpl {
    /** 模板id(前端生成，唯一标识) */
    id: string;
    /** 模板类型 */
    type: TmplTypeEnum;
  }

  /**
   * 设备字段和表单字段映射关系
   * @export
   * @interface Device2FormFieldMap
   */
  export interface Device2FormFieldMap {
    /** 设备字段id */
    deviceField: string;
    // ! 冗余设备字段，如需动态更新则不能存在这里
    /** 设备参数配置信息备份仅显示使用 */
    deviceLinkParams?: IDeviceLinkParams;
    /** 表单字段id（模型key.字段key）*/
    formField?: string;
    /** 表单字段id集合（模型key.字段key）*/
    formFields?: string[];
    /** 是否是子表字段 */
    isSubField?: boolean;
    /** 子表字段映射关系 */
    children?: Device2FormFieldMap[];
    /** 回写方式 */
    writeBackMode: WriteBackModeEnum;
  }

  /**
   * 设备互联模板
   * @export
   * @interface DeviceInterconnectionTmpl
   */
  export interface DeviceInterconnectionTmpl extends BasicTmpl {
    /** 设备名称 */
    deviceName: string;
    /** 设备id */
    deviceId: string;
    /**
     * 设备字段和表单字段映射关系
     * key: 设备字段id（设备字段id）
     * value: 表单字段id（模型key.字段key）
     * */
    fieldMaps: Device2FormFieldMap[];
    /** 运行时设备id */
    runtimeDeviceId?: string;
    /** 运行时设备编码 */
    runtimeDeviceKey?: string;
    /** 运行时设备类型，IPAAS，MQTT */
    runtimeDeviceType?: string;
  }

  export interface AIOcrTmplIdentifyParams {
    /** 提示词 */
    prompt: string;
    /** 表单字段id（模型key.字段key）*/
    formField: string;
  }

  /**
   * AI OCR模板
   * @export
   * @interface AIOcrTmpl
   */
  export interface AIOcrTmpl extends BasicTmpl {
    /** 识别模板名 */
    name: string;
    /** 设备名称 */
    deviceName: string;
    /** 是否启用降噪 */
    enableDenoise: boolean;
    /** 降噪方法 */
    denoiseMethod?: DenoiseMethodEnum;

    /** 是否启用增强对比 */
    enableContrast: boolean;
    /** 增强对比强度值（1.0~3.0） */
    contrastAlpha?: number;

    /** 是否启用二值化 */
    enableBinarize: boolean;
    /** 二值化方法 */
    binarizeMethod?: BinarizeMethodEnum;

    /** 识别参数数组 */
    identifyParams?: AIOcrTmplIdentifyParams[];

    /** 额外提示词 */
    extraPrompt: string;

    /** 输入方式 */
    inputMode?: AiInputModeEnum;

    /** 运行时最终使用的完整提示词 */
    runtimePrompt?: string;
  }

  /** 设备互联类型枚举 */
  export enum DeviceLinkTypeEnum {
    /** 接口 */
    IPAAS = 'IPAAS',
    /**  */
    MQTT = 'MQTT',
  }

  /** 转换成可读的设备参数接口 */
  export interface IDeviceLinkParams {
    code: string;
    name: string;
    type: string;
    remark: string;
    children?: IDeviceLinkParams[];
  }

  /** 组件内部用的设备参数接口 */
  export interface IDeviceLink {
    /** 设备id */
    id: string;
    /** 设备名称 */
    name: string;
    /** 类型 */
    type: DeviceLinkTypeEnum;
    /** 树形的参数配置 */
    params?: IDeviceLinkParams[];
  }
}
