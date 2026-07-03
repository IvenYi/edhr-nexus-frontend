/*
 * @Author: zhangyang
 * @Date: 2022-03-01 19:11:11
 * @LastEditTime: 2023-01-12 16:08:08
 * @Description:
 */
import { defineConfig, presetTypography, presetUno, presetWebFonts } from 'unocss';

export default defineConfig({
  shortcuts: {
    'ks-row': 'flex',
    'ks-column': 'flex flex-col',
    'ks-col': 'flex-1',
    'ks-row-middle': 'flex items-center',
    'ks-row-start': 'flex items-start',
    'ks-row-end': 'flex items-end',
    'ks-row-center': 'flex justify-center',
    'ks-row-left': 'flex justify-start',
    'ks-row-right': 'flex justify-end',
    'ks-row-center-middle': 'flex items-center justify-center',
    'ks-row-center-between': 'flex items-center justify-between',
    'ks-row-center-around': 'flex items-center justify-around',
    'ks-row-between': 'flex  justify-between',
    ell: 'text-ellipsis whitespace-nowrap overflow-hidden',
    'gct-color-text-1': 'text-[#1A1D23]',
    'gct-color-text-4': 'text-[#5A5F6B]',
    'gct-color-text-5': 'text-[#8B8B8B]',
  },
  presets: [presetUno(), presetTypography(), presetWebFonts({})],
});
