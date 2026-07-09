import { getModelMetaDetail } from '/@/apis/gct-apaas/ModelMetaController';
import type { TableFieldMetaDTO, FieldMetaDTO } from '/@/apis/gct-apaas/model/index';

export class FieldSchema {
  static modelData: Map<string, TableFieldMetaDTO> = new Map();
  static FiledData: Map<string, Record<string, FieldMetaDTO>> = new Map();
  static responsePromise: Map<string, Promise<void>> = new Map();
  static silent = false;
  static async getMap(modelKey: string, useCache = true) {
    if (!modelKey) return Promise.reject();
    if (!this.responsePromise.has(modelKey) || !useCache) {
      /**防止同一时刻同事调用接口 */
      const P = (async () => {
        const data = await getModelMetaDetail(
          { modelKey },
          { errorMessageMode: this.silent ? 'none' : undefined },
        );
        this.modelData.set(modelKey, data!);
        const fieldMap =
          !!data?.fieldMetaList &&
          (data.fieldMetaList.reduce((total, curr) => {
            curr.key && (total[curr.key] = curr);
            return total;
          }, {}) as Record<string, FieldMetaDTO>);
        fieldMap && this.FiledData.set(modelKey, fieldMap);
      })();
      this.responsePromise.set(modelKey, P);
    }
    return this.responsePromise.get(modelKey);
  }
  /**
   * 获取模型下字段信息
   * @param modelKey 模型key
   * @param field 字段key
   * @param useCache 是否是用缓存
   * @returns  字段信息
   */
  static async getConfigByField(
    modelKey: string,
    field: string,
    useCache = true,
  ): Promise<FieldMetaDTO> {
    await this.getMap(modelKey, useCache);
    return this.FiledData.get(modelKey)![field];
  }
  /**
   * 获取模型信息
   * @param modelKey 模型key
   * @returns 模型信息
   */
  static async getConfigByModel(modelKey: string): Promise<TableFieldMetaDTO> {
    await this.getMap(modelKey);
    return this.modelData.get(modelKey)!;
  }
  static clearCacheMap(useRequest = false) {
    if (useRequest) {
      this.responsePromise.clear();
    }
    this.modelData.clear();
    this.FiledData.clear();
  }
}

/**字段运行时需要同步的数据 */
export async function initFieldWidgetRuntime(widget, isVanField = false): Promise<any> {
  const { modelKey, field, isCustomField, fieldName, readonly, fieldType } = widget.props;
  if ((!widget.isField && !isVanField) || field === 'table_name_') return {};
  const fieldInfo = isCustomField
    ? { name: fieldName }
    : modelKey && (await FieldSchema.getConfigByField(modelKey, field));
  if ((!fieldInfo || fieldInfo.type !== fieldType) && !isCustomField)
    return Promise.reject('该字段可能已经被删除');
  if (fieldInfo.required && !readonly) {
    widget.props.required = true;
  }
  widget.props.fieldRequired = fieldInfo.required;
  if (fieldInfo?.specificConfig?.digits !== undefined) {
    widget.props.precision = fieldInfo?.specificConfig?.digits;
  }

  return fieldInfo;
}
