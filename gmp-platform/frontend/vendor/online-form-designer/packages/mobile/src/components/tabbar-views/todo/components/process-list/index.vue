<!-- eslint-disable vue/no-v-html -->
<template>
  <div>
    <!-- search -->
    <div class="p-3 py-4 md:p-6">
      <van-field
        v-model="searchValue"
        placeholder="搜索流程标题"
        :clearable="true"
        style="background-color: #e8ebee"
        @update:model-value="handleSearch"
      >
        <template #left-icon>
          <i class="iconfont icon-sousuoMedpro mr-2 text-sm"></i>
        </template>
      </van-field>
    </div>

    <!-- list -->
    <div class="p-3 pt-0">
      <van-list :loading="isLoading" :finished="isFinished" @load="handleLoad">
        <div
          v-for="row in rowList"
          :key="row.id"
          class="flex mb-3 md:mb-4 px-3 py-4 bg-white rounded-lg active:bg-[#E8EBF0]"
          @click="handleViewDetail(row)"
        >
          <!-- icon -->
          <div class="flex-shrink-0">
            <img :src="isThemeBlue ? svgIconTodoBlue : svgIconTodoGreen" />
          </div>
          <!-- content -->
          <div class="flex-grow ml-3 min-w-0">
            <!-- header -->
            <div class="flex items-center">
              <div
                class="flex-grow mr-2 text-lg font-bold text-black truncate"
                v-html="getHighlightTitle(row.title)"
              >
              </div>
              <StatusTag v-bind="{ ...getStatusTypeAndText(row.combinedStatus) }" />
            </div>
            <!-- body -->
            <div class="mt-1">
              <Description v-if="type !== TODO_TYPE.DONE" label="发起时间">
                {{ row.taskStartTime || row.startTime }}
              </Description>

              <Description v-if="type !== TODO_TYPE.APPLICATION" label="发起人">
                {{ row.initiatorName }}
              </Description>

              <Description v-if="type !== TODO_TYPE.APPLICATION" label="发起部门">
                {{ row.initiatorOrgName }}
              </Description>

              <Description label="流程名称">
                {{ row.procDefName }}
              </Description>

              <Description v-if="type !== TODO_TYPE.DONE" label="审批阶段">
                {{ row.taskNames || row.taskName }}
              </Description>

              <Description
                v-if="type === TODO_TYPE.APPLICATION && row.assigneeNames"
                label="当前处理人"
              >
                {{ row.assigneeNames }}
              </Description>

              <Description v-if="type === TODO_TYPE.DONE" label="处理时间">
                {{ row.taskEndTime }}
              </Description>
            </div>
          </div>
        </div>
      </van-list>

      <Empty
        v-if="!isLoading && !rowList.length"
        :tip="searchValue ? '搜索无结果' : `暂无${$t(`sys.menu.todo2.${type}`)}`"
        :iconType="!!searchValue ? 'search' : undefined"
        style="height: calc(100vh - 20rem)"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
  import { ref } from 'vue';
  import { debounce } from 'lodash-es';
  import { ProcessStatusEnum, TODO_TYPE, ch_ProcessStatusMap } from '@gct/runtime';
  import { useProcessPage } from './useProcessPage';
  import { useMitt } from '/@page-designer/hooks/useMitt';
  import Description from '@mobile/components/common/description.vue';
  import StatusTag from '@mobile/components/common/status-tag/index.vue';
  import Empty from '@mobile/components/common/empty.vue';
  import svgIconTodoBlue from '@mobile/assets/svg-icons/icon-todo-case-blue.svg';
  import svgIconTodoGreen from '@mobile/assets/svg-icons/icon-todo-case-green.svg';
  import { StatusType } from '@mobile/components/common/status-tag';
  import { useplatSetting } from '@mobile/utils/useplatSetting';

  const STATUS_TYPE_MAP = {
    [ProcessStatusEnum.APPROVING]: StatusType.primary,
    [ProcessStatusEnum.COMPLETED]: StatusType.success,
    [ProcessStatusEnum.REFUSED]: StatusType.danger,
    [ProcessStatusEnum.REJECTED]: StatusType.danger,
    [ProcessStatusEnum.TERMINATED]: StatusType.warning,
    [ProcessStatusEnum.WITHDRAWN]: StatusType.info,
  };

  const props = defineProps<{
    query: Function;
    type: TODO_TYPE;
  }>();

  const router = useRouter();
  const { mitt } = useMitt();

  const isLoading = ref(false);
  const isFinished = ref(false);
  const rowList = ref<any[]>([]);
  const pageNo = ref(1);
  const searchValue = ref('');
  const searchValueCache = ref('');

  const { themeSetting } = useplatSetting();

  const isThemeBlue = ref(themeSetting.primaryColor === '#026AC8');

  const getStatusTypeAndText = (status: ProcessStatusEnum) => {
    const type: StatusType = STATUS_TYPE_MAP[status];
    const text: string = $t(ch_ProcessStatusMap[status]);
    return { type, text };
  };

  const getHighlightTitle = (title: string) => {
    const searchText = searchValue.value.trim();
    return searchText
      ? title.replace(searchText, `<span class="primary-color font-bold">${searchText}</span>`)
      : title;
  };

  const handleQueryList = async () => {
    props
      .query({
        pageNo: pageNo.value,
        pageSize: 20,
        processTitle: searchValue.value || undefined,
      })
      .then((res: any) => {
        rowList.value.push(...res.data);
        isFinished.value = res?.pageNo >= res?.totalPage;

        if (!searchValue.value && props.type === TODO_TYPE.TODO) {
          mitt.emit('process-center-todo', res.totalCount);
        }
      })
      .finally(() => {
        isLoading.value = false;
      });
  };

  const handleDebouncedQueryList = debounce(handleQueryList, 300);

  const handleSearch = (val: string) => {
    isLoading.value = true;
    pageNo.value = 1;
    searchValue.value = val?.trim();

    const isNewSearch = searchValue.value !== searchValueCache.value;

    if (pageNo.value === 1 || isNewSearch) {
      rowList.value = [];
      isFinished.value = false;
      if (isNewSearch) {
        searchValueCache.value = searchValue.value;
      }
    }

    handleDebouncedQueryList();
  };

  const handleLoad = () => {
    handleQueryList();
    pageNo.value++;
  };

  const handleViewDetail = async (process: any) => {
    const { goTodoPage, goMyApplicationPage, goDonePage } = useProcessPage(process, router);

    if (props.type === TODO_TYPE.APPLICATION) {
      goMyApplicationPage();
    } else if (props.type === TODO_TYPE.TODO) {
      goTodoPage();
    } else if (props.type === TODO_TYPE.DONE) {
      goDonePage();
    }
  };
</script>
<style lang="less" scoped>
  :deep(.van-field) {
    padding: 8px 14px;
    border-radius: 8px;
  }

  :deep(.van-field__control) {
    &::placeholder {
      color: #666;
    }
  }
</style>
