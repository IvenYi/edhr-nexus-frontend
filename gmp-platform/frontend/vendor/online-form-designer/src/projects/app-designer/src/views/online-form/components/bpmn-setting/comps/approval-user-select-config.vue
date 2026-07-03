<template>
  <a-select
    v-model:value="value"
    :placeholder="placeholder || t('sys.appDesigner.approval.approvalUserTip')"
    mode="multiple"
    allowClear
    :size="size || 'small'"
    :open="false"
    dropdownClassName="gct-project-select-dropdown"
    :options="options"
    :disabled="isDisabled"
    @click="openView()"
    :max-tag-count="5"
    :maxTagTextLength="8"
    :showArrow="true"
  >
    <template #tagRender="data">
      <taglabel
        :label="data.label"
        :closable="!isDisabled"
        :tagWidgetStyle="{ tagStyleOpen: true }"
        :isDesign="false"
        :iconProps="returnIconExtra(data.option)"
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

  import { useAppInfoStore } from '/@/store/modules/app-info';
  import { SceneType } from '/@/components/SelectUserModal/controller';
  import { Form } from 'ant-design-vue';
  import { useUserSelectEcho } from '../hooks/UserSelectEcho';

  const formItemContext = Form.useInjectFormItemContext();

  const { init, translateUsers, AllOptions } = useUserSelectEcho();

  const { t } = useI18n();

  const bpmnReadonly = inject('bpmnReadonly', ref(false));
  const bpmnMainModelKey = inject<string>('bpmnMainModelKey', '');

  const options = computed(() => {
    return AllOptions.value;
  });

  const props = withDefaults(
    defineProps<{
      modelValue?: string;
      placeholder?: string;
      /** 需要额外隐藏的id集合 */
      hiddenKeys?: string[];
      showTabs?: string[];
      size?: string;
      disabled?: boolean;
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

  const isDisabled = computed(() => {
    return props.disabled || bpmnReadonly.value;
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
  const openView = () => {
    if (isDisabled.value) {
      return;
    }

    const sceneType = isInEDHR.value ? SceneType.Edhr_Granted : SceneType.Paas;

    openSelectUserModal({
      title: t('sys.appDesigner.approval.approvalUserSelect'),
      values: value.value,
      modelKey: bpmnMainModelKey,
      sceneType,
      showTabs: props.showTabs,
      hiddenKeys: props.hiddenKeys,
      callback: async (ids) => {
        await translateUsers(ids);
        value.value = ids;
      },
    });
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
</script>

<style lang="less" scoped>
  :deep(.ant-select-selection-overflow-item) {
    margin: 3px 3px 1px 0;
  }
</style>
