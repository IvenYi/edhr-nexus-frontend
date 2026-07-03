<template>
  <h1>{{ msg }}</h1>
  <input v-model="msg" />
</template>
<script>
  export default {
    props: {
      formData: Object,
    },
    data() {
      /**初始化双向绑定变量 */
      return {
        msg: '这是一个初始化Vue组件',
      };
    },
    /**侦听器 */
    watch: {},
    /**计算属性 */
    computed: {},
    /**组件初始化钩子 */
    mounted() {
      console.log('mounted');
    },
    /**组件销毁钩子 */
    unmounted() {
      console.log('unmounted');
    },
    /**执行方法函数 */
    methods: {},
  };
</script>
