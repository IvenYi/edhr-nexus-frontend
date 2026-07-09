import { defineComponent, computed } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
import { SelectProps } from 'ant-design-vue';
import { t } from '@gct/runtime';
import {
  hasEditorMarkup,
  parseEditorMarkup,
  resolveEditorConfig,
  type MarkupOptionEditorConfig,
  type NumberEditorConfig,
} from './editorMarkupParser';
import './gct-table-cell-height-editor.scss';

export const GctTableCellHeightEditor = defineComponent({
  name: 'gct-table-cell-height-editor',
  props,
  setup(defProps) {
    const ns = useNamespace('table-cell-height-editor');
    const propConfig = defProps.propConfig as SelectProps;
    const keys = Object.keys(defProps.propName as object);
    const { propValue } = usePropEditor(keys[0], defProps.changeCallback);
    const otherData: Record<string, WritableComputedRef<unknown>> = {};
    keys.slice(1).forEach((k) => {
      otherData[k] = usePropEditor(keys[1], defProps.changeCallback).propValue;
    });
    const options = computed(() => propConfig.options);

    if (!propValue.value && defProps.propConfig.defaultValue) {
      propValue.value = defProps.propConfig.defaultValue;
    }

    function disabledRadio(): boolean {
      if (propConfig.disabled && typeof propConfig.disabled === 'function') {
        return (propConfig.disabled as unknown as Function)(defProps.widget);
      }
      return false;
    }

    function renderLabelWithEditors(
      opt: IObject,
      label: string,
      optionConfig?: MarkupOptionEditorConfig,
    ) {
      const segments = parseEditorMarkup(label);
      return (
        <span class={ns.e('label')}>
          {segments.map((seg, i) => {
            if (seg.type === 'text') {
              return <span key={i}>{seg.content}</span>;
            }
            const _val = otherData[seg.key];

            const editorCfg = resolveEditorConfig(seg.editorType, optionConfig);
            if (seg.editorType === 'number') {
              const numCfg = editorCfg as NumberEditorConfig;
              return (
                <a-input-number
                  key={i}
                  class={ns.e('inline-editor')}
                  size="small"
                  v-model:value={_val.value}
                  placeholder={t('sys.inputText')}
                  disabled={opt.value !== propValue.value}
                  min={numCfg.min}
                  max={numCfg.max}
                  decimalSeparator={numCfg.decimalSeparator}
                  defaultValue={numCfg.defaultValue}
                  step={numCfg.step ?? 1}
                  controls={false}
                  onClick={(e: MouseEvent) => e.stopPropagation()}
                  onBlur={() => {
                    // 失去焦点时，如果值为空，则重置为默认值
                    if (_val.value == null || _val.value === '') {
                      _val.value = numCfg.defaultValue;
                    }
                  }}
                />
              );
            }
            return null;
          })}
        </span>
      );
    }

    return () => {
      return (
        <div class={ns.b()}>
          <a-radio-group
            class={ns.e('radio')}
            v-model:value={propValue.value}
            disabled={disabledRadio()}
            size="small"
          >
            {options.value?.map((opt, index) => {
              const _cfg = opt._config as MarkupOptionEditorConfig;
              const _label = t(opt.label, _cfg?.i18nData || {});
              const isEditor = hasEditorMarkup(_label);
              return (
                <a-radio
                  value={opt.value}
                  key={index}
                  class={[ns.e('radio-item'), ns.em('radio-item', isEditor ? 'editor' : 'label')]}
                >
                  {isEditor ? (
                    renderLabelWithEditors(opt, _label, _cfg)
                  ) : (
                    <span class={ns.em('radio-item', 'label')}>{_label}</span>
                  )}
                </a-radio>
              );
            })}
          </a-radio-group>
        </div>
      );
    };
  },
});

export default GctTableCellHeightEditor;
