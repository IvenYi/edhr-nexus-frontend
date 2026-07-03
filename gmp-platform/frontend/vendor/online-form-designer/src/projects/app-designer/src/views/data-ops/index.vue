<template>
  <basic-page>
    <div class="h100% bg-[#ffffff]">
      <div class="h94px edit-digits ks-row-middle">
        <div class="ks-col pl25px">
          <div class="edit-digits-title text-[#212528]">{{
            t('sys.app.modifyConfig', { sth: t('sys.model.decimalDigits') })
          }}</div>
          <div class="edit-digits-info text-[#797A7D] mt8px">
            {{ t('sys.app.modifyConfigDecimalTip') }}
          </div>
        </div>
        <div class="p16px">
          <a-button type="link" @click="openModal()">{{ t('sys.app.batchModifying') }}</a-button>
        </div>
      </div>
    </div>
  </basic-page>
</template>
<script setup lang="ts">
  import { useI18n } from '/@/hooks/web/useI18n';
  import editDigitsModal from './components/edit-digits-modal.vue';

  const { t } = useI18n();

  const openModal = async () => {
    await gct.openUtil.modal(
      editDigitsModal,
      {},
      { title: t('sys.app.batchModifying'), width: 800, height: 804 },
    );
  };
</script>
<style lang="less" scoped>
  .edit-digits {
    box-sizing: border-box;
    border-bottom: 1px solid @gct-modal-border-color;
  }
</style>
