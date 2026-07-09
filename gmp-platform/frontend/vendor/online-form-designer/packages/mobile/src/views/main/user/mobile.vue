<template>
  <van-form ref="form" label-align="top">
    <van-field
      v-model="formData.country"
      name="country"
      readonly
      :label="$t('区号')"
      :placeholder="$t('sys.inputText') + $t('区号')"
      @click="show = true"
      :rules="[
        {
          required: true,
          message: $t('sys.inputText') + $t('区号'),
        },
      ]"
    />
    <van-field
      v-model="formData.mobile"
      name="mobile"
      :label="$t('sys.mobile')"
      :placeholder="$t('sys.mobile') + $t('sys.mobile')"
      :rules="[
        {
          validator: () => checkPhone(),
          trigger: ['onChange', 'onBlur'],
        },
      ]"
    />
  </van-form>
  <div class="pb40px mt20px pl10px pr10px">
    <van-button
      @click="onSubmit"
      block
      type="primary"
      native-type="submit"
      :disabled="signDisabled"
      :loading="loading"
      >保 存</van-button
    >
  </div>
  <van-popup v-model:show="show" position="bottom" :style="{ height: '30%' }">
    <van-picker :columns="countryList" @cancel="show = false" @confirm="onPickerConfirm" />
  </van-popup>
</template>
<script setup lang="ts">
  import type { FormInstance } from 'vant';
  import { UserData } from '@mobile/stores/loginHooks';
  import { postUserSettings } from '/@/apis/gct-platform/UserController';
  import { countriesData } from '/@/components/VueCountryIntl/src/data';
  import { metadata, PhoneNumberUtil } from 'google-libphonenumber';

  const phoneUtil = PhoneNumberUtil.getInstance();

  const form = ref<FormInstance>();
  const router = useRouter();

  const formData = reactive({
    mobile: '',
    country: '',
  });

  const show = ref(false);
  const onSubmit = async () => {
    await form.value.validate();
    await postUserSettings({ ...UserData.value, ...formData });
    router.back();
  };
  const countryList = computed(() => {
    return countriesData.map((i) => {
      return {
        text: i.nameCN + i.label,
        value: i.label,
      };
    });
  });
  const checkPhone = () => {
    if (!formData.mobile) {
      return true;
    }
    if (
      !Number.isFinite(+formData.mobile) ||
      formData.mobile.length === 1 ||
      formData.mobile.length >= 17
    ) {
      return $t('sys.phoneError');
    }
    if (!metadata.countryCodeToRegionCodeMap[+formData.country?.replace('+', '')]) {
      return true;
    }
    const number = phoneUtil.parseAndKeepRawInput(
      formData.mobile,
      metadata.countryCodeToRegionCodeMap[+formData.country?.replace('+', '')][0],
    );
    const isValite = phoneUtil.isValidNumber(number);

    if (!isValite) {
      return $t('sys.phoneError');
    }
    return true;
  };

  const onPickerConfirm = ({ selectedOptions }) => {
    show.value = false;
    formData.country = selectedOptions[0].value;
  };

  onMounted(() => {
    formData.mobile = UserData.value.mobile;
    formData.country = UserData.value.country;
  });
</script>
<style scoped lang="less"></style>
