<template>
  <a-spin :spinning="spinning">
    <div class="w-800px pt-30px ml-auto mr-auto">
      <a-form
        ref="formRef"
        :model="formState"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
        autocomplete="off"
      >
        <a-form-item
          :label="t('sys.appDesigner.appName')"
          name="name"
          :rules="[{ required: true }]"
        >
          <a-input v-model:value="formState.name" :maxlength="32" show-count />
        </a-form-item>

        <a-form-item
          :label="t('sys.appDesigner.appLogo')"
          :name="['logoConfig', 'type']"
          :rules="[{ required: true, message: t('sys.appDesigner.appLogoRules') }]"
        >
          <a-radio-group v-model:value="formState.logoConfig!.type">
            <a-radio :value="LogoEnum.ICON">{{ t('sys.appDesigner.appLogoIcon') }}</a-radio>
            <a-radio :value="LogoEnum.IMAGE">{{ t('sys.appDesigner.appLogoImage') }}</a-radio>
          </a-radio-group>
        </a-form-item>

        <!-- 图标类型 -->
        <a-form-item
          v-if="formState.logoConfig!.type === LogoEnum.ICON"
          label=" "
          :colon="false"
          :name="['logoConfig', 'logo']"
          :rules="[
            { required: true, message: t('sys.appDesigner.appLogoRules'), trigger: 'change' },
          ]"
        >
          <IconNextPicker
            v-model:value="formState.logoConfig!.logo"
            show-color
            show-background
            v-model:color="formState.logoConfig!.logoColor"
            v-model:background="formState.logoConfig!.logoBgColor"
          />
        </a-form-item>

        <!-- 图片类型 -->
        <template v-else-if="formState.logoConfig!.type === LogoEnum.IMAGE">
          <a-form-item
            :label="t('sys.appDesigner.appLogo')"
            :name="['logoConfig', 'image']"
            :rules="[{ required: true, message: t('sys.appDesigner.appLogoRules') }]"
          >
            <simple-upload
              v-model:file="formState.logoConfig!.image"
              :tip="t('sys.appDesigner.appLogoImageTip')"
            />
          </a-form-item>

          <a-form-item
            :label="t('sys.appDesigner.appLogoThumbnail')"
            :name="['logoConfig', 'thumbnail']"
            :rules="[{ required: true }]"
          >
            <simple-upload
              v-model:file="formState.logoConfig!.thumbnail"
              :tip="t('sys.appDesigner.appLogoTip')"
            />
          </a-form-item>
        </template>

        <a-form-item :label="t('sys.description')" name="description">
          <a-textarea
            class="--resize-none"
            v-model:value="formState.description"
            :maxlength="120"
            show-count
          />
        </a-form-item>

        <a-form-item :label="t('sys.appDesigner.appPageIcon')" name="pageIcon">
          <simple-upload
            v-model:file="formState.pageIcon"
            :tip="t('sys.appDesigner.appPageIconTip')"
          />
        </a-form-item>

        <a-form-item label=" " :colon="false">
          <a-button class="mr-20px" type="primary" @click="handleOk">{{ t('sys.ok') }}</a-button>
          <a-button @click="handleCancel">{{ t('sys.cancel') }}</a-button>
          <!-- <a-button class="ml-20px" @click="handleExpr">表达式</a-button> -->
        </a-form-item>
      </a-form>
    </div>
  </a-spin>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { LogoEnum } from '../types/enum';
  import SimpleUpload from '/@/components/SimpleUpload/index.vue';
  import { useWebSettingStore } from '/@/store/modules/webSetting';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { IconNextPicker } from '/@/components/Icon';
  import { cloneDeep } from 'lodash-es';
  import { BasicConfigResponse } from '/@/apis/gct-apaas/model/index';
  // import { useExpression } from '/@/components/Expression/hooks/useExpressionCalc';
  // const { calculate } = useExpression();
  // calculate('ISEMPTY(undefined,a+b-c.a+d["a"])', {});
  // console.log(identify('ISEMPTY(undefined,1,a,Math.PI,null)'));

  const { t } = useI18n();

  const { createMessage } = useMessage();

  const { loadWebSetting, webSetting, updateWebSetting, genDefaultWebSetting } =
    useWebSettingStore();

  const spinning = ref<boolean>(false);

  const formRef = ref();

  const formState = ref<BasicConfigResponse>(genDefaultWebSetting());

  onMounted(async () => {
    formState.value = await loadWebSetting();
  });

  const handleOk = async () => {
    spinning.value = true;
    try {
      await formRef.value.validate();
      await updateWebSetting(formState.value);
      spinning.value = false;
      createMessage.success(t('sys.saveSuccess'));
    } catch (err) {
      spinning.value = false;
    }
  };
  const handleCancel = () => {
    formState.value = cloneDeep(webSetting);
  };
</script>

<style lang="less" scoped></style>
