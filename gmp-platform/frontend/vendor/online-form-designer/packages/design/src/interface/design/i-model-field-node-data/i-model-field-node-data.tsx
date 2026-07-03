import { IDesignNodeData, IFont } from '@gct/base';
import { IFieldCodeChain, TagTypeEnum } from '@gct/runtime';

/**
 * 卡片字段设计节点数据接口
 *
 * @author chitanda
 * @date 2025-06-18 17:06:52
 * @export
 * @interface IModelFieldNodeData
 * @extends {IDesignNodeData}
 */
export interface IModelFieldNodeData extends IDesignNodeData {
  /**
   * 模型标识
   *
   * @author chitanda
   * @date 2025-07-02 09:07:02
   * @type {string}
   */
  modelKey: string;
  /**
   * 模型分类
   *
   * @author chitanda
   * @date 2025-07-02 09:07:07
   * @type {string}
   */
  modelCategory: string;
  /**
   * 字段标识
   *
   * @author chitanda
   * @date 2025-06-18 19:06:47
   * @type {string}
   */
  key: string;
  /**
   * 字段类型
   *
   * @author chitanda
   * @date 2025-06-22 11:06:03
   * @type {string}
   */
  type: string;
  /**
   * 字段映射类型
   *
   * @author chitanda
   * @date 2025-06-22 11:06:33
   * @type {string}
   */
  mapping_type?: string;
  /**
   * 字段代码链，表示字段的完整路径。根据字段的层级关系进行拼接
   *
   * @author chitanda
   * @date 2025-06-22 14:06:03
   * @type {IFieldCodeChain}
   */
  fieldCodeChain?: IFieldCodeChain;
  /**
   * 用户自定义的显示名称，未定义则使用字段的名称
   *
   * @author chitanda
   * @date 2025-06-19 10:06:23
   * @type {string}
   */
  label?: string;
  /**
   * 字段名称
   *
   * @author chitanda
   * @date 2025-06-30 11:06:27
   * @type {string}
   */
  name: string;
  /**
   * 是否显示标签
   *
   * @default true
   * @author chitanda
   * @date 2025-06-22 11:06:43
   * @type {boolean}
   */
  show_label?: boolean;
  /**
   * 编辑器类型
   *
   * @author chitanda
   * @date 2025-06-22 11:06:37
   * @type {string}
   */
  editor_type?: string;
  /**
   * 币种：根据编辑器类型显示
   *
   * @author chitanda
   * @date 2025-06-24 14:06:00
   * @type {string}
   */
  currency?: string;
  /**
   * 时间类型：根据编辑器类型显示
   *
   * @author chitanda
   * @date 2025-06-24 14:06:58
   * @type {string}
   */
  time_type?: string;
  /**
   * 格式化分割符存储的配置项
   *
   * @author chitanda
   * @date 2025-06-23 19:06:21
   * @type {string}
   */
  separator?: string;
  /**
   * 字段格式化方式
   *
   * @author chitanda
   * @date 2025-06-22 11:06:55
   * @type {string}
   */
  format?: string;
  /**
   * 标签字体样式配置
   *
   * @author chitanda
   * @date 2025-06-24 19:06:36
   * @type {IFont}
   */
  label_font?: IFont;
  /**
   * 内容字体样式配置
   *
   * @author chitanda
   * @date 2025-06-24 19:06:38
   * @type {IFont}
   */
  content_font?: IFont;
  /**
   * 标签样式配置
   *
   * @author chitanda
   * @date 2025-06-24 19:06:01
   * @type {{
   *     check: boolean;
   *     color: string;
   *     mode: TagTypeEnum;
   *   }}
   */
  tag_style?: {
    check: boolean;
    color: string;
    mode: TagTypeEnum;
  };
}
