import { PropType, computed, defineComponent, onUnmounted, ref } from 'vue';
import {
  IFormItemController,
  ISelectEditor,
  useNamespace,
  useGctFormValue,
  EditorController,
} from '@gct/runtime';
import { onClickOutside } from '@vueuse/core';
import './gct-form-select.scss';

export const GctFormSelect = defineComponent({
  name: 'GctFormSelect',
  props: {
    c: {
      type: Object as PropType<IFormItemController>,
      required: true,
    },
    model: {
      type: Object as PropType<ISelectEditor>,
      required: true,
    },
    value: {
      type: String,
      default: '',
    },
    size: {
      type: String,
    },
  },
  emits: ['update:value'],
  setup(props) {
    const ns = useNamespace('gct-form-select');

    const selectRef = ref<any>(null);

    onClickOutside(selectRef, () => {
      open.value = false;
      selectRef.value?.blur();
    });

    const open = ref(false);

    function findParentByClassName(el: HTMLElement, className: string) {
      if (el.className?.indexOf(className) > -1) {
        return el;
      }
      if (el.parentElement) {
        return findParentByClassName(el.parentElement, className);
      }
      return null;
    }

    function onWheel(e: MouseEvent) {
      const el = findParentByClassName(e.target as HTMLElement, 'ant-select-dropdown');
      if (el) {
        return;
      }
      selectRef.value?.blur();
    }
    window.addEventListener('wheel', onWheel);

    const rootRef = ref();

    const editorC = new EditorController(props.model);

    const val = useGctFormValue();

    const val2 = computed({
      get() {
        return val.value != null ? val.value : undefined;
      },
      set(value) {
        val.value = value;
      },
    });

    const options = computed(() => {
      if (props.c.state.options && props.c.state.options.length > 0) {
        return props.c.state.options;
      }
      return editorC.options;
    });

    onUnmounted(() => {
      window.removeEventListener('wheel', onWheel);
    });

    function onCloseDropdown(): void {
      open.value = false;
      if (selectRef.value) {
        selectRef.value.blur();
      }
    }

    function onOpenDropdown(): void {
      open.value = true;
    }

    function onChangeDropdown(): void {
      open.value = !open.value;
    }

    return {
      ns,
      selectRef,
      open,
      rootRef,
      editorC,
      val2,
      options,
      onCloseDropdown,
      onOpenDropdown,
      onChangeDropdown,
    };
  },
  render() {
    return (
      <div ref="rootRef" class={this.ns.b()}>
        {this.model.beforeText ? (
          <div class={this.ns.e('before-text')}>{this.model.beforeText}</div>
        ) : null}
        <div class={this.ns.e('content')}>
          <a-select
            ref="selectRef"
            open={this.open}
            v-model:value={this.val2}
            options={this.options}
            allowClear
            disabled={this.c.state.disabled}
            size={this.size}
            placeholder={this.model.placeholder}
            onChange={this.onCloseDropdown}
            onClick={this.onChangeDropdown}
            {...(this.model.props || {})}
          />
        </div>
        {this.model.afterText ? (
          <div class={this.ns.e('after-text')}>{this.model.afterText}</div>
        ) : null}
      </div>
    );
  },
});

export default GctFormSelect;
