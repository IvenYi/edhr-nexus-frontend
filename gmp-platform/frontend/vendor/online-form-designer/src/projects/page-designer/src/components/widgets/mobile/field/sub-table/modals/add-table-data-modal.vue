<template>
  <Popup v-model:show="visible" position="bottom" @close="cancel" teleport="body" :style="popStyle">
    <div class="popupheaher ks-row-middle">
      <div class="w30px"></div>
      <div class="ks-col"> {{ modalTitle }}</div>
      <div class="w30px text-left" @click="visible = false"> <van-icon name="cross" /></div>
    </div>
    <div class="pt52px popbody pb20px">
      <div class="popbox" :style="modalBodyStyle">
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
  import { ref, reactive, computed, provide } from 'vue';

  import { LowCodeModal } from '/@page-designer/types/modal-types';
  import { BuiltinType, WidgetInScopeEnum } from '/@page-designer/enum';
  import FormRender from '../../../basic/form/form-render.vue';
  import Widget from '/@web-render/render/widget/mobile.vue';
  import { Popup } from 'vant';
  import { isEmpty, pick, get, has } from 'lodash-es';
  import { useStyle } from '/@page-designer/hooks/useStyle';

  provide('widgetInScope', WidgetInScopeEnum.GCT_SUB_TABLE_MODAL);

  const props = defineProps<{
    modalInfo: LowCodeModal.Modal | undefined;
    id: string;
  }>();

  const modalProps = computed<LowCodeModal.ModalProps>(() => {
    return props?.modalInfo?.props;
  });

  const visible = ref(false);
  const isEdit = ref(false);

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
    const mUnitType = get(modalProps.value, 'mUnitType', '%');
    const mModalWidth = !has(modalProps.value, 'mModalWidth')
      ? get(modalProps.value, 'modalWidthPercent', 70)
      : get(modalProps.value, 'mModalWidth', 60);
    return {
      height: `${mModalWidth}${mUnitType}`,
      width: '100%',
    };
  });

  const modalBody = computed(() => {
    return props.modalInfo?.children?.find((d) => d.type === BuiltinType.MODAL_BODY);
  });

  async function open(form, t: string, isRestForm = true) {
    isEdit.value = t === 'edit';
    visible.value = true;
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

  defineExpose({ open });
</script>
<style scoped lang="less">
  .popupheaher {
    position: absolute;
    z-index: 999;
    top: 0;
    width: 100%;
    height: 50px;
    background-color: #fff;
    box-shadow: 0 0 10px 0 #888;
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
