<template>
  <span :class="['action-btns']">
    <VantButton
      v-if="showButtonKeys.includes('abandon-button')"
      :class="['action-btns__btn']"
      :enableCustomColor="true"
      :hasBgColor="true"
      background-color="#ff4d4f"
      font-color="#fff"
      type="primary"
      @click="handleFormAbandon"
      :title="t('sys.onlineForm.AnnotationChangeType.Abandon')"
    />
    <VantButton
      v-if="showButtonKeys.includes('medpro-abandon-button')"
      :class="['action-btns__btn']"
      :enableCustomColor="true"
      :hasBgColor="true"
      background-color="#ff4d4f"
      font-color="#fff"
      type="primary"
      @click="handleMedproAbandon"
      :title="t('sys.onlineForm.AnnotationChangeType.Abandon')"
    />
    <VantButton
      v-if="showButtonKeys.includes('modify-button')"
      :class="['action-btns__btn']"
      @click="handleFormModify"
      :title="formChanging ? t('sys.onlineForm.submitChange') : t('sys.onlineForm.formChange')"
    />
  </span>
</template>

<script lang="ts" setup name="action-btns">
  import { BuiltinAction } from '@gct/nocode-base';
  import VantButton from '../../base/base-button.vue';
  import { i18n } from '@mobile/locales/setupI18n';

  const { t } = i18n.global;

  const props = withDefaults(
    defineProps<{
      /** 显示按钮key集合 */
      showButtonKeys: string[];
      /** 显示表单批注 */
      showAnnotation?: boolean;
      /** 正在进行表单变更 */
      formChanging?: boolean;
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'clickAction', action: BuiltinAction): void;
  }>();

  const handleFormAbandon = () => {
    emit('clickAction', BuiltinAction.DoFormAbandon);
  };

  const handleMedproAbandon = () => {
    emit('clickAction', BuiltinAction.DoMedProFormAbandon);
  };

  const handleFormModify = () => {
    if (!props.formChanging) {
      emit('clickAction', BuiltinAction.DoFormChange);
    } else {
      emit('clickAction', BuiltinAction.SubmitFormChange);
    }
  };
</script>

<style lang="less" scoped>
  .action-btns {
  }
</style>
