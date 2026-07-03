<template>
  <icon>
    <template #component>
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g id="Plus" class="enum-add-icon">
          <path
            id="Union"
            d="M8.43571 3.5H7.56361C7.48609 3.5 7.44733 3.53704 7.44733 3.61111V7.97222H3.11628C3.03876 7.97222 3 8.00926 3 8.08333V8.91667C3 8.99074 3.03876 9.02778 3.11628 9.02778H7.44733V13.3889C7.44733 13.463 7.48609 13.5 7.56361 13.5H8.43571C8.51323 13.5 8.55199 13.463 8.55199 13.3889V9.02778H12.8837C12.9612 9.02778 13 8.99074 13 8.91667V8.08333C13 8.00926 12.9612 7.97222 12.8837 7.97222H8.55199V3.61111C8.55199 3.53704 8.51323 3.5 8.43571 3.5Z"
          />
        </g>
      </svg>
    </template>
  </icon>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import Icon from '@ant-design/icons-vue';

  export default defineComponent({
    name: 'EnumAddIcon',
    components: {
      Icon,
    },
  });
</script>
<style scoped="less">
  .enum-add-icon {
    fill: var(--ant-primary-color) !important;
  }
</style>
