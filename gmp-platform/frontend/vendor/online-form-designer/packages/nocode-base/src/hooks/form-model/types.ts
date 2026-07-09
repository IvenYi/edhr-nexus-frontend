import type { FieldMetaDTO, ModelMetaResponse } from '/@/apis/gct-apaas/model';

export interface IFormModel {
  /** 模型key */
  key: string;
  /** 名称 */
  name: string;
  /** 是否是子模型 */
  subModel?: number;
  /** 字段列表 */
  fields: FieldMetaDTO[];
}

/**
 * 表单模型加载请求器接口
 * @export
 * @interface ModelFetcher
 */
export interface IFormModelFetcher {
  /**
   * 获取表单的所有主，子模型基本信息和字段信息
   * @return {*}
   */
  load(opts: { model: string }): Promise<IFormModel[]>;
}
