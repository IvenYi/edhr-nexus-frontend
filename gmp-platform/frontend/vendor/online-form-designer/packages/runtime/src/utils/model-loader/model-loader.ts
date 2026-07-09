import { EntityModelCategoryEnum } from '@gct-paas/core';
import { FieldMetaDTO, IFieldCodeChain, QueryRefDataRequest } from '../../interface';
import { getModelMetaByKeys, getModelMetaDetail } from '/@/apis/gct-apaas/ModelMetaController';
import { ModelMetaDTO, ModelPageableRow } from '/@/apis/gct-apaas/model';
import { getModelComprehensiveEnumInfoByModelCategory } from '/@/apis/gct-apaas/ModelComprehensiveController';
import { postModelDataQueryRefData } from '/@/apis/gct-apaas/ModelDataController';
import { cloneDeep } from 'lodash-es';

/**
 * 缓存条目接口，包含缓存数据和过期时间戳
 */
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

/**
 * 模型加载器，提供模型缓存和请求去重功能
 *
 * @author chitanda
 * @date 2025-06-20 16:06:12
 * @class ModelLoader
 */
class ModelLoader {
  // 缓存过期时间（毫秒），默认10分钟
  private readonly CACHE_EXPIRATION_TIME = 10 * 60 * 1000;

  private modelCache = new Map<string, CacheEntry<ModelMetaDTO>>();
  private modelLoadingCache = new Map<string, Promise<ModelMetaDTO>>();
  private modelsLoadingCache = new Map<string, Promise<ModelMetaDTO[]>>();
  private enumCache = new Map<string, CacheEntry<IObject[]>>();
  private enumLoadingCache = new Map<string, Promise<IObject[]>>();
  private queryRefDataCache = new Map<string, CacheEntry<ModelPageableRow>>();
  private queryRefDataLoadingCache = new Map<string, Promise<ModelPageableRow>>();

  /**
   * 检查缓存条目是否过期
   *
   * @param {CacheEntry<any>} entry
   * @returns {*}  {boolean}
   */
  private isExpired<T>(entry: CacheEntry<T>): boolean {
    return Date.now() > entry.expiresAt;
  }

  /**
   * 创建缓存条目
   *
   * @param {T} data
   * @returns {*}  {CacheEntry<T>}
   */
  private createCacheEntry<T>(data: T): CacheEntry<T> {
    return {
      data,
      expiresAt: Date.now() + this.CACHE_EXPIRATION_TIME,
    };
  }

  /**
   * 加载模型信息，具有缓存和请求去重功能
   *
   * @author chitanda
   * @date 2025-06-20 16:06:05
   * @param {string} modelKey
   * @returns {*}  {Promise<ModelMetaDTO>}
   */
  async loadModel(modelKey: string): Promise<ModelMetaDTO> {
    // 如果已经有缓存且未过期，直接返回缓存的数据
    if (this.modelCache.has(modelKey)) {
      const cacheEntry = this.modelCache.get(modelKey)!;
      if (!this.isExpired(cacheEntry)) {
        return cacheEntry.data;
      }
      // 如果过期，清除缓存
      this.modelCache.delete(modelKey);
    }

    // 如果正在请求中，返回同一个 Promise 实例
    if (this.modelLoadingCache.has(modelKey)) {
      return this.modelLoadingCache.get(modelKey)!;
    }

    // 创建新的请求 Promise
    const loadPromise = (async () => {
      try {
        const data = await getModelMetaDetail({ modelKey });
        if (data) {
          this.modelCache.set(modelKey, this.createCacheEntry(data));
          return data;
        }
        return {};
      } finally {
        // 请求完成后清除加载缓存
        this.modelLoadingCache.delete(modelKey);
      }
    })();

    // 缓存正在进行的请求
    this.modelLoadingCache.set(modelKey, loadPromise);

    return loadPromise;
  }

  /**
   * 加载多个模型信息
   *
   * @author chitanda
   * @date 2025-06-22 15:06:54
   * @param {string[]} modelKeys
   * @returns {*}  {Promise<ModelMetaDTO[]>}
   */
  async loadModels(modelKeys: string[]): Promise<ModelMetaDTO[]> {
    const cacheKey = modelKeys.join(',');

    // 检查是否所有模型都已缓存且未过期
    const allCached = modelKeys.every((key) => {
      const entry = this.modelCache.get(key);
      return entry && !this.isExpired(entry);
    });
    if (allCached) {
      return modelKeys.map((key) => this.modelCache.get(key)!.data);
    }

    // 清除已过期的缓存
    modelKeys.forEach((key) => {
      const entry = this.modelCache.get(key);
      if (entry && this.isExpired(entry)) {
        this.modelCache.delete(key);
      }
    });

    // 如果正在请求中，返回同一个 Promise 实例
    if (this.modelsLoadingCache.has(cacheKey)) {
      return this.modelsLoadingCache.get(cacheKey)!;
    }

    // 创建新的请求 Promise
    const loadPromise = (async () => {
      try {
        // 过滤出未加载的模型键
        const pendingKeys = modelKeys.filter((key) => !this.modelCache.has(key));

        if (pendingKeys.length > 0) {
          const res = await getModelMetaByKeys({
            modelKeys: pendingKeys.join(','),
          });
          if (res && res.length > 0) {
            // 将获取到的模型数据缓存起来
            res.forEach((model) => {
              this.modelCache.set(model.key!, this.createCacheEntry(model));
              (model as any).fieldMetaList = model.fieldMetas || [];
            });
          }
        }

        return modelKeys.map((key) => {
          const entry = this.modelCache.get(key)!;
          return entry.data;
        });
      } finally {
        // 请求完成后清除加载缓存
        this.modelsLoadingCache.delete(cacheKey);
      }
    })();

    // 缓存正在进行的请求
    this.modelsLoadingCache.set(cacheKey, loadPromise);

    return loadPromise;
  }

  /**
   * 加载指定模型的字段信息
   *
   * @author chitanda
   * @date 2025-06-22 14:06:37
   * @param {string} modelKey
   * @param {string} fieldKey
   * @returns {*}  {(Promise<FieldMetaDTO | undefined>)}
   */
  async loadField(modelKey: string, fieldKey: string): Promise<FieldMetaDTO | undefined> {
    const model = await this.loadModel(modelKey);
    if (model?.fieldMetaList) {
      return model.fieldMetaList.find((field) => field.key === fieldKey);
    }
    return undefined;
  }

  /**
   * 加载指定模型的字段路径信息
   *
   * @author chitanda
   * @date 2025-06-22 14:06:11
   * @param {string} modelKey
   * @param {string} fieldKey
   * @returns {*}  {Promise<string[]>}
   */
  async loadFieldPaths(
    modelKey: string,
    fieldKey: string,
    fieldCodeChain: IFieldCodeChain,
  ): Promise<string[]> {
    if (!fieldCodeChain) {
      return [];
    }
    const list: string[] = [];
    const isFieldModel = !!fieldCodeChain.bindFieldKey;
    const modelKeys = isFieldModel
      ? fieldCodeChain.modelLink || [fieldCodeChain.belongModelKey, fieldCodeChain.bindModelKey]
      : [fieldCodeChain.modelKey];
    const models = await this.loadModels(modelKeys);
    if (isFieldModel) {
      list.push(...models.map((model) => model.name!));
    } else {
      const model = await this.loadModel(fieldCodeChain.modelKey);
      if (model) {
        list.push(model.name!);
      }
    }
    const model = await this.loadModel(modelKey);
    if (model?.fieldMetaList) {
      const field = model.fieldMetaList.find((field) => field.key === fieldKey);
      if (field) {
        list.push(field.name!);
      }
    }
    return list;
  }

  /**
   * 加载指定模型的枚举列表
   *
   * @param {string} modelKey
   * @param {string} fieldKey
   * @param {string} [modelCategory=EntityModelCategoryEnum.ENTITY]
   * @returns {*}  {Promise<IObject[]>}
   */
  async loadEnumList(
    modelKey: string,
    fieldKey: string,
    modelCategory: string = EntityModelCategoryEnum.ENTITY,
  ): Promise<IObject[]> {
    const cacheKey = `${modelCategory}:${modelKey}:${fieldKey}`;

    // 如果已经有缓存且未过期，直接返回缓存的数据
    if (this.enumCache.has(cacheKey)) {
      const cacheEntry = this.enumCache.get(cacheKey)!;
      if (!this.isExpired(cacheEntry)) {
        return cloneDeep(cacheEntry.data);
      }
      // 如果过期，清除缓存
      this.enumCache.delete(cacheKey);
      this.enumLoadingCache.delete(cacheKey);
    }

    // 如果正在请求中，返回同一个 Promise 实例
    if (this.enumLoadingCache.has(cacheKey)) {
      return this.enumLoadingCache.get(cacheKey)!;
    }

    // 创建新的请求 Promise
    const loadPromise = (async () => {
      try {
        const items = await getModelComprehensiveEnumInfoByModelCategory(
          { modelCategory },
          { modelKey, fieldKey },
        );
        if (items) {
          this.enumCache.set(cacheKey, this.createCacheEntry(items));
          return cloneDeep(items);
        }
        return [];
      } finally {
        // 请求完成后清除加载缓存
        this.enumLoadingCache.delete(cacheKey);
      }
    })();

    // 缓存正在进行的请求
    this.enumLoadingCache.set(cacheKey, loadPromise);

    return loadPromise;
  }

  /**
   * 加载关联数据查询（QueryRef）
   *
   * @param {QueryRefDataRequest} request
   * @returns {*}  {Promise<ModelPageableRow>}
   */
  async loadQueryRefData(request: QueryRefDataRequest): Promise<ModelPageableRow> {
    if (!request || !request.modelKey) {
      throw new Error(`queryRefData 参数缺失`);
    }
    const cacheKey = JSON.stringify(request);

    // 如果已经有缓存且未过期，直接返回缓存的数据
    if (this.queryRefDataCache.has(cacheKey)) {
      const cacheEntry = this.queryRefDataCache.get(cacheKey)!;
      if (!this.isExpired(cacheEntry)) {
        return cloneDeep(cacheEntry.data);
      }
      // 如果过期，清除缓存
      this.queryRefDataCache.delete(cacheKey);
      this.queryRefDataLoadingCache.delete(cacheKey);
    }

    // 如果正在请求中，返回同一个 Promise 实例
    if (this.queryRefDataLoadingCache.has(cacheKey)) {
      return this.queryRefDataLoadingCache.get(cacheKey)!;
    }

    // 创建新的请求 Promise
    const loadPromise = (async () => {
      try {
        const data = await postModelDataQueryRefData(request);
        if (data) {
          this.queryRefDataCache.set(cacheKey, this.createCacheEntry(data));
          return cloneDeep(data);
        }
        return {} as ModelPageableRow;
      } finally {
        // 请求完成后清除加载缓存
        this.queryRefDataLoadingCache.delete(cacheKey);
      }
    })();

    // 缓存正在进行的请求
    this.queryRefDataLoadingCache.set(cacheKey, loadPromise);

    return loadPromise;
  }

  /**
   * 获取已缓存的模型
   * @param modelKey 模型键
   * @returns ModelMetaDTO | undefined
   */
  getCachedModel(modelKey: string): ModelMetaDTO | undefined {
    const entry = this.modelCache.get(modelKey);
    if (entry && !this.isExpired(entry)) {
      return entry.data;
    }
    if (entry && this.isExpired(entry)) {
      this.modelCache.delete(modelKey);
    }
    return undefined;
  }

  /**
   * 清除指定模型的缓存
   *
   * @author chitanda
   * @date 2025-06-20 16:06:41
   * @param {string} modelKey
   */
  clear(modelKey: string): void {
    this.modelCache.delete(modelKey);
    this.modelLoadingCache.delete(modelKey);

    // 清除包含该模型的批量加载缓存
    const keysToDelete: string[] = [];
    this.modelsLoadingCache.forEach((_, cacheKey) => {
      if (cacheKey.includes(modelKey)) {
        keysToDelete.push(cacheKey);
      }
    });
    keysToDelete.forEach((key) => {
      this.modelsLoadingCache.delete(key);
    });

    // 清除包含该模型的枚举缓存
    const enumKeysToDelete: string[] = [];
    this.enumCache.forEach((_, cacheKey) => {
      if (cacheKey.includes(modelKey)) {
        enumKeysToDelete.push(cacheKey);
      }
    });
    enumKeysToDelete.forEach((key) => {
      this.enumCache.delete(key);
      this.enumLoadingCache.delete(key);
    });

    // 清除包含该模型的 QueryRef 缓存
    const queryRefKeysToDelete: string[] = [];
    this.queryRefDataCache.forEach((_, cacheKey) => {
      if (cacheKey.includes(`"modelKey":"${modelKey}"`)) {
        queryRefKeysToDelete.push(cacheKey);
      }
    });
    queryRefKeysToDelete.forEach((key) => {
      this.queryRefDataCache.delete(key);
      this.queryRefDataLoadingCache.delete(key);
    });
  }

  /**
   * 清除所有模型缓存
   *
   * @author chitanda
   * @date 2025-06-20 16:06:35
   */
  clearAll(): void {
    this.modelCache.clear();
    this.modelLoadingCache.clear();
    this.modelsLoadingCache.clear();
    this.enumCache.clear();
    this.enumLoadingCache.clear();
    this.queryRefDataCache.clear();
    this.queryRefDataLoadingCache.clear();
  }

  /**
   * 获取所有已缓存的模型键
   *
   * @author chitanda
   * @date 2025-06-20 16:06:55
   * @returns {*}  {string[]}
   */
  keys(): string[] {
    return Array.from(this.modelCache.keys());
  }
}

// 导出单例实例
export const modelLoader = new ModelLoader();
