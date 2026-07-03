import { computed, defineComponent, ref } from 'vue';
import { useNamespace } from '@gct-paas/core';
import {
  EditorType,
  FieldIconMap,
  FieldMetaDTO,
  gctFormItemEditorProps,
  IEditorBasic,
  modelLoader,
  t,
} from '@gct/runtime';
import './field-info-editor.scss';

export interface IFieldInfoEditor extends IEditorBasic {
  readonly type: EditorType.FIELD_INFO;
}

export const FieldInfoEditor = defineComponent({
  name: 'FieldInfoEditor',
  props: gctFormItemEditorProps<IObject, IFieldInfoEditor>(),
  setup(props) {
    const ns = useNamespace('field-info-editor');
    // 字段信息
    const field = ref<FieldMetaDTO>({});
    // 字段链信息
    const fieldPaths = ref<string[]>([]);
    // 加载字段信息
    async function loadField(): Promise<void> {
      const modelKey = props.data?.modelKey || props.context.modelKey;
      if (modelKey) {
        const fieldMeta = await modelLoader.loadField(modelKey, props.data?.key);
        if (fieldMeta) {
          field.value = fieldMeta;
        } else {
          field.value = {};
        }
        fieldPaths.value = await modelLoader.loadFieldPaths(
          modelKey,
          field.value.key!,
          props.data?.fieldCodeChain,
        );
      }
    }
    // 加载字段信息
    loadField();
    const fieldKeyText = computed(() => {
      if (field.value) {
        return field.value.key;
      }
      return '';
    });

    return () => {
      return (
        <div class={ns.b()}>
          <div class={ns.e('field-info')}>
            <span class={ns.e('field-name')}>
              <span class={ns.e('field-icon')}>
                <i
                  class={[
                    'iconfont',
                    field.value && FieldIconMap[field.value.type!]
                      ? FieldIconMap[field.value.type!]
                      : 'icon-zidingyi',
                  ]}
                />
              </span>
              <span>{t(`sys.model.${field.value.type}`)}</span>
            </span>
            <span class={ns.e('field-key')} title={fieldKeyText.value}>
              {fieldKeyText.value}
            </span>
          </div>
          <div class={ns.e('field-paths')}>
            {fieldPaths.value
              .flatMap((path, index) => {
                return [
                  index > 0 ? (
                    <span>
                      <i class="iconfont icon-a-Rightarrow text-[12px]! ml4px mr4px" />
                    </span>
                  ) : null,
                  <span>{path}</span>,
                ];
              })
              .filter((item) => item !== null)}
          </div>
        </div>
      );
    };
  },
});
