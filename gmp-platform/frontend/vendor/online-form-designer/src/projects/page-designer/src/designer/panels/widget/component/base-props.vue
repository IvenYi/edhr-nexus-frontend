<template>
  <a-row class="mb16px">
    <a-col :span="24">
      <span v-if="selectedRef.icon" class="inline-block icon-wrap">
        <i class="iconfont primary widget-icon" :class="`${selectedRef.icon}`"></i>
      </span>
      <span class="widget-name">
        {{ t(`${selectedRef.name}`) }}
        {{ selectedRef.props?.isCustomField ? t('sys.pageDesigner.showFieldName') : '' }}
      </span>
    </a-col>
  </a-row>
  <div class="mb12px">
    <a-breadcrumb v-if="fieldPathChains.length !== 0" separator=">">
      <a-breadcrumb-item v-for="(path, index) of fieldPathChains" :key="index">{{
        path
      }}</a-breadcrumb-item>
    </a-breadcrumb>
  </div>
  <div v-if="modelLinks && modelLinks.length > 0" class="mb12px">
    <a-breadcrumb separator=">">
      <a-breadcrumb-item v-for="(item, index) of modelLinks" :key="index">
        <span>{{ item.label }}</span>
        <span v-if="item.suffix" class="suffix">（{{ t(item.suffix) }}）</span>
      </a-breadcrumb-item>
    </a-breadcrumb>
  </div>
  <!-- 字段key -->
  <a-row
    class="mb8px"
    v-if="selectedRef.isField && !basicPropConfig?.key_hidden && selectedRef.props?.field"
  >
    <a-col :span="8" class="ant-form-item-label" style="padding-bottom: 0; line-height: 22px">
      {{ t(basicPropConfig?.key_label || 'sys.pageDesigner.field') }}KEY
    </a-col>
    <a-col :span="16" align="right">
      {{ showId(selectedRef.props?.field) }}
    </a-col>
  </a-row>
  <!-- 组件key -->
  <a-row
    class="mb8px"
    v-if="
      (!selectedRef.isField ||
        selectedRef.materialType === MaterialEnum.MaterialFormField ||
        selectedRef.materialType === MaterialEnum.MaterialSubTableModalField ||
        selectedRef.materialType === MaterialEnum.DescriptionsFormField) &&
      !basicPropConfig?.key_hidden
    "
  >
    <a-col :span="8" class="ant-form-item-label" style="padding-bottom: 0; line-height: 22px">
      {{ t(basicPropConfig?.key_label || 'sys.pageDesigner.widget') }}KEY
    </a-col>
    <a-col :span="16" align="right">
      <a-tooltip placement="left">
        <template #title>
          <span>{{ selectedRef.id }}</span>
        </template>
        {{ showId(selectedRef.id) }}
      </a-tooltip>
    </a-col>
  </a-row>
  <!-- 组件标题 -->
  <a-form-item
    name="alias"
    :label="t(basicPropConfig?.alias_label || 'sys.pageDesigner.widgetName')"
    v-if="
      (selectedRef.type !== BuiltinType.MODAL || selectedRef.props?.isSubTableModal) &&
      !selectedRef.isField &&
      !basicPropConfig?.alias_hidden
    "
  >
    <a-input v-model:value="selectedRef.alias" :maxlength="32" show-count size="small" />
  </a-form-item>
</template>

<script setup lang="ts">
  import { ref, unref, onMounted, onBeforeMount, onBeforeUnmount, computed } from 'vue';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { PropGroup, BuiltinType } from '/@page-designer/enum';
  import CopyModuleKey from '/@/components/CopyModuleKey';
  import { MaterialEnum } from '/@/enums/appEnum';
  import { useModelField } from '/@/components/FieldTransfer/hooks/useModelField';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useCopyToClipboard } from '/@/hooks/web/useCopyToClipboard';
  import { FormComponents } from '@gct/runtime';
  import { getModelMetaByKeys } from '/@/apis/gct-apaas/ModelMetaController.ts';

  const { createMessage } = useMessage();
  const { t } = useI18n();
  const { selectedRef, selectedAllDesingerConfig } = useSelectedWidget();
  const showId = computed(() => {
    return (key) => {
      if (key.length > 18) {
        const prefix = key.substring(0, 6); // 截取前5位
        const suffix = key.substring(key.length - 6); // 截取后四位
        return `${prefix}***${suffix}`;
      } else {
        return key;
      }
    };
  });
  const basicPropConfig = selectedAllDesingerConfig.value?.basicProps;
  const { getFieldPathChainList } = useModelField();

  const isCopying = ref(false);

  const pasteFunc = () => {
    if (isCopying.value) return;
    const selectText = document.getSelection()?.toString().trim();
    if (selectText) {
      let copyVal = '';
      if (selectedRef.value.id && showId.value(selectedRef.value.id) === selectText) {
        copyVal = selectedRef.value.id;
      } else if (
        selectedRef.value.props?.field &&
        showId.value(selectedRef.value.props?.field) === selectText
      ) {
        copyVal = String(selectedRef.value.props.field);
      }
      if (copyVal) {
        isCopying.value = true;
        setTimeout(() => {
          const { isSuccessRef } = useCopyToClipboard(copyVal);
          unref(isSuccessRef) && createMessage.success(t('sys.pageDesigner.copySuccess'));
          isCopying.value = false;
        }, 0);
      }
    }
  };

  const modelLinks = ref<{ label: string; suffix?: string }[]>([]);

  const fieldPathChains = ref<string[]>([]);
  onBeforeMount(async () => {
    fieldPathChains.value = await getFieldPathChainList(
      selectedRef.value.props.fieldCodeChain,
      selectedRef.value.props.fieldName,
    );
    // console.log('selectedRef.value.props', selectedRef.value);
    if (selectedRef.value.type === FormComponents.SubDataTable) {
      const data = selectedRef.value.props;
      if (data.parentModel) {
        const keys = [data.parentModel, data.model];
        const models = await getModelMetaByKeys({ modelKeys: keys.join(',') });
        models.forEach((item, i) => {
          if (i + 1 === models.length) {
            modelLinks.value.push({
              label: item.name,
              suffix:
                item.subModel === 1 ? 'sys.pageDesigner.subTable' : 'sys.pageDesigner.refdataTable',
            });
          } else {
            modelLinks.value.push({ label: item.name });
          }
        });
      }
    }
  });
  onMounted(() => {
    document.addEventListener('copy', pasteFunc);
  });
  onBeforeUnmount(() => {
    document.removeEventListener('copy', pasteFunc);
  });
</script>
<style scoped lang="less">
  .widget-name {
    margin-left: 4px;
    color: @gct-text-main-color;
    font-weight: 500;
  }

  .icon-wrap {
    width: 16px;
    height: 16px;
    border-radius: 2px;
    background-color: var(--ant-primary-color);
    text-align: center;
  }

  .widget-icon {
    color: #fff;
    font-size: 14px;
    line-height: 16px;
  }

  :deep(.ant-breadcrumb-link) {
    .suffix {
      color: rgb(0 0 0 / 45%);
    }
  }
</style>
