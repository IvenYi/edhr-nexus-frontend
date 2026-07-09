import { WritableComputedRef, computed, defineComponent, PropType } from 'vue';
import { useNamespace } from '@gct/runtime';
import { useI18n } from 'vue-i18n';
import { props } from '/@page-designer/hooks/usePropEditor';
import GctTableButtonListEditor from '../gct-table-button-list-editor/gct-table-button-list-editor';
import './gct-table-rdo-button-config-editor.scss';

export const GctTableRdoButtonConfigEditor = defineComponent({
  // eslint-disable-next-line vue/component-definition-name-casing
  name: 'gct-table-rdo-button-config-editor',
  props: {
    ...props,
    configs: {
      type: Array<IData>,
      required: true,
    },
    single: {
      type: Boolean,
      default: false,
    },
    names: {
      type: Array<string>,
      required: true,
    },
    names2: {
      type: Array<string>,
      required: true,
    },
    map: {
      type: Object as PropType<Map<string, WritableComputedRef<any>>>,
      required: true,
    },
  },
  setup(defProps) {
    const { t } = useI18n() as any;
    const ns = useNamespace('table-rdo-button-config-editor');

    const map: Map<string, WritableComputedRef<any>> = defProps.map;

    const activeCount = computed<number>(() => {
      // 计算有多少个分组是激活的
      let count = 0;
      defProps.names2.forEach((val) => {
        const propValue = map.get(val)!;
        if (propValue.value.children && propValue.value.children.length > 0) {
          count += 1;
        }
      });
      return count;
    });

    const renderItem = (key: string, i) => {
      const propValue = map.get(key)!;
      if (!propValue.value.children || propValue.value.children.length === 0) {
        return;
      }
      const config = defProps.configs[i];
      const content = (
        <GctTableButtonListEditor
          {...(defProps as IData)}
          propValue={propValue}
          propConfig={config}
          hiddenTitle={activeCount.value > 1 || defProps.single === false}
          showBorder={activeCount.value === 1}
          single={activeCount.value === 1 && defProps.single === true}
          map={map}
        />
      );
      if (activeCount.value === 1) {
        return <div class={ns.b('item')}>{content}</div>;
      }
      return (
        <a-tab-pane key={i.toString()} tab={t(config.subTitle)}>
          {content}
        </a-tab-pane>
      );
    };

    return { t, ns, activeCount, renderItem };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        {this.activeCount > 1 ? (
          <a-tabs>{this.names2.map((key: string, i: number) => this.renderItem(key, i))}</a-tabs>
        ) : (
          this.names2.map((key: string, i: number) => this.renderItem(key, i))
        )}
      </div>
    );
  },
});

export default GctTableRdoButtonConfigEditor;
