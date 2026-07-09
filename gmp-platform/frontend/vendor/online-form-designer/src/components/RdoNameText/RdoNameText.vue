<template>
  <div :class="ns.b()">
    <a-row :gutter="10">
      <a-col :span="isFrontPrint ? 19 : 24">
        <a-input-group compact>
          <a-form-item :style="{ width: isFrontPrint ? 'calc(100% - 120px)' : '100%' }" name="name">
            <a-input
              v-model:value="val"
              show-count
              :maxlength="32"
              :placeholder="t('sys.inputText')"
              :disabled="!!c.data.handlerType"
              @change="onNameVersionChange($event, 'name')"
              :style="{ 'border-radius': isFrontPrint ? '4px 0 0 4px' : '4px' }"
            />
          </a-form-item>
          <a-form-item v-if="isFrontPrint" name="version" style="width: 120px">
            <a-input
              v-model:value="versionValue"
              :placeholder="t('sys.appDesigner.version')"
              @change="onNameVersionChange($event, 'version')"
              style="border-radius: 0 4px 4px 0"
            />
          </a-form-item>
        </a-input-group>
      </a-col>
      <a-col v-if="isFrontPrint" :span="5" class="text-right lh-32px">
        <a-checkbox v-model:checked="defaultValue">{{ t('sys.default') }}</a-checkbox>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup name="rdo-name-text">
  import { ref, computed, nextTick } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import {
    IFormItem,
    IFormItemController,
    ITextEditor,
    useGctFormValue,
    useNamespace,
  } from '@gct/runtime';

  const ns = useNamespace('rdo-name-text');
  const { t } = useI18n();
  const props = defineProps({
    c: {
      type: Object as PropType<IFormItemController>,
      required: true,
    },
    itemModel: {
      type: Object as PropType<IFormItem>,
      required: true,
    },
    model: {
      type: Object as PropType<ITextEditor>,
      required: true,
    },
    value: {
      type: String,
      default: '',
    },
  });

  console.log('rdo-name-text', props);

  const val = useGctFormValue();

  const isFrontPrint = computed(() => props.c?.form?.context?.isFrontPrint);

  const versionValue = computed<string>({
    get: () => props.c.data.version,
    set: (v) => {
      // eslint-disable-next-line vue/no-mutating-props
      props.c.data.version = v;
    },
  });

  const defaultValue = computed<string>({
    get: () => props.c.data.default,
    set: (v) => {
      // eslint-disable-next-line vue/no-mutating-props
      props.c.data.default = v;
    },
  });

  const onNameVersionChange = async (event, type) => {
    // console.log('onNameVersionChange', event, type);
    if (type == 'name') {
      val.value = event.target.value;
    } else if (type == 'version') {
      versionValue.value = event.target.value;
    }
    await nextTick();
    props.c?.form?.validateItem('name');
  };
</script>

<style lang="scss" scoped></style>
