<template>
  <div class="member-range-select">
    <div v-for="data in showOptions.slice(0, maxShow)" :key="data.value" class="member-item">
      <taglabel
        :label="data.label"
        :tagWidgetStyle="{ tagStyleOpen: true }"
        :isDesign="false"
        :closable="false"
        :iconProps="returnIconExtra(data)"
      />
    </div>
    <taglabel
      v-if="maxShow && maxShow < showOptions.length"
      label="..."
      :tagWidgetStyle="{ tagStyleOpen: true }"
      :isDesign="false"
      :closable="false"
    />
  </div>
</template>

<script setup lang="ts" name="member-range-select">
  import { ref, computed, onBeforeMount, watch, inject } from 'vue';

  import { openSelectUserModal } from '/@/components/SelectUserModal';
  import { taglabel } from '/@page-designer/components/widgets/web/__components__/formcomponent/index';
  import { useI18n } from '/@/hooks/web/useI18n';

  import { useAppInfoStore } from '/@/store/modules/app-info';
  import { SceneType } from '/@/components/SelectUserModal/controller';
  import { Form } from 'ant-design-vue';
  import { useUserSelectEcho } from '../../bpmn-setting/hooks/UserSelectEcho';

  const formItemContext = Form.useInjectFormItemContext();

  const { init, translateUsers, AllOptions } = useUserSelectEcho();

  const { t } = useI18n();

  const bpmnMainModelKey = inject<string>('bpmnMainModelKey', '');

  const options = computed(() => {
    return AllOptions.value;
  });

  const showOptions = computed(() => {
    return options.value.filter((item) => value.value.includes(item.value));
  });

  const props = withDefaults(
    defineProps<{
      modelValue?: string;
      placeholder?: string;
      /** 需要额外隐藏的id集合 */
      hiddenKeys?: string[];
      disabled?: boolean;
      maxShow?: number;
    }>(),
    {
      disabled: false,
    },
  );

  const emit = defineEmits(['update:modelValue']);

  const value = computed<any>({
    get() {
      let value = props.modelValue || undefined;

      return Array.isArray(value) ? value : value?.split(',').filter((i) => i) || [];
    },
    set(v) {
      emit('update:modelValue', v?.join(','));
      formItemContext.onFieldChange();
    },
  });

  onBeforeMount(async () => {
    await init({ modelKey: bpmnMainModelKey });
  });
  watch(
    () => value.value,
    () => {
      translateUsers(value.value);
    },
    {
      immediate: true,
      deep: true,
    },
  );

  const appInfoStore = useAppInfoStore();
  const isInEDHR = computed(() => appInfoStore.appInfo.suiteKey === 'eDHR');

  // 弹窗-打开
  const openView = (isReadonly) => {
    const sceneType = isInEDHR.value ? SceneType.Edhr_Granted : SceneType.Paas;

    openSelectUserModal({
      title: t('sys.appDesigner.approval.approvalUserSelect'),
      values: value.value,
      modelKey: bpmnMainModelKey,
      sceneType,
      showTabs: ['User', 'Org', 'Role', 'UserGroup'],
      hiddenKeys: props.hiddenKeys,
      readonly: isReadonly,
      callback: async (ids) => {
        await translateUsers(ids);
        value.value = ids;
      },
    });
  };

  const preview = () => {
    openView(true);
  };

  // tagLable中渲染的图标
  const returnIconExtra = (option) => {
    if (!option) return {};
    const { value } = option;
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
      icon,
      iconColor,
      textColor: '',
    };
  };

  defineExpose({
    openView,
    preview,
  });
</script>

<style lang="less" scoped>
  .member-range-select {
    display: flex;
    row-gap: 6px;
    column-gap: 2px;
    flex-wrap: wrap;
    .member-item {
      white-space: nowrap;
    }
  }
  :deep(.ant-select-selection-overflow-item) {
    margin: 3px 3px 1px 0;
  }
</style>
