<template>
  <van-popup
    v-model:show="popupVisible"
    position="right"
    :duration="0"
    :style="{ width: '100%', height: '100%' }"
    :zIndex="10"
  >
    <div class="relative z-0 h-full flex flex-col">
      <!-- header -->
      <PageHeader
        :title="form.id ? '编辑委托' : '发起委托'"
        @back="popupVisible = false"
        class="border-b-solid border-zinc-100"
      />

      <!-- form -->
      <div class="flex-grow relative z-0 p-3 md:p-6 pb-24 overflow-y-auto bg-[#F5F6F7]">
        <div class="md:mx-auto md:max-w-2xl">
          <van-form ref="formRef" required="auto" label-width="7em">
            <!-- 代理人 -->
            <div class="mb-3 md:mb-4 px-3 py-1 bg-white rounded-md">
              <van-field
                v-model="form.delegateUserName"
                isLink
                readonly
                name="delegateUserName"
                label="代理人"
                placeholder="请选择"
                inputAlign="right"
                :rules="[{ required: true, message: '请选择代理人' }]"
                @click="handleUserSelect"
              />
            </div>

            <!-- 委托时间 -->
            <div class="mb-3 md:mb-4 px-3 py-1 bg-white rounded-md">
              <div class="mb-1 py-2 text-sm text-zinc-500 border-b-solid border-zinc-100">
                委托时间
              </div>
              <van-field
                v-model="form.startAt"
                isLink
                readonly
                name="startAt"
                label="开始时间"
                placeholder="请选择"
                inputAlign="right"
                :rules="[{ required: true, message: '请选择开始时间' }]"
                @click="handleTimePickerShow('startAt')"
              />
              <van-field
                v-model="form.endAt"
                isLink
                readonly
                name="endAt"
                label="结束时间"
                placeholder="请选择"
                inputAlign="right"
                :rules="[{ required: true, message: '请选择结束时间' }]"
                @click="handleTimePickerShow('endAt')"
              />
            </div>

            <!-- 委托流程 -->
            <div class="mb-3 md:mb-4 px-3 py-1 bg-white rounded-md">
              <div class="mb-1 py-2 text-sm text-zinc-500 border-b border-b-solid border-zinc-100">
                委托流程
              </div>
              <van-field
                v-model="selectedProcessLabel"
                isLink
                readonly
                name="type"
                label="审批流程"
                placeholder="请选择"
                inputAlign="right"
                :rules="[{ required: true, message: '请选择审批流程' }]"
                @click="processPickerPopupRef?.open(form.mockProcessList)"
              />
            </div>
          </van-form>

          <!-- submit -->
          <div
            class="absolute z-10 right-0 bottom-0 left-0 p-3 bg-white md:static md:p-0 md:bg-transparent"
          >
            <van-button block type="primary" :loading="isLoading" @click="handleSaveConfirm">
              确认
            </van-button>
          </div>
        </div>
      </div>
    </div>
  </van-popup>

  <ProcessPickerPopup
    ref="processPickerPopupRef"
    :availableAppProcessList="availableAppProcessList"
    @confirm="handleProcessPickerConfirm"
  />
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { createListPopup } from '/@page-designer/components/widgets/mobile/__components__/listPopup';
  import {
    getTaskDelegateProcess,
    postTaskDelegate,
    putTaskDelegateById,
  } from '@mobile/apis/gct-platform/TaskDelegateController';
  import { getOrgUserPickerTenantManagementOrgUserPageList } from '@mobile/apis/gct-platform/OrgUserPickerController';
  import dayjs from 'dayjs';
  import { showToast } from 'vant';
  import PageHeader from '@mobile/components/common/page-header.vue';
  import ProcessPickerPopup from './process-picker-popup.vue';
  import type { AppProcess } from '@mobile/apis/gct-platform/model';
  import { dataTimePickerInstance } from '@mobile/InstanceComponent/date-time-picker';
  import {
    appProcessList2MockProcessList,
    mockProcessList2AppProcessList,
    type IMockProcess,
  } from './util';

  const { openPicker } = dataTimePickerInstance({
    displayFormat: 'YYYY-MM-DD HH:mm',
    valueFormat: 'YYYY-MM-DD HH:mm',
  });

  const emit = defineEmits(['close']);

  const formRef = ref();
  const processPickerPopupRef = ref();

  const userSearchVal = ref();
  const popupVisible = ref(false);
  const isLoading = ref(false);

  const userOptions = ref<any[]>([]);
  const selectedUserOptions = ref<any[]>([]);
  const availableAppProcessList = ref<AppProcess[]>([]);

  const form = ref({
    id: undefined,
    startAt: '',
    endAt: '',
    delegateUserId: '',
    delegateUserName: '',
    mockProcessList: undefined as IMockProcess[] | undefined,
  });

  const nameMap = computed(() => {
    const map: Record<string, string> = {};
    availableAppProcessList.value.forEach((app) => {
      app.processList?.forEach((p) => {
        map[`${app.appTag}_${p.processKey}`] = p.processName!;
      });
    });
    return map;
  });

  const selectedProcessLabel = computed(() => {
    const { mockProcessList } = form.value;

    if (mockProcessList === undefined) return '';

    const processNames = mockProcessList.map((p) => nameMap.value[`${p.appTag}_${p.processKey}`]);
    const firstName = processNames[0];

    return processNames.length
      ? processNames.length === 1
        ? firstName
        : `${firstName}...等 ${processNames.length} 个`
      : '全部';
  });

  const handleTimePickerShow = async (field: 'startAt' | 'endAt') => {
    const value = await openPicker({
      value: form.value[field],
      title: field === 'startAt' ? '开始时间' : '结束时间',
    });
    (form.value[field] as any) = value;
  };

  const open = (data?: any) => {
    popupVisible.value = true;
    if (data) {
      const { appProcessList } = data;
      form.value = {
        id: data.id,
        startAt: dayjs(data.startAt).format('YYYY-MM-DD HH:mm'),
        endAt: dayjs(data.endAt).format('YYYY-MM-DD HH:mm'),
        delegateUserId: data.delegateUserId,
        delegateUserName: data.delegateUserName,
        mockProcessList: appProcessList.length
          ? appProcessList2MockProcessList(appProcessList)
          : [],
      };
    } else {
      form.value = {
        id: undefined,
        startAt: '',
        endAt: '',
        delegateUserId: '',
        delegateUserName: '',
        mockProcessList: undefined,
      };
    }
  };

  const getUserData = async (params = { pageNo: 1, keyword: '' }) => {
    const { keyword, pageNo } = params;
    if (userSearchVal.value !== keyword) {
      userSearchVal.value = keyword;
      userOptions.value = [];
    }

    const res: any = await getOrgUserPickerTenantManagementOrgUserPageList({
      pageNo,
      pageSize: 20,
      keyword,
    });

    const data = (res.data || []).map((e: any) => {
      return {
        value: e.id,
        id: e.id,
        label: e.fullname,
      };
    });
    userOptions.value.push(...data);
    return res.pageNo * res.pageSize >= res.totalCount;
  };

  // 代理人
  const { openListPopup: openUserPopup } = createListPopup({
    api: getUserData,
    options: userOptions,
    title: '代理人',
    optionLabelProp: 'showTitle',
    remote: true,
    lazy: true,
    showSearch: true,
    multiple: false,
    selectedOptions: selectedUserOptions,
  });

  const handleSaveConfirm = async () => {
    await formRef.value?.validate();

    const { mockProcessList } = form.value;

    const formData = {
      delegateUserId: form.value.delegateUserId,
      endAt: form.value.endAt + ':00',
      startAt: form.value.startAt + ':00',
      appProcessList:
        !mockProcessList || !mockProcessList.length
          ? undefined
          : mockProcessList2AppProcessList(mockProcessList),
    };
    isLoading.value = true;

    try {
      if (form.value.id) {
        await putTaskDelegateById({ id: form.value.id }, formData);
      } else {
        await postTaskDelegate(formData);
      }
      isLoading.value = false;
      popupVisible.value = false;
      showToast('操作成功');
      emit('close');
    } catch (error) {
      isLoading.value = false;
    }
  };

  const handleUserSelect = () => {
    openUserPopup({
      ids: form.value.delegateUserId,
      callback({ a, checkOptions }) {
        form.value.delegateUserId = a;
        form.value.delegateUserName = checkOptions[0].label;
        selectedUserOptions.value = [...checkOptions];
      },
    });
  };

  const handleProcessPickerConfirm = (data: { mockProcessList: IMockProcess[] | undefined }) => {
    Object.assign(form.value, data);
    processPickerPopupRef.value?.close();
  };

  const handleQueryAppProcessList = async () => {
    const res = (await getTaskDelegateProcess()) || [];
    availableAppProcessList.value = res.filter((app) => app.processList?.length);
  };

  onMounted(() => {
    handleQueryAppProcessList();
  });

  defineExpose({
    open,
  });
</script>
<style scoped lang="less">
  :deep(.van-icon-cross) {
    right: 8px;
    color: #212528;
    font-size: 16px;
  }

  :deep(.van-cell) {
    padding: 6px 0;

    &::after {
      display: none;
    }

    &--clickable:active {
      background-color: transparent;
    }
  }

  :deep(.van-field__error-message) {
    transform: translateX(1rem);
    text-align: right;
  }
</style>
