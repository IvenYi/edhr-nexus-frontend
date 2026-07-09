import { computed, WritableComputedRef, defineComponent, PropType, Ref, ref, VNode } from 'vue';
import { useNamespace } from '@gct-paas/core';
import './design-icon-button.scss';

export const DesignIconButton = defineComponent({
  name: 'DesignIconButton',
  props: {
    // 是否激活，支持双向绑定。也可以不给予，由内部自行管理状态
    active: {
      type: Boolean,
    },
    // 内部自行管理状态下的，是否默认激活默认值
    defaultActive: {
      type: Boolean,
      default: false,
    },
    // 默认显示图标
    icon: {
      type: Object as PropType<VNode>,
      required: true,
    },
    // 激活状态显示的图标，在没有给予的情况下，还是显示 icon
    activeIcon: {
      type: Object as PropType<VNode>,
    },
    // 悬浮 tip 提示内容
    tip: {
      type: String,
      required: true,
    },
    // 激活状态下的 tip 提示内容，在没有给予的情况下，还是显示 tip
    activeTip: {
      type: String,
    },
    // 悬浮提示位置
    placement: {
      type: String,
    },
    color: {
      type: String,
    },
    bgColor: {
      type: String,
    },
    hoverColor: {
      type: String,
    },
    hoverBgColor: {
      type: String,
    },
    activeColor: {
      type: String,
    },
    activeBgColor: {
      type: String,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:active', 'change', 'activate', 'deactivate', 'click'],
  setup(props, { emit, slots }) {
    const ns = useNamespace('design-icon-button');
    let isActive: Ref<boolean> | WritableComputedRef<boolean> = ref(props.defaultActive);
    if (props.active != null) {
      // eslint-disable-next-line vue/no-ref-as-operand
      isActive = computed<boolean>({
        set(val: boolean) {
          // 只有和本地不一致时才出发相关逻辑，避免重复发送事件
          if (props.active !== val) {
            emit('update:active', val);
            emit('change', val);
            if (val === true) {
              emit('activate');
            } else {
              emit('deactivate');
            }
          }
        },
        get() {
          return props.active;
        },
      });
    }

    // 触发状态变更
    function handleClick(e: MouseEvent): void {
      // 禁用时不处理点击事件
      if (props.disabled) {
        return;
      }
      e.stopPropagation();
      isActive.value = !isActive.value;
      emit('click', e);
    }

    // 动态设置计算图标呈现 style 属性，用来覆盖主题下的呈现
    const style = computed(() => {
      const obj: IObject = {};
      if (props.color) {
        obj['color'] = props.color;
      }
      if (props.bgColor) {
        obj['bg-color'] = props.bgColor;
      }
      if (props.hoverColor) {
        obj['hover-color'] = props.hoverColor;
      }
      if (props.hoverBgColor) {
        obj['hover-bg-color'] = props.hoverBgColor;
      }
      if (props.activeColor) {
        obj['active-color'] = props.activeColor;
      }
      if (props.activeBgColor) {
        obj['active-bg-color'] = props.activeBgColor;
      }
      return ns.cssVarBlock(obj);
    });

    const activeTitle = computed<string>(() => {
      return isActive.value ? props.activeTip ?? props.tip : props.tip;
    });

    const activeIcon = computed(() => {
      if (isActive.value) {
        if (slots.activeIcon) {
          return slots.activeIcon();
        }
        return props.activeIcon ?? props.icon;
      }
      return slots.icon ? slots.icon() : props.icon;
    });

    return () => {
      return (
        <div
          class={[ns.b(), ns.is('active', isActive.value), ns.is('disabled', props.disabled)]}
          style={style.value}
        >
          <a-tooltip placement={props.placement} title={activeTitle.value} onClick={handleClick}>
            {activeIcon.value}
          </a-tooltip>
        </div>
      );
    };
  },
});
