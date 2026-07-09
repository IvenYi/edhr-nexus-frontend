<template>
  <div class="ref-autofill-editor">
    <form-item :inline="false" :label="$t('sys.pageDesigner.dataFill')">
      <div class="data-filter-box" @click="handleFilterClick">
        <div class="inpt-box">
          <a-button
            :type="detail?.length ? 'primary' : 'default'"
            :disabled="disabled"
            block
            size="small"
          >
            {{ detail?.length ? t('sys.pageDesigner.editRule') : t('sys.pageDesigner.addRule') }}
          </a-button>
        </div>
      </div>
    </form-item>
    <autofill-rules-dialog
      @register="register"
      @ok="handleOk"
      :refModelKey="fieldMeta.refModelKey!"
      :modelKey="fieldMeta.model!"
    />
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import { cloneDeep } from 'lodash-es';
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import AutofillRulesDialog from './autofill-rules-dialog.vue';
  import { useModelFields } from '/@online-form/views/designer/hooks/useModelFields';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModal } from '/@/components/Modal';
  import type { IBindField } from '@gct/nocode-base';

  const { t } = useI18n();

  const [register, { openModal }] = useModal();

  const props = defineProps<{
    fieldMeta: IBindField;
    autofillRules?: Array<{ toField: string; fromField: string }>;
    disabled: boolean;
  }>();

  const emit = defineEmits(['update:autofillRules']);

  const detail = computed({
    get() {
      return props.autofillRules;
    },
    set(v) {
      emit('update:autofillRules', v);
    },
  });

  const handleFilterClick = () => {
    openModal(true, {
      rules: detail.value,
    });
  };

  const handleOk = ({ rules }) => {
    emit('update:autofillRules', cloneDeep(rules));
  };
</script>

<style lang="less" scoped>
  .data-filter-box {
    .ant-input-affix-wrapper {
      pointer-events: none;
    }
  }
</style>
