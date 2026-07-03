<template>
  <div>
    <a-collapse
      v-if="title"
      :bordered="false"
      ghost
      class="fill-instance-collapse-date"
      v-model:activeKey="outerActiveKey"
    >
      <template #expandIcon="{ isActive }">
        <CaretRightOutlined :rotate="isActive ? 90 : 0" />
      </template>

      <a-collapse-panel :name="title" :key="title">
        <template #header>
          <div class="header-title-content pr-8px">
            <i class="iconfont icon-riqi2"></i>
            <span class="title">{{ title }}</span>
            <span class="count">{{ items.length }}</span>
          </div>
        </template>

        <div class="content">
          <a-collapse :bordered="false" ghost class="record-instance-collapse-inner">
            <template #expandIcon="{ isActive }">
              <CaretRightOutlined :rotate="isActive ? 90 : 0" />
            </template>

            <InstancePanel
              v-for="it in items"
              :key="it.id"
              :item="it"
              :selected="it.id === selectedId"
              :support-edit="supportEdit"
              @edit="$emit('edit', $event)"
              @select="$emit('select', $event)"
            />
          </a-collapse>
        </div>
      </a-collapse-panel>
    </a-collapse>

    <a-collapse
      v-else
      :bordered="false"
      ghost
      class="record-instance-collapse"
      v-model:activeKey="outerActiveKey"
    >
      <template #expandIcon="{ isActive }">
        <CaretRightOutlined :rotate="isActive ? 90 : 0" />
      </template>

      <InstancePanel
        v-for="it in items"
        :key="it.id"
        :item="it"
        :selected="it.id === selectedId"
        :support-edit="supportEdit"
        @edit="$emit('edit', $event)"
        @select="$emit('select', $event)"
      />
    </a-collapse>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import InstancePanel from './instance-panel.vue';

  const props = defineProps<{
    title?: string;
    items: Array<any>;
    supportEdit: boolean;
    /** 是否展开外层panel */
    expanded: boolean;
    selectedId: string;
  }>();

  const emit = defineEmits(['edit', 'select']);

  // outerActiveKey: 当 expanded 为 true，展开外层 panel（若有 title, name = title；flat 则 name = 'flat'）
  const outerActiveKey = ref<string[]>([]);
  const outerName = props.title ? props.title : 'flat';

  watch(
    () => props.expanded,
    (v) => {
      outerActiveKey.value = v ? [outerName] : [];
    },
    { immediate: true },
  );

  // 当 title/props.items 变化时，确保 outerActiveKey 与 expanded 同步
  watch(
    () => props.title,
    (t) => {
      outerActiveKey.value = props.expanded ? [outerName] : [];
    },
    { immediate: true },
  );
</script>

<style scoped lang="less">
  .icon-riqi2 {
    display: flex;
    align-items: center;
    height: 24px;
    width: 24px;
    justify-content: center;
    color: #212528;
  }

  .count {
    font-size: 12px;
    background: var(--ant-primary-color);
    padding: 4px 6px;
    display: flex;
    justify-content: center;
    align-items: center;
    line-height: 1;
    border-radius: 5px;
    color: #fff;
  }

  :deep(.ant-collapse.fill-instance-collapse-date),
  :deep(.ant-collapse.record-instance-collapse),
  :deep(.ant-collapse.record-instance-collapse-inner) {
    .ant-collapse-header {
      > div:first-child {
        display: flex;
        align-items: center;
        height: 24px;
        width: 16px;
        justify-content: left;
        .anticon {
          font-size: 16px;
          margin-right: 0;
          color: #8f8f8f;
        }
      }

      .header-title-content {
        display: flex;
        height: 24px;
        align-items: center;
        justify-content: space-between;
        flex: 1;
        overflow: hidden;

        .title {
          color: #212528;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-right: 4px;

          .is-highlight {
            color: var(--ant-primary-color);
          }
        }
      }
    }

    .ant-collapse-content-box {
      padding: 0;
      .content {
        cursor: pointer;
      }
    }
  }

  :deep(.ant-collapse.fill-instance-collapse-date),
  :deep(.ant-collapse.record-instance-collapse) {
    .ant-collapse-item {
      margin-bottom: 4px;
    }
  }

  :deep(.ant-collapse.fill-instance-collapse-date) {
    .ant-collapse-header {
      padding: 8px 0;
    }

    .ant-collapse-content-box {
      background-color: #fff;
      .content {
        padding: 4px 4px 4px 12px;

        .ant-collapse.record-instance-collapse-inner {
          .ant-collapse-header {
            padding: 2px 0;
          }
        }
      }
    }
  }

  :deep(.ant-collapse.record-instance-collapse),
  :deep(.ant-collapse.record-instance-collapse-inner) {
    .ant-collapse-item {
      background: #fff;
      padding: 4px;
      &:hover {
        background: #f4f7ff;
      }

      &.ebr-instance-item--selected {
        background: #e3eafc;
      }
    }

    .ant-collapse-header {
      padding: 4px 0;

      .header-title-content {
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
      margin-top: 4px;
      background-color: #f8f8f8;
      .content {
        padding: 8px;

        .ant-descriptions-item {
          padding-bottom: 4px !important;
        }
      }
    }
  }
</style>
