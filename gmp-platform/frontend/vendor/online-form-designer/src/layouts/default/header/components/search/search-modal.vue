<template>
  <a-modal
    class="comp-search-result-modal"
    ref="modalRef"
    v-model:visible="open"
    :mask="false"
    :footer="null"
    :closable="false"
    destroyOnClose
    :width="620"
    style="top: 60px; margin-right: 30px"
    :bodyStyle="{ padding: '10px 8px' }"
    :wrap-style="{ overflow: 'hidden' }"
  >
    <div class="result-container">
      <a-table
        :dataSource="searchData"
        :columns="columns"
        size="small"
        :pagination="false"
        :scroll="{ y: 388 }"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'no'">
            {{ index + 1 }}
          </template>
          <template v-if="column.key === 'path'">
            <span>{{ record.location }}</span>
            <span> > {{ record.module }}</span>
            <span v-if="record.modelType"> > {{ record.modelType }}</span>
          </template>
          <template v-if="column.key === 'name'">
            <div
              class="ell text-[#3168EC] cursor-pointer"
              :title="record.name"
              @click="toPage(record)"
            >
              {{ record.name }}
            </div>
          </template>
        </template>
      </a-table>
    </div>

    <template #title>
      <div ref="modalTitleRef" class="comp-search-result-modal-title">
        <div class="comp-search-result-modal-title-left">
          {{ t('sys.searchKeyResult') }}
        </div>
      </div>
    </template>
    <template #modalRender="{ originVNode }">
      <div :style="transformStyle">
        <component :is="originVNode" />
      </div>
    </template>
  </a-modal>
</template>
<script lang="ts" setup>
  import { ref, computed, CSSProperties, watch, watchEffect, h } from 'vue';
  import { useDraggable } from '@vueuse/core';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();

  const columns = [
    {
      title: t('sys.index'),
      dataIndex: 'no',
      key: 'no',
      width: 60,
    },
    {
      title: t('sys.position'),
      dataIndex: 'path',
      key: 'path',
      width: 220,
    },
    {
      title: t('sys.name'),
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: 'KEY',
      dataIndex: 'key',
      key: 'key',
      width: 150,
      ellipsis: true,
    },
  ];

  const emit = defineEmits(['selectResult']);
  const searchData = ref([]);
  const open = ref<boolean>(false);
  const modalTitleRef = ref<HTMLElement>(null);

  const { x, y, isDragging } = useDraggable(modalTitleRef);
  const startX = ref<number>(0);
  const startY = ref<number>(0);
  const startedDrag = ref(false);
  const transformX = ref(0);
  const transformY = ref(0);
  const preTransformX = ref(0);
  const preTransformY = ref(0);
  const dragRect = ref({ left: 0, right: 0, top: 0, bottom: 0 });
  watch([x, y], () => {
    if (!startedDrag.value) {
      startX.value = x.value;
      startY.value = y.value;
      const bodyRect = document.body.getBoundingClientRect();
      const titleRect = modalTitleRef.value.getBoundingClientRect();
      dragRect.value.right = bodyRect.width - titleRect.width;
      dragRect.value.bottom = bodyRect.height - titleRect.height;
      preTransformX.value = transformX.value;
      preTransformY.value = transformY.value;
    }
    startedDrag.value = true;
  });
  watch(isDragging, () => {
    if (!isDragging) {
      startedDrag.value = false;
    }
  });

  watchEffect(() => {
    if (startedDrag.value) {
      transformX.value =
        preTransformX.value +
        Math.min(Math.max(dragRect.value.left, x.value), dragRect.value.right) -
        startX.value;
      transformY.value =
        preTransformY.value +
        Math.min(Math.max(dragRect.value.top, y.value), dragRect.value.bottom) -
        startY.value;
    }
  });
  const transformStyle = computed<CSSProperties>(() => {
    return {
      transform: `translate(${transformX.value}px, ${transformY.value}px)`,
    };
  });

  const showModal = (searchParams) => {
    searchData.value = searchParams;
    startX.value = 0;
    startY.value = 0;
    startedDrag.value = false;
    transformX.value = 0;
    transformY.value = 0;
    preTransformX.value = 0;
    preTransformY.value = 0;
    dragRect.value = { left: 0, right: 0, top: 0, bottom: 0 };
    open.value = true;
  };

  const close = () => {
    open.value = false;
    searchData.value = [];
  };

  const toPage = (record) => {
    emit('selectResult', record);
  };

  defineExpose({
    showModal,
    close,
  });
</script>
<style lang="less">
  .comp-search-result-modal {
    .ant-modal-header {
      padding: 8px;

      .comp-search-result-modal-title {
        width: 100%;
        cursor: move;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 8px;

        &-left {
          font-weight: 400;
          font-size: 14px;
          color: #212528;
        }

        &-right {
          display: flex;
          align-items: center;
          .num {
            font-weight: 400;
            font-size: 14px;
            color: #c3c3c3;
            margin-right: 8px;

            .selected {
              color: #212528;
            }
          }
        }
      }
    }

    .ant-modal-body {
      padding: 16px 24px;
      .result-num {
        text-align: right;
        font-size: 12px;
        color: #4c5966;
      }
      .result-container {
        margin-bottom: 8px;
        max-height: 430px;
        overflow-y: auto;

        &::-webkit-scrollbar {
          width: 4px;
        }
        &::-webkit-scrollbar-track {
          background-color: rgb(0 0 0 / 5%);
        }

        &::-webkit-scrollbar-thumb {
          background-color: rgb(144 147 153 / 30%);
          border-radius: 2px;
          box-shadow: inset 0 0 6px rgb(0 0 0 / 20%);
        }

        &::-webkit-scrollbar-thumb:hover {
          background-color: @border-color-dark;
        }

        .result-item {
          padding: 4px 6px 4px 16px;
          cursor: pointer;
          border-radius: 4px;
          margin-top: 4px;

          font-weight: 400;
          font-size: 14px;
          color: #797a7d;
          &-selected {
            background-color: #f0f2f4;
          }
        }
      }
      .result-btn {
        text-align: right;
        border-top: 1px solid #e0e3ea;
        padding-top: 10px;
        font-size: 16px;

        button {
          margin-left: 16px;
        }
      }
    }
  }
</style>
<style>
  .ant-modal-wrap {
    pointer-events: none;
  }
</style>
