import { Ref, ref } from 'vue';
import { BaseFormModelFetcher } from './fetcher';
import { IFormModel, IFormModelFetcher } from './types';
import { FieldMetaDTO } from '/@/apis/gct-apaas/model';
import { FIELD_TYPE, CreateType } from '@gct/runtime';

/**
 * 表单模型处理
 * @export
 * @class FormModelController
 */
export class FormModelController {
  /** 主模型的key */
  masterModelKey!: string;
  /** 主模型的名称 */
  masterModelName?: string;
  /** 模型请求器 */
  fetcher: IFormModelFetcher = new BaseFormModelFetcher();
  /** 模型映射缓存 */
  modelMetaMap: Ref<Record<string, IFormModel>> = ref({});

  /** 主模型信息 */
  get masterModel() {
    return this.modelMetaMap.value[this.masterModelKey];
  }

  /** 获取主模型字段集合 */
  get masterFields() {
    return this.masterModel.fields;
  }

  /** 获取子模型 */
  getSubModel(subModelKey: string) {
    return this.modelMetaMap.value[subModelKey];
  }

  /** 获取子模型字段集合 */
  getSubModelFields(subModelKey: string) {
    return this.getSubModel(subModelKey)?.fields;
  }

  /**
   * 初始化
   *
   * @param opts
   * - model 主模型key
   * - name 主模型名称
   */
  async init(opts: { model: string; name?: string }) {
    this.masterModelKey = opts.model;
    this.masterModelName = opts.name;
    await this.load();
  }

  /** 刷新数据 */
  async refresh() {
    await this.load();
  }

  /**
   * 加载数据并填充到modelMetaMap中
   * @protected
   * @return {*}
   */
  protected async load() {
    if (!this.masterModelKey) {
      console.error('缺少主模型的key');
      return;
    }
    const models = await this.fetcher.load({ model: this.masterModelKey });
    this.modelMetaMap.value = models.reduce((acc, cur) => {
      acc[cur.key] = cur;
      // 补全主模型名称
      if (cur.key === this.masterModelKey) {
        cur.name = this.masterModelName!;
      }
      return acc;
    }, {});
  }

  /** 是否是子模型字段 */
  isSubField(field: FieldMetaDTO) {
    return field.type === FIELD_TYPE.MASTERSLAVE && field.bindInfo;
  }

  /** 是否是预置字段，包括系统字段和业务内置字段 */
  isPresetField(field: FieldMetaDTO) {
    return [CreateType.BUILTIN, CreateType.SYSTEM].includes(field.createType as any);
  }

  /** 是否是系统字段 */
  isSystemField(field: FieldMetaDTO) {
    return field.createType === CreateType.SYSTEM;
  }

  /**
   * 获取主模型里子表字段对应的子模型key
   *
   * @param fieldKey 子表字段在主表里的字段key
   * @return {*}
   */
  getSubFieldModelKey(fieldKey: string) {
    return this.masterFields.find((field) => field.key === fieldKey)?.bindInfo;
  }

  /**
   * 获取字段信息
   * @param [modelKey=this.masterModelKey] 模型key
   * @param fieldKey 字段key
   * @return {*}
   */
  findField(modelKey: string = this.masterModelKey, fieldKey: string) {
    const model = this.modelMetaMap.value[modelKey];
    if (!model) {
      return;
    }
    return model.fields.find((field) => field.key === fieldKey);
  }
}
