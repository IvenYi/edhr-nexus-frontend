<template>
  <QrcodeCapture
    ref="captureRef"
    :capture="captureMode"
    :formats="['qr_code', 'linear_codes']"
    style="display: none"
    @detect="onDetect"
    @error="onError"
  />
  <baseButton v-bind="widget.props" @click="triggerCapture" />
</template>

<script setup lang="ts" name="gct-qrcode-reader">
  import { ref, computed } from 'vue';
  import { QrcodeCapture } from 'vue-qrcode-reader';
  import { IQrcodeReader } from './schema';
  import baseButton from '/@page-designer/components/widgets/web/__components__/base_button.vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';

  const props = defineProps<{
    widget: IQrcodeReader;
  }>();

  const Event = getPageEvent();

  const captureRef = ref<InstanceType<typeof QrcodeCapture> | null>(null);
  const cameraError = ref<string | null>(null);
  const lastResult = ref<string>('');

  /** 从 widget.props 读取配置的摄像头模式，默认后置 */
  const captureMode = computed<'environment' | 'user' | null>(() => {
    const mode = (props.widget.props as any).captureMode;
    if (mode === 'user') return 'user';
    if (mode === 'false' || mode === false) return null;
    return 'environment';
  });

  function triggerCapture() {
    cameraError.value = null;
    const el = captureRef.value?.$el as HTMLElement | undefined;
    const input = el instanceof HTMLInputElement ? el : el?.querySelector('input');
    input?.click();
  }

  async function onDetect(detectedCodes: any[]) {
    if (captureRef.value) {
      captureRef.value.$el.value = null;
    }
    if (!detectedCodes?.length) return;
    const rawValue = detectedCodes[0]?.rawValue ?? '';
    lastResult.value = rawValue;
    await Event.runEventByName('onDetect', props.widget.events, { ok: true, result: rawValue });
  }

  async function onError(error: Error) {
    const errorMap: Record<string, string> = {
      NotAllowedError: '请允许访问摄像头权限',
      NotFoundError: '未检测到摄像头设备',
      NotReadableError: '摄像头被其他程序占用',
      OverconstrainedError: '摄像头不满足要求',
      StreamApiNotSupportedError: '当前浏览器不支持媒体流 API',
      InsecureContextError: '仅支持在 HTTPS 或 localhost 环境下使用摄像头',
    };
    cameraError.value = errorMap[error.name] ?? `摄像头错误：${error.message}`;
    await Event.runEventByName('onDetect', props.widget.events, {
      ok: false,
      result: cameraError.value,
    });
  }

  defineExpose({
    getValue() {
      return lastResult.value;
    },
    triggerCapture,
  });
</script>

<style scoped lang="less"></style>
