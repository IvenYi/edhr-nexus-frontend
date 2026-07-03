/**
 *  Vite Plugin for fast creating SVG sprites.
 * https://github.com/anncwb/vite-plugin-svg-icons
 */

import { resolve } from 'node:path';

import type { PluginOption } from 'vite';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';

export function configSvgIconsPlugin({ isBuild }: { isBuild: boolean }) {
  const svgIconsPlugin = createSvgIconsPlugin({
    iconDirs: [resolve(process.cwd(), 'src/assets/icons')],
    svgoOptions: {
      // plugins: [
      //   {
      //     // 移除 fill 属性
      //     name: 'removeAttrs',
      //     params: { attrs: 'fill' },
      //   },
      // ],

    },
  });
  return svgIconsPlugin as PluginOption;
}
