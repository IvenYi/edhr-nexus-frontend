<template>
  <icon>
    <template #component>
      <svg width="46" height="49" viewBox="0 0 46 49" fill="none">
        <g id="Group 201">
          <g id="Group 194">
            <rect
              id="Rectangle 732"
              x="0.5"
              y="0.5"
              width="33"
              height="38"
              rx="2.5"
              stroke="white"
            />
            <rect
              id="Rectangle 733"
              x="1"
              y="1"
              width="32"
              height="37"
              rx="2"
              fill="white"
              fill-opacity="0.2"
            />
            <rect id="Rectangle 734" x="7" y="19" width="22" height="2" rx="1" fill="white" />
            <rect
              id="Rectangle 739"
              x="5"
              y="25"
              width="5"
              height="2"
              rx="1"
              fill="white"
              fill-opacity="0.5"
            />
            <rect
              id="Rectangle 742"
              x="5"
              y="29"
              width="5"
              height="2"
              rx="1"
              fill="white"
              fill-opacity="0.5"
            />
            <rect
              id="Rectangle 740"
              x="15"
              y="25"
              width="5"
              height="2"
              rx="1"
              fill="white"
              fill-opacity="0.5"
            />
            <rect
              id="Rectangle 743"
              x="15"
              y="29"
              width="5"
              height="2"
              rx="1"
              fill="white"
              fill-opacity="0.5"
            />
            <rect
              id="Rectangle 741"
              x="24"
              y="25"
              width="5"
              height="2"
              rx="1"
              fill="white"
              fill-opacity="0.5"
            />
            <rect
              id="Rectangle 744"
              x="24"
              y="29"
              width="5"
              height="2"
              rx="1"
              fill="white"
              fill-opacity="0.5"
            />
            <rect id="Rectangle 737" x="13" y="7" width="9" height="9" rx="2" fill="white" />
          </g>
          <g id="Group 197">
            <g id="Ellipse 56" filter="url(#filter0_b_2441_10071)">
              <circle cx="34.5" cy="37.5" r="10.5" fill="white" fill-opacity="0.3" />
              <circle cx="34.5" cy="37.5" r="11" stroke="white" />
            </g>
            <path
              id="Vector"
              d="M34.5 32V43M40 37.5L29 37.5"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
            />
          </g>
        </g>
        <defs>
          <filter
            id="filter0_b_2441_10071"
            x="19"
            y="22"
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
              result="effect1_backgroundBlur_2441_10071"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_backgroundBlur_2441_10071"
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
    name: 'MicroIcon',
    components: {
      Icon,
    },
  });
</script>

<style lang="less" scoped></style>
