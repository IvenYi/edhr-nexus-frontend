<template>
  <a-row :class="[ns.b()]">
    <a-col :span="span" :offset="offset">
      <div class="flex items-center color-[#F77E4A] bg-[#F77E4A1A] h-28px w-full mb-20px">
        <i class="iconfont icon-a-zhuyi_attention2 color-[#F77E4A] mr-8px ml-8px"></i>
        {{ message }}
      </div>
    </a-col>
  </a-row>
</template>

<script lang="ts" setup name="form-alert">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
  const ns = useNamespace('form-alert');

  const props = withDefaults(
    defineProps<{
      message: string;
      span?: string | number;
      offset?: string | number;
    }>(),
    {
      span: 16,
      offset: 6,
    },
  );

  const emit = defineEmits<{
    (e: 'update:value', value: string): void;
  }>();
</script>

<style lang="scss" scoped>
  $form-alert: ();

  @include b(form-alert) {
    @include set-component-css-var(form-alert, $form-alert);
  }
</style>
