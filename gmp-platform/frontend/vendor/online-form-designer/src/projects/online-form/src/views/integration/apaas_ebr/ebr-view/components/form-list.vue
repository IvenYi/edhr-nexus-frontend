<template>
  <div class="other-ebr-list">
    <Scrollbar class="relative" v-if="filteredList.length">
      <div
        v-for="(item, idx) in filteredList"
        :key="item.id || idx"
        class="content-item"
        :class="{ selected: selectedId === item.id }"
        @click.stop="selectItem(item)"
      >
        <div class="content-item-left" :title="item.name">
          <slot name="prefix" :data="item">
            <i class="iconfont icon-a-biaodan2"> </i>
          </slot>
          <div class="content-item-title" :title="item.name || item.title || item.tmplName">
            {{ item.name || item.title || item.tmplName }}
          </div>
        </div>

        <div class="content-item-right">
          <slot name="suffix" :data="item">
            <instance-status-label
              :form-type="item.formType!"
              :data-status="item.dataStatus"
              :instance-status="item.instanceStatus!"
              use-dynamic-color
            />
          </slot>
        </div>
      </div>
    </Scrollbar>
    <div v-else class="nocode-common-loading-warp">
      <a-empty :description="$t('sys.noData')" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { Empty } from 'ant-design-vue';
  import { Scrollbar } from '/@/components/Scrollbar';
  import InstanceStatusLabel from '../../utils/instance-status/instance-status-label.vue';

  const props = defineProps<{
    sourceList: any[];
    selectedId?: string;
  }>();

  const emit = defineEmits<{
    (e: 'update:search', val: string): void;
    (e: 'select', data: any): void;
  }>();

  const filteredList = computed(() => (props.sourceList || []).filter(Boolean));

  function selectItem(item: any) {
    emit('select', item);
  }
</script>

<style scoped lang="less">
  .other-ebr-list {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: auto;
    flex: 1;
    display: flex;
    flex-direction: column;

    .content-item {
      position: relative;
      line-height: 24px;
      padding: 6px 8px;
      padding-left: 24px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-radius: 4px;

      &-left {
        display: flex;
        align-items: center;
        flex: 1;
        overflow: hidden;
        .iconfont {
          font-size: 16px;
          color: #a6a6a6;
        }
      }

      &-right {
        display: flex;
        align-items: center;
      }

      .content-item-title {
        color: #212528;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding-left: 6px;
      }
      :deep(.iconfont.icon-Frame) {
        display: none;
      }

      &:hover {
        .content-item-title {
          color: var(--ant-primary-color);
        }
        :deep(.iconfont.icon-Frame) {
          display: inline-block;
          color: var(--ant-primary-color);
        }
      }
    }

    .selected {
      background-color: #026ac814;
      .content-item-title {
        color: var(--ant-primary-color);
      }
      :deep(.iconfont.icon-Frame) {
        display: inline-block;
        color: var(--ant-primary-color) !important;
      }
      .iconfont.icon-a-biaodan2 {
        color: var(--ant-primary-color) !important;
      }
    }
  }
</style>
