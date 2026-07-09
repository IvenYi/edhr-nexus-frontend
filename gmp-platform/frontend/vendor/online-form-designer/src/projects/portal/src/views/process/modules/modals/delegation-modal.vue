<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="t('sys.process.delegationSetting')"
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form ref="formRef" :model="formState" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
      <a-form-item
        :label="t('sys.process.delegationTo')"
        name="delegateUserId"
        :rules="[
          {
            required: true,
            message: t('sys.pleaseSelectSth', { sth: t('sys.process.delegationTo') }),
          },
        ]"
      >
        <!-- <a-tag v-if="formState.delegateUserId" closable @close.prevent="handleDelete">{{
          formState.delegateUserName
        }}</a-tag>
        <a-button v-else size="small" type="primary" ghost @click="handleAdd">
          <plus-outlined />{{ t('sys.process.selectDelegationTo') }}</a-button
        > -->
        <a-select
          v-model:value="delegateUser"
          :options="userOptions"
          mode="tags"
          :placeholder="t('sys.chooseText')"
          style="width: 100%"
          :open="false"
          @click.stop="handleAdd"
        />
      </a-form-item>
      <a-form-item
        :label="t('sys.process.delegationProcess')"
        name="processKeys"
        :rules="[
          {
            required: true,
            validator: validateProcessKeys,
            trigger: 'change',
          },
        ]"
      >
        <div class="h-32px flex items-center">
          <a-form-item-rest>
            <a-radio-group v-model:value="processRange">
              <a-radio :value="ProcessRangeEnum.All">{{ t('sys.all') }}</a-radio>
              <a-radio :value="ProcessRangeEnum.Part">{{ t('sys.part') }}</a-radio>
            </a-radio-group>
          </a-form-item-rest>
        </div>
        <div class="mt-4px" v-if="processRange === ProcessRangeEnum.Part">
          <a-select
            mode="multiple"
            v-model:value="formState.processKeys"
            :maxTagCount="5"
            :maxTagTextLength="6"
            style="width: 100%"
          >
            <a-select-opt-group v-for="a in appProcess" :key="a.appTag" :label="a.appName">
              <a-select-option
                v-for="p in a.processList"
                :value="p.processKey"
                :key="p.processKey"
                >{{ p.processName }}</a-select-option
              >
            </a-select-opt-group>
          </a-select>
        </div>
      </a-form-item>
      <a-form-item
        :label="t('sys.process.delegationTime')"
        name="startAt"
        :rules="[
          { required: true },
          {
            validator: validateStartEnd,
            trigger: 'change',
          },
        ]"
      >
        <a-range-picker
          class="w-360px"
          v-model:value="timeRange"
          format="YYYY-MM-DD HH:mm"
          valueFormat="YYYY-MM-DD HH:mm"
          :placeholder="[t('sys.startTime'), t('sys.endTime')]"
          :disabled-date="disabledDate"
          show-time
          style="width: 100%"
        />
      </a-form-item>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts">
  import dayjs, { Dayjs } from 'dayjs';
  import { reactive, ref, computed } from 'vue';
  import { FormInstance, message } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { TaskDelegateRequest, AppProcess } from '/@/apis/gct-platform/model';
  import {
    postTaskDelegate,
    putTaskDelegateById,
  } from '/@/apis/gct-platform/TaskDelegateController';
  import type { Rule } from 'ant-design-vue/es/form';
  import { useModalPicker } from '/@/components/UserPick';

  enum ProcessRangeEnum {
    All = 'All',
    Part = 'Part',
  }

  defineProps<{ appProcess: AppProcess[] }>();
  const emit = defineEmits(['ok']);

  const { openPickerByUser } = useModalPicker();
  const { t } = useI18n();
  const [registerInner, { closeModal, changeOkLoading }] = useModalInner((data) => {
    if (!data) return;

    let processKeys: string[] | undefined = undefined;
    if (data?.appProcessList && data?.appProcessList.length > 0) {
      // 部分勾选逻辑
      processKeys = [];
      data.appProcessList.forEach((a) => {
        a.processList!.forEach((p) => {
          (processKeys as string[]).push(`${a.appTag}.${p.processKey}`);
        });
      });
    }

    Object.assign(formState, {
      ...data,
      processKeys,
    });
  });

  const formRef = ref<FormInstance>();
  interface IRequest extends TaskDelegateRequest {
    id?: string;
    processKeys?: string[];
    delegateUserName?: string;
  }
  const formState: IRequest = reactive({
    id: undefined,
    delegateUserId: '',
    delegateUserName: '',
    startAt: '',
    endAt: '',
    processKeys: undefined,
  });

  const timeRange = computed({
    get() {
      return [formState.startAt, formState.endAt];
    },
    set(value) {
      formState.startAt = value ? value[0] : undefined;
      formState.endAt = value ? value[1] : undefined;
    },
  });

  const processRange = computed({
    get() {
      return [undefined, null].includes(formState.processKeys as any)
        ? ProcessRangeEnum.All
        : ProcessRangeEnum.Part;
    },
    set(value) {
      formState.processKeys = value === ProcessRangeEnum.All ? undefined : [];
    },
  });

  const validateProcessKeys = async (_rule: Rule, value) => {
    if (Array.isArray(value) && value.length === 0) {
      return Promise.reject(
        t('sys.pleaseSelectSth', {
          sth: t('sys.process.delegationProcess'),
        }),
      );
    } else {
      return Promise.resolve();
    }
  };

  const validateStartEnd = async (_rule: Rule) => {
    if (
      formState.endAt! <= dayjs().format('YYYY-MM-DD HH:mm') &&
      (formState.startAt || formState.endAt)
    ) {
      return Promise.reject(t('sys.process.delegationEndTimeEalierCurrent'));
    } else {
      return Promise.resolve();
    }
  };

  const disabledDate = (current: Dayjs) => {
    return current && current < dayjs().startOf('day');
  };

  const delegateUser = computed({
    get() {
      return formState.delegateUserId ? [formState.delegateUserId] : [];
    },
    set(value) {
      formState.delegateUserId = Array.isArray(value) ? (value.length ? value[0] : '') : value;
    },
  });

  const handleAdd = () => {
    openPickerByUser({
      multiple: false,
      userIds: formState.delegateUserId ? [formState.delegateUserId] : [],
      callback: async (value, rows) => {
        // console.log(value);
        // console.log(rows);
        if (value[0]) {
          formState.delegateUserId = value[0];
          formState.delegateUserName = rows[0].fullname;
          formRef.value?.validate(['delegateUserId']);
        }
      },
    });
  };

  const userOptions = computed(() => {
    return formState.delegateUserId
      ? [
          {
            value: formState.delegateUserId,
            label: formState.delegateUserName,
          },
        ]
      : [];
  });

  const handleDelete = () => {
    formState.delegateUserId = '';
    formState.delegateUserName = '';
    formRef.value?.validate(['delegateUserId']);
  };

  const handleClose = () => {
    formRef.value?.resetFields();
    formState.endAt = '';
  };

  const handleOk = async () => {
    changeOkLoading(true);
    try {
      await formRef.value?.validate();
      const data: TaskDelegateRequest = {
        delegateUserId: formState.delegateUserId,
        startAt: dayjs(formState.startAt).format('YYYY-MM-DD HH:mm:ss'),
        endAt: dayjs(formState.endAt).format('YYYY-MM-DD HH:mm:ss'),
      };
      if (Array.isArray(formState.processKeys)) {
        // processKey分组
        const appProcessList: TaskDelegateRequest['appProcessList'] = [];
        formState.processKeys.forEach((key) => {
          const [appTag, processKey] = key.split('.');
          const app = appProcessList.find((a) => a.appTag === appTag);
          if (app) {
            app.processList?.push({ processKey });
          } else {
            appProcessList.push({
              appTag,
              processList: [{ processKey }],
            });
          }
        });
        data.appProcessList = appProcessList;
      }
      if (formState.id) {
        await putTaskDelegateById({ id: formState.id }, data);
      } else {
        await postTaskDelegate(data);
      }
      emit('ok', formState.id ? false : true);
      message.success(t('sys.operationSuccess'));
      closeModal();
    } catch (err) {
      console.warn(err);
    } finally {
      changeOkLoading(false);
    }
  };
</script>

<style lang="less">
  .ant-tag {
    padding: 0 10px;
    line-height: 22px;
  }
</style>
