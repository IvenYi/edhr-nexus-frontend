import { defineComponent, ref, watch, PropType, nextTick, onMounted, toRefs } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { IViewStep } from '../../interface';
import './design-step-check.scss';

/**
 * 设计界面步骤选择
 */
export const DesignStepCheck = defineComponent({
  name: 'DesignStepCheck',
  props: {
    // 步骤数据
    steps: {
      type: Array as PropType<IViewStep[]>,
      default: () => [],
    },
    // 当前步骤
    currentStep: {
      type: [String, Number],
      default: '',
    },
  },
  emits: ['update:currentStep', 'stepChange'],
  setup(props, { emit, expose }) {
    const ns = useNamespace('design-step-check');

    const { steps, currentStep } = toRefs(props);

    const containerRef = ref<HTMLElement>();

    // 内部维护的当前步骤状态
    const innerCurrentStep = ref(currentStep.value);

    const offsetLeft = ref(0);
    const width = ref(0);

    // 更新动画指示器位置
    const updateIndicatorPosition = async () => {
      await new Promise((resolve) => setTimeout(resolve, 100)); // 确保 DOM 更新完成
      await nextTick();
      if (!containerRef.value) return;

      const selectedIndex = steps.value.findIndex((step) => step.tag === innerCurrentStep.value);
      if (selectedIndex === -1) return;

      const items = containerRef.value.querySelectorAll(`.${ns.e('item')}`);
      const selectedItem = items[selectedIndex] as HTMLElement;

      if (selectedItem) {
        // 计算偏移量和宽度
        offsetLeft.value = 2;
        for (let i = 0; i < selectedIndex; i++) {
          const item = items[i] as HTMLElement;
          offsetLeft.value += item.offsetWidth;
        }
        width.value = selectedItem.offsetWidth;
      }
    };

    // 监听外部传入的当前步骤变化
    watch(currentStep, (newValue) => {
      innerCurrentStep.value = newValue;
      updateIndicatorPosition();
    });

    // 如果没有传入当前步骤，默认选中第一个
    watch(steps, (newSteps) => {
      if (newSteps.length > 0 && !innerCurrentStep.value) {
        innerCurrentStep.value = newSteps[0].tag;
        emit('update:currentStep', innerCurrentStep.value);
        emit('stepChange', innerCurrentStep.value, newSteps[0]);
      }
      updateIndicatorPosition();
    });

    // 处理步骤点击
    const handleStepClick = (step: IViewStep) => {
      innerCurrentStep.value = step.tag;
      emit('update:currentStep', step.tag);
      emit('stepChange', step.tag, step);
      updateIndicatorPosition();
    };

    onMounted(() => {
      updateIndicatorPosition();
    });

    /**
     * 设置当前步骤，用于外部控制，不需要触发事件
     *
     * @param {string} tag
     */
    function setStep(tag: string) {
      if (steps.value.some((step) => step.tag === tag)) {
        innerCurrentStep.value = tag;
        updateIndicatorPosition();
      }
    }

    expose({
      setStep,
    });

    return () => {
      return (
        <div
          ref={containerRef}
          class={ns.b()}
          style={{
            '--indicator-display': currentStep.value ? 'block' : 'none',
            '--indicator-left': `${offsetLeft.value || -40}px`,
            '--indicator-width': `${width.value || -131}px`,
          }}
        >
          {props.steps.map((step) => (
            <div
              key={step.tag}
              class={[ns.e('item'), ns.is('selected', step.tag === innerCurrentStep.value)]}
              onClick={() => handleStepClick(step)}
            >
              <div class={ns.e('item-number')}>
                {props.steps.findIndex((s) => s.tag === step.tag) + 1}
              </div>
              <div class={ns.e('item-name')}>{step.name}</div>
            </div>
          ))}
        </div>
      );
    };
  },
});
