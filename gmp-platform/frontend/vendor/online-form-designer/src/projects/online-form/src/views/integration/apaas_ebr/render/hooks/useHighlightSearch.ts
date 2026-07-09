import { ref } from 'vue';

export function useHighlightSearch() {
  const keyword = ref('');



  // 内容高亮处理
  function highlightName(name?: string) {
    const displayName = name;
    const rDisplayName = displayName?.replace(
      new RegExp(
        keyword.value?.replace(new RegExp(/(?=[$.?+\[\]\*^|\\(){}/])/g), '\\'),
        'g',
      ),
      (s) => `<span class="is-highlight">${s}</span>`,
    );
    if (rDisplayName === displayName) return null;

    return rDisplayName;
  }

  return {
    keyword,
    highlightName,
  };
}
