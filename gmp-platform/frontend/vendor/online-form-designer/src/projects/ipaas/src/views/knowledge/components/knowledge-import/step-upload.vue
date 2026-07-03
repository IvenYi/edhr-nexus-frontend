<template>
  <div class="pl-100px pr-100px pb-100px">
    <div class="color-text font-500 mt-48px">{{ $t('sys.pageDesigner.downloadUploadTemp') }}</div>
    <div class="color-[#8F8F8F] mt-16px lh-20px">{{ $t('sys.ipaas.downloadTempTip') }}</div>
    <a @click.prevent class="mt-8px lh-20px inline-block">{{ $t('sys.pageDesigner.downloadImportTemp') }}</a>
    <div class="color-text font-500 mt-24px">{{ $t('sys.uploadFile') }}</div>
    <div class="mt-16px">
      <a-upload-dragger>
        <div class="h-140px flex flex-col items-center justify-center">
          <div class="w-56px h-56px bg-[#eee]"></div>
          <div class="mt-12px">{{ $t('sys.pageDesigner.clickOrDragToUploadTip') }}</div>
        </div>
      </a-upload-dragger>
    </div>
    <div class="flex items-center mt-16px">
      <div class="h-32px w-32px bg-[#eee]"></div>
      <div class="ml-10px flex-1">
        <div class="flex items-center">
          <div class="color-[#212528] lh-22px">{{ $t('sys.ipaas.fileName') }}.fhc</div>
          <div class="color-[#C3C3C3] lh-22px ml-16px">78M</div>
          <div class="ml-[auto] color-[#797A7D] text-12px lh-18px">80%</div>
        </div>
        <div
          class="knowledge-import__process mt-4px h-4px rounded-2px overflow-hidden"
          :style="{
            '--width': `${50}%`,
          }"
        ></div>
      </div>
      <div class="ml-24px h-16px w-16px bg-[#eee] cursor-pointer"></div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="less" scoped>
  .color-text {
    color: #212528;
  }

  .knowledge-import__process {
    background-color: #e6e9ef;

    &::after {
      content: '';
      display: block;
      width: var(--width);
      height: 100%;
      background-color: var(--ant-primary-color);
    }
  }
</style>
