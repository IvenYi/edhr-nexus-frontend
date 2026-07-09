<template>
  <div class="identify-param-card">
    <div class="flex justify-between items-center h-30px">
      <div class="identify-param-card__title">
        {{ $t('sys.onlineForm.promptWords')
        }}<IconTooltip class="ml-4px" :content="AITooltips.identifyParam.content" />
      </div>
      <RemoveIcon v-if="showRemove" style="width: 14px" @click="emit('remove', index)" />
    </div>
    <a-input v-model:value="formState.prompt" :placeholder="$t('sys.inputText')" />
    <a-divider class="pt6px pb2px"><i class="gct-iconfont icon-lianjie"></i></a-divider>
    <FormItem isFirst :label="'表单字段'" required :inline="false">
      <FormFieldSelect size="small" v-model="formState.formField" />
    </FormItem>
  </div>
</template>

<script lang="ts" setup name="identify-param-card">
  import { AITooltips, DeviceLink } from '@gct/nocode-base';
  import { computed } from 'vue';
  import { FormFieldSelect } from '/@online-form/components/form-field';
  import { IconTooltip, RemoveIcon } from '/@online-form/components/ui';
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';

  const props = withDefaults(
    defineProps<{
      params: DeviceLink.AIOcrTmplIdentifyParams;
      index: number;
      showRemove?: boolean;
    }>(),
    {
      params: undefined,
    },
  );

  const formState = computed({
    get() {
      return props.params;
    },
    set(v) {
      Object.assign(props.params, v);
    },
  });

  const emit = defineEmits<{
    (e: 'remove', index: number): void;
  }>();
</script>

<style lang="less" scoped>
  .identify-param-card {
    margin-top: 8px;
    background: #f9fafb;
    border-radius: 4px 4px 4px 4px;
    border: 1px dashed #e0e3eb;
    padding: 0 8px 12px;

    .identify-param-card__title {
      font-weight: 400;
      font-size: 12px;
      color: #1a1d23;
    }
  }
</style>
