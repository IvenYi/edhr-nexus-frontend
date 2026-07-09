<template>
  <div>
    <a-button
      block
      @click="
        openModal(true, {
          reg: propValue,
          regHint: selectedProps.regHint,
          i18nConfig: i18nConfig,
        })
      "
      :type="!!propValue ? 'primary' : 'dashed'"
      class="reg-btn"
    >
      <!-- <template #icon>
        <setting-outlined />
      </template> -->
      {{ `${t('sys.pageDesigner.add')}${t('sys.pageDesigner.regex')}` }}
    </a-button>
    <reg-modal @register="register" @ok="handleOk" />
  </div>
</template>

<script setup lang="ts" name="reg-editor">
  import { computed } from 'vue';
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModal } from '/@/components/Modal';
  import RegModal from '../modals/reg-modal.vue';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import { SettingOutlined } from '@ant-design/icons-vue';

  const { selectedProps } = useSelectedWidget();
  const { t } = useI18n();
  const defProps = defineProps(props);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
  const [register, { openModal }] = useModal();

  const i18nConfig = computed(() => {
    if (defProps.propConfig.i18n) {
      return defProps?.widget?.i18n ?? {};
    }
    return {};
  });

  const handleOk = (data) => {
    propValue.value = data.reg;
    selectedProps.value.regHint = data.regHint;
    if (defProps && defProps.widget && defProps.widget.i18n) {
      // eslint-disable-next-line vue/no-mutating-props
      defProps.widget.i18n = { ...data.i18nConfig };
    }
  };
</script>

<style lang="less" scoped></style>
