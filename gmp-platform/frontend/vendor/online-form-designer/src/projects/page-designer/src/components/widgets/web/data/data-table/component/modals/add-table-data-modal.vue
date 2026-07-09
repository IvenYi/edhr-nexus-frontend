<template>
  <a-drawer v-if="isDrawer" v-model:visible="visible" v-bind="modalProps" placement="right">
    <template #title>
      <div style="min-height: 22px">{{ modalTitle }}</div>
    </template>
    <template #footer>
      <div style="min-height: 22px">
        <div class="modal-footer">
          <!-- <drag-widget-group :parent-drag-widgets="modalFooter!.children" /> -->
          <a-button
            @click="
              () => {
                visible = false;
              }
            "
            >{{ t('sys.cancel') }}</a-button
          >
          <a-button type="primary" style="margin-left: 12px" @click="handleOk">{{
            t('sys.okText')
          }}</a-button>
        </div>
      </div>
    </template>
    <div class="p-10px">
      <form-render
        ref="formRender"
        :widget="(modalBody.children[0] as Form)"
        v-slot="{ formState, children }"
      >
        <Widget :widgetlist="children!" :formData="formState" />
      </form-render>
    </div>
  </a-drawer>
  <a-modal
    v-else
    v-model:visible="visible"
    @ok="handleOk"
    v-bind="modalProps"
    okText="确定"
    cancelText="取消"
  >
    <template #title>
      <div style="min-height: 22px">{{ modalTitle }}</div>
    </template>
    <div class="p-10px">
      <form-render
        ref="formRender"
        :widget="(modalBody.children[0] as Form)"
        v-slot="{ formState, children }"
      >
        <Widget :widgetlist="children!" :formData="formState" />
      </form-render>
    </div>
  </a-modal>
</template>
<script setup lang="ts">
  import { ref, computed, provide, watch } from 'vue';
  import { OperateButton, Form } from '/@page-designer/types/web';
  import { LowCodeModal } from '/@page-designer/types/modal-types';
  import { BuiltinType, WidgetInScopeEnum } from '/@page-designer/enum';
  import Widget from '/@web-render/render/widget/index.vue';
  import FormRender from '/@page-designer/components/widgets/web/basic/form/form-render.vue';
  import { useStyle } from '/@page-designer/hooks/useStyle';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { creatPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { pick, merge, get } from 'lodash-es';

  const { t } = useI18n();

  provide('widgetInScope', WidgetInScopeEnum.GCT_SUB_TABLE_MODAL);
  const props = defineProps<{
    modalInfo: LowCodeModal.Modal | undefined;
    destroyVm;
    Event;
  }>();
  creatPageEvent(props.Event);
  type ButtonProps = OperateButton['props'];
  const formRender = ref();
  const resolveCallback = ref();
  const isEdit = ref(false);
  const visible = ref(false);

  const { wrapperStyle } = useStyle(props.modalInfo);

  const modalInfoProps = computed<LowCodeModal.ModalProps>(() => {
    return props.modalInfo?.props;
  });

  const isDrawer = computed(() => {
    return modalInfoProps.value.openMode === 'drawer';
  });

  const modalProps = computed(() => {
    const style = pick(wrapperStyle.value, ['width']);

    const unitType = get(modalInfoProps.value, 'unitType', 'px');

    return merge(
      {},
      style.width ? style : { width: `${modalInfoProps.value.modalWidth || 800}${unitType}` },
      {
        bodyStyle: {
          ...pick(wrapperStyle.value, [
            'backgroundColor',
            'paddingTop',
            'paddingRight',
            'paddingBottom',
            'paddingLeft',
          ]),
          maxHeight: !isDrawer.value ? '70vh' : undefined,
          overflow: 'auto',
        },
      },
    );
  });

  const modalTitle = computed(() => {
    if (modalInfoProps.value.isSubTableModal) {
      if (isEdit.value) {
        return modalInfoProps.value.editModalTitle;
      }
      return modalInfoProps.value.createModalTitle;
    }
    return modalInfoProps.value.modalTitle;
  });

  const handleOk = async () => {
    await formRender.value!.validate();
    visible.value = false;
    resolveCallback.value(formRender.value?.getValue());
  };

  const open = async (form, t: string): Promise<ButtonProps> => {
    isEdit.value = t === 'edit';
    visible.value = true;
    await formRender.value?.reset();
    await formRender.value.setValue({ ...form });
    return new Promise((resolve) => {
      resolveCallback.value = resolve;
    });
  };
  const modalBody = computed(() => {
    return props.modalInfo?.children.find((d) => d.type === BuiltinType.MODAL_BODY)!;
  });
  watch(visible, (v) => {
    if (v) return;
    props.destroyVm();
  });
  defineExpose({ open });
</script>
<style scoped lang="less">
  .modal-footer {
    text-align: right;
  }
</style>
