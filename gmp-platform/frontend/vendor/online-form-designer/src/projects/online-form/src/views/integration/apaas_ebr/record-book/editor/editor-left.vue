<template>
  <div class="editor-left-container">
    <div class="editor-left-container__container">
      <Scrollbar class="px-4px py-8px">
        <a-form layout="vertical" :model="formState" ref="formRef" class="px-12px! py-8px!">
          <a-form-item
            :label="t('sys.edhr.recordBook.recordForm')"
            name="tmpl_id_"
            :rules="[
              {
                required: true,
                message: t('sys.pleaseSelectSth', { sth: t('sys.edhr.recordBook.recordForm') }),
              },
            ]"
          >
            <VersionSelect
              :type="FormDesignEnum.ONLINE_FORM"
              :disabled="isDisabled('tmpl_id_')"
              :value="formState.tmpl_id_"
              @select="onFormVersionSelect"
              :query-params="queryParams"
              :enable-control="true"
              :placeholder="t('sys.chooseText')"
            />
          </a-form-item>
          <a-form-item
            :label="t('sys.no')"
            :rules="[
              {
                required: true,
                message: t('sys.pleaseInputSth', { sth: t('sys.no') }),
              },
            ]"
            name="code_"
          >
            <a-input
              v-model:value="formState.code_"
              :placeholder="t('sys.inputText')"
              show-count
              :maxlength="32"
              :disabled="isDisabled('code_')"
            />
          </a-form-item>
          <a-form-item
            :label="t('sys.pageDesigner.title')"
            :rules="[
              {
                required: true,
                message: t('sys.pleaseInputSth', { sth: t('sys.pageDesigner.title') }),
              },
            ]"
            name="name_"
          >
            <a-input
              v-model:value="formState.name_"
              :placeholder="t('sys.inputText')"
              show-count
              :maxlength="32"
              :disabled="isDisabled('name_')"
            />
          </a-form-item>
          <a-form-item
            :label="t('sys.Dept')"
            :rules="[
              {
                required: true,
                message: t('sys.pleaseSelectSth', { sth: t('sys.Dept') }),
              },
            ]"
            name="org_id_"
          >
            <ApprovalUserSelectConfig
              v-model:modelValue="formState.org_id_"
              :showTabs="['Org']"
              :placeholder="t('sys.chooseText')"
              size="middle"
              :disabled="isDisabled('org_id_')"
            />
          </a-form-item>
          <a-form-item :label="t('sys.pageDesigner.label')" name="label_ids_">
            <a-select
              v-model:value="labelIds"
              allow-clear
              mode="multiple"
              class="record-book-label-select"
              :placeholder="t('sys.chooseText')"
              :disabled="isDisabled('label_ids_')"
            >
              <a-select-option v-for="item in labelOptions" :key="item.key">
                <label-tag :data="item" />
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item
            :label="t('sys.edhr.recordBook.fillStartTime')"
            :rules="[
              {
                validator: validatorStartTime,
              },
            ]"
            name="start_time_"
          >
            <a-date-picker
              class="w-full"
              v-model:value="formState.start_time_"
              :showTime="{ format: 'HH:mm' }"
              :format="pickerFormat"
              :value-format="valueFormat"
              :placeholder="t('sys.chooseText')"
              :disabledDate="disabledDate"
              :disabledTime="disabledTime"
              :show-now="false"
              @change="handleStartChange"
              :disabled="isDisabled('start_time_')"
            />
          </a-form-item>
          <a-form-item
            :label="t('sys.edhr.recordBook.fillEndTime')"
            :rules="[
              {
                validator: validatorEndTime,
              },
            ]"
            name="end_time_"
          >
            <a-date-picker
              class="w-full"
              v-model:value="formState.end_time_"
              :showTime="{ format: 'HH:mm' }"
              :format="pickerFormat"
              :value-format="valueFormat"
              :placeholder="t('sys.chooseText')"
              :disabledDate="disabledDate"
              :disabledTime="disabledTime"
              :show-now="false"
              @change="handleEndChange"
              :disabled="isDisabled('end_time_')"
            />
          </a-form-item>
          <a-form-item
            :label="t('sys.edhr.recordBook.fillUser')"
            :rules="[
              {
                required: true,
                message: t('sys.pleaseSelectSth', { sth: t('sys.edhr.recordBook.fillUser') }),
              },
            ]"
            name="filler_"
          >
            <ApprovalUserSelectConfig
              v-model:modelValue="formState.filler_"
              size="middle"
              :placeholder="$t('sys.chooseText')"
              :showTabs="['User', 'Org', 'Role', 'UserGroup']"
              :disabled="isDisabled('filler_')"
            />
          </a-form-item>
          <a-form-item
            :label="t('sys.edhr.recordBook.viewUser')"
            :rules="[
              {
                required: true,
                message: t('sys.pleaseSelectSth', { sth: t('sys.edhr.recordBook.viewUser') }),
              },
            ]"
            name="viewer_"
          >
            <ApprovalUserSelectConfig
              v-model:modelValue="formState.viewer_"
              size="middle"
              :placeholder="$t('sys.chooseText')"
              :showTabs="['User', 'Org', 'Role', 'UserGroup']"
              :disabled="isDisabled('viewer_')"
            />
          </a-form-item>
        </a-form>
      </Scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref, onBeforeMount, computed, toRaw } from 'vue';
  import { cloneDeep } from 'lodash-es';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Scrollbar } from '/@/components/Scrollbar';
  import { VersionSelect } from '/@online-form/views/web-render/components';
  import { FormDesignEnum } from '/@/layouts/tree-sider-page/enum';
  import { postBizServiceByModelKeyByBsKey } from '/@/apis/gct-apaas/BsServiceController';
  import ApprovalUserSelectConfig from '/@app-designer/views/online-form/components/bpmn-setting/comps/approval-user-select-config.vue';
  import LabelTag from './common/label-tag.vue';
  import { FormTypeEnum } from '@gct/nocode-base';
  import { useUserStore } from '/@/store/modules/user';

  import dayjs from 'dayjs';

  const { t } = useI18n();

  const userStore = useUserStore();

  interface IFormState {
    /** 记录单号 */
    tmpl_id_: string | undefined;
    /** 编号 */
    code_: string | undefined;
    /** 标题 */
    name_: string | undefined;
    /** 所属部门 */
    org_id_: string | undefined;
    /** 标签 */
    label_ids_: string | undefined;
    /** 填报开始时间 */
    start_time_: string | undefined;
    /** 填报截止时间 */
    end_time_: string | undefined;
    /** 填报用户 */
    filler_: string | undefined;
    /** 查看用户 */
    viewer_: string | undefined;
  }

  const queryParams = {
    formType: [FormTypeEnum.BASE, FormTypeEnum.PROCESS].join(','),
  };

  const pickerFormat = 'YYYY-MM-DD HH:mm';

  const valueFormat = 'YYYY-MM-DD HH:mm:ss';

  const ORG_PREFIX = 'ORG:';

  const props = defineProps<{
    form?: IFormState;
    isReadonly: boolean;
    editInReadOnly: string[];
  }>();

  const formState = reactive<IFormState>({
    tmpl_id_: undefined,
    code_: undefined,
    name_: undefined,
    org_id_: undefined,
    label_ids_: undefined,
    start_time_: undefined,
    end_time_: undefined,
    filler_: undefined,
    viewer_: undefined,
  });

  const formRef = ref();
  const labelOptions = ref([]);

  onBeforeMount(() => {
    if (props.form) {
      Object.assign(formState, props.form);
    }
    formState.org_id_ =
      getCmpOrgId(props?.form?.org_id_, false) ||
      getCmpOrgId(userStore.getTenantUserInfo?.masterOrgId, false);
    getRecordBookLabelList();
  });

  const labelIds = computed<any>({
    get() {
      const value = formState.label_ids_ || undefined;
      return Array.isArray(value) ? value : value?.split(',').filter(Boolean) || [];
    },
    set(v) {
      formState.label_ids_ = v?.join(',') || '';
    },
  });

  function isDisabled(key) {
    if (!key) return true;
    return props.isReadonly || !props.editInReadOnly?.includes(key);
  }

  /**
   * 根据 isSplit 决定给 id 添加或去除 ORG: 前缀
   * @param {string|null|undefined} id
   * @param {boolean} isSplit  true：去除前缀；false：添加前缀
   * @returns {string|null}
   */
  function getCmpOrgId(id: string | null | undefined, isSplit: boolean): string | null {
    if (!id || typeof id !== 'string') {
      return null;
    }

    const idArray = id.split(',').filter((item) => item.trim().length > 0);

    if (idArray.length === 0) {
      return null;
    }

    let resultArray: string[];

    if (isSplit) {
      // 去除前缀：对每个ID检查并移除ORG_PREFIX
      resultArray = idArray.map((singleId) =>
        singleId.startsWith(ORG_PREFIX) ? singleId.slice(ORG_PREFIX.length) : singleId,
      );
    } else {
      // 添加前缀：对每个没有前缀的ID添加ORG_PREFIX
      resultArray = idArray.map((singleId) =>
        singleId.startsWith(ORG_PREFIX) ? singleId : `${ORG_PREFIX}${singleId}`,
      );
    }

    return resultArray.join(',');
  }
  const getRecordBookLabelList = async () => {
    const res = await postBizServiceByModelKeyByBsKey(
      {
        modelKey: 'em_notebook_label',
        bsKey: 'listAll',
      },
      {},
    );

    console.log('res', res);

    labelOptions.value = (res?.data || []).map((e) => {
      return {
        key: e.id_,
        value: e.id_,
        label: e.name_,
        labelStyle: e.background_style_,
        labelColor: e.background_color_,
        valueColor: e.name_color_,
      };
    });
  };

  const onFormVersionSelect = (v) => {
    const refId = v.baseId ? `${v.baseId}:${v.id}` : v.id;
    formState.tmpl_id_ = refId;
  };

  const handleStartChange = (val) => {
    if (val) {
      const rounded = dayjs(val).second(0);
      formState.start_time_ = rounded.format(valueFormat);
    }
    formRef.value?.validateFields(['end_time_']);
  };

  const handleEndChange = (val) => {
    if (val) {
      const rounded = dayjs(val).second(0);
      formState.end_time_ = rounded.format(valueFormat);
    }
    formRef.value?.validateFields(['start_time_']);
  };

  const disabledDate = (current) => {
    return current && current.isBefore(dayjs().startOf('day'), 'day');
  };

  const disabledTime = (selectedDate) => {
    const now = dayjs();
    // 只有选中的是今天时，才禁用早于当前时间的小时/分钟
    const hour = now.hour();
    const minute = now.minute();

    // selectedDate 可能为空（还没选日期），这里只不做限制
    if (!selectedDate) {
      return {
        disabledHours: () => Array.from({ length: 24 }, (_, i) => i),
        disabledMinutes: () => Array.from({ length: 60 }, (_, i) => i),
        disabledSeconds: () => [],
      };
    }

    const picked = dayjs(selectedDate);

    // 如果选中的不是今天，则不限制时间
    if (!picked.isSame(now, 'day')) {
      return {
        disabledHours: () => [],
        disabledMinutes: () => [],
        disabledSeconds: () => [],
      };
    }

    return {
      disabledHours: () => Array.from({ length: 24 }, (_, i) => i).filter((i) => i < hour),
      disabledMinutes: (selectedHour) => {
        if (selectedHour === hour) {
          return Array.from({ length: 60 }, (_, i) => i).filter((i) => i < minute);
        }
        return [];
      },
      disabledSeconds: () => [],
    };
  };

  const validatorStartTime = (_, value) => {
    if (
      value &&
      formState.end_time_ &&
      dayjs(value).isAfter(dayjs(formState.end_time_), 'minute')
    ) {
      return Promise.reject(new Error($t('sys.onlineForm.startTimeCantNotAfterEndTime')));
    }
    return Promise.resolve();
  };

  const validatorEndTime = (_, value) => {
    if (
      value &&
      formState.start_time_ &&
      dayjs(value).isBefore(dayjs(formState.start_time_), 'minute')
    ) {
      return Promise.reject(new Error($t('sys.onlineForm.startTimeCantNotAfterEndTime')));
    }
    return Promise.resolve();
  };

  async function validate(nameList?: string[]) {
    try {
      await formRef.value?.validateFields(nameList);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  function getValue() {
    return cloneDeep(formState);
  }

  defineExpose({
    getValue,
    getCmpOrgId,
    validate,
  });
</script>

<style scoped lang="less">
  .editor-left-container {
    width: 299px;
    height: 100%;
    background-color: #fff;
    border-right: 1px solid #e8ecf0;
    position: relative;

    .ant-form-item {
      margin-bottom: 12px;
      :deep(.ant-form-item-label) {
        label {
          color: #252525;
          font-size: 12px;
        }
      }

      &:last-child {
        margin-bottom: 0;
      }
    }

    &__container {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    &__operating-console {
      flex: 0 0 auto;
    }

    .ant-select.record-book-label-select {
      :deep(.ant-select-selection-item) {
        height: 28px;
        padding: 0 4px;
        line-height: 24px;
        background: #f9f9f9;
      }
    }
  }
</style>
