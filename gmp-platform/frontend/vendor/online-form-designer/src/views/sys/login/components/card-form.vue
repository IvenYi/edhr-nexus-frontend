<template>
  <div class="card-form flex justify-center items-center w-full">
    <div class="card-wrap__card w-full">
      <img :src="statusInfo.src" :width="status === 'NORMAL' ? 406 : 84" alt="card-form" class="card-form__card__img">
      <div :class="['card-form__card__title', status === 'NORMAL' ? 'mt-15px mb-16px' : '']">
        {{ statusInfo.title }}
      </div>
    </div>
    
    <Form
      ref="formRef"
      v-show="true"
      class="card-form__form"
      :model="formData"
    >
      <FormItem name="cardNo" class="enter-x">
        <Input
          ref="inputRef"
          v-model:value="formData.cardNo"
          :disabled="isSubmitting"
          @keyup="onCardInput"
        />
      </FormItem>
    </Form>
  </div>
</template>

<script setup lang="ts" name="CardForm">
  import { computed, ref, reactive, onMounted, nextTick, onUnmounted} from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useUserStore } from '/@/store/modules/user';
  import { Form, Input } from 'ant-design-vue';
  import { LoginTypeEnum } from '/@/hooks/platform/constants';
  import picSuccess from '@/assets/svg/pic_success.svg';
  import picJinggao from '@/assets/svg/pic_jinggao.svg';
  import picFail from '@/assets/svg/pic_fail.svg';
  import picShuaka from '@/assets/svg/pic_shuaka.svg';

  const props = defineProps<{
    status: string;
  }>();

  const { t } = useI18n();
  const userStore = useUserStore();
  const FormItem = Form.Item;
  const formRef = ref();
  const inputRef = ref();
  const status = ref('NORMAL');
  /** 读卡登录请求进行中，禁止再次刷卡 / 重复调接口 */
  const isSubmitting = ref(false);

  const formData = reactive({
    cardNo: '',
  });

  const STATUS_LIST = {
    NORMAL: {
      src: picShuaka,
      title: t('sys.cardLoginTips'),
    },
    SUCCESS: {
      src: picSuccess,
      title: t('sys.cardLoginSuccess'),
    },
    WARNING: {
      src: picJinggao,
      title: '',
    },
    ERROR: {
      src: picFail,
      title: t('sys.cardLoginFail'),
    },
  }

  const statusInfo = computed(() => {
    return STATUS_LIST[status.value] || STATUS_LIST.NORMAL;
  });

  const login = async (code: string|number) => {
    if (isSubmitting.value) {
      return;
    }
    isSubmitting.value = true;
    try {
      await userStore.login({
        password: '-',
        username: '-',
        code: code.toString(),
        authCode: LoginTypeEnum.CARD,
        mode: 'none',
      }, () => {
        status.value = 'SUCCESS';
      });
    } catch (error) {
      if (status.value === 'SUCCESS') {
        status.value = 'NORMAL';
        return;
      };
      STATUS_LIST.WARNING.title = error.subMessage || t('sys.cardLoginNoUser');
      status.value = 'WARNING';
      setTimeout(() => {
        status.value = 'NORMAL';
      }, 5000);
    } finally {
      isSubmitting.value = false;
      formData.cardNo = '';
      nextTick(() => {
        inputRef.value?.focus?.();
      });
    }
  };

  const timer = setInterval(() => {
    if (inputRef.value) {
      inputRef.value?.focus?.();
    }
  }, 1000);

  const onCardInput = (e: KeyboardEvent) => {
    // 刷卡机最后一定是回车
    if (e.key === 'Enter' || e.keyCode === 13) {
      e.preventDefault()  
      // 这里就是刷出来的完整卡号
      const cardNo = formData.cardNo?.trim();
      if (!cardNo) return
      if (isSubmitting.value) {
        formData.cardNo = '';
        return;
      }
      console.log('刷卡成功：', cardNo)
      login(cardNo);
    }
  }

  onMounted(() => {
    nextTick(() => {
      inputRef.value?.focus?.();
    });
  });

  onUnmounted(() => {
    clearInterval(timer);
  });
</script>

<style lang="less" scoped>
  .card-form {
    width: 100%;
    height: 178px;
    margin-top: 8px;
    margin-bottom: 24px;
    background: url('/@/assets/svg/card-line.svg') no-repeat center bottom;

    &__card {
      &__img {
        display: block;
        margin: 0 auto;
      }

      &__title {
        font-size: 16px;
        font-weight: 500;
        text-align: center;
      }
    }

    &__form {
      position: fixed;
      top: -600px;
      left: 0;
    }
  }
</style>