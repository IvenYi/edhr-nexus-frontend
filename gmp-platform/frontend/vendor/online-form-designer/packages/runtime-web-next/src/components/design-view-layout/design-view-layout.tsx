import { computed, defineComponent, PropType, ref, toRefs } from 'vue';
import { ModalNameEditor } from '@gct/runtime-web';
import type { ButtonProps } from 'ant-design-vue';
import { IViewStep } from '../../interface';
import { DesignStepCheck } from '../design-step-check/design-step-check';
import style from './design-view-layout.module.scss';
import sandboxBtn from '/@app-designer/views/sandbox/components/preview-btn.vue';

export const DesignViewLayout = defineComponent({
  name: 'DesignViewLayout',
  components: { sandboxBtn },
  props: {
    // 当前数据的主要标题名称
    name: {
      type: String,
      default: '未命名',
    },
    defaultName: {
      type: String,
      default: '未命名卡片名称',
    },
    editName: {
      type: Boolean,
      default: true,
    },
    // 可修改名称上的副标题
    subTitle: {
      type: String,
      default: '',
    },
    // 当前步骤标识符
    step: {
      type: String,
      default: '',
    },
    // 设计界面步骤
    steps: {
      type: Array<IViewStep>,
      default: () => [],
    },
    actions: {
      type: Array<ButtonProps>,
      default: () => [],
    },
    save: {
      type: Function as PropType<() => Promise<void>>,
    },
    next: {
      type: Function as PropType<() => Promise<void>>,
    },
  },
  emits: ['changeName', 'back', 'stepChange'],
  setup(props, { slots, emit, expose }) {
    const t = (window as any).$t;

    const stepCheckRef = ref();

    const { name, subTitle, step, steps } = toRefs(props);
    // 是否正在操作中，下一步和保存按钮会根据这个状态来禁用
    const isLoading = ref<boolean>(false);
    const val = computed({
      get() {
        return name.value;
      },
      set(val: string) {
        if (name.value !== val) {
          name.value = val;
          emit('changeName', val);
        }
      },
    });

    // 判断浏览器是否可以后退，用来显示返回按钮
    const isBack = computed<boolean>(() => {
      return history.length > 1 || !!window.$wujie;
    });

    const isLastStep = computed(() => {
      return steps.value.length === 0 || steps.value[steps.value.length - 1].tag === step.value;
    });

    // async function onSaveName(name: string): Promise<void> {
    //   emit('changeName', name);
    // }

    function onBack(e: MouseEvent): void {
      e.stopPropagation();
      // 触发返回事件
      emit('back', e);
    }

    async function onNext(): Promise<void> {
      // 触发下一步事件
      if (props.next) {
        try {
          isLoading.value = true;
          await props.next();
        } catch (error) {
          console.error('DesignViewLayout: next function error', error);
        } finally {
          isLoading.value = false;
        }
      }
    }

    async function onSave(): Promise<void> {
      // 触发保存事件
      if (props.save) {
        try {
          isLoading.value = true;
          await props.save();
        } catch (error) {
          console.error('DesignViewLayout: save function error', error);
        } finally {
          isLoading.value = false;
        }
      }
    }

    function setStep(stepId: string): void {
      if (stepCheckRef.value) {
        stepCheckRef.value.setStep(stepId);
      }
    }

    expose({
      setStep,
    });

    return () => {
      return (
        <div class={style.main}>
          <div class={style.header}>
            <div class={style.header__left}>
              {isBack.value ? (
                <div class={style.header__back} onClick={onBack}>
                  <svg-icon src="/assets/card-design/arrow_back.svg" />
                </div>
              ) : null}
              {props.editName ? (
                <div class={style.header__info}>
                  <div class={style['header__sub-title']}>{subTitle.value}</div>
                  <div class={style.header__title}>
                    <ModalNameEditor
                      v-model:value={val.value}
                      // save={onSaveName}
                      defaultName={props.defaultName}
                    />
                  </div>
                </div>
              ) : null}
            </div>
            <div class={style.header__center}>
              {steps.value.length > 0 ? (
                <DesignStepCheck
                  ref={(ref) => (stepCheckRef.value = ref)}
                  steps={steps.value}
                  currentStep={step.value}
                  onStepChange={(stepId: string, stepData: any) => {
                    emit('stepChange', stepId, stepData);
                  }}
                />
              ) : null}
            </div>
            <div class={style.header__right}>
              {slots.headerRight ? slots.headerRight() : null}
              <div class={style.header__actions}>
                {props.steps.length > 0 ? (
                  isLastStep.value ? (
                    <>
                      {props.actions.map((actionProps) => {
                        return !actionProps.isSupportSandbox ? (
                          <a-button class={style.header__action_btn} {...actionProps}>
                            {actionProps.title}
                          </a-button>
                        ) : (
                          <sandboxBtn {...actionProps} />
                        );
                      })}
                      <a-button
                        class={style.header__action_btn}
                        type="primary"
                        loading={isLoading.value}
                        onClick={onSave}
                        icon={<i class="gct-iconfont icon-icon_baocun_btn" />}
                      >
                        {t('sys.saveText')}
                      </a-button>
                    </>
                  ) : (
                    <a-button type="primary" onClick={onNext}>
                      {t('sys.nextStep')}
                    </a-button>
                  )
                ) : null}
              </div>
            </div>
          </div>
          <div class={style.content}>{slots.default ? slots.default() : null}</div>
        </div>
      );
    };
  },
}) as any;
