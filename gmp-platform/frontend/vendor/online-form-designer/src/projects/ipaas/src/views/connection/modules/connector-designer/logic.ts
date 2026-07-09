import { inject, provide } from 'vue';
import { IConnectorDesignerController, IConnectorDesignerData } from './type';
import { ConnectorConfigRequest } from '/@/apis/gct-ipaas2/model';
import { cloneDeep } from 'lodash-es';
import JsonPathUtil from '/@ipaas/utils/JsonPathUtil.js';

import { validateUrl } from '/@ipaas/utils/url-check';
import { AuthModeEnum } from '/@ipaas/enums';
import { postAuthTestConnect } from '/@/apis/gct-ipaas2/AuthController';

const ConnectorDesignerControllerKey = 'ConnectorDesignerController';

/**
 * 设置控制器
 * @export
 * @param c
 */
export function setController(c: IConnectorDesignerController) {
  provide(ConnectorDesignerControllerKey, c);
}

/** 获取控制器 */
export function getController() {
  return inject(ConnectorDesignerControllerKey) as IConnectorDesignerController;
}

/** 设计数据转后台数据 */
export function toConfigData(data: IConnectorDesignerData): ConnectorConfigRequest {
  const cloneData = cloneDeep(data);
  cloneData.authParam = [
    ...(cloneData.__authPathParams[0]?.children ?? []),
    ...(cloneData.__authQueryParams[0]?.children ?? []),
    ...(cloneData.__authHeaderParams[0]?.children ?? []),
    ...(cloneData.__authBodyParams[0]?.children ?? [])
      .map((item) => JsonPathUtil.toList(item))
      .flat(),
  ];
  cloneData.requestConfig = [
    ...(cloneData.__requestPathParams[0]?.children ?? []),
    ...(cloneData.__requestQueryParams[0]?.children ?? []),
    ...(cloneData.__requestHeaderParams[0]?.children ?? []),
    ...(cloneData.__requestBodyParams[0]?.children ?? [])
      .map((item) => JsonPathUtil.toList(item))
      .flat(),
  ];

  cloneData.successExpression = cloneData.__successParams[0]?.children ?? [];

  //遍历data的属性删除其中以__开头的属性
  for (const key in cloneData) {
    if (key.startsWith('__')) {
      delete cloneData[key];
    }
  }
  return cloneData;
}

/**
 * 后台数据转设计数据
 *
 * @export
 * @param data
 * @return {*}
 */
export function toDesignData(data: ConnectorConfigRequest): IConnectorDesignerData {
  const cloneData = cloneDeep(data) as any as IConnectorDesignerData;

  // 处理参数设置
  cloneData.__authPathParams = [
    {
      key: 'path',
      keyType: 'Object',
      children: cloneData.authParam?.filter((item) => item.paramType === 'path') || [],
    },
  ];
  cloneData.__authQueryParams = [
    {
      key: 'query',
      keyType: 'Object',
      children: cloneData.authParam?.filter((item) => item.paramType === 'query') || [],
    },
  ];
  cloneData.__authHeaderParams = [
    {
      key: 'header',
      keyType: 'Object',
      children: cloneData.authParam?.filter((item) => item.paramType === 'header') || [],
    },
  ];
  const body = cloneData.authParam?.filter((item) => item.paramType === 'body') || [];
  cloneData.__authBodyParams = JsonPathUtil.toTree(body, { root: { key: 'body' } });

  // 处理鉴权入参
  cloneData.__requestPathParams = [
    {
      key: 'path',
      keyType: 'Object',
      children: cloneData.requestConfig?.filter((item) => item.paramType === 'path') || [],
    },
  ];
  cloneData.__requestQueryParams = [
    {
      key: 'query',
      keyType: 'Object',
      children: cloneData.requestConfig?.filter((item) => item.paramType === 'query') || [],
    },
  ];
  cloneData.__requestHeaderParams = [
    {
      key: 'header',
      keyType: 'Object',
      children: cloneData.requestConfig?.filter((item) => item.paramType === 'header') || [],
    },
  ];
  const _body = cloneData.requestConfig?.filter((item) => item.paramType === 'body') || [];
  cloneData.__requestBodyParams = JsonPathUtil.toTree(_body, { root: { key: 'body' } });

  // 鉴权成功
  cloneData.__successParams = [
    {
      key: 'response',
      keyType: 'Object',
      children: cloneData.successExpression ?? [],
    },
  ];

  // 初始化authFormConfig配置
  if (!cloneData.authFormConfig || !cloneData.authFormConfig.length) {
    cloneData.authFormConfig = initAuthFormConfig(cloneData.authMode!);
  }

  return cloneData;
}

/** 获取路径规则 */
export function getUrlRule(label) {
  return {
    validator: (_rule, value: string) => {
      if (value && value.startsWith('http') && !validateUrl(value)) {
        return Promise.reject(
          $t('sys.pleaseInputValidSth', {
            sth: label,
          }),
        );
      }
      return Promise.resolve();
    },
    trigger: 'change',
  } as const;
}

/**
 * 初始化authFormConfig的配置
 * @export
 * @param type
 * @return {*}
 */
export function initAuthFormConfig(type: AuthModeEnum) {
  if (type === AuthModeEnum.AD) {
    return [
      // 账号
      {
        key: 'account',
        value: undefined,
      },
      // 密码
      {
        key: 'password',
        value: undefined,
      },
    ];
  } else if (type === AuthModeEnum.SAP_RFC) {
    return [
      // 服务地址
      {
        key: 'ashost',
        value: undefined,
      },
      // 系统编号
      {
        key: 'sysnr',
        value: undefined,
      },
      // 客户端ID
      {
        key: 'clientId',
        value: undefined,
      },
      // 用户名
      {
        key: 'userName',
        value: undefined,
      },
      // 密码
      {
        key: 'password',
        value: undefined,
      },
      // 语言
      {
        key: 'lang',
        value: undefined,
      },
    ];
  }
}
