import { ref } from 'vue';

const currentStep = ref<0 | 1 | 2>(0);

export function useState() {
  return {
    currentStep,
  };
}
