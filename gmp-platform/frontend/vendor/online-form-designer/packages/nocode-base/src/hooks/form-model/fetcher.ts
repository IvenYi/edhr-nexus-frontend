import { IFormModel, IFormModelFetcher } from './types';
import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
import { getModelComprehensiveSubModelList } from '/@/apis/gct-apaas/ModelComprehensiveController';
import { getModelMetaDetail } from '/@/apis/gct-apaas/ModelMetaController';
import type { FieldMetaDTO } from '/@/apis/gct-apaas/model';

/**
 * 基础表单的模型请求
 * @export
 * @class BaseFormModelFetcher
 */
export class BaseFormModelFetcher implements IFormModelFetcher {
  /** 默认接口 */
  apis = {
    getFieldMetaList: getFieldMetaList,
    getModelMetaSubModelList: getModelComprehensiveSubModelList,
    getModelDetail2FieldList: getModelMetaDetail,
  };

  /**
   * 模型映射缓存
   */
  modelMetaMap: Record<string, IFormModel> = {};

  async load(opts: { model: string }): Promise<IFormModel[]> {
    const { model } = opts;
    // 先清空数据
    this.modelMetaMap = {};
    await this.loadModelFields(model);
    await this.loadSubModelsFields(model);
    return Object.values(this.modelMetaMap);
  }

  /**
   * 补全字段信息
   * @param modelKey 字段所属的模型
   * @param [fields=[]]
   * @return {*}
   */
  completeFields(modelKey: string, fields: FieldMetaDTO[] = []) {
    return fields.map((field) => {
      if (!field.modelKey) {
        field.modelKey = modelKey;
      }
      return field;
    });
  }

  /**
   * 根据模型key加载模型字段
   *
   * @param [modelKey=this.model]
   * @return {*}
   */
  async loadModelFields(modelKey: string) {
    if (typeof this.apis.getFieldMetaList !== 'function') {
      return;
    }

    const res = await this.apis.getFieldMetaList({
      modelKey,
    });

    this.modelMetaMap[modelKey] = {
      key: modelKey,
      name: '',
      fields: this.completeFields(modelKey, res),
    };

    return res;
  }

  /**
   * 加载表单所有子表字段对应模型的字段信息集合
   */
  async loadSubModelsFields(modelKey: string) {
    const res = await this.apis.getModelMetaSubModelList({
      modelKey,
    });
    (res ?? []).forEach((m) => {
      if (!this.modelMetaMap[m.key!]) {
        this.modelMetaMap[m.key!] = {
          key: m.key!,
          name: m.name!,
          subModel: m.subModel,
          fields: this.completeFields(m.key!, m.fieldMetaList),
        };
      }
    });
  }
}
