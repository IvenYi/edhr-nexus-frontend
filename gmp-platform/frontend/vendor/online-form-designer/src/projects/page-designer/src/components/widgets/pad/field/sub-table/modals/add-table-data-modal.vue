<template>
  <Popup
    v-model:show="visible"
    position="right"
    @close="cancel"
    :teleport="teleport"
    :style="popStyle"
    :close-on-click-overlay="shouldCloseOverlay"
  >
    <div class="popupheaher ks-row-middle">
      <div class="w30px"></div>
      <div class="ks-col font-600 text-[17px]"> {{ modalTitle }}</div>
      <div class="w30px text-left" @click="visible = false"> <van-icon name="cross" /></div>
    </div>
    <div class="pt52px popbody pb20px">
      <div class="popbox" :style="modalBodyStyle" v-if="visible">
        <form-render
          ref="formRender"
          :widget="modalBody?.children[0]"
          v-slot="{ formState, children }"
        >
          <Widget :widgetlist="children!" :formData="formState" />
        </form-render>
      </div>
      <div class="px-16px">
        <van-button type="primary" block @click="handleOk">保存</van-button>
      </div>
    </div>
  </Popup>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, provide, nextTick } from 'vue';

  import { LowCodeModal } from '/@page-designer/types/modal-types';
  import { BuiltinType, WidgetInScopeEnum } from '/@page-designer/enum';
  import FormRender from '../../../basic/form/form-render.vue';
  import Widget from '/@web-render/render/widget/pad.vue';
  import { Popup } from 'vant';
  import { isEmpty, pick, get, has } from 'lodash-es';
  import { useStyle } from '/@page-designer/hooks/useStyle';
  import { usePadTeleport } from '@mobile/utils/usePadTeleport';

  provide('widgetInScope', WidgetInScopeEnum.GCT_SUB_TABLE_MODAL);

  const { teleport } = usePadTeleport();
  const props = defineProps<{
    modalInfo: LowCodeModal.Modal | undefined;
    id: string;
  }>();
  const modalProps = computed<LowCodeModal.ModalProps>(() => {
    return props?.modalInfo?.props;
  });

  const visible = ref(false);
  const isEdit = ref(false);
  const shouldCloseOverlay = ref(true);
  const formRender = ref();
  const resolveCallback = ref();

  const { wrapperStyle } = useStyle(props?.modalInfo);

  const modalBodyStyle = computed(() => {
    return pick(wrapperStyle.value, [
      'backgroundColor',
      'paddingTop',
      'paddingRight',
      'paddingBottom',
      'paddingLeft',
    ]);
  });

  const modalTitle = computed(() => {
    if (modalProps.value?.isSubTableModal) {
      return isEdit.value ? modalProps.value.editModalTitle : modalProps.value.createModalTitle;
    }
    return modalProps.value.modalTitle;
  });

  const popStyle = computed(() => {
    return {
      width: `${props?.modalInfo?.props.modalWidth}${props?.modalInfo?.props.unitType}`,
      height: '100%',
    };
  });

  const modalBody = computed(() => {
    return props.modalInfo?.children?.find((d) => d.type === BuiltinType.MODAL_BODY);
  });

  async function open(form, t: string, isRestForm = true) {
    isEdit.value = t === 'edit';
    visible.value = true;
    await nextTick();
    // 编辑的时候不需要清空
    if (isRestForm) {
      await formRender.value?.reset();
    }
    if (!isEmpty(form)) {
      await formRender.value.setValue({ ...form });
    }
    return new Promise((resolve) => {
      resolveCallback.value = resolve;
    });
  }

  const handleOk = async () => {
    await formRender.value?.validate();
    visible.value = false;
    resolveCallback.value(formRender.value?.getValue());
  };

  const cancel = () => {
    visible.value = false;
  };

  const isParentOverlayEnabled = (val) => {
    shouldCloseOverlay.value = val;
  };

  // 提供给子组件使用
  provide('isParentOverlayEnabled', isParentOverlayEnabled);

  defineExpose({ open });
</script>
<style scoped lang="less">
  :deep(.gct-pad-form-widget) {
    overflow: visible;
  }
  .popupheaher {
    position: absolute;
    z-index: 999;
    top: 0;
    right: 0;
    width: 100%;
    height: 50px;
    background-color: #fff;
    border-bottom: 1px solid #e0e3eb;
    font-size: 16px;
    font-weight: bold;
    line-height: 50px;
    text-align: center;
  }

  .popbody {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .popbox {
    height: 100%;
    overflow-y: auto;
  }
</style>
