import { FlowNodeTypeEnum } from '@gct/flow';
import type { NodeDataSchema } from '/@ipaas/types';
import {
  PanelStep,
  IPaasNodeType,
  EndpointType,
  RequestMethod,
  ResponseMethod,
  ResponseParamType,
} from '/@ipaas/enums';

export const NodeDataConstant = {
  type: FlowNodeTypeEnum.App,
  service: 'gct.ipaas.bed.service.WebHookComponentService',
  // steps: [PanelStep.SelectApp, PanelStep.SelectCase, PanelStep.Setting, PanelStep.Output],
  // cases: {
  //   [IPaasNodeType.Webhook]: [
  //     {
  //       icon: 'icon-fenzhi',
  //       key: 'Request',
  //       title: '当收到接口请求时',
  //       desc: '当收到接口请求时',
  //     },
  //   ],
  //   [IPaasNodeType.Timer]: [
  //     {
  //       icon: 'icon-fenzhi',
  //       key: 'Cyclic',
  //       title: '周期时间触发',
  //       desc: '周期时间触发',
  //     },
  //     {
  //       icon: 'icon-fenzhi',
  //       key: 'Interval',
  //       title: '间隔时间触发',
  //       desc: '间隔时间触发',
  //     },
  //     {
  //       icon: 'icon-fenzhi',
  //       key: 'Custom',
  //       title: '自定义时间触发',
  //       desc: '自定义时间触发',
  //     },
  //   ],
  //   [IPaasNodeType.Http]: [
  //     {
  //       icon: 'icon-fenzhi',
  //       key: 'GET',
  //       title: '发送Get请求',
  //       desc: '发送Get请求',
  //     },
  //     {
  //       icon: 'icon-fenzhi',
  //       key: 'POST',
  //       title: '发送Post请求',
  //       desc: '发送Post请求',
  //     },
  //   ],
  // },
  data: {
    service: '',
    case: '',
    // step: PanelStep.SelectApp,
    nodeConfig: {
      path: '',
      headerParameters: [],
      queryParameters: [],
      body: [],
      // webhook---
      requestMethod: '',
      // http
      httpMethod: '',
      paramType: '',
      uriParameters: [],
    },
  },
};
