
<style scope>
    .reft_screen_form{
        height: 100vh;
        display: flex;
        flex-direction: column;
        background-color: white;
    }
    .reft_modal {
        height: 100vh;
        /*height: -webkit-fill-available;*/
        width: 100%;
        background-color: white;
        position: absolute;
        top: 0px;
        padding:16px;
        display: flex;
        flex-direction: column;
    }

    .close_btn {
        width: 100%;
        margin-bottom: 16px;
    }

    .space {
        flex: 1;
    }

    
</style>
<template>
    <div>
        <FormSelectUser/>
        <MainMenu/>
        <GettingProdLoad/>
        <GettingProdForm/>
        <GettingProdCheck/>

        <SettingsButton/>
        <SettingsScreen/>
        <ConfirmScreen/>
  
    </div>
</template>

<script setup lang="ts">
import FormSelectUser from './FormSelectUser.vue'
import MainMenu from './MainMenu.vue'
import GettingProdLoad from './getting/GettingProdLoad.vue'
import GettingProdForm from './getting/GettingProdForm.vue'
import GettingProdCheck from './getting/GettingProdCheck.vue'
import SettingsButton from './widgets/SettingsButton.vue'
import SettingsScreen from './SettingsScreen.vue'
import ConfirmScreen from './widgets/ConfirmScreen.vue'
import { onMounted } from 'vue';
import { RoutingManager } from '@/classes/RoutingManager';

onMounted(() => {
  RoutingManager.instance.afterReload()
});

</script>