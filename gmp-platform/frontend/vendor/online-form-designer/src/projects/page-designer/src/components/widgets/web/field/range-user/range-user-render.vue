<template>
  <div class="w100%" :class="[getClassName]">
    <div v-for="(e, i) in tagValue" :key="i" class="inline-block">
      <FieldReadonly
        :label="e.label"
        :type="fieldType"
        :tagWidgetStyle="widget.style"
        :iconExtraProps="returnIconExtra(e)"
        :isDesign="false"
        class="mr4px mb1px inline-block"
      />
      <span v-if="i < tagValue.length - 1 && !widget.style.tagStyleOpen" style="margin-left: -2px"
        >,</span
      >
    </div>
    <a-select
      v-if="!readonly"
      v-model:value="value"
      style="width: 100%"
      v-bind="selectAtrr"
      :options="optionsData"
      :disabled="disabled"
      :open="false"
      maxTagCount="responsive"
      :maxTagTextLength="12"
      dropdownClassName="gct-project-select-dropdown"
      @click="!disabled && openView()"
      @change="handleSelectChange"
    >
      <template #tagRender="data">
        <FieldReadonly
          :label="data.label"
          :type="fieldType"
          :title="data.option?.label.length > 12 ? data.option?.label : ''"
          :closable="true"
          :avatar="data.option?.avatar"
          :tagWidgetStyle="{ ...widget.style, tagStyleOpen: true }"
          :isDesign="false"
          :iconExtraProps="returnIconExtra(data.option)"
          @on-close="data.onClose"
        />
      </template>
    </a-select>
    <SelectUserModal
      ref="selectUserModalRef"
      :className="getClassName"
      :destroyOnClose="true"
      @ok="handleOk"
    />
  </div>
</template>
<script setup lang="ts" name="gct-range-user">
  import { ref, computed, toRefs, reactive, watch, onMounted, nextTick, toRaw } from 'vue';
  import { RangeUser } from '/@page-designer/types/web';
  import type { SelectProps } from 'ant-design-vue';
  import SelectUserModal from './component/select-user-modal.vue';
  import { getRoleList } from '/@/apis/gct-apaas/RoleController';
  import { getUserGroupList } from '/@/apis/gct-apaas/UserGroupController';
  import { getDesignerCommonGetCanBeUsedOrg } from '/@/apis/gct-apaas/DesignerCommonController';
  import { RoleResponse, PickerOrgDTO, PickerUserDTO } from '@mobile/apis/gct-platform/model';
  import { UserGroupResponse } from '@mobile/apis/gct-apaas/model';
  import { getOrgUserPickerTenantManagementUserListByIds } from '/@/apis/gct-platform/OrgUserPickerController';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { Form } from 'ant-design-vue';
  import { uuid2 } from '/@/utils/uuid';
  import FieldReadonly from '../../__components__/formcomponent/field-readonly.vue';

  const emit = defineEmits(['update:modelValue', 'saveTableRow']);
  const formItemContext = Form.useInjectFormItemContext();
  const props = defineProps<{
    modelValue?: string;
    widget: RangeUser;
    formData: Object;
    getPopupContainer?: (triggerNode) => HTMLElement;
  }>();

  const Event = getPageEvent();
  const selectUserModalRef = ref();
  const { formData } = toRefs(props);
  const { placeholder, fieldType, multiple, label, fieldName, field } = reactive(
    props.widget.props,
  );

  const { readonly, disabled } = toRefs(props.widget.props);
  const allRoles = ref<RoleResponse[]>([]);
  const allUserGroups = ref<UserGroupResponse[]>([]);
  const allDepts = ref<PickerOrgDTO[]>([]);
  const allUsers = ref<PickerUserDTO[]>([]);
  const getClassName = 'range-user-render-field_' + uuid2(16, 16);

  const value = computed<any>({
    // 目前只有多选
    get() {
      let value = props.modelValue || undefined;
      const a = multiple
        ? Array.isArray(value)
          ? value
          : value?.split(',').filter((i) => i) || []
        : value;
      return a;
    },
    set(v) {
      if (multiple) {
        emit('update:modelValue', v?.join(','));
      } else {
        emit('update:modelValue', v || '');
      }
    },
  });

  watch(value, (val) => {
    updateUserOptions(multiple ? val : [val]);
    // 值发生变化
    // formItemContext.onFieldChange();
    // Event.runEventByName('onChange', props.widget.events, val, optionsData.value, formData.value);
  });

  const tagValue = computed(() => {
    return readonly?.value ? optionsData.value : [];
  });

  // 下拉项数据
  const optionsData = computed(() => {
    const roleOpt = allRoles.value.filter((e) => value.value.includes(e.value));
    const userGroupOpt = allUserGroups.value.filter((e) => value.value.includes(e.value));
    const deptOpt = allDepts.value.filter((e) => value.value.includes(e.value));
    return [...roleOpt, ...userGroupOpt, ...deptOpt, ...allUsers.value];
  });

  const selectAtrr = computed(() => {
    let attr: SelectProps = {
      placeholder: placeholder,
      mode: 'multiple',
      allowClear: true,
      dropdownClassName: 'hidden',
    };
    return attr;
  });

  onMounted(() => {
    getAllRoles();
    getAllUserGroups();
    getAllDepts();
    if ((!multiple && value.value) || (multiple && value.value.length)) {
      updateUserOptions(multiple ? value.value : [value.value]);
    }
  });

  // tagLable中渲染的图标
  const returnIconExtra = (option) => {
    if (!option) return {};
    const { label, value } = option;
    let icon, iconColor;
    if (value.includes('ROLE:')) {
      icon = 'gct-iconfont icon-jiaose_xuanrenzujian';
    } else if (value.includes('USER_GROUP:')) {
      icon = 'gct-iconfont icon-yonghuzu_xuanrenzujian';
    } else if (value.includes('ORG:')) {
      icon = 'gct-iconfont icon-bumen_xuanrenzujian';
    }
    // else if (value.includes('USER:')) {
    //   icon = 'icon-renyuan1';
    //   iconColor = '#5822B4';
    // }
    return {
      [label.length < 12 ? label : label.slice(0, 12) + '...']: { icon, iconColor, textColor: '' },
    };
  };

  // 更新用户列表
  const updateUserOptions = async (userIds) => {
    const notExistUserIds = userIds
      .filter((e) => e.includes(`USER:`) && !allUsers.value.some((f) => f.value === e))
      .map((e) => e.replace(/USER:/, ''));
    notExistUserIds.length && (await getAllUsers(notExistUserIds));
  };

  // 弹窗-打开
  const openView = () => {
    selectUserModalRef.value.open({ selectedValue: value.value, title: label || fieldName });
  };

  // 弹窗-保存
  const handleOk = async (data) => {
    const notExistUserIds = data
      .filter((e) => e.includes(`USER:`) && !allUsers.value.some((f) => f.value === e))
      .map((e) => e.replace(/USER:/, ''));
    notExistUserIds.length && (await getAllUsers(notExistUserIds));
    emit('update:modelValue', data.length ? data.join(',') : '');
    formItemContext.onFieldChange();
    changeSelect(data);
  };

  // 所有的角色
  const getAllRoles = async () => {
    allRoles.value = ((await getRoleList()) ?? []).map((e) => {
      return { ...e, value: `ROLE:${e.id}`, label: e.name, iconExtraProps: {} };
    });
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

  // 已选择的用户
  const getAllUsers = async (ids) => {
    const res = (
      (await getOrgUserPickerTenantManagementUserListByIds({ ids: ids.join(',') })) ?? []
    ).map((e) => {
      return { ...e, value: `USER:${e.id}`, label: e.fullname! };
    });
    allUsers.value.push(...res);
  };

  // 取消选中
  const handleSelectChange = (v) => {
    if (!v || !v.length) {
      Event.runEventByName('afterClear', props.widget.events, value.value, value, formData.value);
    }
  };

  /**选择新的人员 */
  async function changeSelect(v) {
    const data = await changeValue(v);
    Event.runEventByName('onChange', props.widget.events, value.value, data, formData.value);
    /**列字段时候触发保存 */
    emit('saveTableRow');
  }

  /**值发生变化 */
  async function changeValue(v) {
    await nextTick();
    let data = optionsData.value.filter((i) => v.includes(i.value));
    !!formData.value._DICT || (formData.value._DICT = {});
    if (data) {
      /**填充翻译后的值 */
      formData.value._DICT[field] = {
        [value.value]: data.map((i) => i.label),
      };
    }
    return data;
  }
</script>
<style lang="less" scoped>
  :deep(.ant-select-selection-overflow-item) {
    margin: 0 3px 1px 0;
  }

  :deep(.gct-iconfont) {
    opacity: 0.7;
  }
</style>
