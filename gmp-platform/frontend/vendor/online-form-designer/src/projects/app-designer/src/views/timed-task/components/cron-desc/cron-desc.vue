<template>
  <div :class="[ns.b(), ns.is('expand', isExpand)]">
    <div :class="[ns.b('header')]">
      <span>{{ t('sys.appDesigner.timedTask.cronDesc.title') }}</span>
      <span @click="onClick"
        >{{
          isExpand
            ? t('sys.appDesigner.timedTask.cronDesc.retract')
            : t('sys.appDesigner.timedTask.cronDesc.expand')
        }}&nbsp;<DownOutlined
      /></span>
    </div>
    <div :class="[ns.b('content')]">
      <table :class="[ns.b('table')]">
        <thead>
          <tr :class="[ns.b('title')]">
            <th width="46">{{ t('sys.appDesigner.timedTask.cronDesc.table.column.1') }}</th>
            <th width="89">{{ t('sys.appDesigner.timedTask.cronDesc.table.column.2') }}</th>
            <th width="89">{{ t('sys.appDesigner.timedTask.cronDesc.table.column.3') }}</th>
            <th rowspan="6">{{ t('sys.appDesigner.timedTask.cronDesc.table.column.4') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td :class="ns.e('domain')">{{ t('sys.appDesigner.timedTask.editor.second') }}</td>
            <td :class="ns.e('value-range')">[0, 59]</td>
            <td :class="ns.e('character')">*&nbsp;,&nbsp;-&nbsp;/</td>
            <td rowspan="6" style="vertical-align: top">
              <p> 1. * {{ t('sys.appDesigner.timedTask.cronDesc.table.desc.1') }};</p>
              <p> 2. - ：{{ t('sys.appDesigner.timedTask.cronDesc.table.desc.2') }};</p>
              <p> 3. / ：{{ t('sys.appDesigner.timedTask.cronDesc.table.desc.3') }};</p>
              <p> 4. , ：{{ t('sys.appDesigner.timedTask.cronDesc.table.desc.4') }};</p>
              <p> 5. ? ：{{ t('sys.appDesigner.timedTask.cronDesc.table.desc.5') }}。 </p>
            </td>
          </tr>
          <tr>
            <td :class="ns.e('domain')">{{ t('sys.appDesigner.timedTask.editor.minute') }}</td>
            <td :class="ns.e('value-range')">[0, 59]</td>
            <td :class="ns.e('character')">*&nbsp;,&nbsp;-&nbsp;/</td>
          </tr>
          <tr>
            <td :class="ns.e('domain')">{{ t('sys.appDesigner.timedTask.editor.hour') }}</td>
            <td :class="ns.e('value-range')">[0, 23]</td>
            <td :class="ns.e('character')">*&nbsp;,&nbsp;-&nbsp;/</td>
          </tr>
          <tr>
            <td :class="ns.e('domain')">{{ t('sys.appDesigner.timedTask.editor.day') }}</td>
            <td :class="ns.e('value-range')">[1, 31]</td>
            <td :class="ns.e('character')">*&nbsp;,&nbsp;-&nbsp;/&nbsp;?</td>
          </tr>
          <tr>
            <td :class="ns.e('domain')">{{ t('sys.appDesigner.timedTask.editor.week') }}</td>
            <td :class="ns.e('value-range')">[1, 7]</td>
            <td :class="ns.e('character')">*&nbsp;,&nbsp;-&nbsp;/&nbsp;?</td>
          </tr>
          <tr>
            <td :class="ns.e('domain')">{{ t('sys.appDesigner.timedTask.editor.month') }}</td>
            <td :class="ns.e('value-range')">[1, 12]</td>
            <td :class="ns.e('character')">*&nbsp;,&nbsp;-&nbsp;/</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script lang="ts" setup>
  // cron 表达式说明组件
  import { ref } from 'vue';
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  const isExpand = ref(false);

  const ns = useNamespace('cron-desc');

  const onClick = (e: MouseEvent) => {
    e.stopPropagation();
    isExpand.value = !isExpand.value;
  };
</script>
<style lang="scss">
  @import './cron-desc.scss';
</style>
