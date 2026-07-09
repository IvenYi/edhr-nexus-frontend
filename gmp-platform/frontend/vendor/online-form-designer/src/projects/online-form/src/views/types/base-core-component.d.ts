import { CmpMethodEnum } from '/@online-form/utils/config.enum';
import { FIELD_TYPE } from '/@/enums/appEnum';
import { CreateType } from '@gct/runtime';
import { ComponentTypeEnum, EmptySymbol, CellWidgetViewState } from '@gct/nocode-base';

export type IWrapperCmpConfigPrams = {
  /** 当前节点数据 */
  data: any;
  /** 当前节点所属的trs节点信息 */
  prev_trs?: any;
  /** 父节点 */
  parent?: any;
  /** 模板数据集合 */
  dataCenter?: any;
  /** 下标 */
  idx?: number;
};

export type IUpdateCmpConfigParams = {
  /** 当前节点数据 */
  data: any;
  result: any;
  /** 下标 */
  idx?: number;
};

/** 流程字段权限信息 */
export type IBpmnFieldAuthItem = {
  /** 字段key */
  field: string | undefined;
  /** 字段名称 */
  fieldName: string | undefined;
  /** 模型key */
  modelKey: string | undefined;
  /** 是否是子表 */
  subModel: number;
  /** 编辑 */
  edit: boolean;
  /** 只读 */
  readonly: boolean;
};

export abstract class IComponent {
  /** 组件类型 */
  abstract component: ComponentTypeEnum;

  /** 生成组件配置 */
  abstract [CmpMethodEnum.WrapperCmpConfig](params: IWrapperCmpConfigPrams): object;

  /** 更新组件配置 */
  abstract [CmpMethodEnum.UpdateCmpConfig]?: (params: IUpdateCmpConfigParams) => void;
}
