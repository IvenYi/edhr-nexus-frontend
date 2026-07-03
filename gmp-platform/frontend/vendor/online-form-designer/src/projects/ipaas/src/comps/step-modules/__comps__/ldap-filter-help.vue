<template>
  <div class="p20px">
    <a-table :columns="columns" :data-source="data" size="middle" :pagination="false" />
  </div>
</template>
<script setup lang="ts">
  import { ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();

  const columns = ref([
    {
      title: t('sys.ipaas.operation'),
      dataIndex: 'opt',
      key: 'opt',
    },
    {
      title: t('sys.ipaas.grammar'),
      dataIndex: 'grammar',
      key: 'grammar',
    },
    {
      title: t('sys.ipaas.example'),
      dataIndex: 'example',
      key: 'example',
    },
  ]);

  const data = ref([
    {
      opt: t('sys.ipaas.ope.equal'),
      grammar: '(attr=value)',
      example: '(cn=张三)',
    },
    {
      opt: t('sys.ipaas.ope.notEqual'),
      grammar: '(!(attr=value))',
      example: '(!(cn=张三))',
    },
    {
      opt: t('sys.ipaas.ope.exists'),
      grammar: '(attr=*)',
      example: '(mail=*)',
    },
    {
      opt: t('sys.ipaas.ope.start'),
      grammar: '(attr=prefix*)',
      example: '(cn=张*)',
    },
    {
      opt: t('sys.ipaas.ope.contains'),
      grammar: '(attr=*mid*)',
      example: '(cn=*三*)',
    },
    {
      opt: t('sys.ipaas.ope.end'),
      grammar: '(attr=*suffix)',
      example: '(cn=*三)',
    },
    {
      opt: t('sys.ipaas.ope.conditionAnd'),
      grammar: '(&(cond1)(cond2)))',
      example: '(&(objectClass=user)(mail=*))',
    },
    {
      opt: t('sys.ipaas.ope.conditionOr'),
      grammar: '`(',
      example: '(cond1)(cond2))`',
    },
    {
      opt: t('sys.ipaas.ope.nested'),
      grammar: '任意嵌套',
      example: '`(&(',
    },
  ]);
</script>
<style lang="less" scoped></style>
