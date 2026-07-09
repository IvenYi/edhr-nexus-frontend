<template>
  <div class="fill-left-wrapper overflow-hidden ks-column">
    <div class="fill-left-title-content">
      <div class="fill-left-title">{{ $t('sys.edhr.recordsList') }}</div>
      <div class="fill-action-btn">
        <slot name="create-instance"></slot>
      </div>
    </div>
    <div class="flex justify-between py-8px pl-8px">
      <div>{{ $t('sys.webRender.edhrApplication.itemShowType') }}</div>
      <a-radio-group v-model:value="showType">
        <a-radio value="month">{{ $t('sys.edhr.recordBook.monthly') }}</a-radio>
        <a-radio value="all">{{ $t('sys.all') }}</a-radio>
      </a-radio-group>
    </div>

    <div class="px8px py8px">
      <a-input
        v-model:value="searchVal"
        :placeholder="t('sys.keywordsPlaceholder')"
        allowClear
        style="border-radius: 6px; padding-top: 2px; padding-bottom: 2px"
        size="medium"
      >
        <template #suffix>
          <i class="iconfont icon-sousuo text-[#797A7D] text-[13px]"></i>
        </template>
      </a-input>
    </div>

    <div class="instance-content overflow-hidden ks-column">
      <Scrollbar class="px-4px py-4px">
        <template v-if="searchDocInstanceList && searchDocInstanceList.length">
          <template v-if="showType === 'month'">
            <template v-for="(info, key) in groupedMap" :key="key">
              <CollapseGroup
                :title="info.label"
                :items="info.items"
                :support-edit="supportEdit"
                :expanded="key === currentMonthKey"
                :selectedId="selectSelfInfo?.id"
                @edit="onEditDescription"
                @select="onSelectInstanceItem"
              />
            </template>
          </template>

          <template v-else-if="showType === 'all'">
            <CollapseGroup
              :items="searchDocInstanceList"
              :support-edit="supportEdit"
              :expanded="false"
              :selectedId="selectSelfInfo?.id"
              @edit="onEditDescription"
              @select="onSelectInstanceItem"
            />
          </template>
        </template>

        <div v-else class="nocode-common-loading-warp">
          <a-empty :description="$t('sys.noData')" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
        </div>
      </Scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, h } from 'vue';
  import { Empty } from 'ant-design-vue';
  import dayjs from 'dayjs';
  import { Scrollbar } from '/@/components/Scrollbar';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { FormTypeEnum } from '@gct/nocode-base';
  import CollapseGroup from './collapse-group.vue';
  import { OnlineFormInstanceResponse } from '/@/apis/gct-apaas/model';

  const { t } = useI18n();

  const props = defineProps<{
    /** 在线表单实例列表 */
    docInstanceList: Array<OnlineFormInstanceResponse>;
    /** 选择的实例信息 */
    selectSelfInfo: any;
    supportEdit: boolean;
    onEditDescription?: Function;
  }>();

  const emit = defineEmits<{
    (e: 'update:searchValue', value: any): void;
    (e: 'update:selectSelfInfo', value?: any): void;
  }>();

  const showType = ref('month');
  const searchVal = ref();

  // 内容高亮处理，名称被searchkey 匹配不到时，返回 null
  const highlightName = (str) => {
    const displayName = str;
    const rDisplayName = displayName?.replace(
      new RegExp(searchVal.value?.replace(new RegExp(/(?=[$.?+\[\]\*^|\\(){}/])/g), '\\'), 'g'),
      (s) => `<span class="is-highlight">${s}</span>`,
    );
    if (rDisplayName === displayName) return null;

    return rDisplayName;
  };

  const searchDocInstanceList = computed(() => {
    return props.docInstanceList
      .map((item) => {
        const hlName = highlightName(item.title);
        return hlName
          ? {
              ...item,
              highlightName: hlName,
            }
          : null;
      })
      .filter(Boolean)
      .sort((a: any, b: any) => {
        const aTime = a.createTime ?? '';
        const bTime = b.createTime ?? '';
        return String(bTime).localeCompare(String(aTime));
      });
  });

  /**
   * 按月分组
   * @param {Array} arr - 数据数组，元素包含 createTime 字段
   * @param {Object} options
   *   - labelFormatKey: format格式
   *   - labelFormatText: format格式（显示）
   * @returns {Object}
   */
  const groupByMonth = (
    arr,
    { labelFormatKey = 'YYYY-MM', labelFormatText = 'YYYY年MM月' } = {},
  ) => {
    const m = new Map();

    for (const item of arr) {
      const month = dayjs(item.createTime).format(labelFormatKey);
      const bucket = m.get(month);
      if (bucket) bucket.push(item);
      else m.set(month, [item]);
    }

    const entries = Array.from(m.entries()).sort((a, b) => b[0].localeCompare(a[0]));

    return Object.fromEntries(
      entries.map(([month, items]) => [
        month,
        { label: dayjs(month, labelFormatKey).format(labelFormatText), items },
      ]),
    );
  };

  const groupedMap = computed(() => {
    return groupByMonth(searchDocInstanceList.value);
  });

  const currentMonthKey = computed(() => {
    if (!props.selectSelfInfo) {
      return null;
    }
    return dayjs(props.selectSelfInfo.createTime).format('YYYY-MM');
  });

  async function onSelectInstanceItem(data) {
    if (props.selectSelfInfo?.id === data.id) {
      return;
    }

    emit('update:selectSelfInfo', data);
  }
</script>

<style scoped lang="less">
  .fill-left-wrapper {
    position: relative;
    width: 300px;
    background-color: #fff;
    border-right: 1px solid #e8ecf0;

    .fill-left-title-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 8px;
      line-height: 20px;
      border-bottom: 1px solid #eaedf1;
      .fill-left-title {
        color: #000000;
        font-size: 14px;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: default;
      }
    }

    .instance-content {
      position: relative;
      flex: 1;
    }
  }
</style>
