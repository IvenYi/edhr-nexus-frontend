import { defineComponent, ref, onUnmounted } from 'vue';
import { useNamespace } from '@gct-paas/core';
import './resizable-textarea.scss';

export const ResizableTextarea = defineComponent({
  name: 'ResizableTextarea',
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
      default: '',
    },
    rows: {
      type: Number,
      default: 4,
    },
    cols: {
      type: Number,
      default: 50,
    },
    minHeight: {
      type: Number,
      default: 80,
    },
    maxHeight: {
      type: Number,
      default: 300,
    },
  },
  emits: ['update:modelValue', 'input', 'change', 'blur', 'focus'],
  setup(props, { emit }) {
    const ns = useNamespace('resizable-textarea');
    const textareaRef = ref<HTMLTextAreaElement>();
    const containerRef = ref<HTMLDivElement>();
    const resizeHandleRef = ref<HTMLDivElement>();

    const isResizing = ref(false);

    let startY = 0;
    let startHeight = 0;

    const handleInput = (event: Event) => {
      const target = event.target as HTMLTextAreaElement;
      emit('update:modelValue', target.value);
      emit('input', event);
    };

    const handleChange = (event: Event) => {
      emit('change', event);
    };

    const handleBlur = (event: FocusEvent) => {
      emit('blur', event);
    };

    const handleFocus = (event: FocusEvent) => {
      emit('focus', event);
    };

    const handleMouseDown = (event: MouseEvent) => {
      if (!textareaRef.value || props.disabled) return;

      event.preventDefault();
      isResizing.value = true;

      const rect = textareaRef.value.getBoundingClientRect();
      startY = event.clientY;
      startHeight = rect.height;

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isResizing.value || !textareaRef.value) return;

      const deltaY = event.clientY - startY;
      const newHeight = Math.max(props.minHeight, Math.min(props.maxHeight, startHeight + deltaY));

      textareaRef.value.style.height = `${newHeight}px`;
    };

    const handleMouseUp = () => {
      isResizing.value = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };

    onUnmounted(() => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    });

    return {
      ns,
      textareaRef,
      containerRef,
      resizeHandleRef,
      isResizing,
      handleInput,
      handleChange,
      handleBlur,
      handleFocus,
      handleMouseDown,
    };
  },
  render() {
    return (
      <div ref="containerRef" class={[this.ns.b(), { [this.ns.m('resizing')]: this.isResizing }]}>
        <textarea
          ref="textareaRef"
          class={this.ns.e('textarea')}
          value={this.modelValue}
          disabled={this.disabled}
          placeholder={this.placeholder}
          rows={this.rows}
          cols={this.cols}
          onInput={this.handleInput}
          onChange={this.handleChange}
          onBlur={this.handleBlur}
          onFocus={this.handleFocus}
        />
      </div>
    );
  },
});
