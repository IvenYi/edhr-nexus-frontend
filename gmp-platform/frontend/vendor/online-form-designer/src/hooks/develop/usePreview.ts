import { ref } from 'vue';
import { genUrl } from '/@/utils';
import { createLocalStorage, createSessionStorage } from '/@/utils/cache';

interface PreviewParameter {
  aid: string;
  bid: string;
}

const CACHE_NAME = 'Preview-From';
const ls = createLocalStorage({
  hasEncrypt: false,
});

const ss = createSessionStorage({
  hasEncrypt: false,
});

const previewFromUrl = ref<string | undefined>();

function goPreview(data: PreviewParameter) {
  console.log('asdasd');
  ls.set(CACHE_NAME, location.href);
  window.location.href = genUrl(`${location.origin}${import.meta.env.VITE_PATHNAME_WEB}`, data);
}

function initPreviewFrom() {
  const fromLs = ls.get(CACHE_NAME);
  const fromSs = ss.get(CACHE_NAME);
  if (fromLs) {
    ls.remove(CACHE_NAME);
    ss.set(CACHE_NAME, fromLs);
    previewFromUrl.value = fromLs;
  } else if (fromSs) {
    previewFromUrl.value = fromSs;
  }
}

function quitPreview() {
  if (!previewFromUrl.value) return;
  window.location.href = previewFromUrl.value;
}

export function usePreview() {
  return {
    goPreview,
    quitPreview,
    initPreviewFrom,
    previewFromUrl,
  };
}
