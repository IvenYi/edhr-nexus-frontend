/*
 * @Author: wangming
 * @Date: 2022-06-02 18:01:17
 * @LastEditors: wangming
 * @LastEditTime: 2022-06-08 17:09:58
 * @FilePath: /vant-app/postcss.config.js
 * @Description:
 */
const envPath = process.argv.at(-1);
require('dotenv').config({ path: `.env.${envPath}` });

const viewportOptionMap = {
  mobile: {
    'postcss-px-to-viewport-8-plugin': {
      // exclude: [/node_modules/], // 解决vant375,设计稿750问题。忽略某些文件夹下的文件或特定文件
      unitPrecision: 5, // 单位转换后保留的精度
      propList: ['*'], // 能转化为vw的属性列表
      viewportUnit: 'vw', // 希望使用的视口单位
      fontViewportUnit: 'vw', // 字体使用的视口单位
      selectorBlackList: [], // 需要忽略的CSS选择器，不会转为视口单位，使用原有的px等单位。
      minPixelValue: 1, // 设置最小的转换数值，如果为1的话，只有大于1的值会被转换
      mediaQuery: false, // 媒体查询里的单位是否需要转换单位
      replace: false, //  是否直接更换属性值，而不添加备用属性
      landscape: false, // 是否添加根据 landscapeWidth 生成的媒体查询条件 @media (orientation: landscape)
      landscapeUnit: 'vw', // 横屏时使用的单位
      landscapeWidth: 667, // 横屏时使用的视口宽度
      viewportWidth: 375, // 设计稿宽度
    },
  },
  ipad: {
    // 'postcss-px-to-viewport-8-plugin': {
    //   exclude: [/page-designer/], //组件不做缩放处理
    //   viewportWidth: 1280, // 设计稿宽度
    //   landscapeWidth: 1280,
    //   unitPrecision: 5, // 单位转换后保留的精度
    //   propList: ['*'], // 能转化为vw的属性列表
    //   viewportUnit: 'vw', // 希望使用的视口单位
    //   fontViewportUnit: 'vw', // 字体使用的视口单位
    //   selectorBlackList: [], // 需要忽略的CSS选择器，不会转为视口单位，使用原有的px等单位。
    //   minPixelValue: 1, // 设置最小的转换数值，如果为1的话，只有大于1的值会被转换
    //   mediaQuery: false, // 媒体查询里的单位是否需要转换单位
    //   replace: false, //  是否直接更换属性值，而不添加备用属性
    // },
  },
  start: {},
};
module.exports = {
  plugins: {
    ...viewportOptionMap[process.env.VITE_APP_ENV || 'mobile'],
  },
};
