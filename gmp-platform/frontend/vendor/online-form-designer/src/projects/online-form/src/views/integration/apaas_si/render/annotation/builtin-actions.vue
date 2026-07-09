<template>
  <span :class="[ns.b()]">
    <!-- <a-button
      v-if="showButtonKeys.includes('annotate-button')"
      :class="[ns.e('btn')]"
      @click="handleFormAnnotate"
    >
      {{
        showAnnotation ? t('sys.onlineForm.closeAnnotation') : t('sys.onlineForm.showAnnotation')
      }}
    </a-button> -->

    <a-button
      v-if="showButtonKeys.includes('abandon-button')"
      :class="[ns.e('btn')]"
      type="primary"
      danger
      @click="handleFormAbandon"
    >
      {{ t('sys.onlineForm.AnnotationChangeType.Abandon') }}
    </a-button>
    <!-- <a-button
      v-if="showButtonKeys.includes('resubmit-button')"
      :class="[ns.e('btn')]"
      type="primary"
      @click="handleFormResubmit"
    >
      {{ t('sys.onlineForm.AnnotationChangeType.Resubmit') }}
    </a-button> -->
    <a-button
      v-if="showButtonKeys.includes('modify-button')"
      :class="[ns.e('btn')]"
      type="primary"
      @click="handleFormModify"
    >
      {{ formChanging ? t('sys.onlineForm.submitChange') : t('sys.onlineForm.formChange') }}
    </a-button>
    <a-button
      v-if="showButtonKeys.includes('medpro-abandon-button')"
      :class="[ns.e('btn')]"
      type="primary"
      danger
      @click="handleMedproAbandon"
    >
      {{ t('sys.onlineForm.AnnotationChangeType.Abandon') }}
    </a-button>
  </span>
</template>

<script lang="ts" setup name="Demo">
  import { useNamespace } from '@gct/runtime';
  import { BuiltinAction } from './use-annotation';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useAppInfoStore } from '/@/store/modules/app-info';

  const ns = useNamespace('builtin-actions');

  const { t } = useI18n();

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

  const handleFormAnnotate = () => {
    if (props.showAnnotation) {
      emit('clickAction', BuiltinAction.CloseAnnotation);
    } else {
      emit('clickAction', BuiltinAction.ShowAnnotation);
    }
  };

  const handleFormAbandon = () => {
    emit('clickAction', BuiltinAction.DoFormAbandon);
  };
  const handleFormResubmit = () => {
    emit('clickAction', BuiltinAction.DoFormResubmit);
  };

  const handleFormModify = () => {
    if (!props.formChanging) {
      emit('clickAction', BuiltinAction.DoFormChange);
      return;
    }
    const appInfoStore = useAppInfoStore();
    if (appInfoStore.appInfo.suiteKey === 'MEDPRO') {
      emit('clickAction', BuiltinAction.SubmitFormChange);
      // emit('clickAction', BuiltinAction.SubmitMedProFormChange);
    } else {
      emit('clickAction', BuiltinAction.SubmitFormChange);
    }
  };

  const handleMedproAbandon = () => {
    emit('clickAction', BuiltinAction.DoMedProFormAbandon);
  };
</script>

<style lang="scss" scoped>
  $builtin-actions: (
    height: auto,
  );

  @include b(builtin-actions) {
    @include set-component-css-var(builtin-actions, $builtin-actions);

    @include e(btn) {
      margin-left: 8px;
    }

    height: getcssvar(builtin-actions, height);
    vertical-align: top;
  }
</style>
