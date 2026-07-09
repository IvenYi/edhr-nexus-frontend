<template>
  <div class="word-render-fill">
    <div class="render-body">
      <aside class="render-sidebar left"> </aside>

      <section class="render-main" ref="scrollRef">
        <DocRenderLayout ref="renderRef" />
      </section>

      <aside class="render-sidebar right"> </aside>
    </div>
    <footer class="render-footer">
      <div class="footer-left"></div>
      <div class="footer-right">
        <!-- <AnnotationBuiltinActions
          :showButtonKeys="showButtonKeys"
          :showAnnotation="showAnnotation"
          :formChanging="formChanging"
          @click-action="handleBuiltAction"
        /> -->

        <BaseButton
          v-for="item in actionButtonList"
          :key="item.type + '_' + item.buttonType"
          class="btn"
          @click="handleBtnClick(item)"
          :title="item.customTitle"
          :loading="loadingMap[`${item.type}_${item.buttonType}`]"
          v-bind="{ ...(item.style || {}) }"
        />
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts" name="word-render-fill">
  import { toRef, ref } from 'vue';
  import { RenderModeEnum, useOnlineFormActionButton } from '@gct/nocode-base';
  import BaseButton from '/@page-designer/components/widgets/web/__components__/base_button.vue';
  import {
    DocRenderLayout,
    useWord,
    DocModeTypeConst,
    getSubmitFormData,
    type WordRuntime,
  } from '@gct-paas/word';
  import { getConfigInfoByWeb } from '../../views/integration/utils/interface';
  import { IActionButtonItem } from '../../views/integration/apaas_si/render/types';
  import { useFormActionHandler } from '../../views/integration/utils/handle';
  import AnnotationBuiltinActions from '../../views/integration/apaas_si/render/annotation/builtin-actions.vue';
  import { useWebAnnotation } from '@gct/nocode-web-render';

  const props = withDefaults(
    defineProps<{
      /** 在线表单实例id */
      selfId: string;
      /** 批次号 */
      materialNo?: string;
      /** 模型 key */
      modelKey: string;
      /** 是否在模态框中 */
      inDrawer: boolean;
      /** 是否是查看页面 */
      isViewPage?: boolean;
      /** 点击按钮后是否直接关闭弹框 */
      keep?: boolean;
      paramExtraProps?: Record<string, any>;
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'btn-click-callback', btn: IActionButtonItem): void;
  }>();

  const { controller }: WordRuntime = useWord(
    {
      requestId: () => props.selfId,
      materialNo: props.materialNo,
    },
    {
      suiteKey: 'edhr',
      modelKey: props.modelKey,
      factoryType: 'instance',
      isMockReport: false,
      isPreview: false,
      isDetailPage: () => props.isViewPage,
      paramExtraProps: props.paramExtraProps,
      renderModeType: DocModeTypeConst.Fill,
      deviceConfig: getConfigInfoByWeb(),
    },
  );

  const { renderActionButton } = useOnlineFormActionButton();

  const { collapseInfo, actionButtonList, loadingMap, handleBtnClick } = useFormActionHandler(
    props,
    {
      formInfo: toRef(() => controller.value?.docRuntimeMeta ?? {}),
      renderActionButton,
      getType: () => {
        let modeType;
        // 转化
        if (
          controller.value?.docRuntimeMeta?.handleInfo?.btnRenderModeType === DocModeTypeConst.Print
        ) {
          modeType = RenderModeEnum.ViewMode;
        } else {
          modeType = RenderModeEnum.FormMode;
        }
        return {
          bpmnType: controller.value?.docRuntimeMeta?.handleInfo?.bpmnType,
          modeType: modeType,
        };
      },
      getAppendixInfos: () => {
        return controller.value?.getDocumentAttachmentPaths();
      },
      getFormState: async () => {
        return getSubmitFormData(controller.value?.rawData());
      },
      validate: async (bool: boolean) => {
        const res = await controller.value?.validate();
        // 校验通过会返回 null，否则会返回所有错误字段信息
        if (res === null) {
          return Promise.resolve(true);
        }
        // 滚动横向滚动条到最右侧，方便看错误信息
        const scrollContainer = document.querySelector('.render-container');
        if (scrollContainer) {
          scrollContainer.scrollTo({
            left: scrollContainer.scrollWidth,
            behavior: 'smooth',
          });
        }
        return Promise.reject(res);
      },
      updateCounter: controller.value?.reload,
      onSuccess: (btn) => {
        emit('btn-click-callback', btn);
      },
    },
  );

  // todo 批注、数据变更相关代码，后续可以进行开发调试
  // const result = ref();

  // const {
  //   selectedCell,
  //   annotationList,
  //   showAnnotation,
  //   formChanging,
  //   showButtonKeys,
  //   handleBuiltAction,
  //   initState,
  // } = useWebAnnotation({
  //   formIns: toRef(() => controller.value?.docRuntimeMeta ?? {}),
  //   basicIns: toRef(() => {
  //     let modeType;
  //     // 转化
  //     if (
  //       controller.value?.docRuntimeMeta?.handleInfo?.btnRenderModeType === DocModeTypeConst.Print
  //     ) {
  //       modeType = RenderModeEnum.ViewMode;
  //     } else {
  //       modeType = RenderModeEnum.FormMode;
  //     }
  //     console.log('docEngine.value?.docInstance.id', controller.value?.id);
  //     return {
  //       uniqueId: controller.value?.id,
  //       btnRenderModeType: modeType,
  //     };
  //   }),
  //   needAbandonBtn: true,
  //   paramExtraProps: props.paramExtraProps,
  //   formRef: {
  //     getFormState: async (uniqueId: string) => {
  //       return getSubmitFormData(controller.value?.rawData());
  //     },
  //     setFromEditStatus: (uniqueId: string) => {
  //       result.value = controller.value?.enterBaseline(uniqueId);
  //       console.log('tangjian1111', result.value);
  //     },
  //     /**
  //      * 设置批注查看状态
  //      * @param status 开启或关闭
  //      * @param config 批注单元格坐标数组
  //      */
  //     setAnnotationViewStatus: async (uniqueId, status, config) => {
  //       if (status) {
  //         controller.value?.setAnnotation(config, annotationList.value);
  //         // 滚动横向滚动条到最右侧，方便看错误信息
  //         const scrollContainer = document.querySelector('.render-container');
  //         if (scrollContainer) {
  //           setTimeout(() => {
  //             scrollContainer.scrollTo({
  //               left: scrollContainer.scrollWidth,
  //               behavior: 'smooth',
  //             });
  //           }, 0);
  //         }
  //       }
  //     },
  //     getAnnotationContentList: async (uniqueId) => {
  //       return await controller.value?.computeBaselineChanges(result.value);
  //     },
  //   },
  //   onBtnClick: (btn) => {
  //     handleBtnClick(btn);
  //   },
  //   checkedEditFormByUser: async () => Promise.resolve(),
  //   onVisibleChange: (visible) => {},
  // });
</script>

<style scoped lang="less">
  .word-render-fill {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;

    .render-body {
      display: flex;
      flex: 1;
      min-height: 0;

      .render-sidebar {
        flex-shrink: 0;
        overflow: auto;
        background: #fff;

        &.left {
          border-right: 1px solid #e0e0e0;
        }

        &.right {
          border-left: 1px solid #e0e0e0;

          .right-container {
            display: flex;
            position: relative;
            height: 100%;
            overflow: hidden;
          }
        }
      }

      .render-main {
        position: relative;
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }
    }

    .render-footer {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: space-between;
      height: 62px;
      padding: 10px 16px;
      border-top: 1px solid #e0e0e0;
      background: #fff;
      font-size: 12px;

      .footer-right {
        display: flex;
        gap: 12px;
      }
    }
  }
</style>
