import { cloneDeep } from 'lodash-es';
import { IDictionary, IDictionaryItem } from '../../interface';

/**
 * 代码表服务
 *
 * @author zhanghanrui
 * @date 2024-03-27 13:03:26
 * @export
 * @class CodeListService
 */
export class CodeListService {
  /**
   * 代码表配置
   *
   * @author zhanghanrui
   * @date 2024-03-27 13:03:59
   * @private
   * @type {Map<string, IDictionary>}
   */
  private configs: Map<string, IDictionary> = new Map();
  /**
   * 已经加载的代码表缓存
   *
   * @author zhanghanrui
   * @date 2024-03-27 13:03:14
   * @private
   * @type {Map<string, IDictionaryItem[]>}
   */
  private cache: Map<string, IDictionaryItem[]> = new Map();

  /**
   * 获取代码表配置
   *
   * @author zhanghanrui
   * @date 2024-04-02 13:04:32
   * @param {string} tag
   * @return {*}  {(IDictionary | undefined)}
   */
  getConfig(tag: string): IDictionary | undefined {
    return this.configs.get(tag);
  }

  /**
   * 注册写的代码表配置
   *
   * @author zhanghanrui
   * @date 2024-03-27 13:03:17
   * @param {IDictionary} config
   */
  register(config: IDictionary): void {
    this.configs.set(config.tag, config);
    if (config.items) {
      this.cache.set(config.tag, config.items);
    }
  }

  /**
   * 取消注册代码表
   *
   * @author zhanghanrui
   * @date 2024-03-27 13:03:58
   * @param {string} tag
   */
  unregister(tag: string): void {
    this.configs.delete(tag);
    this.cache.delete(tag);
  }

  /**
   * 获取代码表配置
   *
   * @author zhanghanrui
   * @date 2024-03-27 13:03:06
   * @param {string} codeTag
   * @return {*}  {IDictionaryItem[]}
   */
  get(codeTag: string): IDictionaryItem[] {
    return this.cache.get(codeTag) || [];
  }

  /**
   * 动态请求代码表
   *
   * @author zhanghanrui
   * @date 2024-03-27 13:03:14
   * @param {string} codeTag
   * @param {IParams} [params]
   * @return {*}  {Promise<IDictionaryItem[]>}
   */
  async asyncGet(codeTag: string, params?: IParams): Promise<IDictionaryItem[]> {
    const config = this.configs.get(codeTag);
    if (!config) {
      return [];
    }
    if (config.mode === 'static') {
      return this.getByConfig(config);
    }
    if (config.mode === 'async') {
      if (this.cache.has(codeTag)) {
        return this.cache.get(codeTag) || [];
      }
      return this.asyncGetByConfig(config, params);
    }
    return [];
  }

  /**
   * 根据配置获取代码表
   *
   * @author zhanghanrui
   * @date 2024-04-02 21:04:25
   * @param {IDictionary} config
   * @return {*}  {IDictionaryItem[]}
   */
  getByConfig(config: IDictionary): IDictionaryItem[] {
    return config.items || [];
  }

  /**
   * 根据配置获取异步代码表
   *
   * @author zhanghanrui
   * @date 2024-04-02 21:04:00
   * @param {IDictionary} config
   * @param {IParams} [params={}]
   * @return {*}  {Promise<IDictionaryItem[]>}
   */
  async asyncGetByConfig(config: IDictionary, params: IParams = {}): Promise<IDictionaryItem[]> {
    if (config.fetch) {
      const items = await config.fetch(params || {});
      if (items) {
        const [label, value] = config.keys || ['name', 'id'];
        return this.deepFormat(items as IDictionaryItem[], label, value);
      }
    }
    return [];
  }

  /**
   * 递归格式化代码表
   *
   * @author zhanghanrui
   * @date 2024-04-02 22:04:03
   * @protected
   * @param {IDictionaryItem[]} items
   * @param {string} label
   * @param {string} value
   * @return {*}  {IDictionaryItem[]}
   */
  protected deepFormat(items: IDictionaryItem[], label: string, value: string): IDictionaryItem[] {
    return items.map((item) => {
      const config: IDictionaryItem = {
        icon: item.icon,
        label: item[label],
        value: item[value],
        data: cloneDeep(item),
      };
      if (item.children && item.children.length > 0) {
        config.children = this.deepFormat(item.children, label, value);
        config.options = config.children;
      }
      return config;
    });
  }
}

/**
 * 数据字典服务
 *
 * @author zhanghanrui
 * @date 2024-04-02 21:04:37
 * @export
 * @class DictionaryService
 * @extends {CodeListService}
 */
export class DictionaryService extends CodeListService {}
