import { PropType } from 'vue';
import { IEditorBasic, IFormEditItem, IFormItemController } from '../../interface';

/**
 * 标准的表单项输入属性
 *
 * @author chitanda
 * @date 2025-06-22 13:06:34
 * @export
 * @template T
 * @template M
 * @template C
 * @returns {*}
 */
export function gctFormItemEditorProps<
  T = IObject,
  M extends IEditorBasic = IEditorBasic,
  C extends IContext = IContext,
>() {
  return {
    context: {
      type: Object as PropType<C>,
      default: () => ({}),
    },
    value: {
      type: Object as PropType<T>,
    },
    model: {
      type: Object as PropType<M>,
      required: true,
    },
    c: {
      type: Object as PropType<IFormItemController>,
      required: true,
    },
    itemModel: {
      type: Object as PropType<IFormEditItem>,
    },
    data: {
      type: Object,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    keepalive: {
      type: Boolean,
      default: false,
    },
    visible: {
      type: Boolean,
      default: true,
    },
    size: {
      type: String as PropType<'small' | 'medium' | 'large'>,
    },
    count: {
      type: Number,
      default: 0,
    },
    // 空数据时是否显示提示文本
    isEmptyText: {
      type: Boolean,
      default: false,
    },
  };
}
