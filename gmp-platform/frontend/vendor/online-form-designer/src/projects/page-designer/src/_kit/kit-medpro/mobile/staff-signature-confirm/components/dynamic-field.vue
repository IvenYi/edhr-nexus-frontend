<template>
  <van-field
    v-model="item[fieldKey]"
    :border="false"
    :label="field.title"
    :name="name"
    :required="required"
    readonly
    placeholder="请选择"
    is-link
    :rules="fieldRules"
    @click="onFieldClick()"
  >
    <template #input>
      <div v-html="fieldLabel(item)"></div>
    </template>
  </van-field>

  <van-popup v-model:show="showPicker" destroy-on-close position="bottom" teleport="body">
    <component
      :is="defComponent"
      v-model="item[fieldKey]"
      :staffFields="staffFields"
      @confirm="onPickerConfirm"
      @cancel="onPickerCancel"
    >
      <template #default></template>
    </component>
  </van-popup>
</template>

<script lang="ts" setup>
  import { ref, toRef, computed, defineAsyncComponent, } from 'vue';
  import type { Component } from 'vue';
  import { FIELD_TYPE } from '/@/enums/appEnum';

  const props = defineProps<{
    dataSource: any[];
    field: any;
    item: any;
    name: string;
    required: boolean;
    staffFields?: string;
  }>();

  const pickerOptions = ref();
  const showPicker = ref(false);

  const defComponent = computed(() => {
    const fieldType = props.field?.type?.replaceAll?.('_', '-');
    const component = registerComponent().get(fieldType);
    return component;
  });

  const fieldKey = computed(() => props.field?.dataIndex);

  const fieldLabel = computed(() => (item) => {
    if (!item[fieldKey.value]) {
      return `<span style="color: var(--van-text-color-3)">请选择</span>`
    }
    if ([FIELD_TYPE.USER].includes(fieldKey.value)) {
      const fieldItem = pickerOptions.value?.find((field) => field.value == item[fieldKey.value]);
      return fieldItem?.text;
    }

    return item[fieldKey.value];
  });

  const fieldRules = toRef(() => {
    const rules: any = [];
    if (props.required) {
      rules.push({ required: true, message: '当前值不能为空' });
    }
    // USER
    if (props.field.type === FIELD_TYPE.USER) {
      rules.push(
        {
          message: '该签名账号重复',
          validator: (value, rule) => validateUserName(value, rule),
        },
        {
          message: '签名信息未通过',
          validator: (value, rule) => validateSignPassed(value, rule),
        },
      );
    }
    return rules;
  });

  function registerComponent() {
    const modules: Record<string, () => Promise<Component>> = import.meta.glob(
      `./picker/**/*-picker.{vue,tsx}`,
    );
    const pickerMap = new Map();
    Object.entries(modules).forEach(([path, value]) => {
      const fileNameWithExtension = path.split('/').pop()!;
      const fileNameWithoutExtension = fileNameWithExtension
        .split('-picker')
        .slice(0, -1)
        .join('.');
      pickerMap.set(fileNameWithoutExtension, defineAsyncComponent(value));
    });
    return pickerMap;
  }

  function onFieldClick() {
    showPicker.value = true;
  }

  function onPickerConfirm(value, options) {
    console.log(value, options, 'picker field value');
    showPicker.value = false;
    pickerOptions.value = options;
  }

  function onPickerCancel(value: boolean) {
    showPicker.value = value;
  }

  // 校验用户是否重复
  function validateUserName(value, rule) {
    const duplicateNames = props.dataSource.filter(f => f.user === value);
    return !(duplicateNames?.length > 1);
  }
  // 校验签名是否确认
  function validateSignPassed(value, rule) {
    const userInfo = props.dataSource.find((e) => e.user === value);
    if (!userInfo) return true;

    return userInfo.hasValid && userInfo.validatePassed;
  }
</script>
