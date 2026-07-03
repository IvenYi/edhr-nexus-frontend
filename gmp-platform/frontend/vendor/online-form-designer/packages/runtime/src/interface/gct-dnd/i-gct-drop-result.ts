import { IGctDndConfig } from "./i-gct-dnd-config";
import { IGctDndData } from "./i-gct-dnd-data";

/**
 * 放置返回值数据
 *
 * @export
 * @interface IGctDropResultData
 */
export interface IGctDropResultData {
  /**
   * 放置分组标识
   *
   * @type {string}
   */
  group: string;
  /**
   * 是否成功放置
   *
   * @type {boolean}
   */
  success: boolean;
  /**
   * 放置数据
   *
   * @type {IGctDndData}
   */
  data?: IGctDndData;
  /**
   * 额外携带放置配置，用于优化放置对比
   *
   * @type {IGctDndConfig}
   */
  cfg: IGctDndConfig;
}

/**
 * 放置返回值
 *
 * @export
 * @interface IGctDropResult
 */
export interface IGctDropResult {
  /**
   * 放置数据异步钩子
   *
   */
  asyncDrop: () => Promise<IGctDropResultData>;
}
