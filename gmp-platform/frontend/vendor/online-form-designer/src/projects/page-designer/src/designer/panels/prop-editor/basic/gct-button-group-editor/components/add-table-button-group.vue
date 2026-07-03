<template>
  <div class="pt40px pb40px">
    <a-form ref="formRef" :model="formState" autocomplete="off">
      <a-form-item
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
        class="ks-col"
        :label="$t('sys.model.displayLocation')"
        name="position"
      >
        <a-form-item-rest>
          <div
            v-for="(i, index) in positionOption"
            :key="index"
            @click="changeOpt(i)"
            class="position-item mr15px cursor-pointer"
          >
            <img :src="i.icon" alt="" :class="{ active: formState.position === i.value }" />
            <div class="text-center mt10px">
              <a-radio :checked="formState.position === i.value">{{ i.label }}</a-radio>
            </div>
          </div>
        </a-form-item-rest>
      </a-form-item>
      <a-form-item
        v-if="formState.position === ButtonOpeEnum.SINGLELINE_RDO"
        :label="$t('sys.pageDesigner.specificLocation')"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-radio-group
          @change="formState.type = []"
          v-model:value="formState.versionMode"
          :options="[
            { label: $t('sys.pageDesigner.parentVersion'), value: RdoButtonOpeEnum.parentVersion },
            { label: $t('sys.pageDesigner.childVersion'), value: RdoButtonOpeEnum.childVersion },
          ]"
        />
      </a-form-item>
      <a-form-item
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
        class="ks-col"
        :label="$t('sys.pageDesigner.selectButton')"
        name="type"
        :rules="[{ required: true, message: $t('sys.chooseText') + $t('sys.pageDesigner.button') }]"
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
          <a-select-option :value="i.type" v-for="i in buttonOptions" :key="i">
            {{ $t(i.props.title) }}
          </a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watchEffect, computed, reactive } from 'vue';
  import { IModal, ButtonOpeEnum, RdoButtonOpeEnum } from '@gct/runtime';
  import { BaseButton } from '/@page-designer/types/web';
  import { cloneDeep } from 'lodash-es';
  import { createWidgetByType } from '/@page-designer/schema/utils';
  import { FormComponents } from '/@page-designer/enum';

  const defProps = defineProps<{
    modal: IModal;
    headerRightButton: FormComponents[];
    headerLeftButton: FormComponents[];
    columnsButton: FormComponents[];
    columnsRdoButton?: [FormComponents[], FormComponents[]];
    position?: ButtonOpeEnum;
  }>();
  const formRef = ref(null);
  const formState = reactive({
    type: [],
    position: defProps.position ?? ButtonOpeEnum.HEAD,
    versionMode: RdoButtonOpeEnum.parentVersion,
  });
  defProps.modal.ok = async () => {
    await formRef.value!.validate();
    const data = buttonOptions.value.filter((i) => formState.type.includes(i.type));
    return {
      ok: true,
      data: {
        data: cloneDeep(data),
        position: formState.position,
        versionMode: formState.versionMode,
      },
    };
  };

  const buttonOptions = computed<BaseButton[]>(() => {
    let list = opeMap[formState.position];
    if (formState.position === ButtonOpeEnum.SINGLELINE_RDO) {
      list = list[formState.versionMode];
    }
    return list.map((i) => {
      const widget = createWidgetByType(i);
      if ([ButtonOpeEnum.SINGLELINE, ButtonOpeEnum.SINGLELINE_RDO].includes(formState.position)) {
        widget.props.type = 'link';
      }
      return widget;
    });
  });
  const opeMap = {
    [ButtonOpeEnum.SINGLELINE]: defProps.columnsButton || [],
    [ButtonOpeEnum.HEAD]: defProps.headerRightButton || [],
    [ButtonOpeEnum.BATCH]: defProps.headerLeftButton || [],
    [ButtonOpeEnum.SINGLELINE_RDO]: defProps.columnsRdoButton,
  };
  const positionOption = [
    {
      label: $t('sys.pageDesigner.headerButton'),
      value: ButtonOpeEnum.HEAD,
      icon: '/assets/svg/header-button.svg',
      hidden: () => {
        return defProps.headerRightButton?.length;
      },
    },
    {
      label: $t('sys.pageDesigner.singleLineButton'),
      value: ButtonOpeEnum.SINGLELINE,
      icon: '/assets/svg/single-button.svg',
      hidden: () => {
        return defProps.columnsButton?.length;
      },
    },
    {
      label: $t('sys.pageDesigner.singleLineButton'),
      value: ButtonOpeEnum.SINGLELINE_RDO,
      icon: '/assets/svg/single-button.svg',
      hidden: () => {
        return defProps.columnsRdoButton;
      },
    },
    {
      label: $t('sys.pageDesigner.batchButton'),
      value: ButtonOpeEnum.BATCH,
      icon: '/assets/svg/batch-button.svg',
      hidden: () => {
        return defProps.headerLeftButton?.length;
      },
    },
  ].filter((i) => i.hidden());

  function changeOpt(i) {
    formState.position = i.value;
    formState.type = [];
  }
</script>
<style scoped lang="less">
  .position-item {
    display: inline-block;

    img {
      border: 1px solid #e8ebf0;
      border-radius: 4px;
    }

    .active {
      border: 1px solid var(--ant-primary-color);
    }
  }
</style>
