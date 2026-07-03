<template>
  <icon>
    <template #component>
      <svg width="58" height="41" viewBox="0 0 58 41" fill="none">
        <g id="Group 598">
          <g id="Group 200">
            <g id="Group 195">
              <rect
                id="Rectangle 732"
                x="4.86719"
                width="42.8421"
                height="32.1316"
                rx="3"
                fill="white"
                fill-opacity="0.3"
              />
              <path
                id="Rectangle 733"
                d="M7.31641 3.94727C7.31641 3.11884 7.98798 2.44727 8.81641 2.44727H43.7638C44.5922 2.44727 45.2638 3.11884 45.2638 3.94727V29.6841H7.31641V3.94727Z"
                stroke="white"
              />
              <rect
                id="Rectangle 747"
                x="24"
                y="29.7637"
                width="8.76316"
                height="3"
                rx="1.5"
                transform="rotate(-90 24 29.7637)"
                fill="white"
              />
              <rect
                id="Rectangle 746"
                x="15"
                y="30"
                width="16"
                height="3"
                rx="1.5"
                transform="rotate(-90 15 30)"
                fill="white"
              />
              <rect
                id="Rectangle 748"
                x="32"
                y="29.5254"
                width="17.5263"
                height="3"
                rx="1.5"
                transform="rotate(-90 32 29.5254)"
                fill="white"
              />
              <rect
                id="Rectangle 745"
                y="30.1836"
                width="52.5789"
                height="1.94737"
                rx="0.973684"
                fill="white"
                fill-opacity="0.3"
              />
              <circle id="Ellipse 56" cx="10.71" cy="7.86822" r="0.973684" fill="white" />
              <circle id="Ellipse 57" cx="13.6319" cy="7.86822" r="0.973684" fill="white" />
              <circle id="Ellipse 58" cx="16.5518" cy="7.86822" r="0.973684" fill="white" />
            </g>
          </g>
          <g id="Group 197">
            <g id="Ellipse 56_2" filter="url(#filter0_b_2434_10579)">
              <circle cx="46.5" cy="29.5" r="10.5" fill="white" fill-opacity="0.3" />
              <circle cx="46.5" cy="29.5" r="11" stroke="white" />
            </g>
            <path
              id="Vector"
              d="M46.5 24V35M52 29.5L41 29.5"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
            />
          </g>
        </g>
        <defs>
          <filter
            id="filter0_b_2434_10579"
            x="31"
            y="14"
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
              result="effect1_backgroundBlur_2434_10579"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_backgroundBlur_2434_10579"
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
    name: 'BulletinIcon',
    components: {
      Icon,
    },
  });
</script>

<style lang="less" scoped></style>
