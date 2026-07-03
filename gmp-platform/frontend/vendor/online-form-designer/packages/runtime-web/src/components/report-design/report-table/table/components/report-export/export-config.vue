<template>
  <div class="pt20px pb20px">
    <a-form :model="formState" :label-col="{ span: 10 }" :wrapper-col="{ span: 14 }">
      <!-- <a-form-item label="是否导出条件格式">
        <a-radio-group v-model:value="formState.formatting">
          <a-radio :value="true">是</a-radio>
          <a-radio :value="false">否</a-radio>
        </a-radio-group>
      </a-form-item> -->
      <a-form-item :label="$t('sys.report.isExport2DateFormat')">
        <a-radio-group v-model:value="formState.dateFormat">
          <a-radio :value="true">{{ $t('sys.true') }}</a-radio>
          <a-radio :value="false">{{ $t('sys.false') }}</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item :label="$t('sys.report.isExport2NumberFormat')">
        <a-radio-group v-model:value="formState.numFormat">
          <a-radio :value="true">{{ $t('sys.true') }}</a-radio>
          <a-radio :value="false">{{ $t('sys.false') }}</a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, watchEffect, computed } from 'vue';
  import { IModal } from '@gct/runtime';

  const props = defineProps<{
    modal: IModal;
  }>();
  const formState = reactive({
    formatting: true,
    dateFormat: true,
    numFormat: true,
  });
  props.modal.callback(() => {
    return {
      ok: true,
      data: { ...formState },
    };
  });
</script>
<style scoped lang="less"></style>
