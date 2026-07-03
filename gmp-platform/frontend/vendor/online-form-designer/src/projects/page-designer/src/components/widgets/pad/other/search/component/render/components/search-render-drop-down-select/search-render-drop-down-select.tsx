import { computed, defineComponent } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { createIosPopup } from '@mobile/InstanceComponent/select-picker';
import { GctSvgIcon } from '/@/projects/page-designer/src/components/common/svg-icon/svg-icon';
import { toRefs } from '@vueuse/core';
import './search-render-drop-down-select.scss';
import { useGlobalSetting } from '/@/hooks/platform/globalSetting';

export interface IOptionItem {
  text: string;
  value: string | boolean | number;
  item?: IObject;
}

export const SearchRenderDropDownSelect = defineComponent({
  name: 'SearchRenderDropDownSelect',
  props: {
    modelValue: {
      type: String,
    },
    widget: {
      type: Object as PropType<IObject>,
      required: true,
    },
    options: {
      type: Array as PropType<IOptionItem[]>,
      default: () => [],
    },
    title: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const ns = useNamespace('search-render-drop-down-select');
    const { displayValue: emptyDisplayValue } = useGlobalSetting();

    const { placeholder = '请选择' } = props.widget.props;

    const { readonly, disabled } = toRefs(props.widget.props);

    const { openIosPopup } = createIosPopup();

    const val = computed<string>({
      set(val) {
        emit('update:modelValue', val);
      },
      get() {
        return props.modelValue!;
      },
    });

    const selectOpt = computed<IOptionItem | undefined>(() => {
      return props.options.find((item) => item.value === val.value);
    });

    async function onSelect() {
      if (readonly.value || disabled.value) {
        return;
      }
      const currValue = await openIosPopup({
        value: [val.value || ''],
        options: props.options,
        title: props.title || '请选择',
      });
      val.value = currValue.value[0] as string;
    }

    async function onClear(e: Event) {
      e.stopPropagation();
      val.value = '';
    }

    return () => {
      const label = selectOpt.value?.text;
      const empty = !label;
      if (readonly.value) {
        return (
          <div class={['pad-search-editor', ns.b(), ns.is('readonly', true)]}>
            <span class={[ns.e('label')]}>{label || emptyDisplayValue.value}</span>
          </div>
        );
      }
      return (
        <div class={['pad-search-editor', ns.b()]} onClick={onSelect}>
          <span class={[ns.e('label'), ns.is('placeholder', empty)]}>
            {empty ? placeholder : label}
          </span>
          {disabled.value ? null : (
            <span class={[ns.e('icon'), ns.is('clear', !empty)]}>
              {!empty ? (
                <GctSvgIcon src="/assets/pad/public/delete_input.svg" onClick={onClear} />
              ) : (
                <i class="gct-iconfont icon-zujianziduan-xiajiantou" />
              )}
            </span>
          )}
        </div>
      );
    };
  },
});

export default SearchRenderDropDownSelect;
