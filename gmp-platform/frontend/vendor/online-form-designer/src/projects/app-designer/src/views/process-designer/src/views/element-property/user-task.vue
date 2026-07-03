<template>
  <a-form-item :label="t('sys.process.taskMode')" :rules="[{ required: true }]">
    <a-radio-group v-model:value="formState.taskMode">
      <a-radio
        :style="radioStyle"
        v-for="item in TaskModeOptions"
        :key="item.value"
        :value="item.value"
        >{{ t(item.i18nKey) }}</a-radio
      >
    </a-radio-group>
  </a-form-item>

  <a-form-item name="juel" :rules="[{ required: formState.taskMode !== TaskMode.Sequential }]">
    <template #label>
      <div>
        {{ t('sys.process.terminationCondition') }}
        <a-tooltip placement="top">
          <template #title>
            <span>{{ t('sys.process.juelExprssion') }}</span>
          </template>
          <question-circle-outlined />
        </a-tooltip>
      </div>
    </template>
    <a-input
      v-model:value="formState.juel"
      :disabled="formState.taskMode === TaskMode.Competitive"
    />
  </a-form-item>

  <a-form-item :label="t('sys.process.userType')" :rules="[{ required: true }]">
    <a-radio-group v-model:value="formState.userType" @change="handleUserTypeChange">
      <a-radio
        :style="radioStyle"
        v-for="item in UserTypeOptions"
        :key="item.value"
        :value="item.value"
        >{{ t(item.i18nKey) }}</a-radio
      >
    </a-radio-group>
  </a-form-item>

  <a-form-item :label="t('sys.process.' + formState.userType)" :rules="[{ required: true }]">
    <a-button
      v-if="UserType.User === formState.userType"
      type="primary"
      :ghost="userTypeValueEmpty"
      block
      @click="handleUserConfig"
      >{{ userTypeValueEmpty ? t('sys.process.selectUser') : userTypeValueEcho }}</a-button
    >
    <a-button
      v-else-if="UserType.DeptManager === formState.userType"
      type="primary"
      :ghost="userTypeValueEmpty"
      block
      @click="handleDeptConfig"
      >{{ userTypeValueEmpty ? t('sys.process.selectDept') : userTypeValueEcho }}</a-button
    >

    <a-select
      v-else-if="[UserType.ModelUser, UserType.ModelUserSuperior,UserType.ModelDeptManager].includes(formState.userType!)"
      v-model:value="formState.userTypeValue"
    >
      <a-select-option v-for="f in modelFields" :key="f.key" :value="f.key"
        >{{ f.name }}[{{ f.key }}]</a-select-option
      >
    </a-select>

    <a-select
      v-else-if="UserType.UserScript === formState.userType"
      v-model:value="formState.userTypeValue"
    >
      <a-select-opt-group v-for="mc in userScripts" :key="mc.id" :label="mc.name">
        <a-select-option v-for="m in mc.children" :value="m.id" :key="m.id">{{
          m.name
        }}</a-select-option>
      </a-select-opt-group>
    </a-select>

    <a-select
      v-else-if="UserType.Role === formState.userType"
      v-model:value="formState.userTypeValue"
    >
      <a-select-option v-for="r in builtinRoles" :key="r.id" :value="r.id">{{
        r.name
      }}</a-select-option>
    </a-select>
  </a-form-item>

  <a-form-item v-if="isApprovalTask" :rules="[{ required: true }]">
    <template #label>
      <div>
        {{ t('sys.process.rollbackRule') }}
        <a-tooltip placement="top">
          <template #title>
            <div>{{ t('sys.process.rollbackRuleRuleStep') }}</div>
            <div>{{ t('sys.process.rollbackRuleRuleSkip') }}</div>
          </template>
          <question-circle-outlined />
        </a-tooltip>
      </div>
    </template>
    <a-radio-group v-model:value="(formState as BpmnNode.ApprovalTask).rollbackRule">
      <a-radio
        :style="radioStyle"
        v-for="item in RollbackRuleOptions"
        :key="item.value"
        :value="item.value"
        >{{ t(item.i18nKey) }}</a-radio
      >
    </a-radio-group>
  </a-form-item>

  <div class="-ml-16px -mr-16px">
    <bpmn-form-items :forms="(formState as any)" />
  </div>
</template>

<script lang="ts" setup>
  import { computed, watch, ref, onMounted, reactive } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { UserType, TaskMode, BpmnNode, BpmnElementEnum } from '../../types';
  import {
    JUEL_PRESET,
    TaskModeOptions,
    UserTypeOptions,
    RollbackRuleOptions,
  } from '../../constants';
  import { useBpmn } from '../../hooks/useBpmn';
  import { useModelFields } from '../../hooks/useModelFields';
  import type {
    FieldMetaDTO,
    CategoryCompleteResponse,
    RoleResponse,
  } from '/@/apis/gct-apaas/model';
  import { FIELD_TYPE } from '@/enums/appEnum';
  import { getCategoryListComplete } from '/@/apis/gct-apaas/CategoryController';
  import { ScriptTypeEnum } from '/@/layouts/tree-sider-page/enum';
  import { getRolePageList } from '/@/apis/gct-apaas/RoleController';
  import { useModalPicker } from '/@/components/UserPick';
  import BpmnFormItems from '../components/bpmn-form-items.vue';

  const { t } = useI18n();
  const { setProperties, processResponse } = useBpmn();
  const { getModelFields } = useModelFields();
  const { openPickerByUser, openPickerByDept, getUserByIds, getDeptOptions } = useModalPicker();

  const modelFields = ref<FieldMetaDTO[]>([]);
  const userScripts = ref<CategoryCompleteResponse[]>([]);
  const builtinRoles = ref<RoleResponse[]>([]);

  const radioStyle = reactive({
    display: 'flex',
    height: '30px',
    lineHeight: '30px',
  });

  // 用于回显的原始数据
  const userTypeValueRows = ref([]);

  const props = defineProps<{
    id: string;
    formState: BpmnNode.UserTask | BpmnNode.ApprovalTask;
  }>();

  const formState = computed({
    get() {
      return props.formState;
    },
    set(value) {
      console.log(value);
      Object.assign(props.formState, value);
    },
  });

  const isApprovalTask = computed(() => {
    return props.formState._type_ === BpmnElementEnum.ApprovalTask;
  });

  const userTypeValueEmpty = computed(() => {
    const value = props.formState.userTypeValue;
    return (
      ['', undefined].includes(value as any) ||
      (Array.isArray(value) && value.length === 0) ||
      userTypeValueEcho.value === ''
    );
  });

  const userTypeValueEcho = computed(() => {
    if (userTypeValueRows.value.length === 0) return '';
    if (formState.value.userType === UserType.User) {
      return userTypeValueRows.value.map((item) => item.fullname).join(',');
    } else if (formState.value.userType === UserType.DeptManager) {
      return userTypeValueRows.value.map((item) => item.name).join(',');
    } else {
      return '';
    }
  });

  watch(
    () => props.formState,
    (value) => {
      console.log(value);
      setProperties(props.id, value);
    },
    {
      deep: true,
    },
  );

  watch(
    () => props.formState.taskMode,
    (value) => {
      if (value === TaskMode.Competitive) {
        Object.assign(props.formState, {
          juel: JUEL_PRESET[0],
        });
      } else if (value === TaskMode.Together) {
        Object.assign(props.formState, {
          juel: JUEL_PRESET[1],
        });
      } else {
        Object.assign(props.formState, {
          juel: '',
        });
      }
    },
  );

  watch(
    () => props.formState.userType,
    async (value) => {
      if (
        [UserType.ModelUser, UserType.ModelUserSuperior, UserType.ModelDeptManager].includes(
          value as UserType,
        )
      ) {
        const fields: FieldMetaDTO[] = (await getModelFields(processResponse.value.tableMetaKey!))!;
        if (UserType.ModelDeptManager === value) {
          modelFields.value = fields.filter((item) =>
            [FIELD_TYPE.ORG_MULTI, FIELD_TYPE.ORG].includes(item.type as FIELD_TYPE),
          );
        } else {
          modelFields.value = fields.filter((item) =>
            [FIELD_TYPE.USER_MULTI, FIELD_TYPE.USER].includes(item.type as FIELD_TYPE),
          );
        }
      } else if (UserType.UserScript === value) {
        userScripts.value = (await getCategoryListComplete({ module: ScriptTypeEnum.DEFAULT }))!;
      } else if (UserType.Role === value) {
        builtinRoles.value = (await getRolePageList({
          enabled: 1,
          pageNo: 1,
          pageSize: 9999,
        }))!.data.filter((item) => item.type === 'BUILTIN');
      }
    },
    {
      immediate: true,
    },
  );

  onMounted(async () => {
    const value = props.formState.userType;
    if (UserType.User === value) {
      if (props.formState.userTypeValue) {
        userTypeValueRows.value = await getUserByIds({
          ids: (props.formState.userTypeValue as string[]).join(','),
        });
        // 在当前已经选择的用户和现有用户匹配不上时，删除已经选择的不存在用户
        if (userTypeValueRows.value.length > 0) {
          const arr = props.formState.userTypeValue as string[];
          // eslint-disable-next-line vue/no-mutating-props
          props.formState.userTypeValue = arr.filter((str) => {
            const i = userTypeValueRows.value.findIndex((item: any) => {
              if (item.id === str) {
                return true;
              }
              return false;
            });
            if (i === -1) {
              return false;
            }
            return true;
          });
        } else {
          // eslint-disable-next-line vue/no-mutating-props
          props.formState.userTypeValue = [];
        }
      }
    } else if (UserType.DeptManager === value) {
      if (props.formState.userTypeValue) {
        const options = await getDeptOptions();
        userTypeValueRows.value = options?.filter((item) =>
          (props.formState.userTypeValue as string[]).includes(item.id),
        );
      }
    }
  });

  const handleUserTypeChange = () => {
    formState.value.userTypeValue = undefined;
    userTypeValueRows.value = [];
  };

  const handleUserConfig = () => {
    openPickerByUser({
      userIds: formState.value.userTypeValue || [],
      multiple: true,
      callback: (value, rows) => {
        formState.value.userTypeValue = value;
        userTypeValueRows.value = rows as any;
      },
    });
  };

  const handleDeptConfig = () => {
    openPickerByDept({
      deptIds: (formState.value.userTypeValue || []) as any,
      multiple: false,
      callback: (value, rows) => {
        console.log(rows);
        formState.value.userTypeValue = value;
        userTypeValueRows.value = rows as any;
      },
    });
  };
</script>

<style lang="less" scoped></style>
