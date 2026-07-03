import { PropType, defineComponent, unref, computed, toRefs } from 'vue';
import {
  IFormItem,
  IFormItemController,
  ISpanEditor,
  useCopyToClipboard,
  useNamespace,
  nullDisplayEnum,
} from '@gct/runtime';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';

import './gct-form-span.scss';

export const GctFormSpan = defineComponent({
  name: 'GctFormSpan',
  props: {
    c: {
      type: Object as PropType<IFormItemController>,
      required: true,
    },
    itemModel: {
      type: Object as PropType<IFormItem>,
      required: true,
    },
    model: {
      type: Object as PropType<ISpanEditor>,
      required: true,
    },
    value: {
      type: String,
      default: '',
    },
    isEmptyText: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const ns = useNamespace('form-span');

    const { model, itemModel, c } = toRefs(props);

    const { t } = useI18n() as any;

    function handleClipboardKey() {
      const { isSuccessRef } = useCopyToClipboard(props.value);
      unref(isSuccessRef) && message.success(t('sys.copySuccess'));
    }

    c.value.loadDictionary();

    const val = computed(() => {
      // 格式化
      if (model.value.format && typeof model.value.format === 'function') {
        return model.value.format(c.value.data, itemModel.value, c.value);
      }
      // 无值时直接返回
      if (props.value == null || props.value === '') {
        return props.value;
      }
      // 转换代码表
      if (itemModel.value.dictionary) {
        const items = itemModel.value.dictionary.items || [];
        const dictionaryItem = items.find((item) => {
          return item.value == props.value;
        });
        if (dictionaryItem) {
          return dictionaryItem.label;
        }
      }
      // 转换动态加载的代码表
      if (c.value.state.options.length > 0) {
        const item = c.value.state.options.find((item) => {
          return item.value == props.value;
        });
        if (item) {
          return item.label;
        }
      }
      return props.value;
    });

    return { ns, val, handleClipboardKey };
  },
  render() {
    let text = this.val;
    if (!this.val && this.isEmptyText === true) {
      text = nullDisplayEnum[gct.appSetting.emptyDisplay] || '';
    }
    return (
      <div class={this.ns.b()}>
        <span class={this.ns.e('info')}>{text}</span>
        {this.model.copy && (
          <span class={this.ns.e('copy')}>
            <i class="iconfont icon-fuzhi primary-gct" onClick={this.handleClipboardKey}></i>
          </span>
        )}
      </div>
    );
  },
});
