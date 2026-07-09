<template>
  <field-transfer-modal @register="register" v-bind="$props" />
</template>
<script setup lang="ts" name="modal-wrapper">
  import FieldTransferModal from './field-transfer-modal.vue';
  import { useModal } from '/@/components/Modal';

  const [register, { openModal }] = useModal();

  interface IProps {
    /** 模型key */
    modelKey: string;
    /** 模态框标题 */
    modalTitle?: string;
    /** 是否显示级联选择 */
    isShowCascader?: boolean;
    /** 选中的字段信息 */
    data: any[];
    /**
     * 子表的关联主键字段的父模型字段
     */
    childParentModelKey?: string;
    saveCallback?: (params: Recordable<any>) => void;
  }

  defineProps<IProps>();

  const open = () => {
    openModal();
  };

  defineExpose({
    open,
  });
</script>

<style lang="less"></style>
