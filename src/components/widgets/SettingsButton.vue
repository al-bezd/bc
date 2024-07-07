<style scope>
.setting {
    background-image: url('@/assets/img/setting.png');
    background-repeat: no-repeat;
    background-size: cover;

    height: 20px;
    width: 20px;
    position: absolute;
    top: 8px;
    right: 8px;
  }
</style>
<template>
    <div>
        <div class="setting" @click="onTap"></div>
    </div>
</template>
<script setup lang="ts">
import { UserManager } from '@/managers/user/UserManager';

function onTap(){
    UserManager.instance.emit('showAdminPage')
}
</script>