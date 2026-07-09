import { defineComponent, onMounted, onBeforeUnmount, watch, provide, ref, computed } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { DesignSaveTip, DesignViewLayout, type IViewStep } from '@gct/runtime-web-next';
import { loadPageInfo, newKeyTag, pageInfo, platform, usePage } from '../hooks/usePage';
import { useMitt } from '/@page-designer/hooks/useMitt';
import { useScope } from '../hooks/useScope';
import { initMethodMap } from '/@/utils/transform-js';
import { isModified, useDesigner } from '../hooks/useDesigner';
import { DesignerController } from './designer.controller';
import { initSchema } from '../schema';
import { Platform, PlatformType, t, useAppInst, useIFrameProps } from '@gct/runtime';
import { DesignerViewContent } from './designer-view-content';
import { DesignerViewInfo } from './designer-view-info';
import { DesignViewLock } from './components/design-view-lock/design-view-lock';
import { message, Modal } from 'ant-design-vue';
import { SvgIcon } from '@gct/runtime-web';
import { useQueryStore } from '/@/store/modules/query';
import { ComponentSearch } from '/@/components/ComponentSearch';
import { useUserOccupy } from '/@/components/UserOccupy/useUserOccupy';
import './designer-view.scss';
import { DevTools } from '/@/components/DevTools';

enum DesignStep {
  INFO = 'info',
  DESIGN = 'design',
}

export const DesignerView = defineComponent({
  name: 'DesignerView',
  setup() {
    const app = useAppInst();
    const ns = useNamespace('designer-view');

    const queryStore = useQueryStore();
    const pid = queryStore.getPid()!;
    const categoryId = queryStore.getCategory()!;

    const { cancelOccupy } = useUserOccupy();

    const layoutRef = ref<any>(null);
    const infoRef = ref<any>(null);

    const isPreviewLoading = ref<boolean>(false);

    const step = ref<string>(pid.startsWith(newKeyTag) ? DesignStep.INFO : DesignStep.DESIGN);

    const steps = ref<IViewStep[]>();

    initSchema();

    const iframeProps = useIFrameProps();

    // 向父窗口发送回调消息的辅助函数
    const sendCallback = (method: string, ...args: any[]) => {
      window.parent.postMessage(
        {
          type: 'IFRAME_CALLBACK',
          method,
          args,
        },
        '*',
      );
    };

    const controller = new DesignerController();

    provide('designer', controller);

    const { initLockState } = usePage();
    const { mitt } = useMitt();
    const { scopeJs } = useScope();
    const { methodMap, modalInfo, save, preview, previewSandbox, getDataList, sandboxList } =
      useDesigner();

    //在模态框设计切换时 要重新初始化当前作用域的methodMap
    watch(
      () => modalInfo.value.id,
      () => {
        methodMap.value = initMethodMap(scopeJs.value);
      },
    );

    // 处理浏览器标签页关闭
    const handleBeforeUnload = () => {
      cancelOccupy();
    };

    onMounted(() => {
      getDataList();
      mitt.on('get-schema-code', () => {
        methodMap.value = initMethodMap(scopeJs.value);
      });
      // 监听浏览器标签页关闭事件
      window.addEventListener('beforeunload', handleBeforeUnload);
    });

    onBeforeUnmount(() => {
      mitt.off('get-schema-code');
      // 移除事件监听器
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // 组件卸载时也取消占用
      cancelOccupy();
    });

    const viewMsgClose = ref<boolean>(false);

    const { isNewDesigner } = useDesigner();

    function handleMsgClose(): void {
      viewMsgClose.value = true;
    }

    function convertNewDesigner(): void {
      isNewDesigner.value = true;
    }

    const actions = computed(() => {
      return [
        {
          icon: <i class="gct-iconfont icon-icon_yulan_btn" />,
          title: t('sys.pageDesigner.preview'),
          // loading: isPreviewLoading.value,
          onClick(event) {
            event.stopPropagation();
            onPreview();
          },
          isSupportSandbox:
            sandboxList.value && sandboxList.value.length && sandboxList.value[0][platform.value],
          onClickSandbox(event) {
            event.stopPropagation();
            onPreview('sandbox');
          },
        },
      ];
    });

    async function onInit(): Promise<void> {
      try {
        await loadPageInfo(app);
      } catch (error) {
        console.error('Error loading page info:', error);
      }

      if (platform.value === Platform.MOBILE) {
        gct.designPlatform = PlatformType.PDA;
      } else if (platform.value === Platform.PAD) {
        gct.designPlatform = PlatformType.PAD;
      } else {
        gct.designPlatform = PlatformType.WEB;
      }

      steps.value = [
        {
          tag: DesignStep.INFO,
          name: t('sys.pageDesigner.essentialInformation'),
        },
        {
          tag: DesignStep.DESIGN,
          name:
            platform.value === Platform.MOBILE
              ? t('sys.pageDesigner.pdaPageDesign')
              : platform.value === Platform.PAD
                ? t('sys.pageDesigner.padPageDesign')
                : t('sys.pageDesigner.webPageDesign'),
        },
      ];
    }

    function dismiss(): void {
      sendCallback('close');
    }

    async function onSaveAndExt(
      isInfo: boolean,
      isDesign: boolean,
      isDismiss: boolean = true,
    ): Promise<boolean> {
      try {
        let showSuccessInfo = false;
        if (isDesign && isModified() === true) {
          const bol = await save(true, false);
          if (bol === false) {
            return false;
          }
          showSuccessInfo = true;
        }
        if (isInfo && infoRef.value && infoRef.value.isChanged === true) {
          delete pageInfo.value.designerJson;
          delete pageInfo.value.runtimeJson;
          delete pageInfo.value.newLogId;
          const bol = await infoRef.value.save();
          if (bol === false) {
            return false;
          }
          showSuccessInfo = true;
        }
        if (showSuccessInfo) {
          if (window.self === window.top) {
            message.success(t('sys.saveSuccess'));
          } else {
            sendCallback('success', t('sys.saveSuccess'));
          }
        }
        if (isDismiss) {
          dismiss();
        }
      } catch (error) {
        console.error('Error during info save:', error);
        return false;
      }
      return true;
    }

    function handleBack(e): void {
      if (confirm) {
        confirm.destroy();
        confirm = null;
      }
      const isModifiedChange = isModified();
      if ((infoRef.value && infoRef.value.isChanged) || isModifiedChange) {
        window.gct.openUtil.popover(
          e.target as HTMLDivElement,
          DesignSaveTip,
          {
            exit: () => {
              cancelOccupy();
              dismiss();
            },
            saveAndExit: () => {
              onSaveAndExt(infoRef.value.isChanged, isModifiedChange);
            },
          },
          {
            className: ns.e('save-tip'),
            noArrow: true,
            offsetOpts: { mainAxis: 16, crossAxis: 152 },
          },
        );
      } else {
        dismiss();
      }
    }

    let confirm: any = null;

    async function onNext(): Promise<void> {
      const res = await infoRef.value.validate();
      if (res === false) {
        return;
      }
      // 触发下一步事件
      if (infoRef.value && infoRef.value.isChanged === true) {
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
                const bol = await infoRef.value.save();
                if (bol === false) {
                  resolve(false);
                  return false;
                }
                message.success(t('sys.saveSuccess'));
                await initLockState();
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
      step.value = DesignStep.DESIGN;
    }

    /**
     * 变更步骤
     *
     * @author chitanda
     * @date 2025-07-30 16:07:18
     * @param {string} stepId
     */
    function onChangeStep(stepId: string): void {
      if (step.value === stepId) {
        return;
      }
      if (stepId === DesignStep.DESIGN) {
        layoutRef.value.setStep(DesignStep.INFO);
        onNext();
      } else {
        step.value = stepId;
      }
    }

    async function onPreview(type?): Promise<void> {
      if (isModified() === true) {
        // UI 层防重复点击：若当前正在处理预览则直接返回，未触发保存，不做操作
        if (isPreviewLoading.value) return;
        isPreviewLoading.value = true;
        const done = message.loading({
          content: '保存中...',
          class: 'gct-save-loading',
          duration: 0.3,
        });
        const bol = await onSave();
        done();
        if (bol !== true) {
          isPreviewLoading.value = false;
          return;
        }
      }
      try {
        if (type) {
          previewSandbox();
        } else {
          preview();
        }
      } catch (error) {
        console.error('Error during preview:', error);
      } finally {
        // 轻量操作，稍作延迟防止短时间连续触发（与 hook 内 800ms 节流互补）
        setTimeout(() => {
          isPreviewLoading.value = false;
        }, 300);
      }
    }

    function onSave(): Promise<boolean> {
      return onSaveAndExt(true, true, false);
    }

    function renderBody() {
      return [
        !isNewDesigner.value && viewMsgClose.value === false ? (
          <div class={ns.e('view-message')}>
            <a-alert
              message={t('sys.pageDesigner.convertNewDesignerMsg')}
              banner
              closable
              onClose={handleMsgClose}
            />
            <div class="convert-btn">
              <a-button type="link" onClick={convertNewDesigner}>
                {t('sys.pageDesigner.convert')}
              </a-button>
            </div>
          </div>
        ) : null,
        <DesignerViewInfo
          key="designer-view-info"
          ref={(ref) => (infoRef.value = ref)}
          class={ns.is('hidden', step.value !== DesignStep.INFO)}
          category={iframeProps.value?.params?.category || categoryId}
        />,
        pageInfo.value.id && pageInfo.value.id !== newKeyTag ? (
          <DesignerViewContent
            key="designer-view-content"
            hidden={step.value !== DesignStep.DESIGN}
          />
        ) : null,
      ];
    }

    onInit();

    return () => {
      return (
        <DesignViewLayout
          ref={(ref) => (layoutRef.value = ref)}
          class={ns.b()}
          name={pageInfo.value.name}
          defaultName={t('sys.pageDesigner.unnamedPageDesign')}
          subTitle={t('sys.pageDesigner.pageDesign')}
          step={step.value}
          steps={steps.value}
          actions={actions.value}
          save={onSave}
          next={onNext}
          onBack={handleBack}
          onStepChange={onChangeStep}
          onChangeName={(name: string) => {
            pageInfo.value.name = name;
            infoRef.value?.setName(name);
          }}
        >
          {{
            default: () => {
              return pageInfo.value && pageInfo.value.id ? renderBody() : null;
            },
            headerRight: () => {
              return step.value === DesignStep.DESIGN ? (
                <div class={ns.e('header-right')}>
                  <DevTools />
                  <div class={ns.e('widget-search')}>
                    <ComponentSearch />
                  </div>
                  <div class={ns.e('design-lock')}>
                    <DesignViewLock />
                  </div>
                </div>
              ) : null;
            },
          }}
        </DesignViewLayout>
      );
    };
  },
});

export default DesignerView;
