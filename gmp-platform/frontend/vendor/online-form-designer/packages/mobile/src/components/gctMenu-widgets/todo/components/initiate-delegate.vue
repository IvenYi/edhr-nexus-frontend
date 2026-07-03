<template>
  <van-popup v-model:show="show" position="bottom" closeable :style="{ height: '100%' }">
    <div class="h100% ks-column">
      <div class="py12px pl8px ks-row-middle text-[16px] text-[#212528]">
        <van-icon name="arrow-left" @click="show = false" />
        <div class="ell text-center ks-col mr24px">发起委托</div>
      </div>
      <div class="ks-col py12px px14px bg-[#F7F8FA]">
        <div class="bg-[#FFFFFF] rounded-8px py16px px12px">
          <van-form ref="formRef" required="auto" label-width="7em">
            <van-cell-group inset>
              <van-field
                v-model="form.delegateUserName"
                name="委托人"
                label="委托人"
                placeholder="委托人"
                is-link
                :rules="[{ required: true, message: '请选择委托人' }]"
                @click="onSelectUser"
              />
              <van-field
                v-model="form.startAt"
                is-link
                name="委托开始时间"
                label="委托开始时间"
                placeholder="委托开始时间"
                :rules="[{ required: true, message: '请选择委托开始时间' }]"
                @click="showStartPicker = true"
              />
              <van-field
                v-model="form.endAt"
                is-link
                name="endAt"
                label="委托结束时间"
                placeholder="委托结束时间"
                :rules="[{ required: true, message: '请选择委托结束时间' }]"
                @click="showEndPicker = true"
              />
              <van-field
                name="radio"
                label="委托流程"
                :rules="[{ required: true, message: '请选择委托流程' }]"
              >
                <template #input>
                  <van-radio-group v-model="form.type" direction="horizontal">
                    <van-radio name="1">全部</van-radio>
                    <van-radio name="2">部分</van-radio>
                  </van-radio-group>
                </template>
              </van-field>
              <van-field
                v-model="form.appProcessList"
                v-show="form.type === '2'"
                name="appProcessList"
                :rules="[{ required: form.type === '2', message: '请选择委托流程' }]"
              >
                <template #input>
                  <div
                    class="p8px rounded-4px bg-[#F7F8FA] w100% flex-wrap h128px overflow-y-auto"
                    @click="onSelectProcess"
                  >
                    <span v-for="item in processCheckeOpts" class="gct-custom-tag" :key="item.id">
                      {{ item.label }}
                    </span>
                  </div>
                </template>
              </van-field>
            </van-cell-group>
            <div class="border-t my12px"></div>
            <van-button block type="primary" @click="saveDelegate">确认</van-button>
          </van-form>
        </div>
      </div>
    </div>
  </van-popup>
  <dateTimePopup v-model:show="showStartPicker" v-model:value="form.startAt" />
  <dateTimePopup v-model:show="showEndPicker" v-model:value="form.endAt" :min="form.startAt" />
</template>
<script setup lang="ts">
  import { computed, ref, onMounted } from 'vue';
  import dateTimePopup from './date-time-popup.vue';
  import { createListPopup } from '/@page-designer/components/widgets/mobile/__components__/listPopup';
  import {
    getTaskDelegateProcess,
    postTaskDelegate,
    putTaskDelegateById,
  } from '@mobile/apis/gct-platform/TaskDelegateController';
  import { getOrgUserPickerTenantManagementOrgUserPageList } from '@mobile/apis/gct-platform/OrgUserPickerController';
  import dayjs from 'dayjs';
  import { showToast } from 'vant';

  const emit = defineEmits(['update:show', 'close']);

  const formRef = ref();
  const showStartPicker = ref(false);
  const showEndPicker = ref(false);
  const processCheckeOpts = ref<any[]>([]);
  const userOptions = ref<any[]>([]);
  const userCheckeOpts = ref<any[]>([]);
  const processOptions = ref<any[]>([]);
  const show = ref(false);
  const form = ref({
    startAt: '',
    endAt: '',
    delegateUserId: '',
    delegateUserName: '',
    appProcessList: [],
    type: '1',
  });

  const open = (data?: any) => {
    show.value = true;
    if (data) {
      form.value = {
        startAt: dayjs(data.startAt).format('YYYY-MM-DD HH:mm'),
        endAt: dayjs(data.endAt).format('YYYY-MM-DD HH:mm'),
        delegateUserId: data.delegateUserId,
        delegateUserName: data.delegateUserName,
        type: data.children?.length ? '2' : '1',
        appProcessList: data.children?.map((e) => e.processKey) || [],
        id: data.id,
      };
      processCheckeOpts.value = processOptions.value
        .filter((e) => e.children)
        .map((e) => e.children)
        .flat()
        .filter((e) => data.children.some((f) => f.processKey === e.id));
    } else {
      form.value = {
        startAt: '',
        endAt: '',
        delegateUserId: '',
        delegateUserName: '',
        appProcessList: [],
        type: '1',
      };
    }
  };

  // 委托人
  const { openListPopup: openUserPopup } = createListPopup({
    api: getUserData,
    options: userOptions,
    title: '委托人',
    optionLabelProp: 'showTitle',
    remote: true,
    lazy: true,
    showSearch: true,
    multiple: false,
    selectedOptions: userCheckeOpts,
  });

  // 委托流程
  const { openListPopup: openProcessPopup } = createListPopup({
    options: processOptions,
    title: '委托流程',
    isTree: true,
    multiple: true,
    lazy: false,
    selectedOptions: processCheckeOpts,
  });

  onMounted(() => {
    getProcessData();
  });

  async function saveDelegate() {
    await formRef.value?.validate();
    const params = {
      delegateUserId: form.value.delegateUserId,
      endAt: form.value.endAt + ':00',
      startAt: form.value.startAt + ':00',
      appProcessList:
        form.value.type === '2'
          ? processCheckeOpts.value.reduce((list, e) => {
              let obj = list.find((f) => f.appTag === e.pId);
              if (!obj) {
                obj = { appTag: e.pId, processList: [] };
                list.push(obj);
              }
              obj.processList.push({
                processKey: e.id,
              });
              return list;
            }, [])
          : undefined,
    };
    if (form.value.id) {
      await putTaskDelegateById({ id: form.value.id }, params);
    } else {
      await postTaskDelegate(params);
    }
    show.value = false;
    showToast('操作成功');
    emit('close');
  }

  function onSelectUser() {
    openUserPopup({
      ids: form.value.delegateUserId,
      callback({ a, checkOptions }) {
        form.value.delegateUserId = a;
        form.value.delegateUserName = checkOptions[0].label;
        userCheckeOpts.value = [...checkOptions];
      },
    });
  }

  const onSelectProcess = () => {
    openProcessPopup({
      ids: form.value.appProcessList,
      callback({ a, checkOptions }) {
        form.value.appProcessList = [...a];
        processCheckeOpts.value = [...checkOptions];
      },
    });
  };

  async function getProcessData() {
    const res = (await getTaskDelegateProcess()) || [];
    const data = res
      .filter((e) => e.processList?.length)
      .map((e: any) => {
        return {
          label: e.appName,
          value: e.appTag,
          id: e.appTag,
          isLeaf: false,
          pId: '',
          unchecked: true,
          _item: {
            full_path_: e.appTag,
            label: e.appName,
            value: e.appTag,
            id: e.appTag,
            parent_id_: '',
            LEVEL: 1,
          },
          children:
            e.processList && e.processList.length
              ? e.processList.map((f: any) => {
                  return {
                    pId: e.appTag,
                    isLeaf: true,
                    label: f.processName,
                    value: f.processId,
                    id: f.processId,
                    _item: {
                      full_path_: e.appTag + '/' + f.processId,
                      label: f.processName,
                      value: f.processId,
                      id: f.processId,
                      parent_id_: e.appTag,
                      LEVEL: 2,
                    },
                  };
                })
              : undefined,
        };
      });
    processOptions.value = data.reduce((list: any[], item: any) => {
      list.push(item);
      if (item.children) list.push(...item.children);
      return list;
    }, []);
  }

  const searchVal = ref();
  async function getUserData(params = { pageNo: 1, keyword: '' }) {
    const { keyword, pageNo } = params;
    if (searchVal.value !== keyword) {
      searchVal.value = keyword;
      userOptions.value = [];
    }
    const res: any =
      (await getOrgUserPickerTenantManagementOrgUserPageList({ pageNo, pageSize: 20, keyword })) ||
      [];
    const data = (res.data || []).map((e: any) => {
      return {
        value: e.id,
        id: e.id,
        label: e.fullname,
      };
    });
    userOptions.value.push(...data);
    return res.pageNo * res.pageSize >= res.totalCount;
  }

  defineExpose({
    open,
  });
</script>
<style lang="less" scoped>
  :deep(.van-icon-cross) {
    font-size: 16px;
    color: #212528;
    right: 8px;
  }

  :deep(.van-cell) {
    padding: 6px 0;

    &::after {
      display: none;
    }
    &--clickable:active {
      background-color: transparent;
    }
    &-group--inset {
      margin: 0;
    }
  }
  .border-t {
    border-top: 1px solid #f0f0f0;
  }
</style>
