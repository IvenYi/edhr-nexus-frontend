<template>
  <a-modal v-model:visible="visible" @ok="handleOk" v-bind="modalProps">
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
  import { ref, computed, provide } from 'vue';
  import { OperateButton, Form } from '/@page-designer/types/web';
  import { LowCodeModal } from '/@page-designer/types/modal-types';
  import { BuiltinType, WidgetInScopeEnum } from '/@page-designer/enum';
  import Widget from '/@web-render/render/widget/index.vue';
  import FormRender from '../../../basic/form/form-render.vue';
  import { useStyle } from '/@page-designer/hooks/useStyle';
  import { pick, merge, get } from 'lodash-es';

  provide('widgetInScope', WidgetInScopeEnum.GCT_SUB_TABLE_MODAL);
  const props = defineProps<{
    modalInfo: LowCodeModal.Modal | undefined;
    id: string;
    customValidateRules: Function;
  }>();
  type ButtonProps = OperateButton['props'];
  const formRender = ref();
  const resolveCallback = ref();
  const isEdit = ref(false);
  const visible = ref(false);

  provide('subTableCustomValidateRules', props.customValidateRules);
  const { wrapperStyle } = useStyle(props.modalInfo);

  const modalInfoProps = computed<LowCodeModal.ModalProps>(() => {
    return props.modalInfo?.props;
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
          maxHeight: '70vh',
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
  defineExpose({ open });
</script>
<style scoped lang="less"></style>
