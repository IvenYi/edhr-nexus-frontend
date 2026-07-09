<template>
  <icon>
    <template #component>
      <svg width="55" height="40" viewBox="0 0 55 40" fill="none">
        <g id="Group 202">
          <g id="Group 193">
            <path
              id="Rectangle 733"
              d="M2.5 4C2.5 3.17157 3.17157 2.5 4 2.5H40C40.8284 2.5 41.5 3.17157 41.5 4V29C41.5 29.8284 40.8284 30.5 40 30.5H4C3.17157 30.5 2.5 29.8284 2.5 29V4Z"
              fill="white"
              fill-opacity="0.2"
              stroke="white"
            />
            <rect id="Rectangle 734" x="7" y="7" width="22" height="4" rx="2" fill="white" />
            <rect id="Rectangle 735" x="7" y="15" width="13" height="4" rx="2" fill="white" />
            <rect id="Rectangle 736" x="7" y="23" width="19" height="4" rx="2" fill="white" />
            <g id="Ellipse 55" filter="url(#filter0_b_2434_10592)">
              <circle cx="43.5" cy="28.5" r="10.5" fill="white" fill-opacity="0.3" />
              <circle cx="43.5" cy="28.5" r="11" stroke="white" />
            </g>
            <path
              id="Vector"
              d="M43.5 23V34M49 28.5L38 28.5"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
            />
          </g>
        </g>
        <defs>
          <filter
            id="filter0_b_2434_10592"
            x="28"
            y="13"
            width="31"
            height="31"
            filterUnits="userSpaceOnUse"
            color-interpolation-filters="sRGB"
          >
            <feFlood flood-opacity="0" result="BackgroundImageFix" />
            <feGaussianBlur in="BackgroundImageFix" stdDeviation="2" />
            <feComposite
              in2="SourceAlpha"
              operator="in"
              result="effect1_backgroundBlur_2434_10592"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_backgroundBlur_2434_10592"
              result="shape"
            />
          </filter>
        </defs>
      </svg>
    </template>
  </icon>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import Icon from '@ant-design/icons-vue';

  export default defineComponent({
    name: 'MajorIcon',
    components: {
      Icon,
    },
  });
</script>

<style lang="less" scoped></style>
