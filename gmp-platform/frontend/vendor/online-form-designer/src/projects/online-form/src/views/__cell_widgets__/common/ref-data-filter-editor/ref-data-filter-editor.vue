<template>
  <div class="ref-data-filter-editor">
    <form-item :inline="false" :label="$t('sys.pageDesigner.datafiltering')">
      <div class="data-filter-box" @click="handleFilterClick">
        <div class="inpt-box">
          <a-button :type="filterValue ? 'primary' : 'default'" block size="small">
            {{
              filterValue
                ? t('sys.pageDesigner.editFilterCondition')
                : t('sys.pageDesigner.setFilterCondition')
            }}
          </a-button>
        </div>
      </div>
    </form-item>
    <field-condition-rules-modal
      :isPageDesigner="false"
      :isOnlineFormDesigner="true"
      :onlineFormFieldList="fieldOptions"
      @register="fieldConditionRulesRegister"
      @refresh="onRefresh"
    />
  </div>
</template>

<script lang="ts" setup>
  import { FIELD_TYPE, FIELD_TYPE_BASIC } from '@gct/runtime';
  import { computed, nextTick } from 'vue';
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';

  import { useModelFields } from '/@online-form/views/designer/hooks/useModelFields';
  import FieldConditionRulesModal from '/@page-designer/designer/panels/prop-editor/modals/field-condition-rules-modal.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModal } from '/@/components/Modal';
  import type { IBindField } from '@gct/nocode-base';

  const { t } = useI18n();

  const { modelMetaMap } = useModelFields();

  const [fieldConditionRulesRegister, { openModal: openFieldConditionRulesModal }] = useModal();

  interface dataRuleType {
    dataRule: string;
    dataRuleConfig: string;
    dataRuleEnabled: Boolean;
  }

  const props = defineProps<{
    fieldMeta: IBindField;
    dataFilter?: dataRuleType;
    disabled: boolean;
  }>();

  const emit = defineEmits(['update:dataFilter']);

  const detail = computed({
    get() {
      return {
        ...props.dataFilter,
        dataRuleEnabled: true,
      };
    },
    set(v) {
      emit('update:dataFilter', v);
    },
  });

  const filterValue = computed(() => {
    if (detail.value?.dataRule) {
      const obj = JSON.parse(detail.value.dataRule);
      return obj.exp;
    } else {
      return null;
    }
  });

  const currentModelMeta = computed(() => {
    return modelMetaMap.value[props.fieldMeta.model!];
  });

  const fieldOptions = computed(() => {
    const filterFieldKeys = [
      ...Object.values(FIELD_TYPE_BASIC),
      FIELD_TYPE.OPTION,
      FIELD_TYPE.OPTION_MULTI,
      FIELD_TYPE.REF,
      FIELD_TYPE.REF_MULTI,
    ];

    return currentModelMeta.value.fields
      .filter((i) => filterFieldKeys.includes(i.type))
      .filter((v) => v.createType === 'USER_DEFINED' || v.createType === 'BUILTIN')
      .map((i) => {
        return {
          label: `${currentModelMeta.value.meta.name}.${i.name}`,
          type: i.type,
          value: i.key,
        };
      });
  });

  const handleFilterClick = () => {
    openFieldConditionRulesModal(true, {
      detail: detail.value,
      modelKey: props.fieldMeta.refModelKey,
    });
  };

  const onRefresh = async (data) => {
    emit('update:dataFilter', data);
    await nextTick();
    console.log(props.dataFilter, 'propValue.value-------');
  };
</script>

<style lang="less" scoped>
  .data-filter-box {
    .ant-input-affix-wrapper {
      pointer-events: none;
    }
  }
</style>
