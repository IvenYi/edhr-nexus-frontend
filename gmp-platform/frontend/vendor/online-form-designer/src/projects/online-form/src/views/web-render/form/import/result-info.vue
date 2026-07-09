<template>
  <div class="result-info">
    <div class="flex justify-between">
      <div class="result-info__title">{{ $t('sys.pageDesigner.importDetail') }}</div>
      <div v-if="result.fail" class="result-info__more" @click="openModal">
        {{ $t('sys.onlineForm.viewFailedData') }}
        <i class="gct-iconfont icon-arrow_right text-size-16px"></i>
      </div>
    </div>
    <div class="result-info__message"
      >{{ $t('sys.onlineForm.totalImported') }} {{ result.total }}
      {{ $t('sys.onlineForm.itemsOfDataSuccess') }} {{ result.success }}
      {{ $t('sys.onlineForm.itemsFailed') }}
      <span :class="[result.fail ? 'mark' : '']">{{ result.fail }}</span>
      {{ $t('sys.onlineForm.items') }}</div
    >
  </div>
</template>

<script lang="ts" setup name="result-info">
  import FailTableModal from './fail-table-modal.vue';
  import { IImportResult } from './types';

  const props = withDefaults(
    defineProps<{
      result: IImportResult;
    }>(),
    {},
  );

  const openModal = () => {
    gct.openUtil.modal(FailTableModal, { items: props.result.failList }, {});
  };
</script>

<style lang="less" scoped>
  .result-info {
    font-weight: 400;
    font-size: 14px;
    color: #1a1d23;
    padding: 16px;
    background: #f6f8fa;
    margin: 0 40px;

    &__title {
      font-weight: 400;
      font-size: 14px;
      color: #1a1d23;
    }

    &__message {
      font-weight: 400;
      font-size: 12px;
      color: #8b8b8b;
      margin-top: 6px;
    }

    &__more {
      font-weight: 400;
      font-size: 14px;
      color: #026ac8;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
    }

    .mark {
      color: #f5676a;
    }
  }
</style>
