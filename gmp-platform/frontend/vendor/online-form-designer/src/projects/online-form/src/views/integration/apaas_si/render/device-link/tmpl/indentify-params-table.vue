<template>
  <vxe-grid class="indentify-params-table default vxetable" :data="tableData" v-bind="gridOptions">
    <template #prompt_title="{ column }">
      {{ $t('sys.onlineForm.promptWords')
      }}<IconTooltip class="ml-4px" :content="AITooltips.identifyParam.content" />
    </template>
  </vxe-grid>
</template>

<script lang="ts" setup name="indentify-params-table">
  import { DeviceLink, useFormModel, AITooltips } from '@gct/nocode-base';
  import { VxeGridProps } from 'vxe-table';
  import { computed, reactive } from 'vue';
  import { IconTooltip } from '/@online-form/components/ui';

  const c = useFormModel().injectController();

  const props = withDefaults(
    defineProps<{
      value?: DeviceLink.AIOcrTmplIdentifyParams[];
      readonly?: boolean;
    }>(),
    {
      value: () => [],
    },
  );

  const tableData = computed(() =>
    props.value.map((item) => {
      const [model, field] = item.formField.split('.');
      return {
        prompt: item.prompt,
        formKey: field,
        formName: c.findField(model, field)?.name,
      };
    }),
  );

  const gridOptions = reactive<VxeGridProps<any>>({
    // border: true,
    round: true,
    editConfig: { trigger: 'manual', mode: 'row' },
    rowConfig: {
      resizable: true,
    },
    columns: [
      {
        field: 'prompt',
        title: $t('sys.onlineForm.promptWords'),
        slots: { header: 'prompt_title' },
      },
      {
        field: 'formKey',
        title: $t('sys.onlineForm.formFields'),
      },
      {
        field: 'formName',
        title: $t('sys.appDesigner.printDesign.form.name2'),
      },
    ],
  });
</script>

<style lang="less" scoped>
  .indentify-params-table {
  }
</style>
