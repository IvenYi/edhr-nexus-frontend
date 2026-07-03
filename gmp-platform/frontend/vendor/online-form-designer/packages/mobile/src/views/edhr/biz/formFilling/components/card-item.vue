<template>
  <div class="h166px rounded-8px bg-white p16px">
    <div class="ks-row">
      <InstanceStatusLabel
        ref="InstanceStatusLabelRef"
        class="flex-none justify-end! status-wrap"
        :style="{ '--color': InstanceStatusLabelRef?.themeConfig?.textColor }"
        :form-type="row.formType!"
        :data-status="row.dataStatus"
        :instance-status="row.instanceStatus!"
        :is-form-summary="true"
      />
      <span class="gct-color-text-1 text-16px font-600"
        >{{ row.tmplName }} / {{ row.ofCode || '--' }}</span
      >
    </div>
    <div class="card-container text-14px mt16px">
      <div>
        <div class="gct-color-text-5">流水号</div>
        <div class="gct-color-text-1 ell">{{ row.serialNo || '--' }}</div>
      </div>
      <div>
        <div class="gct-color-text-5">备注名</div>
        <div class="gct-color-text-1 ell">{{ row.title || '--' }}</div>
      </div>
      <div>
        <div class="gct-color-text-5">关联批次</div>
        <div class="gct-color-text-1">
          <TextOverflowPopover
            v-if="row.relatedMaterialNo"
            :text="row.relatedMaterialNo"
          />
          <span v-else>--</span>
        </div>
      </div>
    </div>
    <div class="text-right mt16px">
      <collapseButton :data="row" :buttonGroup="buttonGroup" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watchEffect, computed } from 'vue';
  import { collapseButton, type ButtonAction } from '@gct/nocode-mobile-render';
  import { FillingTypeEnum } from '@gct/nocode-base';
  import { InstanceStatusLabel } from '@gct/nocode-mobile-render';
  import TextOverflowPopover from '@mobile/views/edhr/_comps_/text-overflow-popover/index.vue';

  const props = withDefaults(
    defineProps<{
      row: any;
      buttonGroup: ButtonAction[];
    }>(),
    {},
  );

  const InstanceStatusLabelRef = ref();
</script>
<style scoped lang="less">
  .card-container {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .status-wrap {
    padding: 1px 10px;
    margin-right: 8px;
    border: 1px solid rgba(from var(--color) r g b / 50%);
    border-radius: 13px;
    background-color: rgba(from var(--color) r g b / 8%);

   :deep(.instance-title) {
      font-size: 12px;
    }
  }
</style>
