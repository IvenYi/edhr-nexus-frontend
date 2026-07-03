<template>
  <a-select
    :open="false"
    @click="handleOpenModal"
    :value="showValue"
    @deselect="handleDeselect"
    maxTagCount="responsive"
    :maxTagTextLength="2"
    :options="selectOptions"
  />
</template>
<script setup lang="ts" name="select-userdep-cmp">
  import { computed, ref, watch, toRaw } from 'vue';
  import { useModalPicker, PickType } from '/@/components/UserPick';
  import { useI18n } from '/@/hooks/web/useI18n';

  import type { SelectProps } from 'ant-design-vue';

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

  const { openPickerByUser, openPicker, openPickerByDept, getUserByIds, getDeptOptions } =
    useModalPicker({
      type: PickType.APP,
      fieldKey: props.pickerCompParams.fieldKey,
      modelKey: props.pickerCompParams.modelKey,
    });

  const selectOptions = ref<SelectProps['options']>([]);

  const showValue = computed(() => {
    if (props.value) {
      return [].concat(props.value?.orgs ?? [], props.value?.users ?? []);
    }
    return undefined;
  });

  watch(
    [() => props.value?.orgs, () => props.value?.users],
    async ([orgsIds, usersIds]) => {
      let userOptions: any = [],
        orgsOptions: any = [];
      if (Array.isArray(usersIds) && usersIds.length !== 0) {
        const userList = await getUserByIds({ ids: toRaw(usersIds).join(',') });
        userOptions = userList?.map((item) => {
          return {
            label: t(item.__LABEL__),
            value: item.id,
          };
        });
      }

      if (Array.isArray(orgsIds) && orgsIds.length !== 0) {
        const orgsList = await getDeptOptions();
        orgsOptions = orgsList?.map((item) => {
          return {
            label: t(item.name),
            value: item.id,
          };
        });
      }

      selectOptions.value = [...userOptions, ...orgsOptions];
    },
    { deep: true, immediate: true },
  );

  const handleDeselect = (key, option) => {
    const orgs = (props.value?.orgs ?? []).filter((org) => org !== key);
    const users = (props.value?.users ?? []).filter((user) => user !== key);
    const info: any = {};
    if (orgs.length !== 0 || users.length !== 0) {
      info.orgs = orgs;
      info.users = users;
    }
    emits('change', info, 0);
  };

  const handleOpenModal = () => {
    if (props.supportModalType === 'user&org') {
      openPicker({
        userIds: props.value?.users ?? [],
        deptIds: props.value?.orgs ?? [],
        callback: async (value) => {
          const { deptIds, userIds } = value;
          const info: any = {};
          if (deptIds.length !== 0 || userIds.length !== 0) {
            info.orgs = deptIds;
            info.users = userIds;
          }
          emits('change', info, 0);
        },
      });
    } else if (props.supportModalType === 'user') {
      openPickerByUser({
        userIds: props.value?.users ?? [],
        multiple: props.pickerCompParams.multiple,
        callback(userIds, options) {
          const info: any = {};
          if (userIds.length !== 0) {
            info.users = userIds;
          }
          emits('change', info, 0);
        },
      });
    } else if (props.supportModalType === 'org') {
      openPickerByDept({
        deptIds: props.value?.orgs ?? [],
        multiple: props.pickerCompParams.multiple,
        callback: async (dept) => {
          const info: any = {};
          if (dept.length !== 0) {
            info.orgs = dept;
          }
          emits('change', info, 0);
        },
      });
    }
  };
</script>
