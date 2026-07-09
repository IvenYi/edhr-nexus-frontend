import { IEditorBasic } from '@gct/runtime';
import { DesignEditorType } from '../../../constant';

/**
 * 子项编辑器
 *
 * @author zhanghanrui
 * @date 2024-07-29 14:07:55
 * @export
 * @interface IChildListEditor
 * @extends {IEditorBasic}
 */
export interface IChildListEditor extends IEditorBasic {
  readonly type: DesignEditorType.CHILD_LIST_EDITOR;

  /**
   * 标题
   *
   * @author zhanghanrui
   * @date 2024-07-29 15:07:10
   * @type {string}
   */
  title: string;

  /**
   * 默认激活的子数据标识
   *
   * @author zhanghanrui
   * @date 2024-07-29 17:07:49
   * @type {string}
   */
  defaultSelectChildKey?: string;

  /**
   * 编辑的子项，默认是 name
   *
   * @author zhanghanrui
   * @date 2024-07-30 13:07:38
   * @type {string}
   */
  childEditFieldKey?: string;

  /**
   * 是否可以新增
   *
   * @description 默认不可以新增
   * @default true
   * @author zhanghanrui
   * @date 2024-07-29 14:07:21
   * @type {boolean}
   */
  add?: boolean;

  /**
   * 是否允许拖拽排序
   *
   * @description 默认不启用拖拽排序
   * @default false
   * @author zhanghanrui
   * @date 2024-07-29 15:07:20
   * @type {boolean}
   */
  sort?: boolean;

  /**
   * 是否可以删除项
   *
   * @description 默认不启用删除
   * @default true
   * @author zhanghanrui
   * @date 2024-07-29 15:07:19
   * @type {boolean}
   */
  delete?: boolean;

  /**
   * 默认的编辑器
   *
   * @description 默认使用文本编辑器
   * @default 'text'
   * @author zhanghanrui
   * @date 2024-07-29 15:07:31
   * @type {('i18n' | 'text' | 'number')}
   */
  editorType?: 'i18n' | 'text' | 'number';

  /**
   * 编辑器属性
   *
   * @author zhanghanrui
   * @date 2024-08-01 17:08:26
   * @type {IParams}
   */
  editorProps?: IParams;

  /**
   * 是否允许选中项
   *
   * @description 默认不可以选择
   * @default false
   * @author zhanghanrui
   * @date 2024-07-29 15:07:57
   * @type {boolean}
   */
  select?: boolean;

  /**
   * 显示标题
   *
   * @description 默认不显示标题
   * @default false
   * @author zhanghanrui
   * @date 2024-07-30 13:07:14
   * @type {boolean}
   */
  showLabel?: boolean;

  /**
   * 子项类型
   *
   * @author zhanghanrui
   * @date 2024-07-29 15:07:00
   * @type {string}
   */
  childDesignType: string;
}
