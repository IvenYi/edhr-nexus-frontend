import { ref } from 'vue';
import { RuleItem } from '../types';

const rules = ref<Record<string, Array<RuleItem> | undefined>>({});

export function useRules() {
  function setRules(data) {
    rules.value = data;
  }
  return {
    rules,
    setRules,
  };
}
