<template>
  <a-modal v-model:visible="visible" :title="title" @ok="handleOk">
    <div class="p30px">
      <!-- {{ formState }} -->
      <a-form ref="formRef" :model="formState" autocomplete="off">
        <!-- <i18n-select-input-form
          :formRef="formRef"
          formItemName="name"
          :fromItemExtraProps="{
            label: $t('sys.pageDesigner.name'),
            rules: [
              {
                required: true,
                message: $t('sys.pageDesigner.name') + $t('sys.pageDesigner.cannotBeEmpty'),
              },
            ],
          }"
          :inputExtraProps="{
            placeholder: `${$t('sys.inputText')}${$t('sys.pageDesigner.name')}`,
          }"
          v-model:text="formState.name"
          v-model:i18nConfig="formState.i18n"
        /> -->
        <a-form-item
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
            alls
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
  </a-modal>
</template>
<script setup lang="ts">
  import { ref, toRaw, computed } from 'vue';
  import type { FormInstance } from 'ant-design-vue';
  import { FormComponents, Platform } from '/@page-designer/enum';
  // import { I18nSelectInputForm } from '/@/components/I18nSelect';
  import { createWidgetByType } from '/@page-designer/schema/utils';
  import { useModalDragMove } from '/@/components/Modal/src/hooks/useModalDrag';
  import { useAppInfoStore } from '/@/store/modules/app-info';

  const props = defineProps({
    isBottomButton: {
      type: Boolean,
      default: false,
    },
    platform: {
      type: String,
      default: Platform.WEB,
    },
    butOptions: {
      type: Object as PropType<FormComponents[]>,
      default: () => [],
    },
  });

  const formRef = ref<FormInstance>();

  const resolveCallback = ref();
  const title = ref('');
  const visible = ref(false);
  const buttonOptions = computed(() => {
    return props.butOptions.map(createWidgetByType);
  });
  const formState = ref({ name: '', type: [], i18n: '' });

  // modal拖拽的方法
  useModalDragMove({ visible, destroyOnClose: ref(false), draggable: ref(true) });

  const handleOk = async () => {
    await formRef.value!.validate();
    visible.value = false;
    const i18ndata = formState.value.i18n ? JSON.parse(formState.value.i18n) : '';
    resolveCallback.value({ ...toRaw(formState.value), i18n: i18ndata.name });
  };

  const open = async (t: string): Promise<typeof formState.value> => {
    formState.value.name = '';
    formState.value.type = [];
    formState.value.i18n = '';
    await formRef.value?.clearValidate();
    title.value = t;
    visible.value = true;
    return new Promise((resolve) => {
      resolveCallback.value = resolve;
    });
  };
  const edit = async (
    formdata: typeof formState.value,
    t: string,
  ): Promise<typeof formState.value> => {
    const i18n = formdata.i18n ? JSON.stringify({ name: formdata.i18n }) : '';
    formState.value = { ...formdata, i18n };
    await formRef.value?.clearValidate();
    title.value = t;
    visible.value = true;
    return new Promise((resolve) => {
      resolveCallback.value = resolve;
    });
  };

  defineExpose({ open, edit });
</script>
<style scoped lang="less"></style>
