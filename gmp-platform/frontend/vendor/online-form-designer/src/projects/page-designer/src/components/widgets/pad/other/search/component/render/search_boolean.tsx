import { computed, defineComponent, onBeforeMount, ref } from 'vue';
import SearchRenderDropDownSelect, {
  type IOptionItem,
} from './components/search-render-drop-down-select/search-render-drop-down-select';
import { FieldSchema } from '/@page-designer/hooks/getFieldSchema';

export const SearchBoolean = defineComponent({
  name: 'SearchBoolean',
  props: {
    modelValue: {
      type: String,
    },
    widget: {
      type: Object as PropType<IObject>,
      required: true,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const options = ref<IOptionItem[]>();

    const val = computed<string>({
      set(val) {
        emit('update:modelValue', val);
      },
      get() {
        return props.modelValue!;
      },
    });
    const getOptions = async () => {
      const info = await FieldSchema.getConfigByField(
        props.widget?.props?.modelKey,
        props.widget?.props?.field,
      );

      const option = info?.specificConfig;
      options.value = option
        ? Object.entries(option)
            .filter(([_, label]) => !Array.isArray(label)) // 过滤掉 value 是数组的条目
            .map(([value, label]) => ({
              text: label,
              value: value === true || value === 'true' ? 1 : 0,
            }))
        : [];
    };
    onBeforeMount(() => {
      getOptions();
    });

    return () => {
      return (
        <SearchRenderDropDownSelect
          v-model:modelValue={val.value}
          widget={props.widget}
          options={options.value}
          title="请选择"
        />
      );
    };
  },
});

export default SearchBoolean;
