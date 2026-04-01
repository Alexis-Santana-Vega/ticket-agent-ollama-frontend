<template>
  <v-app>
    <v-app-bar order="2">
      <v-app-bar-nav-icon @click.stop="openDrawer()"></v-app-bar-nav-icon>
      <v-app-bar-title>Tickets de Compras</v-app-bar-title>
    </v-app-bar>
    <v-navigation-drawer v-model="controls.drawer" order="1" :rail="controls.rail" :rail-width="64">
      
      <div class="d-flex h-100 align-center">
        <v-list class="px-2 w-100" variant="flat" color="primary">
          <v-list-item>
          <template v-slot:prepend>
            <v-img
              src="https://raw.githubusercontent.com/lobehub/lobe-icons/refs/heads/master/packages/static-png/light/ollama.png"
              height="48" width="48" class="ml-n4 mr-4 mt-n1 rounded-circle" cover />
          </template>
          <v-list-item-title class="text-h6 font-weight-black">Ollama Agent</v-list-item-title>
        </v-list-item>
        <v-list-item v-for="(item, i) in menuItems" :key="i" :to="item.href" :value="item">
          <template v-slot:prepend>
            <v-icon class="ml-n1 mr-n2" :icon="item.icon"></v-icon>
          </template>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
          <v-tooltip v-if="controls.rail" activator="parent" location="end" :text="item.title"></v-tooltip>
        </v-list-item>
      </v-list>
      </div>
      <template v-slot:append>
      </template>
    </v-navigation-drawer>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import { computed, ref } from 'vue'
import { reactive, watch } from 'vue'
import { useDisplay, useTheme } from 'vuetify'

export default {
  setup() {
    const { mdAndDown } = useDisplay()
    const theme = useTheme()
    /** Data */
    const menuItems = [
      { title: "Subir", icon: "mdi-upload-circle-outline", href: "/" },
    ]
    const controls = reactive({
      rail: null,
      drawer: null,
    })
    /** Methods */
    const openDrawer = () => {
      if (mdAndDown.value) {
        controls.drawer = !controls.drawer
        controls.rail = false
      } else {
        controls.rail = !controls.rail
      }
    }
    const initialize = () => {
      controls.rail = !mdAndDown.value
    }
    initialize()
    return { controls, openDrawer, menuItems }
  }
}
</script>