<template>
  <div :class="[ns.b()]">
    <d :class="[ns.e('left')]" ref="formRef" :model="formState" autocomplete="off">
      <a-form-item :class="[ns.e('item')]" name="name" :label="nameLangTitle">
        <a-input v-model:value="formState.query" :placeholder="t('sys.inputTextTip')" />
      </a-form-item>
      <a-form-item :class="[ns.e('item')]" name="code" :label="codeLangTitle">
        <a-input v-model:value="formState.code" :placeholder="t('sys.inputTextTip')" />
      </a-form-item>
      <!--文控状态|审核状态 -->
      <a-form-item
        v-if="enableDocControl"
        :class="[ns.e('item')]"
        name="name"
        :label="typeLangTitle"
      >
        <a-select
          v-if="enableApproveControl"
          :allowClear="true"
          :placeholder="t('sys.chooseTextTip')"
          v-model:value="formState.approveStatus"
          showSearch
          optionFilterProp="label"
          :options="typeOptions"
        />
        <a-select
          v-else
          :allowClear="true"
          :placeholder="t('sys.chooseTextTip')"
          v-model:value="formState.controlStatus"
          showSearch
          optionFilterProp="label"
          :options="typeOptions"
        />
      </a-form-item>
      <div :class="[ns.e('search-btn')]">
        <a-button @click="handleReset">
          {{ t('sys.reset') }}
        </a-button>
        <a-button class="ml-8px" type="primary" @click="onSearch">
          {{ t('sys.query') }}
        </a-button>
      </div>
    </d>
    <div :class="[ns.e('toolbar')]" v-if="showAdd || showExport">
      <a-button v-if="showExport" :class="[ns.e('action')]" @click="onExport">
        <icon-next
          :class="[ns.e('action-icon')]"
          value="icon-platform:platform-daochu"
          :size="16"
          :style="{
            '--color': 'rgba(0,0,0,.85)',
          }"
        />
        {{ t('sys.export') }}
      </a-button>
      <a-button v-if="showAdd" type="primary" :class="[ns.e('action')]" @click="onAdd">
        <icon-next
          :class="[ns.e('action-icon')]"
          value="icon-platform:platform-xinjian"
          :size="16"
        />
        {{ t('sys.newSth') }}
      </a-button>
    </div>
  </div>
</template>

<script lang="ts" setup name="page-header2">
  import { useNamespace } from '@gct/runtime';
  import { computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import {
    ApprovalControlStatusEnum,
    ControlStatusEnum,
  } from '/@app-designer/views/online-form/constants';
  import { isEnableDocControl } from '/@online-form/views/web-render/hooks/useControl';
  import { isEnableApproveControl } from '/@online-form/views/web-render/hooks/useApproveControl';

  const enableDocControl = computed(() => isEnableDocControl());
  const enableApproveControl = computed(() => isEnableApproveControl());

  const { t } = useI18n();

  const ns = useNamespace('page-header2');

  const props = withDefaults(
    defineProps<{
      title: string;
      params: IParams;
      showAdd: boolean;
      showExport: boolean;
    }>(),
    {
      showAdd: undefined,
      showExport: false,
    },
  );

  const nameLangTitle = computed(() => {
    return t('sys.name');
  });
  const codeLangTitle = computed(() => {
    return t('sys.platform.code');
  });
  const typeLangTitle = computed(() => {
    return enableApproveControl.value ? t('sys.edhr.approveStatus') : t('sys.edhr.controlType');
  });

  const typeOptions = computed(() => {
    const allStatus = enableApproveControl.value
      ? Object.values(ApprovalControlStatusEnum)
      : Object.values(ControlStatusEnum);
    const i18nPrefix = enableApproveControl.value
      ? 'sys.onlineForm.approvalStatusEnum'
      : 'sys.onlineForm.controlStatusEnum';
    return allStatus.map((key) => {
      return {
        label: t(`${i18nPrefix}.${key}`),
        value: key,
      };
    });
  });

  const emit = defineEmits<{
    (e: 'search'): void;
    (e: 'add'): void;
    (e: 'export'): void;
  }>();

  const formState = computed({
    get() {
      return props.params;
    },
    set(v) {
      Object.assign(props.params, v);
    },
  });

  const onSearch = () => {
    emit('search');
  };
  const onAdd = () => {
    emit('add');
  };
  const onExport = () => {
    emit('export');
  };

  const handleReset = () => {
    Object.assign(formState.value, {
      query: '',
      code: null,
      controlStatus: null,
      approveStatus: null,
    });
    onSearch();
  };
</script>

<style lang="scss" scoped>
  $page-header2: ();

  @include b(page-header2) {
    @include set-component-css-var(page-header2, $page-header2);
    padding-top: 16px;
    height: 137px;

    @include e(left) {
      display: flex;
      justify-content: space-between;
      padding: 16px;
      background: #f7f8fa;
      margin-bottom: 10px;
    }

    @include e(item) {
      margin-bottom: 0;
      margin-right: 20px;
      flex-grow: 1;
      flex-wrap: nowrap;
      width: 200px;

      :deep(.ant-input-suffix) {
        display: none;
      }
      :deep(.ant-form-item-label) {
        flex-shrink: 0;
      }
    }

    @include e(search-btn) {
      flex-shrink: 0;
    }

    @include e(toolbar) {
      text-align: right;
      margin-bottom: 20px;
      :deep(.ant-btn) {
        height: 36px;
        padding: 4px 12px;
      }
    }

    @include e(action) {
      margin-left: 12px;
      display: inline-flex;
      align-items: center;
    }

    @include e(action-icon) {
      margin-right: 6px;
    }
  }
</style>
