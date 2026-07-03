<template>
  <div class="ai-tmpl-form">
    <a-form ref="formRef" :model="formData">
      <a-row :gutter="24">
        <a-col :span="12">
          <FormItem :label="$t('sys.tableColumnType')" name="type" required :inline="false">
            <a-select
              v-model:value="formData.type"
              :placeholder="$t('sys.chooseText')"
              :options="typeOptions"
            />
          </FormItem>
        </a-col>
        <a-col :span="12">
          <FormItem
            :label="$t('sys.onlineForm.recognitionTemplateName')"
            name="name"
            required
            :inline="false"
            :rules="[
              { required: true, message: $t('sys.onlineForm.pleaseEnterRecognitionTemplateName') },
            ]"
          >
            <a-input
              v-model:value="formData.name"
              :placeholder="$t('sys.inputText')"
              :maxLength="16"
            />
          </FormItem>
        </a-col>
        <a-col :span="12">
          <FormItem
            :label="$t('sys.developer.devive.index') + '/' + $t('sys.onlineForm.instrumentName')"
            name="name"
            :inline="false"
          >
            <a-input v-model:value="formData.deviceName" :placeholder="$t('sys.inputText')" />
          </FormItem>
        </a-col>
        <a-col :span="12">
          <FormItem
            :label="$t('sys.onlineForm.denoise')"
            name="denoiseMethod"
            :inline="false"
            :class="[formData.enableDenoise ? '' : 'hidden-content']"
          >
            <template #label>
              {{ $t('sys.onlineForm.denoise')
              }}<IconTooltip
                class="ml-4px"
                :content="AITooltips.denoise.content"
                :title="AITooltips.denoise.title"
              />
              <a-switch class="ml-8px" v-model:checked="formData.enableDenoise" />
            </template>
            <a-select
              class="ai-tmpl-form__select"
              v-model:value="formData.denoiseMethod"
              :options="DenoiseMethodOptions"
              :placeholder="$t('sys.chooseText')"
            />
          </FormItem>
        </a-col>
        <a-col :span="12">
          <FormItem
            :label="$t('sys.onlineForm.binarization')"
            name="binarizeMethod"
            :inline="false"
            :class="[formData.enableBinarize ? '' : 'hidden-content']"
          >
            <template #label>
              {{ $t('sys.onlineForm.binarization')
              }}<IconTooltip
                class="ml-4px"
                :content="AITooltips.binarize.content"
                :title="AITooltips.binarize.title"
              />
              <a-switch class="ml-8px" v-model:checked="formData.enableBinarize" />
            </template>
            <a-select
              class="ai-tmpl-form__select"
              v-model:value="formData.binarizeMethod"
              :options="BinarizeMethodOptions"
              :placeholder="$t('sys.chooseText')"
            />
          </FormItem>
        </a-col>
        <a-col :span="12">
          <FormItem
            :label="$t('sys.onlineForm.contrastEnhancement')"
            name="binarizeMethod"
            :inline="false"
            :class="[formData.enableContrast ? '' : 'hidden-content']"
          >
            <template #label>
              {{ $t('sys.onlineForm.contrastEnhancement')
              }}<IconTooltip
                class="ml-4px"
                :content="AITooltips.contrast.content"
                :title="AITooltips.contrast.title"
              />
              <a-switch class="ml-8px" v-model:checked="formData.enableContrast" />
            </template>
            <DecimalSlider
              v-model="formData.contrastAlpha"
              :step="0.1"
              :precision="1"
              :max="3"
              :min="1"
            />
          </FormItem>
        </a-col>
        <a-col :span="24">
          <div class="ai-tmpl-form__table-wrapper">
            <div class="flex justify-between mb-8px">
              <div>{{ $t('sys.onlineForm.parameterRecognition') }}</div>
              <a-button type="link" class="ai-tmpl-form__add-param" @click="addParam">
                <i class="gct-iconfont icon-btn_add"></i>
                {{ $t('sys.onlineForm.addRecognitionParameter') }}
              </a-button>
            </div>
            <template v-if="formData.identifyParams?.length">
              <IdentifyParamCard
                v-for="(item, i) in formData.identifyParams"
                :key="i"
                :params="item"
                :index="i"
                :show-remove="formData.identifyParams.length > 1"
                @remove="onRemoveParam"
              />
            </template>
          </div>
        </a-col>
        <a-col :span="24">
          <FormItem
            :label="$t('sys.onlineForm.extraPromptWords')"
            name="extraPrompt"
            :inline="false"
          >
            <a-textarea
              :rows="3"
              v-model:value="formData.extraPrompt"
              :placeholder="$t('sys.inputText')"
            />
          </FormItem>
        </a-col>
      </a-row>
    </a-form>
  </div>
</template>

<script lang="ts" setup name="ai-tmpl-form">
  import {
    DeviceLink,
    AITooltips,
    DenoiseMethodOptions,
    BinarizeMethodOptions,
    useFormTmplConfig,
  } from '@gct/nocode-base';
  import { computed, ref } from 'vue';
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import { FormInstance } from 'ant-design-vue';
  import { DecimalSlider, IconTooltip } from '/@online-form/components/ui';
  import IdentifyParamCard from './identify-param-card.vue';

  const c = useFormTmplConfig().injectController();

  const props = withDefaults(
    defineProps<{
      tmpl: DeviceLink.AIOcrTmpl;
    }>(),
    {
      tmpl: undefined,
    },
  );

  const typeOptions = computed(() => {
    const types = [];
    if (c.state.IOTPermission) {
      types.push(DeviceLink.TmplTypeEnum.DEVICE_INTERCONNECTION);
    }
    if (c.state.OCRPermission) {
      types.push(DeviceLink.TmplTypeEnum.AI_OCR);
    }
    return types.map((i) => {
      return {
        value: i,
        label: $t('sys.edhr.DeviceLinkTmplTypeEnum.' + i),
      };
    });
  });

  const formData = computed({
    get() {
      return props.tmpl;
    },
    set(v) {
      Object.assign(props.tmpl, v);
    },
  });

  const formRef = ref<FormInstance>();

  const validate = async () => {
    await formRef.value?.validate();
  };

  const addParam = () => {
    if (!formData.value.identifyParams) {
      formData.value.identifyParams = [];
    }
    formData.value.identifyParams.push({
      prompt: undefined,
      formField: undefined,
    } as any);
  };

  const onRemoveParam = (index: number) => {
    formData.value.identifyParams?.splice(index, 1);
  };

  defineExpose({
    validate,
  });
</script>

<style lang="less" scoped>
  .ai-tmpl-form {
    &__add-param {
      line-height: 20px;
      padding: 0;
      height: 20px;
      .gct-iconfont {
        margin-right: 6px;
      }
    }

    // :deep(.icon-tooltip__icon) {
    //   font-size: 16px;
    //   color: #a6a6a6;
    // }

    &__table-wrapper {
      border-top: 1px solid #e0e3eb;
      padding-top: 24px;
      margin-top: 24px;
    }

    // 隐藏表单项的内容的情况
    .hidden-content {
      :deep(.form-item__label) {
        margin-bottom: 0;
      }
      :deep(.form-item__content) {
        display: none;
      }
    }
  }
</style>
