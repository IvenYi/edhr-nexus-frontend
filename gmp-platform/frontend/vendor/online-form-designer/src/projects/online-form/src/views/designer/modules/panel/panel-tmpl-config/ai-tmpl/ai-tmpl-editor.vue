<template>
  <TmplCard class="ai-tmpl-editor" :type="DeviceLink.TmplTypeEnum.AI_OCR">
    <div class="px-8px py-12px">
      <FormItem isFirst :label="'模板名称'" required :inline="false">
        <a-input
          v-model:value="formState.name"
          :placeholder="$t('sys.inputText')"
          :maxLength="16"
        />
      </FormItem>
      <FormItem :label="'设备/仪器名称'" :inline="false">
        <a-input v-model:value="formState.deviceName" :placeholder="$t('sys.inputText')" />
      </FormItem>
      <FormItem>
        <template #label>
          {{ $t('sys.onlineForm.denoise')
          }}<IconTooltip
            class="ml-4px"
            :content="AITooltips.denoise.content"
            :title="AITooltips.denoise.title"
          />
        </template>
        <div class="flex justify-end">
          <a-switch v-model:checked="formState.enableDenoise" />
        </div>
      </FormItem>
      <FormItem v-if="formState.enableDenoise" :label="$t('sys.onlineForm.denoiseMethod')">
        <div class="flex justify-end">
          <a-select
            class="ai-tmpl-editor__select"
            v-model:value="formState.denoiseMethod"
            :options="DenoiseMethodOptions"
          />
        </div>
      </FormItem>
      <FormItem>
        <template #label>
          {{ $t('sys.onlineForm.contrastEnhancement')
          }}<IconTooltip
            class="ml-4px"
            :content="AITooltips.contrast.content"
            :title="AITooltips.contrast.title"
          />
        </template>
        <div class="flex justify-end">
          <a-switch v-model:checked="formState.enableContrast" />
        </div>
      </FormItem>
      <DecimalSlider
        v-if="formState.enableContrast"
        v-model="formState.contrastAlpha"
        :step="0.1"
        :precision="1"
        :max="3"
        :min="1"
      />
      <FormItem>
        <template #label>
          {{ $t('sys.onlineForm.binarization')
          }}<IconTooltip
            class="ml-4px"
            :content="AITooltips.binarize.content"
            :title="AITooltips.binarize.title"
          />
        </template>
        <div class="flex justify-end">
          <a-switch v-model:checked="formState.enableBinarize" />
        </div>
      </FormItem>
      <FormItem v-if="formState.enableBinarize" :label="$t('sys.onlineForm.binarizationMethod')">
        <div class="flex justify-end">
          <a-select
            class="ai-tmpl-editor__select"
            v-model:value="formState.binarizeMethod"
            :options="BinarizeMethodOptions"
          />
        </div>
      </FormItem>
    </div>
    <div class="px-8px py-12px ai-tmpl-editor__border-top">
      <a-button type="dashed" class="ai-tmpl-editor__add-param" @click="addParam">
        <i class="gct-iconfont icon-a-btn_add2"></i>
        {{ $t('sys.onlineForm.addRecognitionParameter') }}
      </a-button>
      <template v-if="formState.identifyParams?.length">
        <IdentifyParamCard
          v-for="(item, i) in formState.identifyParams"
          :key="i"
          :params="item"
          :index="i"
          :show-remove="formState.identifyParams.length > 1"
          @remove="onRemoveParam"
        />
      </template>
      <FormItem :label="'额外提示词'" :inline="false">
        <a-textarea
          :rows="3"
          v-model:value="formState.extraPrompt"
          :autosize="{ minRows: 3, maxRows: 3 }"
          :placeholder="$t('sys.inputText')"
        />
      </FormItem>
      <a-popover placement="bottomLeft" overlayClassName="ai-tmpl-editor__preview-popover">
        <template #content>
          {{ previewPrompt }}
        </template>
        <div class="ai-tmpl-editor__preview-btn mt-12px">
          <i class="gct-iconfont icon-yulantishici"></i>{{ $t('sys.onlineForm.previewFullPrompt') }}
        </div>
      </a-popover>
    </div>
  </TmplCard>
</template>

<script lang="ts" setup name="ai-tmpl-editor">
  import {
    DeviceLink,
    useFormModel,
    AITooltips,
    DenoiseMethodOptions,
    BinarizeMethodOptions,
    DeviceLinkTmplUtil,
  } from '@gct/nocode-base';
  import TmplCard from '../common/tmpl-card.vue';
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import { computed } from 'vue';
  import { DecimalSlider, IconTooltip } from '/@online-form/components/ui';

  import IdentifyParamCard from './identify-param-card.vue';

  const { injectController } = useFormModel();
  const c = injectController();

  const props = withDefaults(
    defineProps<{
      value: Partial<DeviceLink.AIOcrTmpl>;
    }>(),
    {},
  );

  const formState = computed(() => props.value);

  const previewPrompt = computed(() => {
    return DeviceLinkTmplUtil.calcEntirePrompt(props.value as any);
  });

  const addParam = () => {
    if (!formState.value.identifyParams) {
      formState.value.identifyParams = [];
    }
    formState.value.identifyParams.push({
      prompt: undefined,
      formField: undefined,
    } as any);
  };

  const onRemoveParam = (index: number) => {
    formState.value.identifyParams?.splice(index, 1);
  };
</script>

<style lang="less" scoped>
  .ai-tmpl-editor {
    &__select.ant-select {
      width: 120px;
    }

    &__border-top {
      border-top: 1px solid #f2f5f8;
    }

    &__add-param {
      width: 100%;
      border-radius: 4px 4px 4px 4px;
      font-weight: 400;
      font-size: 12px;
      color: var(--ant-primary-color);
      border-color: rgba(2, 106, 200, 0.3);
      &:hover {
        color: rgba(from var(--ant-primary-color) r g b / 80%);
      }
      .gct-iconfont {
        font-size: 12px;
        margin-right: 4px;
      }
    }

    // 预览提示词按钮
    &__preview-btn {
      cursor: pointer;
      color: var(--ant-primary-color);
      font-size: 12px;

      .gct-iconfont {
        margin-right: 4px;
        font-size: 14px;
      }

      &:hover {
        color: rgba(from var(--ant-primary-color) r g b / 80%);
      }
    }

    :deep(.icon-tooltip__icon) {
      transform: translateY(0.5px);
      display: inline-block;
    }
  }
</style>

<style lang="less">
  .ai-tmpl-editor__preview-popover {
    padding-top: 4px !important;

    .ant-popover-arrow {
      display: none;
    }

    .ant-popover-inner {
      overflow: auto;
    }

    .ant-popover-inner-content {
      white-space: break-spaces;
      max-width: 208px;
      max-height: 280px;
      padding: 12px;
      overflow: auto;
    }
  }
</style>
