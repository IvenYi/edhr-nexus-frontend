import { defineComponent, computed, ref } from 'vue';
import {
  useForm,
  useNamespace,
  IFormEditItemController,
  II18nEditor,
  FieldMetaDTO,
  gctFormItemEditorProps,
  modelLoader,
} from '@gct/runtime';

export const GctFormI18n = defineComponent({
  name: 'GctFormI18n',
  props: gctFormItemEditorProps<string, II18nEditor>(),
  emits: ['update:value', 'blur'],
  setup(props, { emit }) {
    const ns = useNamespace('form-i18n');

    const form = useForm();

    const field = ref<FieldMetaDTO>({});
    // 数据修改
    const hasChange = ref<boolean>(false);

    const i18nConfig = form.item[props.model?.cfgKey || 'i18nConfig'] as IFormEditItemController;

    if (!i18nConfig) {
      console.warn(
        `i18nConfig not found in form item, please ensure that the model has a valid cfgKey or i18nConfig is defined in the form.`,
      );
    }

    const fieldKey = computed<string | null>(() => {
      return props.data?.[props.model?.fieldKey || 'fieldKey'] || null;
    });

    async function loadField(): Promise<void> {
      const fieldMeta = await modelLoader.loadField(
        props.data?.modelKey || props.context.modelKey,
        fieldKey.value!,
      );
      if (fieldMeta) {
        field.value = fieldMeta;
      }
    }

    if (fieldKey.value) {
      loadField();
    }

    const val = computed({
      get: () => {
        if (props.value) {
          return props.value;
        }
        if (hasChange.value === true) {
          return '';
        }
        return field.value.name;
      },
      set: (newVal: any) => {
        if (typeof newVal === 'string') {
          newVal = newVal.trim();
        }
        hasChange.value = true;
        if (typeof newVal != 'object' && props.value == newVal) {
          return;
        }
        // 值被清空时，同时清空 i18nConfig 配置
        if (!newVal) {
          i18nConfigValue.value = '';
        }
        emit('update:value', newVal);
      },
    });

    const i18nConfigValue = computed({
      get: () => {
        if (i18nConfig) {
          return {
            i18nKey: i18nConfig.value,
          };
        }
        return '';
      },
      set: (val) => {
        if (!i18nConfig) {
          return;
        }
        try {
          const json = JSON.parse(val as string);
          i18nConfig.value = json.i18nKey;
        } catch (error) {
          console.error(error);
        }
      },
    });

    function onBlur(): void {
      hasChange.value = false;
    }

    return { ns, val, i18nConfigValue, onBlur };
  },
  render() {
    return (
      <i18n-select-input
        class={[this.ns.b(), this.ns.m(this.size)]}
        v-model:i18nText={this.val}
        v-model:i18nConfig={this.i18nConfigValue}
        placeholderText={this.model!.placeholder || this.$t('sys.inputText')}
        attr="i18nKey"
        btnHeight={this.size === 'small' ? '26px' : undefined}
        inputExtraProps={{
          showCount: true,
          maxlength: this.model!.max || 32,
          disabled: this.c!.state.disabled,
        }}
        onBlur={(e) => {
          this.onBlur();
          this.$emit('blur', e);
        }}
        size={this.size}
        {...(this.model?.props || {})}
      />
    );
  },
});

export default GctFormI18n;
