<template>
  <div class="ks-col ks-column overflow-auto">
    <div class="bg-[#FFFFFF] rounded-8px mx14px mt12px">
      <van-field
        v-model="processTitle"
        label=""
        placeholder="请输入流程标题"
        :clearable="true"
        @update:model-value="onSearch"
      >
        <template #left-icon>
          <i class="iconfont icon-sousuoMedpro mr6px text-[12px] lh-14px"></i>
        </template>
      </van-field>
    </div>
    <div class="ks-col overflow-auto py12px px14px">
      <van-list v-model:loading="loading" :finished="finished" finished-text="" @load="onLoad">
        <div
          v-for="item in dataList"
          :key="item.id"
          class="px10px py14px mb10px bg-[#FFFFFF] rounded-8px"
        >
          <div class="title pb10px border-b ks-row">
            <div class="text-[#212528] text-16px break-all ks-col">{{ item.title }}</div>
            <div
              class="text-12px"
              :class="statusOptions[(item.combinedStatus as ProcessStatusEnum) || ProcessStatusEnum.APPROVING]"
            >
              {{
                $t(
                  ch_ProcessStatusMap[
                    (item.combinedStatus as ProcessStatusEnum) || ProcessStatusEnum.APPROVING
                  ],
                )
              }}
            </div>
          </div>
          <div class="mt12px">
            <van-row :gutter="[0, 8]" class="text-12px">
              <van-col :span="12">
                <span class="text-[#474747]">流程名：</span>
                {{ item.procDefName }}
              </van-col>
              <van-col v-show="type !== TODO_TYPE.DONE" :span="12">
                <span class="text-[#474747]">当前节点：</span>
                {{ item.taskNames || item.taskName }}
              </van-col>
              <van-col v-show="type !== TODO_TYPE.APPLICATION" :span="12">
                <span class="text-[#474747]">提交人：</span>
                {{ item.initiatorName }}
              </van-col>
              <van-col v-show="type !== TODO_TYPE.APPLICATION" :span="12">
                <span class="text-[#474747]">提交部门：</span>
                {{ item.initiatorOrgName }}
              </van-col>
              <van-col v-show="type === TODO_TYPE.APPLICATION" :span="24">
                <span class="text-[#474747]">当前节点处理人：</span>
                {{ item.assigneeNames }}
              </van-col>
              <van-col v-if="type !== TODO_TYPE.DONE" :span="24">
                <span class="text-[#474747]">提交时间：</span>
                {{ item.taskStartTime || item.startTime }}
              </van-col>
              <van-col v-else :span="24">
                <span class="text-[#474747]">处理时间：</span>
                {{ item.taskEndTime }}
              </van-col>
              <van-col :span="24" class="primary-gct" @click="viewDetail(item)">
                <van-icon name="arrow" class="float-right pt5px font-bold" />
                <span class="text-14px">查看详情</span>
              </van-col>
            </van-row>
          </div>
        </div>
      </van-list>
      <div v-if="!dataList.length" class="van-list__finished-text"> 暂无信息 </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { ref } from 'vue';
  import { debounce } from 'lodash-es';
  import { ProcessStatusEnum, TODO_TYPE, ch_ProcessStatusMap } from '@gct/runtime';
  import { useProcessPage } from '../usePage';
  import { useMitt } from '/@page-designer/hooks/useMitt';
  const props = defineProps<{
    api: Function;
    type: string;
  }>();
  const router = useRouter();
  const loading = ref(false);
  const finished = ref(true);
  const dataList = ref<any[]>([]);
  const pageNo = ref(1);
  const processTitle = ref();
  const { mitt } = useMitt();
  const statusOptions = {
    [ProcessStatusEnum.APPROVING]: 'blue-color',
    [ProcessStatusEnum.COMPLETED]: 'green-color',
    [ProcessStatusEnum.REFUSED]: 'red-color',
    [ProcessStatusEnum.REJECTED]: 'orange-color',
    [ProcessStatusEnum.TERMINATED]: 'red-color',
    [ProcessStatusEnum.WITHDRAWN]: 'gray-color',
  };

  onMounted(() => {
    getData().then((res) => {
      if (props.type === TODO_TYPE.TODO) {
        mitt.emit('process-center-todo', res.totalCount);
      }
    });
  });

  async function viewDetail(data: any) {
    const { taskId = '', processInstanceId } = data;
    const { goTodoPage, goMyApplicationPage, goDonePage } = useProcessPage(data, router);
    if (props.type === TODO_TYPE.APPLICATION) {
      goMyApplicationPage();
    }
    if (props.type === TODO_TYPE.TODO) {
      goTodoPage();
    }
    if (props.type === TODO_TYPE.DONE) {
      goDonePage();
    }
  }

  function onLoad() {
    pageNo.value++;
    getData();
  }

  function onSearch(val: string) {
    processTitle.value = val?.trim();
    debounce(() => {
      pageNo.value = 1;
      getData();
    }, 300)();
  }

  const searchVal = ref();
  async function getData() {
    const res = await props.api({
      pageNo: pageNo.value,
      pageSize: 20,
      processTitle: processTitle.value,
    });
    if (pageNo.value === 1 || searchVal.value !== processTitle.value) {
      dataList.value = [];
    }
    if (searchVal.value !== processTitle.value) {
      searchVal.value = processTitle.value;
    }
    finished.value = res?.pageNo >= res?.totalPage;
    loading.value = false;
    dataList.value.push(...res.data);
    return res
  }
</script>
<style lang="less" scoped>
  .border-b {
    border-bottom: 1px dashed #f0f0f0;
  }

  .border-b-solid {
    border-bottom: 1px solid #f0f0f0;
  }

  .primary-gct {
    color: var(--van-primary-color);
  }

  :deep(.van-field) {
    padding: 8px 14px;
    border-radius: 8px;
  }

  :deep(.van-field__control) {
    &::placeholder {
      color: #666;
    }
  }

  .blue-color {
    color: #3168ec;
  }

  .red-color {
    color: #f54547;
  }

  .green-color {
    color: #0fba84;
  }

  .orange-color {
    color: #ff792e;
  }

  .gray-color {
    color: #8f8f8f;
  }
</style>
