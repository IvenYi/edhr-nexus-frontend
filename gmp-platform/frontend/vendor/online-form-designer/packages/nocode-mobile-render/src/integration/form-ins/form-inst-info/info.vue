<template>
  <BasicPopup
    v-model:show="show"
    title="表单详细信息"
    :extraStyle="{
      width: '480px',
    }"
  >
    <div id="info-wrap" class="h100% p16px">
      <van-cell-group :inset="true">
        <van-cell title="表单名称" :value="form.tmplName || '--'" :border="false" size="large" />
        <van-cell title="表单编号" :value="form.ofCode || '--'" :border="false" size="large" />
        <van-cell title="流水号" :value="form.serialNo || '--'" :border="false" size="large" />
        <van-cell title="备注名" :value="form.title || '--'" :border="false" size="large" />
        <van-cell title="状态" :border="false" size="large">
          <template #value>
            <InstanceStatusLabel
              class="flex-none ml-10px justify-end!"
              :form-type="form.formType!"
              :data-status="form.dataStatus"
              :instance-status="form.instanceStatus!"
              :is-form-summary="true"
            />
          </template>
        </van-cell>
        <van-cell title="关联批次" :border="false" size="large">
          <template #value>
            <TextOverflowPopover
              v-if="form.relatedMaterialNo"
              :text="form.relatedMaterialNo"
            />
            <van-tag v-else color="#ff4d4f" plain>无关联</van-tag>
          </template>
        </van-cell>
      </van-cell-group>
      <van-cell-group :inset="true" class="mt8px!">
        <van-cell title="创建人" :value="form.createUserName || '--'" :border="false" size="large" />
        <van-cell title="更新人" :value="form.modifyUserName || '--'" :border="false" size="large" />
        <van-cell title="创建时间" :value="form.createTime || '--'" :border="false" size="large" />
        <van-cell title="完成时间" :value="form.completedTime || '--'" :border="false" size="large" />
      </van-cell-group>
    </div>
  </BasicPopup>
</template>
<script setup lang="ts">
  import { ref, computed, nextTick } from 'vue';
  import BasicPopup from '@mobile/views/edhr/_comps_/basic-popup/index.vue';
  import { InstanceStatusLabel } from '@gct/nocode-mobile-render';
  import TextOverflowPopover from '@mobile/views/edhr/_comps_/text-overflow-popover/index.vue';

  const props = defineProps<{
    context: {
      info: any;
    };
  }>();

  const show = ref<boolean>(true);
  const form = computed(() => {
    return props.context?.info || {}
  })

</script>
<style lang="less" scoped>
  :deep(.van-cell) {
    --van-cell-large-vertical-padding: 16px;
    --van-cell-large-value-font-size: 16px;

    .van-cell__title {
      color: #5A5F6B;
    }
    .van-cell__value {
      color: #1A1D23;
    }
  }
  :deep(.van-cell-group--inset) {
    margin: 0;
  }
</style>
