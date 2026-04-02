<template>
  <v-container class="pa-6" fluid>
    <v-row density="comfortable">
      <!-- Panel de carga de tickets -->
      <v-col cols="12" md="6" lg="4">
        <v-card class="h-100">
          <v-card-title class="bg-primary"><v-icon icon="mdi-upload-circle-outline" class="mr-2"></v-icon>Subir
            Tickets</v-card-title>

          <v-card-text class="pa-6">
            <v-row density="comfortable">
              <v-col cols="12">
                <v-file-input v-model="newFile" label="Selecciona un archivo (PDF, PNG, JPEG)"
                  accept=".pdf,.png,.jpg,.jpeg" :disabled="isUploading" />
              </v-col>
              <v-col cols="12">
                <v-btn @click="submitTicket" color="primary" block size="large" :loading="isUploading"
                  prepend-icon="mdi-upload" :disabled="!newFile || isUploading">
                  Subir Ticket
                </v-btn>
              </v-col>
            </v-row>



            <v-alert v-if="uploadMessage" :type="uploadMessage.type" class="mt-4" closable>
              {{ uploadMessage.text }}
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Panel de Chat -->
      <v-col cols="12" md="6" lg="8">
        <v-card class="h-100 d-flex flex-column">
          <v-card-title class="bg-tertiary">
            <v-icon left class="mr-2">mdi-chat-outline</v-icon>
            Chat con Agente IA
          </v-card-title>

          <v-card-text class="pa-0">
            <div ref="chatContainer" style="height: 400px; overflow-y: auto; overflow-x: hidden; display: flex; flex-direction: column;">
              <div class="pa-4">
                <div v-if="chatMessages.length === 0"
                  class="text-center d-flex align-center justify-center flex-column py-12">
                  <v-icon size="48" color="grey-darken-1">mdi-chat-outline</v-icon>
                  <p>Comienza una conversación con el agente Ollama</p>
                </div>

                <div v-for="(msg, index) in chatMessages" :key="index">
                  <!-- Mensaje del Usuario (derecha) -->
                  <div v-if="msg.role === 'user'" class="d-flex justify-end mb-2">
                    <v-card class="px-4" color="tertiary">
                      <p>{{ msg.content }}</p>
                    </v-card>
                    <v-avatar rounded="circle" size="large">
                      <v-icon icon="mdi-account-circle-outline" size="large"></v-icon>
                    </v-avatar>
                  </div>

                  <!-- Mensaje del Agente (izquierda) -->
                  <div v-else class="d-flex justify-start mb-2">
                    <v-avatar rounded="circle" size="large">
                      <v-icon icon="mdi-robot-happy-outline" size="large"></v-icon>
                    </v-avatar>
                    <v-card class="w-75 px-4" color="background">
                      <p>{{ msg.content }}</p>
                    </v-card>
                  </div>
                </div>
              </div>
            </div>
          </v-card-text>

          <v-divider />

          <v-card-text>
            <v-row no-gutters>
              <v-col cols="12" sm="10">
                <v-text-field v-model="newMessage" label="Escribe tu pregunta..." outlined
                  @keyup.enter="sendMessageHandler" hide-details :disabled="isChattting"/>
              </v-col>
              <v-col cols="12" sm="2" class="pl-2">
                <v-btn @click="sendMessageHandler" color="tertiary" block size="large" :loading="isChattting"
                  prepend-icon="mdi-send-variant" :disabled="!newMessage.trim() || isChattting">
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Lista de Tickets -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="bg-secondary">
            <v-icon left class="mr-2">mdi-list-box-outline</v-icon>
            Mis Tickets
          </v-card-title>

          <v-card-text class="pa-4">
            <v-btn @click="fetchTickets" prepend-icon="mdi-refresh" size="large" color="secondary">
                    Actualizar
                  </v-btn>
            <v-data-table :items="tickets" :headers="headers">
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { uploadTicket, sendMessage, getTickets } from '../services/api.js'

const tickets = ref([])
const chatMessages = ref([])
const newFile = ref(null)
const newMessage = ref('')
const isUploading = ref(false)
const isChattting = ref(false)
const uploadMessage = ref(null)
const chatContainer = ref(null)

const headers = ref([
  { title: 'ID del Ticket', value: 'id' },
  { title: 'Tienda', value: 'store' },
  { title: 'Fecha', value: 'date' },
  { title: 'Hora', value: 'time' },
  { title: 'Total', value: 'total' },
  { title: 'Numero de Productos', value: 'num_items' },

])

// Auto-scroll al final cuando hay nuevos mensajes
const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    setTimeout(() => {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }, 100)
  }
}

watch(
  () => chatMessages.value.length,
  scrollToBottom,
  { flush: 'post' }
)

const submitTicket = async () => {
  if (!newFile.value) {
    uploadMessage.value = { type: 'error', text: 'Selecciona un archivo primero' }
    return
  }

  try {
    isUploading.value = true
    const response = await uploadTicket(newFile.value)
    console.log('Archivo subido:', response.data)

    uploadMessage.value = {
      type: 'success',
      text: `✅ Ticket subido correctamente. ID: ${response.data.ticket_id}`
    }

    newFile.value = null
    await fetchTickets()

    setTimeout(() => {
      uploadMessage.value = null
    }, 5000)
  } catch (error) {
    console.error('Error al subir ticket:', error)
    uploadMessage.value = {
      type: 'error',
      text: `❌ Error: ${error.response?.data?.detail || 'No se pudo subir el ticket'}`
    }
  } finally {
    isUploading.value = false
  }
}

const fetchTickets = async () => {
  try {
    const response = await getTickets()
    tickets.value = response.data
  } catch (error) {
    console.error('Error al obtener tickets:', error)
  }
}

const sendMessageHandler = async () => {
  if (!newMessage.value.trim()) return

  try {
    isChattting.value = true

    // Agregar mensaje del usuario al historial
    chatMessages.value.push({
      role: 'user',
      content: newMessage.value
    })

    const userInput = newMessage.value
    newMessage.value = ''
    
    // Scroll inmediato después de agregar mensaje del usuario
    await scrollToBottom()

    // Enviar TODOS los mensajes del historial al backend
    const response = await sendMessage(chatMessages.value)

    // Agregar respuesta del agente
    chatMessages.value.push({
      role: 'assistant',
      content: response.data.reply
    })
    
    // Scroll después de agregar respuesta del agente
    await scrollToBottom()
  } catch (error) {
    console.error('Error al enviar mensaje:', error)
    chatMessages.value.push({
      role: 'assistant',
      content: `❌ Error: ${error.response?.data?.detail || 'No se pudo procesar tu mensaje'}`
    })
    // Scroll después del error
    await scrollToBottom()
  } finally {
    isChattting.value = false
  }
}

onMounted(() => {
  fetchTickets()
})
</script>