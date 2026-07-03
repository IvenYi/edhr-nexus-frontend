export * from './app-designer';
export * from './page-designer';
export * from './online-form';

export * from './appEnum';
export * from './appStateEnum';
export * from './authActionEnum';
export * from './breakpointEnum';
export * from './cacheEnum';
export * from './designEnum';
export * from './exceptionEnum';
export * from './globalEnum';
export * from './httpEnum';
export * from './menuEnum';
export * from './pageEnum';
export * from './roleEnum';
export * from './sizeEnum';
export * from './processEnum';

export enum ReturnTypeEnum {
  String = 'string',
  Number = 'number',
  Boolen = 'boolean',
  Boolean = 'boolean',
}

/**mqtt主题枚举*/
export enum GctMqttTopsEnum {
  /**mqtt电子表单 编辑 遗嘱消息解锁使用 */
  EDHR_FORM_INST_MULTI_PERSON_EDIT_BREAK = 'FORM_INST_MULTI_PERSON_EDIT_BREAK',
  /**mqtt用于接受其他用户解锁的主题 */
  EDHR_FORM_INST_MULTI_PERSON_EDIT_UNLOCK = 'FORM_INST_MULTI_PERSON_EDIT_UNLOCK',
}
