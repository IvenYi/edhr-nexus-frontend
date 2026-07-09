<template>
  <TmplCard class="ai-tmpl-card" @edit="doEdit" @detail="doDetail">
    <template #title> {{ tmpl.name }} </template>
    <div class="sub-title">
      <i :class="`type-icon gct-iconfont icon-icon_AIshibie`"></i>
      {{ $t('sys.edhr.DeviceLinkTmplTypeEnum.AI_OCR') }}
    </div>
    <FieldsPreview :fields="fieldKeys" />
    <div class="mt-6px">
      <a-radio-group v-model:value="formState.inputMode" :options="inputModeOptions" />
    </div>
  </TmplCard>
</template>

<script lang="ts" setup name="ai-tmpl-card">
  import { DeviceLink, DeviceLinkTmplUtil } from '@gct/nocode-base';
  import TmplCard from './tmpl-card.vue';
  import { computed, onMounted, watch } from 'vue';
  import FieldsPreview from './fields-preview.vue';

  const props = withDefaults(
    defineProps<{
      tmpl: DeviceLink.AIOcrTmpl;
    }>(),
    {},
  );

  /** 对应的表单的key */
  const fieldKeys = computed(() => {
    return props.tmpl.identifyParams?.map((params) => params.formField).filter(Boolean);
  });

  const emit = defineEmits<{
    (e: 'edit', tmpl: DeviceLink.AIOcrTmpl): void;
    (e: 'detail', tmpl: DeviceLink.AIOcrTmpl): void;
  }>();

  const doEdit = () => {
    emit('edit', props.tmpl);
  };

  const doDetail = () => {
    emit('detail', props.tmpl);
  };

  const formState = computed({
    get() {
      return props.tmpl;
    },
    set(v) {
      Object.assign(props.tmpl, v);
    },
  });

  const inputModeOptions = [
    {
      label: $t('sys.onlineForm.camera'),
      value: DeviceLink.AiInputModeEnum.CAMERA,
    },
    {
      label: $t('sys.component.upload.imgUpload'),
      value: DeviceLink.AiInputModeEnum.UPLOAD,
    },
  ];

  onMounted(() => {
    // 默认没值的时候用摄像头
    if (!formState.value.inputMode) {
      formState.value.inputMode = DeviceLink.AiInputModeEnum.CAMERA;
    }
  });
</script>

<style lang="less" scoped>
  .ai-tmpl-card {
    :deep(.ant-radio-wrapper) {
      line-height: 20px;
    }

    .type-icon {
      margin-right: 4px;
      color: #026ac8;
      font-size: 14px;
    }

    .sub-title {
      margin-bottom: 12px;
      color: #1a1d23;
      font-size: 12px;
      font-weight: 400;
      line-height: 18px;
    }
  }
</style>
