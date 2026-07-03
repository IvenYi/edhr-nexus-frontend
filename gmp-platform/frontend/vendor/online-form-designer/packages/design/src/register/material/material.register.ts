import { clone } from 'lodash-es';
import { IMaterialData, IMaterialGroup } from '../../interface';
import { DesignViewPrefix } from '../../constant';

/**
 * 素材区素材注册
 *
 * @author zhanghanrui
 * @date 2024-07-09 15:07:50
 * @export
 * @class MaterialRegister
 */
export class MaterialRegister {
  private static groupMap: Map<string, IMaterialGroup> = new Map();

  private static map: Map<string, IMaterialData> = new Map();

  /**
   * 注册素材项
   *
   * @author zhanghanrui
   * @date 2024-07-09 15:07:15
   * @static
   * @param {IMaterialData} material
   * @param {string} [prefix]
   */
  static register(material: IMaterialData, prefix?: string): void {
    const tag = prefix ? `${prefix}:${material.type}` : material.type;
    this.map.set(tag, material);
  }

  /**
   * 注册自定义首页素材
   *
   * @author zhanghanrui
   * @date 2024-07-09 16:07:52
   * @static
   * @param {IMaterialData} material
   */
  static registerCustomHome(material: IMaterialData): void {
    this.register(material, DesignViewPrefix.CUSTOM_HOME);
  }

  /**
   * 注册自定义导航页面
   *
   * @author zhanghanrui
   * @date 2024-08-19 17:08:13
   * @static
   * @param {IMaterialData} material
   */
  static registerCustomExpView(material: IMaterialData): void {
    this.register(material, DesignViewPrefix.CUSTOM_EXP_VIEW);
  }

  /**
   * 注册素材组
   *
   * @author zhanghanrui
   * @date 2024-07-09 15:07:25
   * @static
   * @param {IMaterialGroup} material
   * @param {string} [prefix]
   */
  static registerGroup(material: IMaterialGroup, prefix?: string): void {
    const tag = prefix ? `${prefix}:${material.tag}` : material.tag;
    this.groupMap.set(tag, material);
    if (material.children) {
      material.children.forEach((item) => {
        this.register(item, prefix);
      });
    }
  }

  /**
   * 注册自定义首页素材组
   *
   * @author zhanghanrui
   * @date 2024-07-09 16:07:56
   * @static
   * @param {IMaterialGroup} material
   */
  static registerGroupCustomHome(material: IMaterialGroup): void {
    this.registerGroup(material, DesignViewPrefix.CUSTOM_HOME);
  }

  /**
   * 注册自定义导航页面组
   *
   * @author zhanghanrui
   * @date 2024-08-19 17:08:09
   * @static
   * @param {IMaterialGroup} material
   */
  static registerGroupCustomExpView(material: IMaterialGroup): void {
    this.registerGroup(material, DesignViewPrefix.CUSTOM_EXP_VIEW);
  }

  /**
   * 获取素材项
   *
   * @author zhanghanrui
   * @date 2024-07-16 14:07:28
   * @static
   * @param {string} tag
   * @param {string} [prefix]
   * @return {*}  {(IMaterialData | undefined)}
   */
  static getMaterial(tag: string, prefix?: string): IMaterialData | undefined {
    return this.map.get(prefix ? `${prefix}:${tag}` : tag);
  }

  /**
   * 获取指定的素材清单
   *
   * @author zhanghanrui
   * @date 2024-07-09 16:07:05
   * @static
   * @param {string} [prefix]
   * @return {*}  {IMaterialGroup[]}
   */
  static getList(prefix?: string): IMaterialGroup[] {
    const keys = Array.from(this.groupMap.keys()).filter((_) => _.startsWith(`${prefix}:`));
    const itemKeys = Array.from(this.map.keys()).filter((_) => _.startsWith(`${prefix}:`));
    let arr: IMaterialGroup[] = [];
    keys.forEach((key) => {
      const group = this.groupMap.get(key);
      if (group) {
        arr.push(clone(group));
      }
    });
    arr = arr.sort((a, b) => a.order - b.order);
    let items: IMaterialData[] = [];
    itemKeys.forEach((key) => {
      const item = this.map.get(key);
      if (item) {
        items.push(clone(item));
      }
    });
    items = items.sort((a, b) => a.order - b.order);
    arr.forEach((group) => {
      group.children = items.filter((item) => item.group === group.tag);
    });
    return arr;
  }
}
