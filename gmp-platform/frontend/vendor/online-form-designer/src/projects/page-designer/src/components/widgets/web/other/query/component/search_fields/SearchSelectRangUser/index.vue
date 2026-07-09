<template>
  <div class="w100% ks-row-middle" :class="[getClassName]">
    <a-input v-if="!!useMore" disabled :value="t(`sys.model.${useMore}`)" />
    <div v-else :class="['search-select-box', moreOptions?.length ? 'use-more' : '']">
      <div v-for="(e, i) in tagValue" :key="i" class="inline-block">
        <taglabel
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
        :open="false"
        maxTagCount="gct-responsive"
        :maxTagTextLength="12"
        dropdownClassName="gct-project-select-dropdown"
        :disabled="disabled || !!useMore"
        @click="openView()"
        @change="handleSelectChange"
      >
        <template #tagRender="data">
          <taglabel
            :label="data.label"
            :type="fieldType"
            :title="data.option?.label"
            :closable="true"
            :avatar="data.option?.avatar"
            :tagWidgetStyle="{ ...widget.style, tagStyleOpen: true }"
            :isDesign="false"
            :iconExtraProps="returnIconExtra(data.option)"
            @on-close="data.onClose"
          />
        </template>
      </a-select>

      <template v-if="readonly && !tagValue.length">
        {{ emptyDisplayValue }}
      </template>

      <SelectUserModal
        ref="selectUserModalRef"
        :className="getClassName"
        :ignoreCase="ignoreCase"
        :destroyOnClose="true"
        @ok="handleOk"
      />
    </div>
    <moreOption
      :disabled="disabled"
      @clear="$emit('update:modelValue', null)"
      v-model:useMore="useMore"
      v-model:ope="ope"
      :moreOptions="moreOptions"
      :label="label || fieldName"
      @change="emit('tableSearch')"
    />
  </div>
</template>
<script setup lang="ts" name="gct-range-user">
  import { ref, computed, toRefs, reactive, watch, onMounted, nextTick, toRaw } from 'vue';
  import { taglabel } from '/@page-designer/components/widgets/web/__components__/formcomponent/index';
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
  import moreOption from '../../more_option.vue';
  import { useGlobalSetting } from '/@/hooks/platform/globalSetting';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();

  const emit = defineEmits(['update:modelValue', 'tableSearch']);
  const formItemContext = Form.useInjectFormItemContext();
  const props = defineProps<{
    modelValue?: string;
    widget: SearchTmplTreeSelect;
    formData: object;
  }>();

  const { displayValue: emptyDisplayValue } = useGlobalSetting();

  const Event = getPageEvent();
  const selectUserModalRef = ref();
  const multiple = true;
  const { placeholder, fieldType, disabled, label, moreOptions, ignoreOptions, fieldName, field } =
    reactive(props.widget.props);

  const { readonly, ope, useMore } = toRefs(props.widget.props);
  const allRoles = ref<RoleResponse[]>([]);
  const allUserGroups = ref<UserGroupResponse[]>([]);
  const allDepts = ref<PickerOrgDTO[]>([]);
  const allUsers = ref<PickerUserDTO[]>([]);
  const getClassName = 'range-user-render-field_' + uuid2(16, 16);

  const value = computed<any>({
    // 目前只有多选
    get() {
      let value = props.modelValue || [];

      return value;
    },
    set(v) {
      emit('update:modelValue', v);
    },
  });

  watch(value, (val) => {
    updateUserOptions(multiple ? val : [val]);
    // 值发生变化
    emit('tableSearch');
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

  const ignoreCase = computed(() => {
    return ignoreOptions?.[0] === 'ignoreCase' ? 1 : 0;
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
      [label]: { icon, iconColor, textColor: '' },
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
    emit('update:modelValue', data);
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

  /**选择新的人员 */
  async function changeSelect(v) {
    const data = await changeValue(v);
    Event.runEventByName('onChange', props.widget.events, value.value, data, props.formData);
    /**列字段时候触发保存 */
  }

  /**值发生变化 */
  async function changeValue(v) {
    await nextTick();
    let data = optionsData.value.filter((i) => v.includes(i.value));
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

  .search-select-box {
    flex: 1;
    &.use-more {
      width: calc(100% - 26px);
    }
  }
</style>
