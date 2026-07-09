<template>
  <div class="bg-[#f5f6f7]" :style="{ height: height || '722px' }">
    <div class="relative _z-0 h-full flex flex-col">
      <div class="flex-shrink-0 bg-white">
        <PageHeader renderAsPDA :title="$t('sys.process.element.approval')" />
        <Tabs
          class="-mt-2 pl-3"
          :options="tabOptions"
          :active="activeTab"
          @change="handleTabChange"
        />
      </div>

      <!-- list -->
      <div class="flex-grow relative _z-0 overflow-y-auto">
        <!-- delegate-list -->
        <template v-if="activeTab === TODO_TYPE.DELEGATE">
          <div class="_absolute _z-0 _inset-0 flex flex-col overflow-hidden">
            <!-- tabs -->
            <div class="flex-shirk-0 p-4">
              <ButtonTabs
                :tabs="DELEGATE_TABS"
                :activeTab="activeDelegationType"
                @change="handleButtonTabChange"
              />
            </div>

            <!-- list -->
            <div class="flex-grow px-3 overflow-y-auto">
              <van-list :finished="true">
                <div
                  v-for="row in delegateRowList"
                  :key="row.id"
                  class="relative z-0 px-3 py-4 mb-3 bg-white rounded-lg"
                >
                  <!-- header -->
                  <div class="flex items-center">
                    <div class="flex-grow mr-2 text-lg font-bold text-black truncate">
                      {{ row.delegateUserName }}的委托
                    </div>
                    <div :class="{ hidden: activeDelegationType !== '1' }">
                      <StatusTag v-bind="{ ...getDelegateStatusTypeAndText(row.status!) }" />
                    </div>
                  </div>

                  <!-- print -->
                  <div
                    class="justify-center items-center absolute z-10 top-1/2 right-4 w-20 h-20 -translate-y-1/2 bg-center bg-contain bg-no-repeat -rotate-15"
                    :class="[
                      activeDelegationType === '2' ? 'flex' : 'hidden',
                      row.status === 'EXPIRED' ? 'grayscale' : '',
                    ]"
                    :style="{ backgroundImage: `url(${svgStatusPrint})` }"
                  >
                    <div class="text-[#F5454740] text-sm font-900">
                      {{ getDelegateStatusTypeAndText(row.status!).text }}
                    </div>
                  </div>

                  <!-- body -->
                  <div class="mt-1">
                    <Description :label="$t('sys.startTime')">
                      {{ formatDatetime(row.startAt!) }}
                    </Description>

                    <Description :label="$t('sys.endTime')">
                      {{ formatDatetime(row.endAt!) }}
                    </Description>

                    <Description :label="$t('sys.process.delegate')">
                      {{ row.delegateUserName }}
                    </Description>
                  </div>

                  <div v-show="row.status !== 'EXPIRED'" class="mt-2 text-right">
                    <van-button plain size="small" class="ml-3 w-20"> {{ $t('sys.edit') }} </van-button>
                    <van-button
                      v-show="row.status === 'STARTED'"
                      plain
                      size="small"
                      type="danger"
                      class="ml-3 w-20"
                    >
                      {{ $t('sys.undo') }}
                    </van-button>
                    <van-button
                      v-show="row.status === 'NOT_STARTED'"
                      plain
                      size="small"
                      class="ml-3 w-20"
                    >
                      {{ $t('sys.delete') }}
                    </van-button>
                  </div>
                </div>
              </van-list>
            </div>
          </div>

          <!-- fixed button -->
          <div
            class="flex justify-center items-center absolute z-20 right-4 bottom-24 w-16 h-16 rounded-2xl shadow-lg"
            :class="extraClass.shadow"
          >
            <layer
              class="absolute -z-10 inset-0 bg-gradient-to-b from-[var(--van-primary-color)]"
              :class="extraClass.layer"
              style="
                clip-path: path(
                  'M0.422757 15.2472C0.76071 7.18494 7.18494 0.76071 15.2472 0.422757C20.6961 0.194349 26.8466 0 32 0C37.1534 0 43.3039 0.194349 48.7528 0.422757C56.8151 0.76071 63.2393 7.18494 63.5772 15.2472C63.8057 20.6961 64 26.8466 64 32C64 37.1534 63.8057 43.3039 63.5772 48.7528C63.2393 56.8151 56.8151 63.2393 48.7528 63.5772C43.3039 63.8057 37.1534 64 32 64C26.8466 64 20.6961 63.8057 15.2472 63.5772C7.18494 63.2393 0.76071 56.8151 0.422757 48.7528C0.194349 43.3039 0 37.1534 0 32C0 26.8466 0.194349 20.6961 0.422757 15.2472Z'
                );
              "
            />
            <div class="text-center text-white">
              <img class="w-6 h-6" :src="svgPlane" />
              <div class="text-xs font-500">{{ $t('sys.process.createDelegation') }}</div>
            </div>
          </div>
        </template>

        <!-- process-list -->
        <template v-else>
          <div>
            <!-- search -->
            <div class="p-3 py-4">
              <van-field
                v-model="searchValue"
                :placeholder="$t('sys.process.searchTitle')"
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
              <van-list :finished="true">
                <div
                  v-for="row in processRowList"
                  :key="row.id"
                  class="flex px-3 py-4 mb-3 bg-white rounded-lg active:bg-[#E8EBF0]"
                >
                  <!-- icon -->
                  <div class="flex-shrink-0">
                    <img :src="isThemeBlue ? svgIconTodoBlue : svgIconTodoGreen" />
                  </div>
                  <!-- content -->
                  <div class="flex-grow ml-3 min-w-0">
                    <!-- header -->
                    <div class="flex items-center">
                      <div class="flex-grow mr-2 text-lg font-bold text-black truncate">
                        {{ row.title }}
                      </div>
                      <StatusTag v-bind="{ ...getProcessStatusTypeAndText(row.combinedStatus) }" />
                    </div>
                    <!-- body -->
                    <div class="mt-1">
                      <Description v-if="type !== TODO_TYPE.DONE" :label="$t('sys.process.launchTime')">
                        {{ row.taskStartTime || row.startTime }}
                      </Description>

                      <Description v-if="type !== TODO_TYPE.APPLICATION" :label="$t('sys.process.initiator')">
                        {{ row.initiatorName }}
                      </Description>

                      <Description v-if="type !== TODO_TYPE.APPLICATION" :label="$t('sys.process.initiatorOrg')">
                        {{ row.initiatorOrgName }}
                      </Description>

                      <Description :label="$t('sys.process.name')">
                        {{ row.procDefName }}
                      </Description>

                      <Description v-if="type !== TODO_TYPE.DONE" :label="$t('sys.process.approvalStage')">
                        {{ row.taskNames || row.taskName }}
                      </Description>

                      <Description v-if="type === TODO_TYPE.APPLICATION" :label="$t('sys.process.currentProcessor')">
                        {{ row.assigneeNames }}
                      </Description>

                      <Description v-if="type === TODO_TYPE.DONE" :label="$t('sys.process.handleTime')">
                        {{ row.taskEndTime }}
                      </Description>
                    </div>
                  </div>
                </div>
              </van-list>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
<script name="DesignTodoComponent" setup lang="ts">
  import { computed, toRefs, ref } from 'vue';
  import { nodeContainerProps } from '../../../props';
  import PageHeader from '@mobile/components/common/page-header.vue';
  import Tabs from '@mobile/components/common/tabs.vue';
  import Description from '@mobile/components/common/description.vue';
  import { ButtonTabs } from '@mobile/components/common/button-tabs';
  import StatusTag from '@mobile/components/common/status-tag/index.vue';
  import { ProcessStatusEnum, TODO_TYPE, ch_ProcessStatusMap } from '@gct/runtime';
  import { StatusType } from '@mobile/components/common/status-tag';
  import svgStatusPrint from '@mobile/assets/svg-icons/icon-todo-delegate-status-print.svg';
  import svgPlane from '@mobile/assets/svg-icons/icon-todo-delegate-plane.svg';
  import dayjs from 'dayjs';

  const DEFAULT_CONTENT_LIST = [
    TODO_TYPE.TODO,
    TODO_TYPE.APPLICATION,
    TODO_TYPE.DONE,
    TODO_TYPE.DELEGATE,
  ];

  const DELEGATE_TABS = [
    { key: '1', name: $t('sys.process.currentDelegation') },
    { key: '2', name: $t('sys.process.delegationHistory') },
  ];

  const STATUS_TYPE_MAP = {
    [ProcessStatusEnum.APPROVING]: StatusType.primary,
    [ProcessStatusEnum.COMPLETED]: StatusType.success,
    [ProcessStatusEnum.REFUSED]: StatusType.danger,
    [ProcessStatusEnum.REJECTED]: StatusType.danger,
    [ProcessStatusEnum.TERMINATED]: StatusType.warning,
    [ProcessStatusEnum.WITHDRAWN]: StatusType.info,
  };

  const props = defineProps(nodeContainerProps);
  const { displayContent } = toRefs(props.data.data);

  const activeDelegationType = ref('1');

  const getProcessStatusTypeAndText = (status: ProcessStatusEnum) => {
    const type: StatusType = STATUS_TYPE_MAP[status];
    const text: string = $t(ch_ProcessStatusMap[status]);
    return { type, text };
  };

  const getDelegateStatusTypeAndText = (status: string) => {
    const type: StatusType = STATUS_TYPE_MAP[status] || StatusType.info;
    const text: string = $t(`sys.process.delegation.${status}`);
    return { type, text };
  };

  const formatDatetime = (date: string) => {
    return dayjs(date).format('YYYY-MM-DD HH:mm');
  };

  const tabOptions = computed(() => {
    const visibleTypes = displayContent.value || DEFAULT_CONTENT_LIST;
    return visibleTypes.map((t) => {
      const suffix = t === TODO_TYPE.TODO ? ` (3)` : '';
      const label = `${$t(`sys.menu.todo2.${t}`)}${suffix}`;
      return { label, value: t };
    });
  });

  const defaultTab = displayContent.value[0] || (route.query.key as TODO_TYPE) || TODO_TYPE.TODO;

  const activeTab = ref<TODO_TYPE>(defaultTab);

  const isThemeBlue = ref(false); //computed(() => '' === '#026AC8');

  const extraClass = computed(() => {
    return {
      blue: { layer: 'to-[#0098E4]', shadow: 'shadow-blue-500/20' },
      green: { layer: 'to-[#1BC89F]', shadow: 'shadow-teal-500/20' },
    }['blue'];
  });

  const handleTabChange = async (val: TODO_TYPE) => {
    activeTab.value = val;
  };

  const handleButtonTabChange = (type: string) => {
    activeDelegationType.value = type;
  };

  const processRowList = [
    {
      id: 1,
      title: '审批名称',
      initiatorName: '发起人名称',
      initiatorOrgName: '发起部门名称',
      procDefName: '流程名称',
      taskNames: '审批阶段名称',
      taskStartTime: '2024-10-24 08:00:00',
      combinedStatus: ProcessStatusEnum.APPROVING,
    },
    {
      id: 2,
      title: '审批名称',
      initiatorName: '发起人名称',
      initiatorOrgName: '发起部门名称',
      procDefName: '流程名称',
      taskNames: '审批阶段名称',
      taskStartTime: '2024-10-24 08:00:00',
      combinedStatus: ProcessStatusEnum.COMPLETED,
    },
    {
      id: 3,
      title: '审批名称',
      initiatorName: '发起人名称',
      initiatorOrgName: '发起部门名称',
      procDefName: '流程名称',
      taskNames: '审批阶段名称',
      taskStartTime: '2024-10-24 08:00:00',
      combinedStatus: ProcessStatusEnum.REFUSED,
    },
  ];

  const delegateRowList = [
    {
      id: 1,
      title: '审批名称',
      delegateUserName: '委托人',
      startAt: '2024-10-24 08:00:00',
      status: 'EXPIRED',
    },
    {
      id: 2,
      title: '审批名称',
      delegateUserName: '委托人',
      startAt: '2024-10-24 08:00:00',
      status: 'EXPIRED',
    },
    {
      id: 3,
      title: '审批名称',
      delegateUserName: '委托人',
      startAt: '2024-10-24 08:00:00',
      status: 'EXPIRED',
    },
  ];
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
