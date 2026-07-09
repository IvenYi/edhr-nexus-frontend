import { BpmnNodeTypeEnum } from '@gct/flow/src/plugins/biz-bpmn/enums';

export enum BpmnVersionStatusEnum {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  HISTORY = 'HISTORY',
}

/**
 * 根据类型获取节点信息
 * @param types
 * @return {*}
 */
export function getActionsByTypes(types: BpmnNodeTypeEnum[]) {
  const allActions = [
    {
      key: BpmnNodeTypeEnum.BpmnBizDocument,
      name: '表单节点',
      icon: 'iconfont:icon-biaodanjiedian',
      color: '#3168ec',
    },
    {
      key: BpmnNodeTypeEnum.BpmnExclusive,
      name: '条件分支',
      icon: 'iconfont:icon-fenzhi',
      color: '#088c49',
    },
    {
      key: BpmnNodeTypeEnum.BpmnParallel,
      name: '条件并行',
      icon: 'iconfont:icon-binghangfenzhi',
      color: '#FF980E',
    },
    // {
    //   key: BpmnNodeTypeEnum.BpmnParallelReal,
    //   name: '并行节点',
    //   icon: 'iconfont:icon-binghangfenzhi',
    //   color: '#FF980E',
    // },
    {
      key: BpmnNodeTypeEnum.BpmnTransaction,
      name: '事务节点',
      icon: 'iconfont:icon-fangfa',
      color: '#3168ec',
    },
    {
      key: BpmnNodeTypeEnum.BpmnAllocat,
      name: '配置节点',
      icon: 'iconfont:icon-yewuliu',
      color: '#3168ec',
    },
    {
      key: BpmnNodeTypeEnum.BpmnMessage,
      name: '消息通知',
      icon: 'iconfont:icon-xiaoxitongzhi',
      color: '#6931ec',
    },
    {
      key: BpmnNodeTypeEnum.BpmnInBound,
      name: '入库执行',
      icon: 'iconfont:icon-rukuzhihang-liuchengjiedian',
      color: '#1DB94C',
    },
    {
      key: BpmnNodeTypeEnum.BpmnOutBound,
      name: '出库执行',
      icon: 'iconfont:icon-chukuzhihang-liuchengjiedian',
      color: '#FF2C55',
    },
    {
      key: BpmnNodeTypeEnum.BpmnInspection,
      name: '检验执行',
      icon: 'iconfont:icon-jianyanzhihang-liuchengjiedian',
      color: '#F58C00',
    },
    {
      key: BpmnNodeTypeEnum.BpmnRelease,
      name: '放行执行',
      icon: 'iconfont:icon-fanghangzhihangjiedian',
      color: '#1DB94C',
    },
    {
      key: BpmnNodeTypeEnum.BpmnMaterialLoading,
      name: '上料执行',
      icon: 'iconfont:icon-shangliaozhihangjiedian',
      color: '#31B7EC',
    },
    {
      key: BpmnNodeTypeEnum.BpmnMaterialUnLoading,
      name: '下料执行',
      icon: 'iconfont:icon-xialiaozhihangjiedian',
      color: '#F58C00',
    },
    {
      key: BpmnNodeTypeEnum.BpmnLabelPrint,
      name: '标签打印',
      icon: 'iconfont:icon-biaoqiandayinjiedian',
      color: '#3168ec',
    },
  ];
  return types.map((type) => allActions.find((action) => action.key === type)).filter(Boolean);
}
