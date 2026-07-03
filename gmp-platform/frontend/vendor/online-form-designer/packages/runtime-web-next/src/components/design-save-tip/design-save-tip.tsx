import { defineComponent, PropType } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { IModal } from '@gct/runtime';
import './design-save-tip.scss';

export const DesignSaveTip = defineComponent({
  name: 'DesignSaveTip',
  props: {
    modal: {
      type: Object as PropType<IModal>,
      required: true,
    },
    title: {
      type: String,
      default: () => {
        return (window as any).$t('sys.cardDesign.back_info.title');
      },
    },
    content: {
      type: String,
      default: () => {
        return (window as any).$t('sys.cardDesign.back_info.content');
      },
    },
    exit: {
      type: Function as PropType<() => void>,
    },
    saveAndExit: {
      type: Function as PropType<() => void>,
    },
  },
  setup(props) {
    const t = (window as any).$t;
    const ns = useNamespace('design-save-tip');

    /**
     * 继续编辑
     */
    function onContinue(): void {
      props.modal.dismiss({ ok: false });
    }

    /**
     * 不保存并退出
     *
     */
    function onNotSave(): void {
      if (props.exit) {
        props.exit();
      }
      props.modal.dismiss({ ok: true });
    }

    /**
     * 保存并退出
     */
    function onSaveAndExit(): void {
      if (props.saveAndExit) {
        props.saveAndExit();
      }
      props.modal.dismiss({ ok: true });
    }

    return () => {
      return (
        <div class={ns.b()}>
          <div class={ns.e('tip-icon')}>
            <svg-icon src="/assets/design-view/exclamation-circle.svg" />
          </div>
          <div class={ns.e('header')}>{props.title}</div>
          <div class={ns.e('content')}>{props.content}</div>
          <div class={ns.e('footer')}>
            <a-button type="link" onClick={onContinue}>
              {t('sys.app.continueEdit')}
            </a-button>
            <a-button class={ns.e('cancel-btn')} size="small" onClick={onNotSave}>
              {t('sys.cardDesign.back_info.notSave')}
            </a-button>
            <a-button class={ns.e('save-exit')} type="primary" size="small" onClick={onSaveAndExit}>
              {t('sys.cardDesign.back_info.saveAndExit')}
            </a-button>
          </div>
        </div>
      );
    };
  },
});
