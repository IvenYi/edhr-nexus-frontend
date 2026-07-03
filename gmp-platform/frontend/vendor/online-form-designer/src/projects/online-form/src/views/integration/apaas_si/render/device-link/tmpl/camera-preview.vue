<template>
  <a-card :title="$t('sys.onlineForm.cameraPhoto')" bordered>
    <a-row :gutter="16">
      <a-col :span="12">
        <a-card size="small" :title="$t('sys.onlineForm.realTimePreview')">
          <a-spin :spinning="loading" :tip="$t('sys.onlineForm.cameraStarting') + '...'">
            <video ref="videoRef" class="video"></video>
            <div class="ks-row">
              <a-select
                class="ks-col"
                :value="currentDevice.deviceId"
                :placeholder="$t('sys.onlineForm.selectCamera')"
                :options="cameraOptions"
                @change="onCameraChange"
              />
              <a-button
                :disabled="!currentDevice.deviceId"
                @click="takePhoto"
                type="primary"
                class="leading-none ml8px w120px"
                >{{ $t('sys.appDesigner.screenshot') }}</a-button
              >
            </div>
          </a-spin>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card size="small" :title="$t('sys.onlineForm.screenshotResult')">
          <div class="preview-box">
            <a-image v-if="photo" :src="photo" width="100%" />
            <a-empty v-else :description="$t('sys.onlineForm.noScreenshotYet')" />
          </div>
        </a-card>
      </a-col>
    </a-row>
  </a-card>
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, nextTick, computed } from 'vue';
  import { IModal } from '@gct/runtime';
  import { CameraHelper, getCameraList, type CameraDevice } from '@/utils/CameraHelper';
  import { useSessionStorage } from '@vueuse/core';

  const props = defineProps<{
    modal: IModal;
  }>();
  props.modal.state.okDisabled = true;
  const videoRef = ref<HTMLVideoElement | null>(null);
  const camera = ref<CameraHelper>();
  const photo = ref<string>('');
  const currentDevice = useSessionStorage<{ deviceId: string; facingMode: string }>(
    'APP_DeviceId',
    { deviceId: '', facingMode: '' },
  );
  const loading = ref(true);
  const cameraOptions = ref<CameraDevice[]>([]);
  /**
   * 截图
   */
  const takePhoto = async () => {
    photo.value = camera.value!.takeSnapshot();
    props.modal.state.okDisabled = false;
  };

  /** 切换摄像头 */
  const onCameraChange = async (deviceId: string, option: any) => {
    loading.value = true;
    const { facingMode } = option;
    currentDevice.value.deviceId = deviceId;
    currentDevice.value.facingMode = facingMode;
    try {
      await camera.value?.stopStream();
      await camera.value?.startSnap({
        deviceId,
        facingMode,
      });
    } catch (error) {}

    loading.value = false;
  };

  onMounted(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert(
        $t('sys.onlineForm.browserDoesNotSupportCameraPleaseCheckIfBrowserHasCameraPermission'),
      );
      return;
    }
    cameraOptions.value = await getCameraList();
    if (cameraOptions.value.length === 0) {
      alert($t('sys.onlineForm.noCameraDeviceDetectedPleaseCheckIfBrowserHasCameraPermission'));
      // 没有摄像头
      return;
    }
    await nextTick();
    if (!currentDevice.value.deviceId) {
      currentDevice.value.deviceId = cameraOptions.value[0]?.value;
      currentDevice.value.facingMode = cameraOptions.value[0]?.facingMode;
    }
    camera.value = new CameraHelper(videoRef.value!);
    const { deviceId, facingMode } = currentDevice.value;
    await camera.value.startSnap({ deviceId, facingMode });
    await new Promise<void>((resolve) => {
      const video = videoRef.value!;
      if (video.readyState >= 2) {
        resolve();
      } else {
        video.oncanplay = () => resolve();
      }
    });
    loading.value = false;
  });
  onBeforeUnmount(() => {
    camera.value?.stopStream();
  });

  props.modal.ok = async () => {
    return { ok: !!photo.value, data: photo.value };
  };
</script>

<style scoped>
  .camera-container {
    width: 480px;
    margin: 0 auto;
    text-align: center;
  }

  .video {
    width: 100%;
    border-radius: 8px;
  }

  .actions {
    margin: 12px 0;
  }

  button {
    margin: 0 8px;
    padding: 6px 14px;
  }

  .photo {
    width: 100%;
    margin-top: 12px;
    border-radius: 8px;
  }
</style>
