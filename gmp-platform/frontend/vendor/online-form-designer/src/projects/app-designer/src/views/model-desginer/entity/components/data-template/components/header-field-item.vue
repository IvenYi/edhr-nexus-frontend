<template>
  <div class="header-field">
    <a-checkbox v-model:checked="checked">
      {{ `${field.name}(${field.key})` }}
    </a-checkbox>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { FieldMetaDTO } from '/@/apis/gct-apaas/model';

  defineProps<{
    field: FieldMetaDTO;
  }>();

  const checked = ref(false);
</script>

<style lang="less">
  .header-field {
    // margin-top: 10px;
    height: 40px;
    padding-left: 16px;
    line-height: 40px;

    &:hover {
      background-color: #edf6f6;
    }
  }
</style>
