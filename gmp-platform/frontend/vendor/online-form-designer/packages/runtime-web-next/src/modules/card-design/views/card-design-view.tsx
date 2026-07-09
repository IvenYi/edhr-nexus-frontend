import { defineComponent, PropType, ref } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { IModal, useAppInst } from '@gct/runtime';
import { SvgIcon } from '@gct/runtime-web';
import {
  DesignNodeType,
  DesignViewPrefix,
  IDesignViewOptions,
  NodeRegister,
  useDesignViewController,
} from '@gct/runtime-design';
import { message, Modal } from 'ant-design-vue';
import { cloneDeep } from 'lodash-es';
import { DesignSaveTip, DesignViewLayout } from '../../../components';
import { IViewStep } from '../../../interface';
import { initCardDesignStore } from '../store';
import { CARD_DESIGN_STEP, CARD_MODE } from '../enum';
import { CardDesignConfig, CardInfoForm } from '../widgets';
import Plugins from '../plugins';
import {
  getCommonInfoCardInfo,
  putCommonInfoCardById,
  postCommonInfoCard,
} from '/@/apis/gct-apaas/CommonInfoCardController';
import './card-design-view.scss';

export const CardDesignView = defineComponent({
  name: 'CardDesignView',
  props: {
    id: {
      type: String,
    },
    modelKey: {
      type: String,
    },
    modal: {
      type: Object as PropType<IModal>,
      required: true,
    },
    params: {
      type: Object,
    },
  },
  setup(props) {
    const app = useAppInst();
    app.use(Plugins);

    const t = (window as any).$t;
    const ns = useNamespace('card-design-view');
    const layoutRef = ref();
    const infoFormRef = ref();
    const designRef = ref();
    // 设计视图配置
    const opts: IDesignViewOptions = {
      title: (window as any).$t('sys.cardDesign.title'),
      prefix: DesignViewPrefix.CARD_DESIGN,
      isMobile: false,
    };
    // 上下文信息
    const context = ref<IContext>({ id: props.id, designType: opts.prefix });
    // 设计界面通用控制器
    const c = useDesignViewController();
    c.store.prefix = opts.prefix as DesignViewPrefix.CARD_DESIGN;
    c.store.rootExpLabel = '卡片';

    const store = initCardDesignStore();

    // 设计步骤
    const steps: IViewStep[] = [
      {
        tag: CARD_DESIGN_STEP.INFO,
        name: t('sys.cardDesign.step.info'),
      },
      {
        tag: CARD_DESIGN_STEP.CONFIG,
        name: t('sys.cardDesign.step.cardConfig'),
      },
    ];
    // 当前步骤
    const step = ref<string>('');

    async function onStepChange(newStep: string) {
      // 如果是基本信息填写，跳转全走下一步逻辑
      if (step.value === CARD_DESIGN_STEP.INFO) {
        layoutRef.value?.setStep(CARD_DESIGN_STEP.INFO);
        await onNext();
        return;
      }
      step.value = newStep;
    }

    function onClose(e: MouseEvent): void {
      if (confirm) {
        confirm.destroy();
        confirm = null;
      }
      if (store.dirtyCheck || c.store.isChange) {
        window.gct.openUtil.popover(
          e.target as HTMLDivElement,
          DesignSaveTip,
          {
            exit: () => {
              props.modal.dismiss();
            },
            saveAndExit: () => {
              onSaveAndClose();
            },
          },
          {
            className: ns.e('save-tip'),
            noArrow: true,
            offsetOpts: { mainAxis: 16, crossAxis: 152 },
          },
        );
      } else {
        props.modal.dismiss();
      }
    }

    async function onLoad(): Promise<void> {
      if (props.id) {
        const res = await getCommonInfoCardInfo({ id: props.id });
        if (res) {
          store.data = res;
          if (res.designerJson) {
            store.json = JSON.parse(decodeURIComponent(res.designerJson));
            step.value = CARD_DESIGN_STEP.CONFIG;
            c.store.setData(store.json);
          }
          context.value.id = store.data.id;
          context.value.modelKey = store.data.modelKey;
        }
      } else {
        step.value = steps[0].tag;
        const provider = NodeRegister.get(DesignNodeType.PAGE, DesignViewPrefix.CARD_DESIGN);
        c.store.setData({
          nodes: [],
          pageNode: provider ? provider.create() : null,
          tree: [],
          type: DesignViewPrefix.CARD_DESIGN,
        });
      }
      if (store.json && !store.json.name) {
        store.json.name = '';
      }
      c.store.isChange = false;
      store.disableDirtyCheck();
    }

    async function onSave(): Promise<void> {
      const previewImage = await designRef.value?.getPreviewImage();
      const data = c.store.getData();
      if (data) {
        Object.assign(store.json, data);
      }
      // 数据格式处理
      store.data.designerJson = JSON.stringify(store.json);
      store.data.description = store.json.description || '';
      if (store.json.mode) {
        if (store.json.mode === CARD_MODE.SIMPLE) {
          store.data.edition = 'EASY';
        }
        if (store.json.mode === CARD_MODE.ADVANCED) {
          store.data.edition = 'PROFESSIONAL';
        }
      }
      store.data.modelKey = store.json.modelKey || '';
      store.data.modelCategory = store.json.category || '';
      store.data.modelName = store.json.modelName || '';
      store.data.name = store.json.name || '';
      store.data.screenShoot = previewImage || '';
      store.data.type = 'CARD';
      if (store.data.id) {
        try {
          await putCommonInfoCardById({ id: store.data.id }, store.data, {
            transferToConfig: {
              headers: { OperateType: props?.params?.isEdit ? 'UPDATE' : 'INSERT' },
            },
          });
        } catch (error) {
          console.error('Error updating card info:', error);
          return;
        }
      } else {
        const id = await postCommonInfoCard(store.data);
        store.data.id = id;
      }
      // 更新上下文信息
      context.value.id = store.data.id;
      context.value.modelKey = store.data.modelKey;
      message.success(t('sys.saveSuccess'));
      c.store.isChange = false;
      store.disableDirtyCheck();
    }

    let confirm: any = null;

    async function onNext(): Promise<void> {
      const is = await infoFormRef.value?.validate();
      if (!is) {
        // 如果当前步骤是信息填写，验证不通过则不允许进入下一步
        return;
      }
      if (store.dirtyCheck || c.store.isChange) {
        const isOk = await new Promise<boolean>((resolve) => {
          if (confirm) {
            confirm.destroy();
            confirm = null;
          }
          confirm = Modal.confirm({
            content: t('sys.cardDesign.saveTip'),
            okText: t('sys.saveAndContinue'),
            cancelText: t('sys.cancel'),
            width: 240,
            class: ns.e('save-confirm'),
            icon: <SvgIcon src="/assets/card-design/exclamation-circle.svg" />,
            mask: false,
            onOk: async () => {
              try {
                await onSave();
                resolve(true);
              } catch (error) {
                console.error('Error during save:', error);
                resolve(false);
              }
            },
            onCancel: () => {
              resolve(false);
            },
          });
        });
        if (!isOk) {
          return;
        }
      }
      // 触发下一步事件
      const i = steps.findIndex((s) => s.tag === step.value);
      if (i !== -1 && i < steps.length - 1) {
        const is = await infoFormRef.value?.validate();
        if (is) {
          // 如果当前步骤是信息填写，验证通过后才允许进入下一步
          step.value = steps[i + 1].tag;
        }
      }
    }

    async function onSaveAndClose(): Promise<void> {
      // 如果当前步骤是信息填写，验证不通过则不可以保存
      if (infoFormRef.value) {
        const is = await infoFormRef.value?.validate();
        if (!is) {
          return;
        }
      }
      await onSave();
      props.modal.dismiss({ ok: true, data: [cloneDeep(store.data)] });
    }

    function onChangeName(name: string): void {
      store.json.name = name;
      c.store.isChange = true;
      store.enableDirtyCheck();
    }

    function renderStepContent() {
      switch (step.value) {
        case CARD_DESIGN_STEP.INFO:
          return <CardInfoForm ref={(ref) => (infoFormRef.value = ref)} context={context.value} />;
        case CARD_DESIGN_STEP.CONFIG:
          return (
            <CardDesignConfig
              ref={(ref) => (designRef.value = ref)}
              context={context.value}
              opts={opts}
            />
          );
        default:
          return null;
      }
    }

    async function onInit(): Promise<void> {
      if (props.modelKey) {
        // 如果传入了 modelKey 则设置 store.json.modelKey 默认值
        store.json.modelKey = props.modelKey;
      }
      // 加载数据
      await onLoad();
      // 加载数据后根据数据中的 model key 更新属性节点中的 label
      if (store.json?.modelKey) {
        c.store.map.forEach((node) => {
          if (node.type === DesignNodeType.FIELD) {
            const field = node.data;
            if (field && field.key && field.label) {
              field.name = field.label;
            }
          }
        });
      }
    }

    onInit();

    return () => {
      return (
        <DesignViewLayout
          ref={(ref) => (layoutRef.value = ref)}
          name={store.json?.name}
          class={ns.b()}
          subTitle={t('sys.cardDesign.title')}
          defaultName="未命名卡片名称"
          step={step.value}
          onStepChange={onStepChange}
          steps={steps}
          next={onNext}
          save={onSaveAndClose}
          onBack={onClose}
          onChangeName={onChangeName}
        >
          {renderStepContent()}
        </DesignViewLayout>
      );
    };
  },
});
