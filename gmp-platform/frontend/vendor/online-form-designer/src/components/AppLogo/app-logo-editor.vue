<template>
  <div :class="[ns.b()]">
    <a-form-item
      :label="label"
      :name="fieldMap.type"
      :rules="[
        { required: true, message: t('sys.chooseTextTip', { name: label }) + t('sys.type') },
      ]"
    >
      <a-radio-group
        v-model:value="formState[fieldMap.type]"
        :options="logoTypeOptions"
        @change="onTypeChange"
      />
    </a-form-item>

    <!-- 图标类型 -->
    <a-form-item
      v-if="formState[fieldMap.type] === AppLogoTypeEnum.Icon"
      label=" "
      :colon="false"
      :name="fieldMap.icon"
      :rules="[
        { required: true, message: t('sys.chooseTextTip', { name: label }), trigger: 'change' },
      ]"
    >
      <IconNextPicker
        v-model:value="formState[fieldMap.icon]"
        show-color
        show-background
        v-model:color="formState[fieldMap.iconColor]"
        v-model:background="formState[fieldMap.iconBgColor]"
      />
    </a-form-item>

    <!-- 图片类型 -->
    <template v-else-if="formState[fieldMap.type] === AppLogoTypeEnum.Image">
      <a-form-item
        :label="t('sys.tenant.appLogo')"
        :name="fieldMap.image"
        :rules="[{ required: true, message: t('sys.chooseTextTip', { name: label }) }]"
      >
        <simple-upload
          v-model:file="formState[fieldMap.image]"
          :tip="t('sys.developer.appCenter.uploadTip')"
          :width="208"
          :height="40"
        />
      </a-form-item>
    </template>

    <!-- <AppLogoPure
      :type="formState[fieldMap.type]"
      :icon="formState[fieldMap.icon]"
      :icon-bg-color="formState[fieldMap.iconBgColor]"
      :icon-color="formState[fieldMap.iconColor]"
      :image="formState[fieldMap.image]"
      :size="48"
      :icon-size="32"
    /> -->
  </div>
</template>

<script lang="ts" setup name="app-logo-editor">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { computed } from 'vue';
  import SimpleUpload from '/@/components/SimpleUpload/index.vue';
  import { AppLogoTypeEnum, AppLogoValue } from './constant';
  import { IconNextPicker } from '../Icon';

  const { t } = useI18n();
  const ns = useNamespace('app-logo-editor');

  const logoTypeOptions = [
    { label: t('sys.developer.appCenter.appIcon'), value: AppLogoTypeEnum.Icon },
    { label: t('sys.developer.appCenter.appImage'), value: AppLogoTypeEnum.Image },
  ];

  const props = withDefaults(
    defineProps<{
      /** 表单项label */
      label: string;
      /** 存储的数据对象 */
      value: IData;
      /** 字段映射 */
      fieldMap?: Record<keyof AppLogoValue, string>;
    }>(),
    {
      fieldMap: () => ({
        type: 'type',
        icon: 'icon',
        iconColor: 'iconColor',
        iconBgColor: 'iconBgColor',
        image: 'image',
      }),
    },
  );

  const formState = computed({
    get() {
      return props.value;
    },
    set(v) {
      Object.assign(props.value, v);
    },
  });

  const onTypeChange = (val) => {
    if (val === AppLogoTypeEnum.Icon) {
      formState.value[props.fieldMap.image] = '';
    } else {
      formState.value[props.fieldMap.icon] = '';
      formState.value[props.fieldMap.iconColor] = '';
      formState.value[props.fieldMap.iconBgColor] = '';
    }
  };
</script>

<style lang="scss" scoped>
  $app-logo-editor: ();

  @include b(app-logo-editor) {
    @include set-component-css-var(app-logo-editor, $app-logo-editor);
  }
</style>
