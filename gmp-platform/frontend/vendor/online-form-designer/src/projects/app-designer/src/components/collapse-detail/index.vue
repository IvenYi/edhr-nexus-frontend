<template>
  <div class="collapse-detail-wrap">
    <a-collapse
      :bordered="false"
      collapsible="icon"
      v-model:activeKey="activeKey"
      style="margin-bottom: 20px"
      @change="handleCollapseChange($event)"
    >
      <a-collapse-panel key="1">
        <template #header>
          <div class="header">
            <div class="header-title">{{ t('sys.appDesigner.basicInformation') }}</div>
            <div class="action-wrap">
              <slot></slot>
            </div>
          </div>
          <div :class="['description', { 'desc-expand': isExpand }]">
            <collapse-list :descData="headerInfo" :column="col" :isHead="true">
              <!-- 透传所有插槽 -->
              <template v-for="(_, slotName) in $slots" #[slotName]="slotData" :key="slotName">
                <slot :name="slotName" v-bind="slotData"></slot>
              </template>
            </collapse-list>
          </div>
        </template>
        <collapse-list :descData="mainInfo" :column="col">
          <!-- 透传所有插槽 -->
          <template v-for="(_, slotName) in $slots" #[slotName]="slotData" :key="slotName">
            <slot :name="slotName" v-bind="slotData"></slot>
          </template>
        </collapse-list>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script setup lang="ts" name="collapse-detail">
  import { ref, computed, onMounted, onBeforeMount } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { type CollapseItem } from './typing';
  import CollapseList from './components/collapse-list.vue';

  const { t } = useI18n();

  const props = withDefaults(
    defineProps<{
      collapseInfo: CollapseItem[];
      column?: number;
      defaultExpand?: boolean;
    }>(),
    {
      defaultExpand: true,
    },
  );

  const emit = defineEmits(['collapse-change']);

  const isExpand = ref<boolean>(true);
  //tab页的key
  const activeKey = ref('1');

  const col = computed(() => props.column ?? 3);

  const detailInfo = computed(() => {
    return props.collapseInfo.filter((i) => !i.hidden);
  });

  const headerInfo = computed(() => {
    return detailInfo.value.filter((i, index) => index < col.value);
  });

  const mainInfo = computed(() => {
    return detailInfo.value.filter((i, index) => index >= col.value);
  });

  const handleCollapseChange = (e) => {
    isExpand.value = !!e[0];
    console.log(e, activeKey.value, isExpand.value);
    emit('collapse-change');
  };

  defineExpose({
    refreshExpand: () => {
      isExpand.value = true;
      activeKey.value = '1';
    },
  });

  onBeforeMount(() => {
    if (!props.defaultExpand) {
      isExpand.value = false;
      activeKey.value = '';
    }
  });
</script>

<style lang="less" scoped>
  .collapse-detail-wrap {
    :deep(.btn-text.ant-btn) {
      padding: 4px 12px;

      & > .anticon + span {
        margin-left: 8px;
      }
    }

    :deep(.ant-collapse > .ant-collapse-item > .ant-collapse-header) {
      flex-wrap: wrap;
      padding: 0 !important;
      background-color: #fff;

      > div:first-child {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 40px;
        padding-top: 16px;
      }
    }

    :deep(.ant-collapse-item) {
      border-bottom: none;
    }

    .header {
      display: flex;
      flex: 1;
      align-items: center;
      justify-content: space-between;
      padding-top: 16px;
      padding-bottom: 12px;

      .header-title {
        font-size: 16px;
      }

      .action-wrap {
        .ant-btn {
          position: absolute;
          right: 0;
          top: 12px;
          z-index: 9;
          height: 28px;
          line-height: 18px;
          padding: 4px 12px;
          .iconfont {
            font-size: 14px;
          }
        }
      }
    }

    .description {
      display: flex;
      align-items: center;
      padding: 20px 0;
      border-radius: 4px;
      background-color: #f7f8fa;

      &.desc-expand {
        border-bottom-right-radius: 0;
        border-bottom-left-radius: 0;
      }

      .item {
        padding: 0 20px;
      }

      :deep(.ant-descriptions-row) {
        td {
          padding-bottom: 0;
        }
      }
    }

    :deep(.ant-collapse.ant-collapse-borderless) {
      background: transparent;
      .ant-collapse-item {
        .ant-collapse-content {
          border-radius: 0 0 4px 4px;
          background-color: #f7f8fa;
          .ant-collapse-content-box {
            padding: 0 20px !important;
          }
        }
      }
    }

    :deep(.ant-descriptions-item-container .ant-descriptions-item-label) {
      color: #797a7d;
    }

    .desc-area {
      color: #333;
      font-family: PingFangSC-Regular, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      :deep(.ant-descriptions-row) {
        td {
          padding-bottom: 20px;
        }
      }
    }
  }
</style>
