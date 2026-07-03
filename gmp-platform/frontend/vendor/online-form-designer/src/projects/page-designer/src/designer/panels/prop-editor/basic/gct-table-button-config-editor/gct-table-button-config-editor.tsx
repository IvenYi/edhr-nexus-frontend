import { defineComponent, reactive, WritableComputedRef, computed } from 'vue';
import { useNamespace } from '@gct/runtime';
import { GctTableButtonListEditor } from '../gct-table-button-list-editor/gct-table-button-list-editor';
import { GctTableRdoButtonConfigEditor } from '../gct-table-rdo-button-config-editor/gct-table-rdo-button-config-editor';
import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
import { useI18n } from 'vue-i18n';
import './gct-table-button-config-editor.scss';

export const GctTableButtonConfig = defineComponent({
  // eslint-disable-next-line vue/component-definition-name-casing
  name: 'gct-table-button-config-editor',
  props,
  setup(defProps) {
    const { t } = useI18n() as any;
    const ns = useNamespace('table-button-config-editor');

    const map: Map<string, WritableComputedRef<any>> = new Map();

    const propConfig = reactive<IData>(defProps.propConfig);

    // 按钮组各个按钮的位置
    const keys = Object.keys((defProps.propName as IData).list);
    // rdo 情况下的 keys 清单
    const childKeysMap: Map<string, string[]> = new Map();

    const setProp = (key: string, tag: string) => {
      const propEditor = usePropEditor(tag, defProps.changeCallback);
      map.set(key, propEditor.propValue);
    };

    keys.forEach((key) => {
      const val = (defProps.propName as IData).list[key];
      if (val instanceof Array) {
        const keys2: string[] = [];
        val.forEach((item, i) => {
          const tag = `${key}.${i}`;
          keys2.push(tag);
          setProp(tag, item);
        });
        childKeysMap.set(key, keys2);
      } else {
        setProp(key, val);
      }
    });

    const activeCount = computed<number>(() => {
      // 计算有多少个分组是激活的
      let count = 0;
      keys.forEach((key) => {
        const val = (defProps.propName as IData).list[key];
        if (val instanceof Array) {
          // 如果有子分组计算子分组有多少个激活的
          let num = 0;
          val.forEach((_item, i) => {
            const propValue = map.get(`${key}.${i}`)!;
            if (
              propValue.value &&
              propValue.value.children &&
              propValue.value.children.length > 0
            ) {
              num += 1;
            }
          });
          // 子分组只要有一个激活，主计算 +1
          if (num > 0) {
            count += 1;
          }
        } else {
          const propValue = map.get(key)!;
          if (propValue.value && propValue.value.children && propValue.value.children.length > 0) {
            count += 1;
          }
        }
      });
      return count;
    });

    const renderTabPane = (key: string, i: number) => {
      const val = (defProps.propName as IData).list[key];
      let count = 0;
      if (val instanceof Array) {
        val.forEach((_item, i) => {
          const propValue = map.get(`${key}.${i}`)!;
          if (propValue.value && propValue.value.children && propValue.value.children.length > 0) {
            count = 1;
          }
        });
      } else {
        const propValue = map.get(key)!;
        if (propValue.value && propValue.value.children && propValue.value.children.length > 0) {
          count = 1;
        }
      }
      if (count === 0) {
        return;
      }
      const config = propConfig.btnConfig[key];
      const content = Array.isArray(val) ? (
        <GctTableRdoButtonConfigEditor
          {...(defProps as IData)}
          names={keys}
          names2={childKeysMap.get(key)!}
          propName={val}
          configs={config.children}
          single={activeCount.value === 1}
          map={map}
          key={key}
        />
      ) : (
        <GctTableButtonListEditor
          {...(defProps as IData)}
          propValue={map.get(key)!}
          propConfig={config}
          showBorder
          single={activeCount.value === 1}
          map={map}
          key={key}
        />
      );
      if (activeCount.value === 1) {
        return <div class={ns.b('item')}>{content}</div>;
      }
      return (
        <a-tab-pane key={key + i.toString()} tab={t(config.title)}>
          {content}
        </a-tab-pane>
      );
    };

    return {
      t,
      ns,
      propConfig,
      keys,
      activeCount,
      renderTabPane,
    };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        {this.activeCount > 1 ? (
          <a-tabs>{this.keys.map((key, i) => this.renderTabPane(key, i))}</a-tabs>
        ) : (
          this.keys.map((key, i) => this.renderTabPane(key, i))
        )}
      </div>
    );
  },
});

export default GctTableButtonConfig;
