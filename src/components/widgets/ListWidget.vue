<template>
  <DynamicScroller
    :key="list.length"
    class="scroller"
    :min-item-size="240"
    :items="list"
    :key-field="keyField"
  >
    <template v-slot="{ item, index, active }">
      <DynamicScrollerItem
        :key="item[keyField]"
        :item="item"
        :active="active"
        :data-index="index"
        ><slot :item="item"></slot>
        <!-- <ScaningItem
              :key="item.IDSec"
              :data="item"
              @delete="itemDelete"
              @tap="filterByArticul(item)"
            /> -->
        <div style="min-height: 1px"></div>
      </DynamicScrollerItem>
    </template>
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
