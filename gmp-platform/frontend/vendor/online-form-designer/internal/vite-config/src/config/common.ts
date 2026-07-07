import UnoCSS from 'unocss/vite';
import { VantResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { type UserConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';
import { createStyleImportPlugin, VxeTableResolve } from 'vite-plugin-style-import';
import VueDevTools from 'vite-plugin-vue-devtools';

const skipBuildGzip = process.env.VITE_SKIP_BUILD_GZIP === 'true';

const commonConfig: UserConfig = {
  build: {
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      // TODO: Prevent memory overflow
      maxParallelFileOps: 4,
    },
  },
  plugins: [
    Components({
      dirs: ['src/autocomponent'],
      resolvers: [
        // AntDesignVueResolver({ importStyle: false, resolveIcons: true, exclude: ['AInput'] }),
        VantResolver({ importStyle: false }),
      ],
      dts: 'src/components.d.ts',
    }),
    createStyleImportPlugin({
      resolves: [VxeTableResolve()],
    }),
    UnoCSS({ hmrTopLevelAwait: false }),
    VueDevTools(),
    ...(skipBuildGzip
      ? []
      : [
          viteCompression({
            verbose: true, //是否在控制台输出压缩结果
            disable: false, //是否禁用,相当于开关在这里
            threshold: 10240, //体积大于 threshold 才会被压缩,单位 b，1b=8B, 1B=1024KB  那我们这里相当于 9kb多吧，就会压缩
            algorithm: 'gzip', //压缩算法,可选 [ 'gzip' , 'brotliCompress' ,'deflate' , 'deflateRaw']
            ext: '.gz', //文件后缀
            compressionOptions: { level: 9 },
          }),
        ]),
  ],
};
export { commonConfig };
