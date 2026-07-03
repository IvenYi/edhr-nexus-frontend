import { EntityModelCategoryEnum } from "@gct/runtime";
import { SourceModeEnum } from "../../enums";

/**
 * 数据来源配置
 *
 * @export
 * @interface SourceConfig
 */
export interface SourceConfig {
  /**
   * 模型模式
   *
   * @type {SourceModeEnum}
   */
  mode: SourceModeEnum;
  /**
   * 标识
   *
   * @type {string}
   */
  key: string;
  /**
   * 名称
   *
   * @type {string}
   */
  name: string;
  /**
   * 模型大类
   *
   * @type {EntityModelCategoryEnum}
   */
  category?: EntityModelCategoryEnum;
}
