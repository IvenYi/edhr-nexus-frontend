<template>
  <div class="font-family">
    <div class="setting-row flex-col">
      <div class="sub-title mb-4px">字体</div>
      <div class="sub-content overflow-hidden">
        <div class="sub-content_inner overflow-hidden">
          <a-select v-model:value="currentValue" style="width: 100%">
            <a-select-opt-group
              v-for="(fontFamily, index) in aa"
              :key="'fontfamliy' + Math.random()"
            >
              <template #label>
                <span>{{ fontFamily.family }}</span>
              </template>
              <a-select-option
                v-for="(font, i) in fontFamily.fonts"
                :key="Math.random()"
                :value="font.definition"
                :label="font.name"
              />
            </a-select-opt-group>
          </a-select>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { getLabelListFont } from '/@/apis/gct-apaas/LabelController';

  export default {
    // eslint-disable-next-line vue/component-definition-name-casing
    name: 'font-family',
    props: ['value', 'label'],
    data() {
      return {
        aa: [
          {
            family: '黑体',
            fonts: [
              {
                name: '微软雅黑',
                definition: '微软雅黑',
              },
              {
                name: '黑体',
                definition: '黑体',
              },
            ],
          },
          {
            family: '宋体',
            fonts: [
              {
                name: '宋体',
                definition: '宋体',
              },
            ],
          },
          {
            family: 'serif',
            fonts: [
              {
                name: 'Georgia',
                definition: 'Georgia, serif',
              },
              {
                name: 'Palatino',
                definition: '"Palatino Linotype", "Book Antiqua", Palatino serif',
              },
              {
                name: 'Times',
                definition: '"Times New Roman", Times serif',
              },
              {
                name: '宋体',
                definition: '宋体',
              },
            ],
          },
          {
            family: 'sans-serif',
            fonts: [
              {
                name: 'Arial',
                definition: 'Arial, Helvetica, sans-serif',
              },
              {
                name: 'Arial Black',
                definition: '"Arial Black", Gadget, sans-serif',
              },
              // {
              //   name: 'Charcoal',
              //   definition: 'Charcoal, sans-serif',
              // },
              // {
              //   name: 'Geneva',
              //   definition: 'Geneva, Tahoma, sans-serif',
              // },
              // {
              //   name: 'Helvetica',
              //   definition: 'Helvetica, Arial, sans-serif',
              // },
              {
                name: 'Impact',
                definition: 'Impact, Charcoal, sans-serif',
              },
              {
                name: 'Lucida Sans',
                definition: '"Lucida Sans Unicode", "Lucida Grande", sans-serif',
              },
              {
                name: 'Tahoma',
                definition: 'Tahoma, Geneva, sans-serif',
              },
              // {
              //   name: 'Roboto',
              //   definition: 'Roboto, sans-serif',
              // },
              {
                name: 'Trebuchet',
                definition: '"Trebuchet MS", Helvetica, sans-serif',
              },
              {
                name: 'Verdana',
                definition: 'Verdana, Geneva, sans-serif',
              },
            ],
          },
          {
            family: 'monospace',
            fonts: [
              {
                name: 'Courier',
                definition: '"Courier New", Courier, monospace',
              },
              {
                name: 'Lucida Console',
                definition: '"Lucida Console", Monaco, monospace',
              },
            ],
          },
          {
            family: 'icons',
            fonts: [
              {
                name: 'Material Icons',
                definition: '"Material Icons"',
              },
            ],
          },
        ],
      };
    },
    computed: {
      currentValue: {
        get() {
          return this.value;
        },
        set(val) {
          this.$emit('changeEvent', val);
        },
      },
    },
    created() {
      const run = async () => {
        const res = await getLabelListFont();
        if (res) {
          const items: any[] = [];
          res.forEach((item) => {
            items.push({
              name: item.key,
              definition: item.value,
            });
          });
          this.aa.push({
            family: '其他',
            fonts: items,
          });
        }
      };
      run();
    },
  };
</script>
