<template>
  <a-modal
    v-model:visible="visible"
    :title="`${$t('sys.new')}${$t('sys.model')}`"
    width="800px"
    centered
    wrapClassName="ant-modal-new"
    :ok-text="$t('sys.editor.next')"
    @ok="handleOk"
  >
    <typeSelect v-model:value="type" :options="options" />
  </a-modal>
</template>
<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useModalDragMove } from '/@/components/Modal/src/hooks/useModalDrag';
  import typeSelect from '../../../../components/type-select/index.vue';
  import { EntityModelTypeEnum } from '/@app-designer/enum';
  import { useI18n } from 'vue-i18n';
  import { useAppInfoStore } from '/@/store/modules/app-info';

  const { appInfo } = useAppInfoStore();
  const emit = defineEmits(['next']);
  const { t } = useI18n();
  const visible = ref(false);
  const type = ref(EntityModelTypeEnum.BASE);
  const baseModel =
    appInfo.suiteKey === 'MEDPRO'
      ? Object.keys(EntityModelTypeEnum).filter((i) => i !== EntityModelTypeEnum.WORKFLOW)
      : [EntityModelTypeEnum.BASE, EntityModelTypeEnum.DYNAMIC_FORM, EntityModelTypeEnum.TREE];
  const options = computed(() => {
    return baseModel.map((e) => {
      return {
        value: EntityModelTypeEnum[e],
        label: t('sys.model.' + e),
        message: e === EntityModelTypeEnum.TRANSACTION ? '' : t('sys.model.' + e + '_tips'),
        icon: EntityModelTypeEnum[e],
      };
    });
  });
  const params = ref({});
  const open = (data = {}) => {
    visible.value = true;
    params.value = { ...data };
    type.value = data.type || EntityModelTypeEnum.BASE;
  };

  const handleOk = () => {
    visible.value = false;
    emit('next', type.value, { ...params.value, type: type.value });
  };

  // modal拖拽的方法
  useModalDragMove({ visible, destroyOnClose: ref(false), draggable: ref(true) });

  defineExpose({
    open,
  });
</script>
<style lang="less" scoped></style>
