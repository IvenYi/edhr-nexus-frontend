import { computed, defineComponent, watch } from 'vue';
import {
  useNamespace,
  gctFormItemEditorProps,
  t,
  IDateFormatSelectEditor,
  IDictionaryItem,
  FIELD_TYPE,
} from '@gct/runtime';
import { useGctFormValue } from '@gct-paas/core';
import './gct-form-date-format-select.scss';

/**
 * 静态2级联选择编辑器,根据数据字典的2级进行联动选择
 */
export const GctFormDateFormatSelect = defineComponent({
  name: 'GctFormDateFormatSelect',
  props: gctFormItemEditorProps<string, IDateFormatSelectEditor>(),
  setup(props) {
    const ns = useNamespace('form-date-format-select');
    const fieldType = computed(() => {
      return props.data![props.model?.fieldTypeKey || 'type'];
    });
    const mappingType = computed(() => {
      return props.data![props.model?.mappingTypeKey || 'mapping_type'];
    });
    const separator = useGctFormValue<string>(props.model?.separatorKey || 'separator');
    const separatorOptions: IDictionaryItem[] = [
      {
        label: '-',
        value: '-',
      },
      {
        label: '/',
        value: '/',
      },
      {
        label: '·',
        value: '.',
      },
    ];
    const val = useGctFormValue<string>();
    const options = computed<IDictionaryItem[]>(() => {
      if (fieldType.value === FIELD_TYPE.DATE_TIME || mappingType.value === FIELD_TYPE.DATE_TIME) {
        return [
          {
            label: `yyyy${separator.value}MM${separator.value}dd HH`,
            value: `YYYY${separator.value}MM${separator.value}DD HH`,
          },
          {
            label: `yyyy${separator.value}MM${separator.value}dd HH:mm`,
            value: `YYYY${separator.value}MM${separator.value}DD HH:mm`,
          },
          {
            label: `yyyy${separator.value}MM${separator.value}dd HH:mm:ss`,
            value: `YYYY${separator.value}MM${separator.value}DD HH:mm:ss`,
          },
        ];
      }
      if (fieldType.value === FIELD_TYPE.DATE || mappingType.value === FIELD_TYPE.DATE) {
        return [
          {
            label: `yyyy`,
            value: `YYYY`,
          },
          {
            label: `yyyy${separator.value}MM`,
            value: `YYYY${separator.value}MM`,
          },
          {
            label: `yyyy${separator.value}MM${separator.value}dd`,
            value: `YYYY${separator.value}MM${separator.value}DD`,
          },
        ];
      }
      return [];
    });

    watch(separator, () => {
      if (fieldType.value === FIELD_TYPE.DATE_TIME || mappingType.value === FIELD_TYPE.DATE_TIME) {
        val.value = `YYYY${separator.value}MM${separator.value}DD HH:mm:ss`;
        return;
      }
      if (fieldType.value === FIELD_TYPE.DATE || mappingType.value === FIELD_TYPE.DATE) {
        val.value = `YYYY${separator.value}MM${separator.value}DD`;
        return;
      }
      val.value = '';
    });

    return () => {
      return (
        <div class={ns.b()}>
          <span class={ns.e('first')}>
            <a-select
              v-model:value={separator.value}
              disabled={props.c!.state.disabled}
              size={props.size}
              placeholder={props.model!.placeholder || t('sys.chooseText')}
              {...(props.model?.props || {})}
            >
              {separatorOptions.map((item) => (
                <a-select-option key={item.value} value={item.value}>
                  {item.label}
                </a-select-option>
              ))}
            </a-select>
          </span>
          <span class={ns.e('second')}>
            <a-select
              v-model:value={val.value}
              disabled={props.c!.state.disabled}
              size={props.size}
              placeholder={props.model!.placeholder || t('sys.chooseText')}
              {...(props.model?.props || {})}
            >
              {options.value.map((item) => (
                <a-select-option key={item.value} value={item.value}>
                  {item.label}
                </a-select-option>
              ))}
            </a-select>
          </span>
        </div>
      );
    };
  },
});
