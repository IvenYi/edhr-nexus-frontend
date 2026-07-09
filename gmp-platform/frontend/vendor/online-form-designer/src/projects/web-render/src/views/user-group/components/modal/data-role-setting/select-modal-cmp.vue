<template>
  <a-select
    :open="false"
    @click="handleOpenModal"
    :value="showValue"
    @deselect="handleDeselect"
    maxTagCount="responsive"
    :maxTagTextLength="2"
    :options="optionsData"
    v-bind="selectAtrr"
  />
  <SelectUserModal
    ref="selectUserModalRef"
    :className="getClassName"
    :destroyOnClose="true"
    @ok="handleOk"
  />
</template>
<script setup lang="ts" name="select-modal-cmp">
  import { computed, ref, watch, toRaw, onMounted, h } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { SelectProps } from 'ant-design-vue';
  import { uuid2 } from '/@/utils/uuid';
  import { PrintTypeEnum } from '/@/layouts/tree-sider-page/enum';
  import LabelTmplModal from '/@page-designer/components/widgets/web/__components__/print-tmpl-modal.vue';
  import SelectUserModal from '/@page-designer/components/widgets/web/field/range-user/component/select-user-modal.vue';
  import { PickerUserDTO, RoleResponse, PickerOrgDTO } from '/@/apis/gct-platform/model';
  import { UserGroupResponse } from '/@/apis/gct-apaas/model';
  import { getRoleList } from '/@/apis/gct-apaas/RoleController';
  import { getUserGroupList } from '/@/apis/gct-apaas/UserGroupController';
  import { getDesignerCommonGetCanBeUsedOrg } from '/@/apis/gct-apaas/DesignerCommonController';
  import { getOrgUserPickerTenantManagementUserListByIds } from '/@/apis/gct-platform/OrgUserPickerController';
  import { getPrintDesignerInfo } from '/@/apis/gct-apaas/PrintDesignerController';

  export interface IPickerCompParams {
    modelKey?: string;
    fieldKey?: string;
    multiple: boolean;
  }

  export interface Props {
    supportModalType: string;
    pickerCompParams: IPickerCompParams;
    value: any;
  }

  const { t } = useI18n();
  const props = defineProps<Props>();
  const emits = defineEmits(['change']);

  const selectUserModalRef = ref();
  const getClassName = 'range-user-modal_' + uuid2(16, 16);
  const allRoles = ref<RoleResponse[]>([]);
  const allUserGroups = ref<UserGroupResponse[]>([]);
  const allDepts = ref<PickerOrgDTO[]>([]);
  const allUsers = ref<PickerUserDTO[]>([]);

  const labelOptions = ref<IObject[]>([]);
  const fieldObj = ref<IObject>({});

  const multiple = computed(() => props.pickerCompParams?.multiple);

  const selectAtrr = computed(() => {
    let attr: SelectProps = {
      // placeholder: ,
      mode: multiple.value ? 'multiple' : undefined,
      // allowClear: true,
      dropdownClassName: 'hidden',
    };
    return attr;
  });

  const showValue = computed(() => {
    if (props.value) {
      let value = props.value;
      const a = multiple.value
        ? Array.isArray(value)
          ? value
          : value?.split(',').filter((i) => i) || []
        : value;
      return props.supportModalType === 'range_user' ? a : value;
    }
    return undefined;
  });

  const handleDeselect = (key: string) => {
    if (props.supportModalType === 'range_user') {
      const raw = props.value;
      const cur: string[] = multiple.value
        ? Array.isArray(raw)
          ? [...raw]
          : String(raw ?? '')
              .split(',')
              .filter(Boolean)
        : raw != null && raw !== ''
          ? [String(raw)]
          : [];
      const next = cur.filter((k) => String(k) !== String(key));
      // 范围人员必多选
      emits('change', next.length ? next : '', 0);
      return;
    }
    if (props.supportModalType === 'label_template_ref') {
      if (multiple.value) {
        const raw = props.value;
        const cur: string[] = Array.isArray(raw)
          ? [...raw]
          : raw != null && raw !== ''
            ? String(raw)
                .split(',')
                .filter(Boolean)
            : [];
        const next = cur.filter((id) => String(id) !== String(key));
        emits('change', next, 0);
      } else {
        emits('change', '', 0);
      }
    }
  };

  // 下拉项数据
  const optionsData = computed(() => {
    if (props.supportModalType === 'range_user') {
      const roleOpt = allRoles.value.filter((e) => showValue.value?.includes(e.value));
      const userGroupOpt = allUserGroups.value.filter((e) => showValue.value?.includes(e.value));
      const deptOpt = allDepts.value.filter((e) => showValue.value?.includes(e.value));
      const userOpt = allUsers.value.filter((e) => showValue.value?.includes(e.value));
      return [...roleOpt, ...userGroupOpt, ...deptOpt, ...userOpt];
    } 
    if (props.supportModalType === 'label_template_ref') {
      const data = labelOptions.value.map((e) => {
        return {
          ...e,
          value: e.id,
          label: `${e.name}${e.version && e.printType !== 'btw' ? ' : ' + e.version : ''}`,
        };
      });
      return data;
    }
  });
  
  /**
   * 范围人员逻辑开始--------------------------------------
   */
  // 更新用户列表
  const updateUserOptions = async (userIds) => {
    if (!userIds?.length) return;
    const notExistUserIds = userIds
      ?.filter((e) => e.includes(`USER:`) && !allUsers.value.some((f) => f.value === e))
      ?.map((e) => e.replace(/USER:/, ''));
    notExistUserIds?.length && (await getAllUsers(notExistUserIds));
  };

  // 所有的角色
  const getAllRoles = async () => {
    allRoles.value = ((await getRoleList()) ?? []).map((e) => {
      return { ...e, value: `ROLE:${e.id}`, label: e.name, iconExtraProps: {} };
    });
  };

  // 已选择的用户
  const getAllUsers = async (ids) => {
    const res = (
      (await getOrgUserPickerTenantManagementUserListByIds({ ids: ids.join(',') })) ?? []
    ).map((e) => {
      return { ...e, value: `USER:${e.id}`, label: e.fullname! };
    });
    allUsers.value.push(...res);
  };

  // 所有的用户组
  const getAllUserGroups = async () => {
    allUserGroups.value = ((await getUserGroupList()) ?? []).map((e) => {
      return { ...e, value: `USER_GROUP:${e.id}`, label: e.name };
    });
  };

  // 所有的部门
  const getAllDepts = async () => {
    allDepts.value = ((await getDesignerCommonGetCanBeUsedOrg()) ?? []).map((e) => {
      return { ...e, value: `ORG:${e.id}`, label: e.name };
    });
  };

  /**
   * 标签模版逻辑开始--------------------------------------
   */
  const getIsBtwLabel = (label: any) => {
    if (!label?.printType) return false;
    return label.printType === 'btw';
  };

  /**
   * 供标签选择弹窗回填：单选返回一条记录，多选返回已选记录数组（先补全 labelOptions）
   */
  async function getLabelOptionValue(v: any = showValue.value) {
    await hydrateLabelOptionsFromValue(v);
    const ids = normalizeLabelTemplateIds(v);
    if (!ids.length) {
      return multiple.value ? [] : undefined;
    }
    const rows = ids
      .map((id) => labelOptions.value.find((e) => String(e.id) === String(id)))
      .filter(Boolean) as IObject[];
    const mapped = rows.map((data) => {
      const parent = labelOptions.value.find((e) => e.id === data?.key);
      const categoryId = parent?.categoryId || data.categoryId;
      const merged: IObject = { ...data, categoryId };
      return {
        ...merged,
        version: getIsBtwLabel(merged) ? '' : merged?.version,
      };
    });
    if (multiple.value) {
      return mapped.map((m) => toRaw(m));
    }
    return mapped[0] ? toRaw(mapped[0]) : undefined;
  }

  async function getTmplInfo(id) {
    const res: any = await getPrintDesignerInfo({
      id,
      moduleType: PrintTypeEnum.LABEL,
    });
    res && labelOptions.value.push({ ...res, id: res.baseId ? res.baseId + ':' + res.id : res.id });
    return res;
  }

  /** 回填值统一为 id 列表（与 handleOk / handleDeselect 一致） */
  function normalizeLabelTemplateIds(val: any): string[] {
    if (val == null || val === '') return [];
    if (multiple.value) {
      return Array.isArray(val)
        ? val.map(String).filter(Boolean)
        : String(val)
            .split(',')
            .filter(Boolean);
    }
    return [String(val)];
  }

  /** 已有选中项但本地无缓存时，拉取详情写入 labelOptions，供 options 展示 */
  async function hydrateLabelOptionsFromValue(sourceVal?: any) {
    const ids = normalizeLabelTemplateIds(sourceVal ?? showValue.value);
    if (!ids.length) return;
    await Promise.all(
      ids.map(async (fullId) => {
        if (labelOptions.value.some((e) => String(e.id) === String(fullId))) return;
        const apiId = String(fullId).includes(':')
          ? String(fullId).split(':').pop()!
          : String(fullId);
        await getTmplInfo(apiId || fullId);
      }),
    );
  }

  // 弹窗-保存
  const handleOk = async (data) => {
    const notExistUserIds = data
      ?.filter((e) => e.includes(`USER:`) && !allUsers.value.some((f) => f.value === e))
      ?.map((e) => e.replace(/USER:/, ''));
    notExistUserIds?.length && (await getAllUsers(notExistUserIds));
    // 范围人员必多选
    emits('change', data.length ? data : '', 0);
  };

  const handleOpenModal = async () => {
    if (props.supportModalType === 'range_user') {
      selectUserModalRef.value.open({ selectedValue: showValue.value, title: '' });
    } else if (props.supportModalType === 'label_template_ref') {
      const res: any = await gct.openUtil.modal(
        LabelTmplModal,
        {
          selected: await getLabelOptionValue(),
          moduleType: PrintTypeEnum.LABEL,
          isRdo: true,
          btwForceVisible: true,
          multiple: multiple.value,
        },
        {
          title: t('sys.pageDesigner.chooseTmplSth', { sth: '' }),
          width: 1100,
          height: 734,
          okText: t('sys.okText'),
          wrapClassName: 'vxe-table--ignore-clear',
        },
      );
      if (res.ok && res.params?.selected?.length) {
        const { selected } = res.params;
        // btw 标签的 version 只在模版转换保存数据时写死为 1，使用时不展示
        selected.forEach((o) => {
          if (getIsBtwLabel(o)) {
            o.id = `${o.baseId}:${o.id}`; // 强制带上 baseId
            o.version = ''; // 手动清空
          }
        });
        selected.forEach((o) => {
          if (!labelOptions.value.some((e) => e.id === o.id)) {
            labelOptions.value.push({ ...o });
          }
        });
        emits('change', multiple.value ? selected.map((e) => e.id) : selected[0].id, 0);
      }
    }
  };

  watch(
    () => showValue,
    async (val) => {
      if (props.supportModalType === 'range_user') {
        updateUserOptions(multiple.value ? val : [val]);
        return;
      }
      if (props.supportModalType === 'label_template_ref') {
        const ids = normalizeLabelTemplateIds(val);
        await hydrateLabelOptionsFromValue(val);
        const rows = ids?.map((id) => labelOptions.value.find((e) => e.id == id))?.filter(Boolean);
        if (!rows?.length) {
          fieldObj.value = {};
          return;
        }
        // 与弹窗/选项展示一致：btw 不在 fieldObj 里展示 version；多选时 fieldObj 取首条作为主信息
        const primary = rows[0];
        fieldObj.value = {
          ...primary,
          version: getIsBtwLabel(primary) ? '' : primary?.version,
        };
      }
    },
    {
      immediate: true,
      deep: true,
    },
  );

  onMounted(() => {
    if (props.supportModalType === 'range_user') {
      getAllRoles();
      getAllUserGroups();
      getAllDepts();
      if ((!multiple.value && showValue.value) || (multiple.value && showValue.value?.length)) {
        updateUserOptions(multiple.value ? showValue.value : [showValue.value]);
      }
    }  
    if (props.supportModalType === 'label_template_ref') {
      void hydrateLabelOptionsFromValue();
    }
  });
</script>
