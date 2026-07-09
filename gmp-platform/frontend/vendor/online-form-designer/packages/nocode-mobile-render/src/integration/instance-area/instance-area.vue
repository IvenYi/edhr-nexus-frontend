<template>
  <div class="instance-content">
    <div class="instance-title-content">
      <div class="instance-title">表单实例记录列表</div>
      <!-- <div class="instance-action-btn">
        <close-outlined class="iconfont cursor-pointer" @click="toggleVisible" />
      </div> -->
    </div>

    <div class="flex px16px py2px mb16px" v-if="supportEdit">
      <van-button type="default" class="w-full" size="small" @click="addInstance"
        >新建表单实例</van-button
      >
    </div>

    <Scrollbar class="px-12px">
      <template v-if="docInstanceList?.length">
        <van-collapse v-model="activeNames" :bordered="false" class="ebr-instance-collapse-inner">
          <van-collapse-item
            :name="item.id"
            v-for="(item, idx) in docInstanceList"
            :key="item.id"
            :class="{ 'ebr-instance-item--selected': selectedId === item.id }"
          >
            <template #title>
              <div class="header-title-content" @click.stop="onSelectInstanceItem(item)">
                <span
                  class="title"
                  :title="`${item.ext2 ?? item.tmplName ?? ''}${idx === 0 ? '(最新)' : ''}`"
                >
                  {{ `${item.ext2 ?? item.tmplName ?? ''}${idx === 0 ? '(最新)' : ''}` }}
                </span>
                <van-icon
                  v-if="supportEdit"
                  name="edit"
                  size="18"
                  color="#72b892"
                  @click.stop="onEdit(item)"
                />
                <instance-status-label
                  :form-type="item.formType!"
                  :data-status="item.dataStatus"
                  :instance-status="item.instanceStatus!"
                  use-dynamic-color
                />
              </div>
            </template>
            <div class="content" @click.stop="onSelectInstanceItem(item)">
              <div class="desc-list">
                <div class="desc-item">
                  <div class="desc-label">表单流水号</div>
                  <div class="desc-value">
                    {{ item.serialNo }}
                  </div>
                </div>
                <div class="desc-item">
                  <div class="desc-label">创建时间</div>
                  <div class="desc-value">{{ item.createTime }}</div>
                </div>
                <div class="desc-item">
                  <div class="desc-label">更新时间</div>
                  <div class="desc-value">{{ item.modifyTime }}</div>
                </div>
                <div class="desc-item">
                  <div class="desc-label">更新人</div>
                  <div class="desc-value">{{ item.modifyUserName }}</div>
                </div>
              </div>
            </div>
          </van-collapse-item>
        </van-collapse>
      </template>

      <div v-else class="mt-150px">
        <van-empty description="暂无数据" image="search" />
      </div>
    </Scrollbar>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { Scrollbar } from '/@/components/Scrollbar';
  import InstanceStatusLabel from '../instance-status/instance-status-label.vue';
  import CopyModuleKey from '/@/components/CopyModuleKey';

  const props = defineProps<{
    docInstanceList: any[];
    selectedId?: string | number;
    supportEdit?: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'update:selected', data: any): void;
    (e: 'add-instance', v: boolean): void;
    (e: 'search', val: string): void;
    (e: 'edit', data: any): void;
  }>();

  const searchInput = ref('');
  const activeNames = ref([]);

  function onSearch() {
    emit('search', searchInput.value);
  }

  function onSelectInstanceItem(item: any) {
    emit('update:selected', item);
  }

  function onEdit(item: any) {
    emit('edit', item);
  }

  function addInstance() {
    emit('add-instance');
  }
</script>

<style scoped lang="less">
  .instance-content {
    position: relative;
    overflow: hidden;
    display: flex;
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

  :deep(.van-collapse.ebr-instance-collapse-inner) {
    .van-collapse-item {
      margin-bottom: 8px;
      border-radius: 4px;
      background: #f9fafb;
      overflow: hidden;

      .van-cell__title {
        width: calc(100% - 30px);
      }

      &.ebr-instance-item--selected {
        background: #e1f0ff;
        .van-cell,
        .van-collapse-item__content {
          background: #e1f0ff;
        }
      }

      .van-icon {
        vertical-align: middle;
        line-height: 24px;
      }
    }
    .van-collapse-item__title {
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
      }
    }
    .van-collapse-item__content {
      padding: 0 12px;

      .content {
        padding: 8px 0;
        border-top: 1px solid #e0e3eb;
        cursor: pointer;

        .desc-list {
          .desc-item {
            padding-bottom: 4px;

            .desc-label {
              color: #666;
              font-size: 12px;
            }

            .desc-value {
              color: #252525;
              font-size: 12px;
            }
          }
        }
      }
    }
  }
</style>
