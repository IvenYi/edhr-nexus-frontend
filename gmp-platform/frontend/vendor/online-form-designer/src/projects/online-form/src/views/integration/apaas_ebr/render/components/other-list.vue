<template>
  <div class="other-ebr-list">
    <div class="px8px py16px content-search" v-if="tabActiveKey !== '1'">
      <a-input
        v-model:value="localKeyword"
        :placeholder="$t('sys.keywordsPlaceholder')"
        allowClear
        style="border-radius: 6px; padding-top: 2px; padding-bottom: 2px"
        size="medium"
      >
        <template #suffix><i class="iconfont icon-sousuo text-[#797A7D] text-[13px]"></i></template>
      </a-input>
    </div>

    <Scrollbar class="relative px-8px pb-8px">
      <template v-if="filteredList.length">
        <div
          v-for="(item, idx) in filteredList"
          :key="item.id || idx"
          class="content-item"
          :class="{ 'content-item--selected': selectedId === item.id }"
          @click.stop="selectItem(item)"
        >
          <instance-status-label
            show-icon
            need-custom-class
            :form-type="item.formType!"
            :data-status="item.dataStatus"
            :instance-status="item.instanceStatus!"
            :status-type="item?.showType"
            use-dynamic-color
          >
            <template #instanceTitle>
              <div
                class="content-item-title"
                v-html="item.highlightName || item.tmplName"
                :title="item.tmplName"
              ></div>
            </template>
          </instance-status-label>
        </div>
      </template>
      <div v-else class="nocode-common-loading-warp">
        <a-empty :description="$t('sys.noData')" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
      </div>
    </Scrollbar>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue';
  import { Empty } from 'ant-design-vue';
  import { Scrollbar } from '/@/components/Scrollbar';
  import { useHighlightSearch } from '../hooks/useHighlightSearch';
  import InstanceStatusLabel from '../../utils/instance-status/instance-status-label.vue';

  const props = defineProps<{
    tabActiveKey: string;
    releaseList: any[];
    appendixList: any[];
    transactionList: any[];
    reworkList: any[];
    linkList: any[];
    selectedId?: string | number;
  }>();

  const emit = defineEmits<{
    (e: 'update:search', val: string): void;
    (e: 'select', data: any): void;
  }>();

  const { keyword, highlightName } = useHighlightSearch();
  const localKeyword = keyword; // v-model

  const sourceList = computed(() => {
    if (props.tabActiveKey === '1') return props.releaseList || [];
    if (props.tabActiveKey === '3') return props.appendixList || [];
    if (props.tabActiveKey === '4') return props.transactionList || [];
    if (props.tabActiveKey === '5') return props.reworkList || [];
    if (props.tabActiveKey === '6') return props.linkList || [];

    return [];
  });

  const filteredList = computed(() =>
    (sourceList.value || [])
      .map((item) => {
        const h = highlightName(item.tmplName);
        return h ? { ...item, highlightName: h } : null;
      })
      .filter(Boolean),
  );

  watch(localKeyword, (v) => {
    emit('update:search', v);
  });

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
    .content-search {
      position: relative;
      &::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        border-bottom: 1px solid #e8ecf0;
        pointer-events: none;
      }
    }
    .content-item {
      position: relative;
      line-height: 24px;
      padding: 16px 8px;
      cursor: pointer;
      display: flex;
      align-items: center;

      &::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        border-bottom: 1px solid #e8ecf0;
        pointer-events: none;
      }

      .content-item-title {
        color: #212528;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding-left: 10px;
      }

      &:hover {
        .content-item-title {
          color: var(--ant-primary-color);
        }
      }

      &.content-item--selected {
        .content-item-title {
          color: var(--ant-primary-color);
        }
      }
    }
  }
</style>
