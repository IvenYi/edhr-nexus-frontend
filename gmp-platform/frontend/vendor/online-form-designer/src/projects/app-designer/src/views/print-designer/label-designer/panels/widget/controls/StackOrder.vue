<template>
  <div class="stack-order">
    <div class="setting-row flex-col">
      <div class="sub-title mb-2px">Z轴层级</div>
      <div class="sub-content">
        <div class="sub-content_inner">
          <div class="stack-order-btn-box w-full">
            <a-button plain size="mini" @click.native="$emit('changeEvent', 'auto')">自动</a-button>
            <a-button
              plain
              size="mini"
              @click.native="$emit('changeEvent', zIndex !== 'auto' ? zIndex + 1 : 1)"
              >上移一层</a-button
            >
            <a-button
              plain
              size="mini"
              @click.native="$emit('changeEvent', zIndex !== 'auto' && zIndex > 0 ? zIndex - 1 : 0)"
              >下移一层</a-button
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
