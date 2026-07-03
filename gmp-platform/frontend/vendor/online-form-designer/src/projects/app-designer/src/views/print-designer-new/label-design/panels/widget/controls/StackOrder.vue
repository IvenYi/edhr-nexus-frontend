<template>
  <div class="stack-order">
    <div class="setting-row flex-col">
      <div class="sub-title mb-2px">{{ $t('sys.printDesigner.zIndex') }}</div>
      <div class="sub-content">
        <div class="sub-content_inner">
          <div class="stack-order-btn-box w-full">
            <a-button plain size="mini" @click.native="$emit('changeEvent', 'auto')">{{ $t('sys.printDesigner.auto') }}</a-button>
            <a-button
              plain
              size="mini"
              @click.native="$emit('changeEvent', zIndex !== 'auto' ? zIndex + 1 : 1)"
              >{{ $t('sys.printDesigner.moveUp') }}</a-button
            >
            <a-button
              plain
              size="mini"
              @click.native="$emit('changeEvent', zIndex !== 'auto' && zIndex > 0 ? zIndex - 1 : 0)"
              >{{ $t('sys.printDesigner.moveDown') }}</a-button
            >
          </div>
        </div>
      </div>
    </div>
    <div class="icon-bar none"> </div>
  </div>
</template>

<script>
  export default {
    name: 'StackOrder',
    props: ['zIndex'],
  };
</script>
