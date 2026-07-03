<template>
  <basic-modal
    :title="$t('sys.appDesigner.newMenu')"
    :okText="$t('sys.editor.next')"
    width="640px"
    centered
    @register="registerInner"
    @ok="handleOk"
  >
    <!-- <div class="tip">{{ $t('sys.appDesigner.menuTypeSelectTip') }}</div> -->
    <div>
      <menuTypeSelect v-model:value="formState.type" />
    </div>
  </basic-modal>
</template>
<script setup lang="ts">
  import { reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import menuTypeSelect from './menu-type-select.vue';
  import { MenuType } from '@/enums/appEnum';

  const emit = defineEmits(['closed']);

  const formState = reactive({
    type: MenuType.CATALOG,
  });
  const [registerInner, { closeModal }] = useModalInner((data) => {
    formState.type = (data && data.type) || MenuType.CATALOG;
  });

  const handleOk = () => {
    closeModal();
    emit('closed', formState);
  };
</script>
<style lang="scss" scoped>
  .tip {
    font-size: 12px;
    color: #797a7d;
    margin-bottom: 4px;
  }
</style>
