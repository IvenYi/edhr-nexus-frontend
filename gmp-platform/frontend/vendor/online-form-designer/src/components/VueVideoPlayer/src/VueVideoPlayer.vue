<script lang="tsx">
  import { shallowRef, defineComponent, watchEffect, unref, ref, reactive } from 'vue';
  import { VideoPlayer } from '@videojs-player/vue';
  import videojs from 'video.js';
  import videojs_lang_zhCN from 'video.js/dist/lang/zh-CN.json';
  import videojs_lang_zhTW from 'video.js/dist/lang/zh-TW.json';
  import videojs_lang_en from 'video.js/dist/lang/en.json';
  import 'video.js/dist/video-js.css';
  import { useLocale } from '/@/locales/useLocale';

  type VideoJsPlayer = ReturnType<typeof videojs>;

  const lanMap = reactive({
    'zh-CN': videojs_lang_zhCN,
    en: videojs_lang_en,
    'zh-TW': videojs_lang_zhTW,
  });

  const props = {
    width: {
      type: Number,
      default: '700',
    },
    src: {
      type: String,
      default: '',
    },
    poster: {
      type: String,
      default: '',
    },
    playbackRates: {
      type: Array,
      default: [0.8, 1.0, 1.5, 2.0],
    },
    loop: {
      type: Boolean,
      default: false,
    },
    volume: {
      type: Number,
      default: 0.6,
    },
    crossorigin: {
      type: String,
      default: 'anonymous',
    },
    playsinline: {
      type: Boolean,
      default: true,
    },
    controls: {
      type: Boolean,
      default: true,
    },
  };

  export default defineComponent({
    name: 'VueVideoPlayer',
    props,
    setup(props, { expose }) {
      const { getLocale } = useLocale();
      const selectedKeys = ref<string[]>([]);
      const player = shallowRef<VideoJsPlayer>();
      const handleMounted = (payload: any) => {
        player.value = payload.player;
      };

      const handleEvent = (log: any) => {
        console.log('Basic player event', log);
      };

      // 视频播放器load
      const handleReload = () => {
        player.value?.load();
      };

      expose({
        handleReload,
      });

      watchEffect(() => {
        selectedKeys.value = [unref(getLocale)];
        const langTxt = selectedKeys.value[0] == 'en-US' ? 'en' : selectedKeys.value[0];
        videojs.addLanguage(langTxt, lanMap[langTxt]);
      });

      return () => {
        const {
          width,
          src,
          poster,
          loop,
          volume,
          playbackRates,
          crossorigin,
          playsinline,
          controls,
        } = props;
        return (
          <VideoPlayer
            src={src}
            poster={poster}
            crossorigin={crossorigin}
            playsinline={playsinline}
            controls={controls}
            width={width}
            loop={loop}
            volume={volume}
            playback-rates={playbackRates}
            onMounted={handleMounted}
            onReady={handleEvent}
            onPlay={handleEvent}
            onPause={handleEvent}
            onEnded={handleEvent}
            onWaiting={handleEvent}
            onPlaying={handleEvent}
            onCanplay={handleEvent}
            onCanplaythrough={handleEvent}
          />
        );
      };
    },
  });
</script>
