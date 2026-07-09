<template>
  <a-select
    v-model:value="value"
    :placeholder="placeholder || t('sys.appDesigner.approval.approvalUserTip')"
    mode="multiple"
    allowClear
    :size="size"
    :open="false"
    dropdownClassName="gct-project-select-dropdown"
    :options="options"
    :disabled="bpmnReadonly"
    @change="(val) => emit('change', val?.length ? val.join(',') : '')"
    @click="openView()"
  >
    <template #tagRender="data">
      <taglabel
        :label="data.label"
        :closable="!bpmnReadonly"
        :tagWidgetStyle="{ tagStyleOpen: true }"
        :isDesign="false"
        :iconExtraProps="returnIconExtra(data.option)"
        @on-close="data.onClose"
      />
    </template>
  </a-select>
</template>

<script setup lang="ts" name="approval-user-select-config">
  import { ref, computed, onBeforeMount, watch, inject } from 'vue';

  import { openSelectUserModal } from '/@/components/SelectUserModal';
  import { taglabel } from '/@page-designer/components/widgets/web/__components__/formcomponent/index';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import { getRoleList } from '/@/apis/gct-apaas/RoleController';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  import { getUserGroupList } from '/@/apis/gct-apaas/UserGroupController';
  import { getDesignerCommonGetVisibleOrg } from '/@/apis/gct-apaas/DesignerCommonController';
  import { getOrgUserPickerTenantManagementUserListByIds } from '/@/apis/gct-platform/OrgUserPickerController';

  import { useAppInfoStore } from '/@/store/modules/app-info';
  import { SceneType } from '/@/components/SelectUserModal/controller';
  import { DYN_FORMAT_TYPE_ENUM } from '/@/components/SelectUserModal/utils';

  const { t } = useI18n();

  const bpmnReadonly = inject('bpmnReadonly', false);
  const bpmnMainModelKey = inject<string>('bpmnMainModelKey', '');

  const options = ref<any>([]);

  const props = withDefaults(
    defineProps<{
      modelValue?: string;
      placeholder?: string;
      size?: string;
      showTabs?: string[];
    }>(),
    {
      size: 'small',
    },
  );

  const emit = defineEmits(['update:modelValue', 'change']);

  const value = computed<any>({
    get() {
      let value = props.modelValue || undefined;

      return Array.isArray(value) ? value : value?.split(',').filter((i) => i) || [];
    },
    set(v) {
      emit('update:modelValue', v?.join(','));
    },
  });

  onBeforeMount(async () => {
    options.value = await getAllData();
  });

  const filterUserIds = (userIds) => {
    return userIds
      .filter((e) => e.includes(`USER:`) && !options.value.some((f) => f.value === e))
      .map((e) => e.replace(/USER:/, ''));
  };

  // 已选择的用户
  const getAllUsers = async (ids) => {
    const res = (
      (await getOrgUserPickerTenantManagementUserListByIds({ ids: ids.join(',') })) ?? []
    ).map((e) => {
      return { ...e, value: `USER:${e.id}`, label: e.fullname! };
    });
    options.value.push(...res);
  };

  const userIds = computed(() => {
    return filterUserIds(value.value);
  });

  watch(
    () => userIds.value,
    async () => {
      if (userIds.value.length !== 0) {
        await getAllUsers(userIds.value);
      }
    },
    {
      immediate: true,
      deep: true,
    },
  );

  /** 获取字段列表 */
  async function getModelFieldsData() {
    if (!bpmnMainModelKey) {
      return;
    }
    const res = await getFieldMetaList({
      modelKey: bpmnMainModelKey,
    });

    if (res) {
      return res
        .filter((item) => {
          return (
            item.type === FIELD_TYPE.USER ||
            item.type === FIELD_TYPE.ORG ||
            item.type === FIELD_TYPE.USER_MULTI ||
            item.type === FIELD_TYPE.ORG_MULTI
          );
        })
        .reduce((acc, item) => {
          if (!acc[item.type!]) {
            acc[item.type!] = [];
          }
          acc[item.type!].push(item);

          return acc;
        }, {});
    }
  }

  const getAllData = async () => {
    const [roles, userGroups, depts, fields] = await Promise.all([
      getRoleList(),
      getUserGroupList(),
      getDesignerCommonGetVisibleOrg(),
      getModelFieldsData(),
    ]);

    const mapField = (fieldType, typeEnum) =>
      (fields?.[fieldType] ?? []).map((e) => ({
        value: `${typeEnum}:${e.key}`,
        label: e.name,
      }));

    const allData = [
      ...(roles ?? []).map((e) => ({
        ...e,
        value: `ROLE:${e.id}`,
        label: e.name,
        iconExtraProps: {},
      })),
      ...(userGroups ?? []).map((e) => ({
        ...e,
        value: `USER_GROUP:${e.id}`,
        label: e.name,
      })),
      ...(depts ?? []).map((e) => ({
        ...e,
        value: `ORG:${e.id}`,
        label: e.name,
      })),

      ...(depts ?? []).map((e) => ({
        ...e,
        value: `${DYN_FORMAT_TYPE_ENUM.DYN_DEPT_PRINCIPAL}:${e.id}`,
        label: e.name,
      })),

      ...mapField(FIELD_TYPE.USER, DYN_FORMAT_TYPE_ENUM.DYN_MODEL_USERS),
      ...mapField(FIELD_TYPE.USER, DYN_FORMAT_TYPE_ENUM.DYN_MODEL_USER_MANAGER),
      ...mapField(FIELD_TYPE.USER_MULTI, DYN_FORMAT_TYPE_ENUM.DYN_MODEL_USERS),
      ...mapField(FIELD_TYPE.USER_MULTI, DYN_FORMAT_TYPE_ENUM.DYN_MODEL_USER_MANAGER),
      ...mapField(FIELD_TYPE.ORG, DYN_FORMAT_TYPE_ENUM.DYN_MODEL_DEPT_PRINCIPAL),
      ...mapField(FIELD_TYPE.ORG_MULTI, DYN_FORMAT_TYPE_ENUM.DYN_MODEL_DEPT_PRINCIPAL),

      {
        value: `${DYN_FORMAT_TYPE_ENUM.DYN_SUBMITTER_MANAGER}:current`,
        label: $t('sys.kit.edhr.requesterDirectManager'),
      },
      {
        value: `${DYN_FORMAT_TYPE_ENUM.DYN_SUBMITTER_DEPT_PRINCIPAL}:current`,
        label: $t('sys.kit.edhr.requesterDeptManager'),
      },
    ];

    return allData;
  };

  // 更新用户列表
  const updateUserOptions = async (userIds) => {
    const notExistUserIds = filterUserIds(userIds);
    notExistUserIds.length && (await getAllUsers(notExistUserIds));
  };
  const appInfoStore = useAppInfoStore();
  const isInEDHR = computed(() => appInfoStore.appInfo.suiteKey === 'eDHR');

  // 弹窗-打开
  const openView = () => {
    if (bpmnReadonly.value) {
      return;
    }

    const sceneType = isInEDHR.value ? SceneType.Edhr_Granted : SceneType.Paas;

    openSelectUserModal({
      title: t('sys.appDesigner.approval.approvalUserSelect'),
      values: value.value,
      modelKey: bpmnMainModelKey,
      sceneType,
      showTabs: props.showTabs,
      callback: async (ids) => {
        await updateUserOptions(ids);
        emit('update:modelValue', ids.length ? ids.join(',') : '');
        emit('change', ids.length ? ids.join(',') : '');
      },
    });
  };

  // tagLable中渲染的图标
  const returnIconExtra = (option) => {
    if (!option) return {};
    const { label, value } = option;
    let icon, iconColor;
    if (value.includes('ROLE:')) {
      icon = 'icon-jiaose1';
      iconColor = '#00B2F8';
    } else if (value.includes('USER_GROUP:')) {
      icon = 'icon-yonghuzu1';
      iconColor = '#00D627';
    } else if (value.includes('ORG:')) {
      icon = 'icon-bumen1';
      iconColor = '#FF6937';
    } else if (value.includes('USER:')) {
      icon = 'icon-renyuan2';
      iconColor = '#2C71FC';
    } else {
      icon = 'icon-dongtai';
      iconColor = '#B445F5';
    }
    return {
      [label]: { icon, iconColor, textColor: '' },
    };
  };
</script>

<style lang="less" scoped>
  :deep(.ant-select-selection-overflow-item) {
    margin: 0 3px 1px 0;
  }
</style>
