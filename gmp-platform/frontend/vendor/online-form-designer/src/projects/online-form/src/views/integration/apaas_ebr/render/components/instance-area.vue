<template>
  <div class="instance-content">
    <div class="instance-title-content">
      <div class="instance-title" :title="$t('sys.edhr.formInstList')">
        {{ $t('sys.edhr.formInstList') }} ({{ docInstanceList.length }})
      </div>
      <div class="instance-action-btn">
        <close-outlined class="iconfont cursor-pointer" @click="toggleVisible" />
      </div>
    </div>

    <div class="flex px16px py2px">
      <a-input
        v-model:value="searchInput"
        :placeholder="$t('sys.keywordsPlaceholder')"
        allowClear
        style="border-radius: 4px; padding-top: 2px; padding-bottom: 2px; height: 28px"
        size="medium"
        @pressEnter="onSearch"
      >
        <template #suffix><i class="iconfont icon-sousuo text-[#797A7D] text-[13px]"></i></template>
      </a-input>
      <slot name="create-instance"></slot>
    </div>

    <Scrollbar class="px-16px py-16px">
      <template v-if="docInstanceList?.length">
        <a-collapse
          :bordered="false"
          expandIconPosition="right"
          ghost
          class="ebr-instance-collapse-inner"
        >
          <template #expandIcon="{ isActive }">
            <i v-if="isActive" class="iconfont collapse-icon icon-pad_arrow_up"></i>
            <i v-else class="iconfont collapse-icon icon-pad_arrow_down"></i>
          </template>

          <a-collapse-panel
            v-for="(item, idx) in docInstanceList"
            :key="item.id"
            :class="{
              'ebr-instance-item--selected': selectedId === item.id,
              'tagged-instance': taggedInst?.includes(item.id),
            }"
          >
            <template #header>
              <div class="header-title-content" @click.stop="onSelectInstanceItem(item)">
                <span
                  class="title"
                  :title="`${item.description || ''}${idx === 0 ? `(${$t('sys.edhr.latest')})` : ''}`"
                >
                  {{ `${item.description || ''}${idx === 0 ? `(${$t('sys.edhr.latest')})` : ''}` }}
                </span>
                <instance-status-label
                  :form-type="item.formType!"
                  :data-status="item.dataStatus"
                  :instance-status="item.instanceStatus!"
                  use-dynamic-color
                />
                <i
                  v-if="supportEdit"
                  class="icon iconfont icon-sheji-2 leading-none ml-2px primary-gct-hover"
                  @click.stop="edit(item)"
                ></i>
              </div>
            </template>

            <div class="content" @click.stop="onSelectInstanceItem(item)">
              <a-descriptions
                :column="1"
                :colon="false"
                :labelStyle="{ color: '#666', fontSize: '12px' }"
                :contentStyle="{ color: '#252525', fontSize: '12px' }"
                layout="vertical"
              >
                <a-descriptions-item :label="$t('sys.onlineForm.formIdent')"
                  ><copy-module-key :moduleKey="item.serialNo" :fontSize="12"
                /></a-descriptions-item>
                <a-descriptions-item :label="$t('sys.createTime')">{{
                  item.createTime
                }}</a-descriptions-item>
                <a-descriptions-item :label="$t('sys.updateTime')">{{
                  item.modifyTime
                }}</a-descriptions-item>
                <a-descriptions-item :label="$t('sys.updatePerson')">{{
                  item.modifyUserName
                }}</a-descriptions-item>
              </a-descriptions>
            </div>
          </a-collapse-panel>
        </a-collapse>
      </template>

      <div v-else class="nocode-common-loading-warp">
        <a-empty :description="$t('sys.noData')" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
      </div>
    </Scrollbar>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { Empty } from 'ant-design-vue';
  import { Scrollbar } from '/@/components/Scrollbar';
  import InstanceStatusLabel from '../../utils/instance-status/instance-status-label.vue';
  import CopyModuleKey from '/@/components/CopyModuleKey';

  const props = defineProps<{
    docInstanceList: any[];
    selectedId?: string | number;
    supportEdit?: boolean;
    taggedInst?: Array<string>;
  }>();

  const emit = defineEmits<{
    (e: 'update:selected', data: any): void;
    (e: 'toggleVisible', v: boolean): void;
    (e: 'edit', data: any): void;
    (e: 'search', val: string): void;
  }>();

  const searchInput = ref('');

  function onSearch() {
    emit('search', searchInput.value);
  }

  function onSelectInstanceItem(item: any) {
    emit('update:selected', item);
  }

  function toggleVisible() {
    emit('toggleVisible', false);
  }

  function edit(item: any) {
    emit('edit', item);
  }
</script>

<style scoped lang="less">
  .instance-content {
    position: relative;
    overflow: hidden;
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: #fff;

    .instance-title-content {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;

      .instance-title {
        color: #1a1d23;
        font-size: 14px;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-right: 4px;
        line-height: 24px;
        cursor: default;
      }

      .instance-action-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        .iconfont {
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
          color: #888;
          width: 16px;
          height: 16px;
        }
      }
    }
  }

  :deep(.ant-collapse.ebr-instance-collapse-inner) {
    .ant-collapse-item {
      margin-bottom: 8px;
      border-radius: 4px;
      background: #f9fafb;
      overflow: hidden;
      &:hover {
        background: #f2f5f8;
      }

      &.ebr-instance-item--selected {
        background: #e1f0ff;
      }

      &.tagged-instance {
        position: relative;
        &::before {
          color: #fff;
          font-size: 10px;
          text-align: center;
          content: '追溯';
          display: block;
          position: absolute;
          left: -17px;
          top: 2px;
          background-color: #026ac8;
          transform: rotate(-45deg);
          width: 50px;
        }
      }
    }
    .ant-collapse-header {
      padding: 6px 12px;

      > div:first-child {
        .collapse-icon {
          font-size: 16px;
          margin-right: 0;
          right: 12px;
          line-height: 1;
          color: #2c3344;
        }
      }

      .header-title-content {
        display: flex;
        height: 24px;
        align-items: center;
        justify-content: space-between;
        flex: 1;
        padding-right: 18px;
        overflow: hidden;

        .title {
          color: #212528;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-right: 4px;
        }

        .icon {
          display: none;
        }

        &:hover {
          .icon {
            display: inline-block;
          }
        }
      }
    }
    .ant-collapse-content-box {
      padding: 0 12px;

      .content {
        padding: 8px 0;
        border-top: 1px solid #e0e3eb;
        cursor: pointer;

        .ant-descriptions-item {
          padding-bottom: 4px !important;
        }
      }
    }
  }
</style>
