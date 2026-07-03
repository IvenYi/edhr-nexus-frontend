import { AuthKeyTypeEnum, ParamTypeEnum } from '/@ipaas/enums';

/** 转成类似jsonSchema的格式 */
export type ToJsonSchema<T> =
  | ({
      type: AuthKeyTypeEnum.Object;
      properties: Record<string, ToJsonSchema<T>>;
    } & T)
  | ({
      type: AuthKeyTypeEnum.Array;
      items: ToJsonSchema<T>;
    } & T)
  | ({
      type: Exclude<AuthKeyTypeEnum, AuthKeyTypeEnum.Array | AuthKeyTypeEnum.Object>;
    } & T);

/** 扩展JsonSchema格式的字段 */
export type ExtendsJsonSchema<T extends ToJsonSchema<{}>, U> = ToJsonSchema<
  Omit<T, 'type' | 'items' | 'properties'> & U
>;

/** 后台需要的通用字段 */
interface IApiJsonParamBasic {
  description?: string;
  required?: boolean;
}

/** 后台需要的参数数据结构 */
export type IApiJsonParam = ToJsonSchema<IApiJsonParamBasic>;

/** 前台配置界面需要的参数数据结构 */
export interface ITreeJsonParam extends IApiJsonParamBasic {
  /** 字段key，子节点才有 */
  key?: string;
  /** 字段类型 */
  type: AuthKeyTypeEnum;
  /** 传参类型 */
  paramType?: ParamTypeEnum;
  /** 参数key */
  paramKey?: string;
  /** 子节点集合,对象和数组类型才有 */
  children?: ITreeJsonParam[];
  /** 是否折叠 */
  collapse?: boolean;
}
