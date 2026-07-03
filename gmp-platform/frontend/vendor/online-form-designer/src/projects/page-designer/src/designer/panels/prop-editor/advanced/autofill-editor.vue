<template>
  <div>
    <a-button
      block
      @click="openModal(true, { rules: propValue, widget })"
      :type="propValue?.length ? 'primary' : 'default'"
      class="rules-btn"
    >
      <template #icon>
        <setting-outlined />
      </template>
      {{ t('sys.pageDesigner.addRule') }}
    </a-button>
    <autofill-rules-modal @register="register" @ok="handleOk" />
  </div>
</template>

<script setup lang="ts" name="autofill-editor">
  import { useI18n } from '/@/hooks/web/useI18n';
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { SettingOutlined } from '@ant-design/icons-vue';
  import AutofillRulesModal from '../modals/autofill-rules-modal.vue';
  import { useModal } from '/@/components/Modal';
  import { cloneDeep } from 'lodash-es';

  const defProps = defineProps(props);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
  const { t } = useI18n();
  const [register, { openModal }] = useModal();

  const handleOk = ({ rules }) => {
    propValue.value = cloneDeep(rules);
  };
  if (propValue.value === undefined) {
    propValue.value = [];
  }
</script>

<style lang="less" scoped></style>
