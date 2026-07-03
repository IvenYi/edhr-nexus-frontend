<template>
  <a-select
    :class="[ns.b()]"
    :open="false"
    showArrow
    :placeholder="placeholder || $t('sys.chooseText')"
    dropdownClassName="gct-project-select-dropdown"
    @click="handleOpenModal"
    v-model:value="valueArr"
    :options="selectOptions"
    :mode="multiple ? 'multiple' : undefined"
    :allowClear="true"
  />
</template>

<script lang="ts" setup name="grant-user-select">
  import { useNamespace } from '@gct/runtime';
  import { SelectProps } from 'ant-design-vue';
  import { computed, ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { openSelectUserModal } from '/@/components/SelectUserModal';
  import { PickType, useModalPicker } from '/@/components/UserPick';
  import { SceneType } from '/@/components/SelectUserModal/controller';

  const { getUserByIds } = useModalPicker({ type: PickType.ViSIBLE });

  const { t } = useI18n();

  const ns = useNamespace('grant-user-select');

  const props = withDefaults(
    defineProps<{
      value?: string | string[];
      multiple?: boolean;
      /** 是否是授权用户,true是授权用户，false是未授权用户，undefined是全部用户 */
      isGranted?: boolean;
      /** 需要额外隐藏的id集合 */
      hiddenKeys?: string[];
      placeholder?: string;
    }>(),
    {
      isGranted: undefined,
    },
  );

  const emit = defineEmits<{
    (e: 'update:value', value?: string | string[]): void;
    (e: 'select', arr?: Array<{ id: string; name: string }>): void;
  }>();

  const valueArr = computed<any>({
    get() {
      if (props.multiple) {
        return props.value || [];
      }
      return props.value ? [props.value] : [];
    },
    set(v) {
      if (props.multiple) {
        emit('update:value', v);
      } else {
        emit('update:value', v?.[0]);
      }
    },
  });

  const selectOptions = ref<SelectProps['options']>([]);

  const handleOpenModal = async () => {
    let sceneType = SceneType.Paas;
    if (props.isGranted === true) {
      sceneType = SceneType.Edhr_Granted;
    } else if (props.isGranted === false) {
      sceneType = SceneType.Edhr_UnGranted;
    }

    openSelectUserModal({
      title: t('sys.appDesigner.approval.approvalUserSelect'),
      values: valueArr.value.map((id) => `USER:${id}`),
      modelKey: '',
      multiple: props.multiple,
      showTabs: ['User'],
      sceneType,
      hiddenKeys: props.hiddenKeys ? props.hiddenKeys.map((id) => `USER:${id}`) : undefined,
      callback: async (ids, selectMap) => {
        console.log('选中数据', selectMap.users);
        const userIds = selectMap.users.map((e) => e.id);
        valueArr.value = userIds;
        emit(
          'select',
          selectMap.users.map((e) => ({ id: e.id, name: e.fullname })),
        );
      },
    });
  };

  watch(
    () => props.value,
    async (v) => {
      if (!v) {
        return;
      }
      let userOptions: any = [];
      const usersIds = Array.isArray(v) ? v : [v];
      if (usersIds) {
        const userList = await getUserByIds({ ids: usersIds.join(',') });
        userOptions = userList?.map((item) => {
          return {
            label: item.__LABEL__ || item.fullname,
            value: item.id,
          };
        });
      }

      selectOptions.value = [...userOptions];
    },
    { deep: true, immediate: true },
  );
</script>

<style lang="scss" scoped>
  $grant-user-select: (
    height: auto,
  );

  @include b(grant-user-select) {
    @include set-component-css-var(grant-user-select, $grant-user-select);
    height: getCssVar(grant-user-select, height);

    :deep(.ant-select-selection-overflow) {
      pointer-events: none;
    }
  }
</style>
