import { Ref, computed, defineComponent, ref } from 'vue';
import { useNamespace } from '@gct/runtime';
import { useI18n } from 'vue-i18n';
import './linkage-editor.scss';

export const LinkageEditor = defineComponent({
  // eslint-disable-next-line vue/component-definition-name-casing
  name: 'linkage-editor',
  props: {
    label: {
      type: String,
    },
    beforeValue: {
      type: String,
      required: true,
    },
    afterValue: {
      type: String,
      required: true,
    },
    beforeWidth: {
      type: Number,
      default: 152,
    },
    beforeOption: {
      type: Function || Array<IData>,
      required: true,
    },
    afterOption: {
      type: Function || Array<IData>,
      required: true,
    },
    size: {
      type: String,
      default: 'default',
    },
    isTreeSelect: {
      type: Boolean || (Function as PropType<(IData) => Boolean>),
      default: () => false,
    },
    slots: {
      type: Object,
    },
  },
  emits: ['update:beforeValue', 'update:afterValue'],
  setup(props, { emit }) {
    const ns = useNamespace('linkage-editor');

    const items: Ref<any[]> = ref(Array.isArray(props.beforeOption) ? props.beforeOption : []);
    const items2: Ref<any[]> = ref(Array.isArray(props.afterOption) ? props.afterOption : []);

    const { t } = useI18n() as any;

    const val = computed({
      get() {
        return props.beforeValue;
      },
      set(val) {
        emit('update:beforeValue', val);
        val2.value = null as any;
        items2.value = [];
      },
    });

    const val2 = computed({
      get() {
        return props.afterValue || undefined;
      },
      set(val) {
        emit('update:afterValue', val);
      },
    });

    const onFocus = async () => {
      if (props.beforeOption) {
        if (Array.isArray(props.beforeOption)) {
          items.value = props.beforeOption;
        } else {
          items.value = await props.beforeOption();
        }
      }
      items.value.forEach((item) => {
        item.label = t(item.label);
      });
    };

    const onFocus2 = async () => {
      if (props.afterOption) {
        if (Array.isArray(props.afterOption)) {
          items2.value = props.afterOption.filter((item) => {
            return item.label && item.label.includes(val.value);
          });
        } else {
          items2.value = await props.afterOption(
            val.value,
            items.value.find((item) => item.value === val.value),
          );
        }
      }
      items2.value?.forEach((item) => {
        item.label = t(item.label);
      });
    };

    if (val.value != null) {
      onFocus();
      if (val2.value != null) {
        onFocus2();
      }
    }

    const isTree = () => {
      if (!props.isTreeSelect) return false;
      else if (typeof props.isTreeSelect === 'function')
        return props.isTreeSelect([val.value, val2.value]);
      else return true;
    };

    return { ns, t, val, val2, items, items2, onFocus, onFocus2, isTree };
  },
  render() {
    return (
      <a-form-item class={this.ns.b()} label={this.label}>
        <a-input-group compact>
          <a-select
            class={this.ns.e('before')}
            style={{ width: this.beforeWidth + 'px' }}
            v-model:value={this.val}
            options={this.items}
            size={this.size}
            onFocus={this.onFocus}
          ></a-select>
          <a-select
            getPopupContainer={(element) => element.parentNode}
            v-show={!this.isTree()}
            class={this.ns.e('after')}
            style={{ width: `calc(100% - ${this.beforeWidth}px)` }}
            v-model:value={this.val2}
            options={this.items2}
            size={this.size}
            allowClear
            onFocus={this.onFocus2}
            placeholder={$t('sys.chooseText')}
          ></a-select>
          <a-tree-select
            v-show={this.isTree()}
            v-model:value={this.val2}
            dropdown-style={{ maxHeight: '400px', overflow: 'auto', maxWidth: '240px' }}
            style={{ width: `calc(100% - ${this.beforeWidth}px)` }}
            placeholder={$t('sys.chooseText')}
            onFocus={this.onFocus2}
            allow-clear
            tree-default-expand-all
            listHeight={310}
            tree-data={this.items2}
            filterTreeNode={false}
            treeNodeLabelProp="label"
            dropdownMatchSelectWidth={false}
            v-slots={this.slots}
          ></a-tree-select>
        </a-input-group>
        {this.$slots.default?.()}
      </a-form-item>
    );
  },
});

export default LinkageEditor;
