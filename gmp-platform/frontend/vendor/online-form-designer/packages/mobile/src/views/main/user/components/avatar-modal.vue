<template>
  <!-- 头像操作菜单 -->
  <van-popup v-model:show="showCropper" round position="bottom" :style="{ height: '100%' }">
    <div class="cropper-container">
      <img ref="cropperImage" :src="selectedImage" class="cropper-img" />
    </div>
    <div class="cropper-actions">
      <span class="color-[#ffffff]" @click="cancelCrop">取消</span>
      <span class="color-[#ffffff]" @click="rotate">旋转</span>
      <span class="color-[#ffffff]" @click="resetCrop">还原</span>
      <van-button type="primary" @click="confirmCrop" size="small" round>确定</van-button>
    </div>
  </van-popup>
</template>
<script setup lang="ts">
  import { showLoadingToast, showSuccessToast, showFailToast } from 'vant';
  import Cropper from 'cropperjs';
  import 'cropperjs/dist/cropper.css';
  import { postMinioFileBase64Upload } from '@mobile/apis/gct-platform/FileController';
  import { GctNative } from '@native/index';
  import { _isAndroid, MOBILE_MINIO_PATH } from '@mobile/utils/const';
  import { Environment } from '@mobile/type';
  import { serverAddress } from '@mobile/stores/sessionHooks';
  import { AccessToken } from '@mobile/stores/loginHooks';

  const env = _isAndroid ? Environment.ANDROID : Environment.WEB;
  // const env = Environment.ANDROID;

  const props = defineProps({
    value: {
      type: Boolean,
      default: false,
    },
  });
  const emit = defineEmits(['update:value', 'on-confirm']);
  const rotationAngle = ref(0);
  watch(
    () => props.value,
    (val) => {
      if (val) {
        chooseFromGallery();
      }
    },
  );
  // 图片选择和裁剪控制
  const showCropper = ref(false);
  const selectedImage = ref('');
  const cropperInstance = ref(null);
  const cropperImage = ref(null);

  // 从相册选择
  const chooseFromGallery = () => {
    switch (env) {
      case Environment.ANDROID:
        GctNative.IMAGE.choose({
          count: 1,
          extension: ['jpg', 'jpeg', 'png', 'bmp'],
          success({ tempFiles }) {
            const fileNameArr = tempFiles[0].path.split('/');
            const fileName = fileNameArr[fileNameArr.length - 1];
            const type = fileName.split('.')[fileName.split('.').length - 1];
            const headers = {
              source: 502,
              Token: AccessToken.value,
            };
            if (!['jpg', 'jpeg', 'png', 'bmp'].includes(type)) {
              showFailToast(`【${file.name}】${$t('sys.component.cropper.acceptAvatarTypeTip')}`);
              return;
            }

            if (tempFiles[0] > 4 * 1024 * 1024) {
              showFailToast(`【${file.name}】文件大小不能超过 4MB`);
              return;
            }
            GctNative.FILE.Upload({
              uploadUrl:
                (serverAddress.value || location.origin) + '/gct-platform/api/file/upload/image',
              headers,
              path: tempFiles[0].path,
              success(url) {
                selectedImage.value = MOBILE_MINIO_PATH.value + url;
                showCropper.value = true;
                nextTick(initCropper);
              },
              fail() {},
            });

            selectedImage.value = tempFiles[0].path;
            showCropper.value = true;
          },
          fail() {},
        });
        break;
      case Environment.WEB:
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = ['.jpg', '.jpeg', '.png', '.bmp'];
        input.onchange = handleFileSelect;
        input.click();
        break;

      default:
        break;
    }
    emit('update:value', false);
  };

  // 重置裁剪状态
  const resetCrop = () => {
    if (cropperInstance.value) {
      cropperInstance.value.reset(); // 重置为初始状态
      cropperInstance.value.setAspectRatio(1); // 保持1:1比例
      cropperInstance.value.setDragMode('move'); // 重置为移动模式
    }
  };

  const handleFileSelect = (e) => {
    let file = e.target.files?.[0];
    console.log('file', file);
    if (!file) return;
    // 验证文件类型和大小
    if (!['image/jpg', 'image/jpeg', 'image/png', 'image/bmp'].includes(file.type)) {
      showFailToast(`【${file.name}】${$t('sys.component.cropper.acceptAvatarTypeTip')}`);
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      showFailToast(`【${file.name}】文件大小不能超过 4MB`);
      return;
    }

    // 读取文件为DataURL
    const reader = new FileReader();
    reader.onload = (event) => {
      selectedImage.value = event.target.result;
      showCropper.value = true;
      nextTick(initCropper);
    };
    reader.readAsDataURL(file);
  };

  // 取消裁剪
  const cancelCrop = () => {
    showCropper.value = false;
    if (cropperInstance.value) {
      cropperInstance.value.destroy();
      cropperInstance.value = null;
    }
  };
  const rotate = () => {
    if (cropperInstance.value) {
      rotationAngle.value += 90;
      if (rotationAngle.value >= 360) {
        rotationAngle.value = 0;
      }

      // 每次点击旋转90度
      cropperInstance.value.rotate(rotationAngle.value);
    }
  };
  const confirmCrop = async () => {
    if (!cropperInstance.value) return;

    const canvas = cropperInstance.value.getCroppedCanvas({
      width: 300, // 输出宽度
      height: 300, // 输出高度
      minWidth: 200,
      minHeight: 200,
      maxWidth: 800,
      maxHeight: 800,
      fillColor: '#fff', // 填充色
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
    });
    // 替代方案：使用 toDataURL
    const dataURL = canvas.toDataURL('image/jpeg', 0.9);
    // 将 Base64 转为 Blob
    // const res = await fetch(dataURL);
    // const blob = await res.blob();
    const date = new Date().getTime();

    const url = await postMinioFileBase64Upload({
      fileContent: dataURL,
      filename: `${$t('sys.pageDesigner.handwrittenSignature')}_${date}.png`,
    });
    // const url = await postFileUploadImage(
    //   { file: blob },
    //   {},
    //   {
    //     headers: { 'Content-Type': 'multipart/form-data;charset=UTF-8' },
    //   },
    // );
    emit('on-confirm', url);

    showCropper.value = false;
    // 转换为Blob对象
    // canvas.toBlob(
    //   async (blob) => {
    //     if (blob) {
    //       const url = await postFileUploadImage(
    //         { file: blob },
    //         {},
    //         {
    //           headers: { 'Content-Type': 'multipart/form-data;charset=UTF-8' },
    //         },
    //       );

    //     }
    //   },
    //   'image/jpeg',
    //   0.9,
    // ); // 质量为90%的JPEG格式
  };

  // 初始化裁剪器
  const initCropper = () => {
    if (cropperInstance.value) {
      cropperInstance.value.destroy();
    }
    cropperImage.value.crossOrigin = 'anonymous';
    cropperInstance.value = new Cropper(cropperImage.value, {
      aspectRatio: 1, // 1:1比例
      viewMode: 1, // 限制裁剪框不超过图片大小
      autoCropArea: 0.8, // 初始裁剪区域占图片80%
      movable: true, // 可移动图片
      rotatable: true, // 可旋转
      scalable: true, // 可缩放
      zoomable: true, // 可放大缩小
      dragMode: 'move', // 初始拖拽模式为移动图片
      cropBoxMovable: false, // 可移动裁剪框
      cropBoxResizable: false, // 可调整裁剪框大小
      background: false, // 不显示背景
      responsive: true, // 响应式调整
      checkCrossOrigin: false, // 不检查跨域
      ready() {
        const container = this.cropper.getContainerData();
        const image = this.cropper.getImageData();

        // 计算需要放大的比例（仅放大到匹配宽度或高度）
        const widthRatio = container.width / image.naturalWidth;
        const heightRatio = container.height / image.naturalHeight;

        // 选择需要放大的最小比例（确保完全覆盖）
        const zoomRatio = Math.max(widthRatio, heightRatio);

        // 应用缩放（仅当图片小于容器时放大）
        if (zoomRatio > 1) {
          this.cropper.zoomTo(zoomRatio);
        }

        // 居中图片
        this.cropper.setCropBoxData({
          left: 0,
          top: 0,
          width: container.width,
          height: container.height,
        });
      },
    });
  };
</script>
<style scoped lang="less">
  .avatar-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
  }

  .avatar-preview {
    position: relative;
    width: 150px;
    height: 150px;
    overflow: hidden;
    border: 1px solid #eee;
    border-radius: 50%;
    cursor: pointer;
  }

  .avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .edit-overlay {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    padding: 8px 0;
    background: rgb(0 0 0 / 50%);
    color: white;
    text-align: center;
  }

  .edit-text {
    font-size: 14px;
  }

  .cropper-container {
    width: 100%;
    height: calc(100% - 50px);
    background: #000;
  }

  .cropper-image {
    display: block;
    max-width: 100%;
    max-height: 100%;
  }

  .cropper-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
    background: #000;
  }
</style>
<style lang="less">
  .cropper-view-box,
  .cropper-face {
    border-radius: 50%;
  }
</style>
