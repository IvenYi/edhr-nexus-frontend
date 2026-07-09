/**
 * 平台类型枚举
 *
 * @author copilot
 * @date 2025-06-13
 * @export
 * @enum {string}
 */
export enum PlatformType {
  /**
   * 网页端
   */
  WEB = 'web',

  /**
   * PDA端
   */
  PDA = 'pda',

  /**
   * PAD端
   */
  PAD = 'pad',
}

/**空值显示枚举 */
export enum nullDisplayEnum {
  '--' = '--',
  'empty' = '(空)',
  'null' = 'null',
  'N/A' = 'N/A',
  'noDisplay' = '',
}

export enum DeviceParamsTypeEnum {
  STRING = 'String',
  INTEGER = 'Integer',
  LONG = 'Long',
  FLOAT = 'Float',
  BOOLEAN = 'Boolean',
  DATE = 'Date',
}
