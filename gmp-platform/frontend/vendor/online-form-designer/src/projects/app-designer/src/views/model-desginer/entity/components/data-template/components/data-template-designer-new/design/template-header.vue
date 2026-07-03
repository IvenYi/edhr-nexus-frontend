<template>
  <div class="template-designer-new-heander bg-[#FFFFFF] h64px relative">
    <div class="left ks-row-middle text-[#000000] px8px ml8px h100%">
      <i class="iconfont icon-a-Leftarrow cursor-pointer" @click="emit('on-back')"></i>
      <div class="left-title ml16px">
        <div class="lh18px text-[#5A5F6B] text-[12px]">
          {{ modelInfo.name }}
          <span class="mx4px">/</span>
          {{ t('sys.appDesigner.dataTemp') }}
        </div>
        <div v-if="!isEdit" class="text-[#1A1D23] ks-row w165px text-[#14px]" @click="onEditName">
          <div class="ell max140px">{{ formState.name || '未命名模板名称' }}</div>
          <i class="iconfont icon-bianji text-[#A6A6A6] ml8px cursor-pointer h22px edit-icon"></i>
        </div>
        <div v-else class="relative">
          <a-input
            ref="inputRef"
            v-model:value="formState.name"
            :bordered="false"
            style="width: 165px"
          />
          <div
            v-if="formState.name?.trim().length > 100"
            class="error-gct error-tip px10px bg-[#FEECEC]"
            >{{ t('sys.designView.title.errorMsg') }}</div
          >
        </div>
      </div>
    </div>
    <div class="right mr16px w100px ks-row-middle h100%" style="justify-content: flex-end">
      <div v-if="step === 1" @click="emit('on-next')">
        <a-button type="primary">{{ t('sys.app.nextStep') }}</a-button>
      </div>
      <div v-else @click="onSave">
        <a-button type="primary" :disabled="!modelColumns.length" :loading="loadingBtn">
          <i
            class="gct-iconfont icon-icon_baocun_btn"
            style="font-size: 14px; margin-right: 4px"
          ></i>
          {{ t('sys.saveText') }}
        </a-button>
      </div>
    </div>
    <div class="center ks-row-center-middle ks-col h100% w100%">
      <DesignStepCheck
        :steps="steps"
        :currentStep="step"
        @stepChange="(step) => emit('update:step', step)"
      />
      <!-- <div
        class="step-item ks-row-middle"
        :class="[step === 1 && 'active']"
        @click="emit('update:step', 1)"
      >
        <i class="iconfont icon-a-1quan mr4px"></i>
        {{ t('sys.appDesigner.basicInformation') }}
      </div>
      <div
        class="step-item ks-row-middle"
        :class="[step === 2 && 'active']"
        @click="emit('on-next')"
      >
        <i class="iconfont icon-a-2quan mr4px"></i>
        {{ t('sys.appDesigner.templateConfig') }}
      </div> -->
    </div>
  </div>
</template>
<script setup lang="ts">
  import { computed, nextTick, ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { onClickOutside } from '@vueuse/core';
  import { useDesigner } from '../hook/useDesigner';
  // import { DesignStepCheck } from 'packages/runtime-web-next/src/components/design-step-check/design-step-check';
  import { DesignStepCheck, IViewStep } from '@gct/runtime-web-next';

  const props = defineProps<{
    data: Object | undefined;
    model: Object;
    step: number;
    form: object;
  }>();

  const { t } = useI18n();

  // 设计步骤
  const steps: IViewStep[] = [
    {
      tag: 1,
      name: t('sys.cardDesign.step.info'),
    },
    {
      tag: 2,
      name: t('sys.appDesigner.templateConfig'),
    },
  ];

  const emit = defineEmits(['on-save', 'on-save-basic', 'on-next', 'update:step', 'on-back']);
  const { modelColumns } = useDesigner();

  const isEdit = ref(false);
  const inputRef = ref();
  const cloneName = ref();
  const loadingBtn = ref(false);

  const modelInfo = computed({
    get() {
      DesignStepCheck;
      return props.model;
    },
    set(value) {
      Object.assign(props.model, value);
    },
  });

  const formState = computed({
    get() {
      return props.form;
    },
    set(value) {
      Object.assign(props.form, value);
    },
  });

  const onEditName = () => {
    isEdit.value = true;
    cloneName.value = formState.value?.name;
    nextTick(() => {
      inputRef.value?.select();
    });
  };

  const onSave = () => {
    loadingBtn.value = true;
    emit('on-save', loadingBtn);
  };

  onClickOutside(inputRef, () => {
    if (formState.value?.name?.trim().length > 100) {
      inputRef.value?.select();
      return;
    }
    isEdit.value = false;
    const val = formState.value.name ? formState.value.name.trim() : '';
    if (props.step === 2) {
      formState.value.name = val ? val : cloneName.value;
      if (val && val !== cloneName.value) {
        // emit('on-save-basic');
      }
    }
  });
</script>
<style lang="less" scoped>
  .template-designer-new {
    &-heander {
      .left {
        position: absolute;
        top: 0;
        left: 0;
        :deep(.ant-input-affix-wrapper) {
          padding: 0;
        }

        .error-tip {
          position: absolute;
          bottom: -26px;
          left: 0;
          border-radius: 4px;
        }
        .edit-icon {
          &:hover {
            color: #ffffff;
          }
        }
      }
      .right {
        position: absolute;
        right: 0;
        top: 0;

        :deep(.ant-btn) {
          padding: 3px 12px;
        }
      }
      .step-item {
        color: rgba(255, 255, 255, 0.64);
        padding: 5px 12px;
        border-radius: 4px;
        cursor: pointer;
        width: fit-content;

        &.active {
          background-color: var(--ant-primary-color);
          color: #ffffff;
        }

        &.disabled {
          background-color:;
        }

        & + .step-item {
          margin-left: 40px;
          position: relative;

          &::before {
            content: ' ';
            display: block;
            height: 1px;
            width: 24px;
            background: rgba(255, 255, 255, 0.64);
            position: absolute;
            left: -32px;
            top: 16px;
            cursor: auto;
          }
        }
      }
    }
  }
</style>
