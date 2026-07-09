<template>
  <div class="asset-gen-image" :style="{ width: !autoWidth ? width + 'px' : '' }">
    <div class="asset-gen-image__con">
      <img
        v-if="autoWidth"
        src="./asset/pic_scan.svg"
        :style="{
          width: '100%',
          maxWidth: widget.props.autoWidth
            ? (widget.props.maxHeight ?? 60) * (widget.props.whRadio ?? 1) + 'px'
            : 'none',
        }"
      />
      <div v-else class="w - full">
        <img :width="width" :height="height" src="./asset/pic_scan.svg" />
      </div>
    </div>
    <div class="asset-gen-image__text" v-show="prompt || auxiliary">
      <p class="prompt">{{ prompt }}</p>
      <p class="auxiliary">{{ auxiliary }}</p>
    </div>
  </div>
</template>

<script setup lang="ts" name="gct-asset-gen-image-render">
  import { toRefs } from 'vue';

  import type { IAssetGenImage } from './schema';

  const props = defineProps<{ modelValue?: string; widget: IAssetGenImage }>();

  const { prompt, auxiliary, autoWidth, width, height } = toRefs(props.widget.props);
</script>
<style scoped lang="less">
  .asset-gen-image {
    overflow: auto;
    z-index: 99;
    &__con {
      overflow: auto;
      // background: #fbfbfc;

      .no-data {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
      }

      .auto-width {
        width: 100%;
      }
    }

    &__text {
      margin-top: 16px;
      text-align: center;

      & > p {
        margin: 0;
      }

      .prompt {
        line-height: 24px;
        font-size: 14px;
        color: #000000;
        font-weight: bold;
      }

      .auxiliary {
        color: #999999;
        font-size: 14px;
        line-height: 22px;
      }
    }
  }

  img {
    display: block;
    margin: 0 auto;
    object-fit: contain;
  }
</style>
