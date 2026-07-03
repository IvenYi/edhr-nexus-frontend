<template>
  <div class="zoom-menu">
    <a-tooltip class="item" effect="dark" title="放大" placement="right">
      <button class="action-btn" @click="zoomIn" :disabled="!canZoomIn">
        <plus-outlined />
        <label></label>
      </button>
    </a-tooltip>
    <a-tooltip class="item" effect="dark" title="缩小" placement="right">
      <button class="action-btn" @click="zoomOut" :disabled="!canZoomOut">
        <minus-outlined />
      </button>
    </a-tooltip>
    <div class="zoom-value">{{ Math.round(zoom * 100) + '%' }}</div>
    <a-tooltip class="item" effect="dark" title="还原" placement="right">
      <button class="action-btn" @click="zoomRestore" :disabled="!canZoomIn">
        <history-outlined />
        <label></label>
      </button>
    </a-tooltip>
    <a-tooltip class="item" effect="dark" title="适合" placement="right">
      <button class="action-btn" @click="zoomFit" :disabled="!canZoomIn">
        <compress-outlined />
        <label></label>
      </button>
    </a-tooltip>
  </div>
</template>

<script lang="ts" setup name="zoom-menu">
  import { computed } from 'vue';

  const MAX_ZOOM = 3.0;
  const MIN_ZOOM = 0.3;
  const emit = defineEmits(['zoomChange', 'zoomChange', 'zoomFit', 'zoomChange']);
  const props = defineProps({
    zoom: {
      type: Number,
      default: 1,
    },
  });
  const canZoomIn = computed(() => {
    return props.zoom < MAX_ZOOM;
  });
  const canZoomOut = computed(() => {
    return props.zoom > MIN_ZOOM;
  });
  const zoomIn = () => {
    return emit('zoomChange', Math.round((props.zoom + 0.1) * 10) / 10);
  };
  const zoomOut = () => {
    return emit('zoomChange', Math.round((props.zoom - 0.1) * 10) / 10);
  };
  const zoomFit = () => {
    emit('zoomFit');
  };
  const zoomRestore = () => {
    emit('zoomChange', 1.0);
  };
</script>
<style lang="less">
  .zoom-menu {
    display: block;
    position: absolute;
    z-index: 1000;
    right: 5px;
    bottom: 10px;
    box-sizing: border-box;
    width: 38px;
    padding: 0 4px;
    transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 50px;
    opacity: 0.25;
    background-color: rgb(0 0 0 / 78%);

    .zoom-menu--sub {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 100px;
      max-width: 100px;
      height: 38px;
      margin-top: -19px;
      margin-left: -50px;

      &.invisible {
        display: none;
        max-width: 0;
      }
    }

    .action-btn {
      width: 26px;
      min-width: 28px;
      height: 26px;
      min-height: 28px;
      margin: 6px 0;
      padding: 1px;
      border: 0 none;
      border-radius: 100%;
      outline: none;
      background-color: transparent;
      cursor: pointer;
      user-select: none;

      span {
        color: #fff;
        font-size: 20px;
      }
    }

    .action-btn:hover {
      background-color: rgb(238 238 238 / 3.8%);
    }

    .action-btn:active {
      background-color: rgb(238 238 238 / 38%);
    }

    .action-btn * {
      vertical-align: middle;
    }
  }

  .zoom-menu:hover {
    opacity: 1;
  }

  .zoom-value {
    color: #fff;
    font-size: 12px;
    text-align: center;
  }
</style>
