<template>
  <van-form ref="form" label-align="top">
    <van-field
      v-model="formData.fullname"
      name="email"
      :label="$t('sys.fullname')"
      :placeholder="$t('sys.inputText') + $t('sys.fullname')"
      :rules="[
        {
          required: true,
          message: $t('sys.inputText') + $t('sys.fullname'),
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
</template>
<script setup lang="ts">
  import type { FormInstance } from 'vant';
  import { UserData } from '@mobile/stores/loginHooks';
  import { postUserSettings } from '/@/apis/gct-platform/UserController';

  const form = ref<FormInstance>();
  const router = useRouter();

  const formData = reactive({
    fullname: '',
  });

  const onSubmit = async () => {
    await form.value.validate();
    await postUserSettings({ ...UserData.value, ...formData });
    router.back();
  };
  onMounted(() => {
    formData.fullname = UserData.value.fullname;
  });
</script>
<style scoped lang="less"></style>
