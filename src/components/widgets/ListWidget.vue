<template>
  <!---->
  <DynamicScroller
    :key="list.length"
    class="scroller"
    :items="list"
    :min-item-size="240"
    :key-field="keyField"
    page-mode
  >
    <template v-slot="{ item, index, active }">
      <DynamicScrollerItem
        :key="item[keyField]"
        :item="item"
        :active="active"
        :data-index="index"
        ><slot :item="item"></slot>
        <div style="min-height: 0.1rem"></div>
      </DynamicScrollerItem>
    </template>
    <!-- <template v-slot="{ item, index, active }">
      <DynamicScrollerItem
        :key="item[keyField]"
        :item="item"
        :active="active"
        :data-index="index"
        ><slot :item="item"></slot>
        <div style="min-height: 1px"></div>
      </DynamicScrollerItem>
    </template> -->
  </DynamicScroller>
</template>
<script setup lang="ts">
interface Props {
  list: any[];
  keyField: string;
}
// sizeDependencies: any[];
// :size-dependencies="sizeDependencies"

const props = defineProps<Props>();
</script>
