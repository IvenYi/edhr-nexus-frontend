<template>
  <div class="pt40px pb40px">
    <a-form ref="formRef" :model="formState" autocomplete="off">
      <a-form-item
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
        class="ks-col"
        :label="$t('sys.pageDesigner.selectButton')"
        name="type"
        :rules="[{ required: true, message: $t('sys.chooseText') }]"
      >
        <a-select
          v-model:value="formState.type"
          style="width: 100%"
          mode="multiple"
          allowClear
          showArrow
          :listHeight="340"
          :show-search="false"
          :maxTagCount="5"
          :maxTagTextLength="6"
          :placeholder="$t('sys.chooseText')"
          dropdownClassName="gct-custom-select-dropdown"
        >
          <a-select-option :value="i.type" v-for="i in buttonOptions" :key="i">{{
            $t(i.props.title)
          }}</a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
  import { computed, reactive } from 'vue';
  import { IModal } from '@gct/runtime';
  import { BaseButton } from '/@page-designer/types/web';
  import { cloneDeep } from 'lodash-es';
  import { createWidgetByType } from '/@page-designer/schema/utils';
  import { FormComponents } from '/@page-designer/enum';

  const defProps = defineProps<{
    modal: IModal;
    options: FormComponents[];
  }>();
  const formState = reactive({ type: [] });
  defProps.modal.ok = async () => {
    const data = buttonOptions.value.filter((i) => formState.type.includes(i.type));
    return { ok: true, data: cloneDeep(data) };
  };

  const buttonOptions = computed<BaseButton[]>(() => {
    return defProps.options.map(createWidgetByType);
  });
</script>
<style scoped lang="less"></style>
