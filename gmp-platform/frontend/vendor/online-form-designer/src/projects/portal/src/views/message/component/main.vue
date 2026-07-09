<template>
  <div class="gct-message-center">
    <template v-if="dataList.length">
      <div class="message-container">
        <div class="message-item" v-for="item in dataList" :key="item.id" @click="readItem(item)">
          <div class="message-item-header">
            <div class="message-item-header-title">
              <div class="message-item-header-title-left">
                <!-- <a-tag
                  style="border: none; background: rgba(255, 121, 46, 0.24); color: #ff792e"
                  v-if="!item.read"
                >
                  {{ t('sys.message.notRead') }}
                </a-tag> -->
                <span class="read-point mr-8px" v-if="!item.read"></span>
                <span>
                  {{ item.appName }}
                </span>
                <a-tag class="message-process-tag" v-if="item.supportProcess == 1">
                  {{ t('sys.message.process') }}
                </a-tag>
                <span class="message-item-header-time">
                  {{ item.createTime }}
                </span>
              </div>
            </div>
          </div>

          <message-item
            :msgContent="item.content"
            :supportJump="item.supportJump"
            :jumpAddress="item.jumpAddress"
            :supportProcess="item.supportProcess"
            :appId="item.appId"
            :env="item.env"
            :branchId="item.branchId"
            :isFront="props.isFront"
            @goToFunc="goProcessCenter"
          />
        </div>
      </div>
      <a-pagination
        v-if="pagination.total"
        class="ant-pagination mini ant-table-pagination ant-table-pagination-right"
        size="small"
        v-model:current="pagination.current"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :show-total="(total) => t('sys.component.table.total', { total })"
        @change="changePagination"
      />
    </template>
    <div v-else class="empty-area">
      <a-empty />
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    getInternalMessagePageList,
    putInternalMessageReadById,
    getInternalMessageUnreadCount,
  } from '/@/apis/gct-platform/InternalMessageController';
  import { ref, reactive, nextTick, onMounted, onBeforeUnmount, computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMitt } from '/@page-designer/hooks/useMitt';
  import dayjs from 'dayjs';
  import { useRouter, useRoute } from 'vue-router';
  import { openWindow } from '/@/utils';
  import MessageItem from './message-item.vue';
  import { usePathQueryStore } from '/@/store/modules/pathQuery';

  const usePathQuery = usePathQueryStore();

  const { mitt } = useMitt();
  const { t } = useI18n();
  const router = useRouter();
  const route = useRoute();

  const props = defineProps<{
    type: string;
    appId?: string;
    isFront?: boolean;
  }>();

  const dataList = ref<any>([]);

  const time = {
    startTime: dayjs().subtract(6, 'months').format('YYYY-MM-DD 00:00:00'),
    endTime: dayjs().format('YYYY-MM-DD 23:59:59'),
  };

  // 分页
  const pagination = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const config = computed(() => {
    return props.appId
      ? {
          transferToConfig: { headers: { 'App-Tag': props.appId } },
        }
      : {};
  });
  const getTableData = async () => {
    const res = await getInternalMessagePageList(
      {
        pageNo: pagination.current,
        pageSize: pagination.pageSize,
        status: props.type || 'ALL',
        ...time,
      },
      config.value,
    );
    pagination.total = res!.totalCount;
    dataList.value = res!.data?.map((i) => {
      return {
        ...i,
        content: i.content,
      };
    });
    await nextTick();
  };

  onMounted(() => {
    mitt.on('read-message-all', () => {
      dataList.value.forEach((item) => {
        item.read = 1;
      });
    });

    getTableData();
  });

  onBeforeUnmount(() => {
    mitt.off('read-message-all');
  });

  const changePagination = (pageNum, pageSize) => {
    pagination.current = pageNum;
    pagination.pageSize = pageSize;
    getTableData();
  };

  const readItem = (item) => {
    if (!item.read) {
      putInternalMessageReadById({ id: item.id }, config.value).then(async () => {
        item.read = 1;
        const config = usePathQuery.getAid()
          ? {
              transferToConfig: { headers: { 'App-Tag': usePathQuery.getAid() } },
            }
          : {};
        const res = await getInternalMessageUnreadCount(config);
        mitt.emit('update-message-count', res);
      });
    }
  };

  function goProcessCenter() {
    if (route?.name == 'AllMessage') {
      router.push('/process/todo');
    } else {
      openWindow(`${location.origin}${import.meta.env.VITE_PATHNAME_PROTAL}#/process/todo`);
    }
  }
</script>
<style lang="less" scoped>
  .gct-message-center {
    height: 100%;

    .message-container {
      height: calc(100% - 60px);
      overflow: auto;

      &::-webkit-scrollbar {
        width: 0;
      }

      .message-item {
        padding: 20px 0;
        border-bottom: 1px solid #e0e3ea;

        &-header {
          margin-bottom: 12px;

          &-title {
            // display: flex;
            // justify-content: space-between;
            &-left {
              display: flex;
              align-items: center;
              margin-right: 12px;
              color: #212528;
              font-size: 14px;
              font-style: normal;
              font-weight: 500;
              text-align: left;
              text-transform: none;

              .read-point {
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: #f54547;
              }
            }
          }

          &-time {
            margin-left: auto;
            color: #c3c3c3;
            font-size: 14px;
            font-style: normal;
            font-weight: 400;
            text-align: left;
            text-transform: none;
          }
        }
      }
    }
  }

  :deep(.ant-tag.message-process-tag) {
    margin-left: 8px;
    border: none;
    background: rgba(from var(--ant-primary-color) r g b / 27%);
    color: var(--ant-primary-color);
    line-height: 22px;
  }

  .empty-area {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
</style>
