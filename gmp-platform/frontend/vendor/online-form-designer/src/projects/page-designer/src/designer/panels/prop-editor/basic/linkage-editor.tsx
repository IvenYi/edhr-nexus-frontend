import { Ref, computed, defineComponent, ref } from 'vue';
import { useNamespace } from '@gct/runtime';
import { useI18n } from 'vue-i18n';
import { usePropEditor, props } from '/@page-designer/hooks/usePropEditor';
import './linkage-editor.scss';

export const LinkageEditor = defineComponent({
  // eslint-disable-next-line vue/component-definition-name-casing
  name: 'linkage-editor',
  props,
  setup(defProps) {
    const ns = useNamespace('linkage-editor');

    const { options, options2, width = 80, isTreeSelect, slots } = defProps.propConfig;

    const items: Ref<any[]> = ref(Array.isArray(options) ? options : []);
    const items2: Ref<any[]> = ref(Array.isArray(options2) ? options2 : []);

    const { t } = useI18n() as any;

    const [name, name2] = (defProps.propName as IData).list?.split(';') || [];

    const { propValue: value } = usePropEditor(name, defProps.changeCallback);
    const { propValue: value2 } = usePropEditor(name2, defProps.changeCallback);

    const val = computed({
      get() {
        return value.value;
      },
      set(val) {
        value.value = val;
        value2.value = null;
        items2.value = [];
      },
    });

    const val2 = computed({
      get() {
        return value2.value || undefined;
      },
      set(val) {
        value2.value = val;
      },
    });

    const onFocus = async () => {
      if (options) {
        if (Array.isArray(options)) {
          items.value = options;
        } else {
          items.value = await options(defProps.widget);
        }
      }
      items.value.forEach((item) => {
        item.label = t(item.label);
      });
    };

    const onFocus2 = async () => {
      if (options2) {
        if (Array.isArray(options2)) {
          items2.value = options2.filter((item) => {
            return item.label && item.label.includes(val.value);
          });
        } else {
          items2.value = await options2(
            defProps.widget,
            val.value,
            items.value.find((item) => item.value === val.value),
          );
        }
      }
      items2.value.forEach((item) => {
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
      if (!isTreeSelect) return false;
      else if (typeof isTreeSelect === 'function')
        return isTreeSelect({ [name]: val.value, [name2]: val2.value });
      else return true;
    };

    return { ns, t, val, val2, items, items2, onFocus, onFocus2, width, isTree, slots };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <a-input-group compact>
          <a-select
            class={this.ns.e('before')}
            style={{ width: this.width + 'px' }}
            v-model:value={this.val}
            options={this.items}
            size="small"
            onFocus={this.onFocus}
          ></a-select>
          <a-select
            v-show={!this.isTree()}
            class={this.ns.e('after')}
            style={{ width: `calc(100% - ${this.width}px)` }}
            v-model:value={this.val2}
            options={this.items2}
            size="small"
            allowClear
            onFocus={this.onFocus2}
            placeholder={$t('sys.chooseText')}
          ></a-select>
          <a-tree-select
            v-show={this.isTree()}
            v-model:value={this.val2}
            dropdown-style={{ maxHeight: '400px', overflow: 'auto', maxWidth: '240px' }}
            placeholder={$t('sys.chooseText')}
            onFocus={this.onFocus2}
            allow-clear
            tree-default-expand-all
            listHeight={310}
            tree-data={this.items2}
            filterTreeNode={false}
            treeNodeLabelProp="label"
            size="small"
            style={{ width: `calc(100% - ${this.width}px)` }}
            dropdownMatchSelectWidth={false}
            v-slots={this.slots}
          ></a-tree-select>
        </a-input-group>
      </div>
    );
  },
});

export default LinkageEditor;
