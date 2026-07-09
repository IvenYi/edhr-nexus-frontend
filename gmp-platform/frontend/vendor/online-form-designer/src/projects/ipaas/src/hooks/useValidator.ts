import { tryOnBeforeUnmount } from '@vueuse/core';

export function useValidate(formRef, props) {
  tryOnBeforeUnmount(() => {
    formRef.value
      ?.validate()
      .then(() => {
        props.node.tooltips = [];
      })
      .catch((err) => {
        props.node.tooltips = err.errorFields.reduce((arr, cur) => {
          arr.push(...cur.errors);
          return arr;
        }, []);
      });
  });
}
