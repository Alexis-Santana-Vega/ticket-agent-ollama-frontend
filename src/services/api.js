import axios from 'axios'
const api = axios.create({ baseURL: '/api' })

export const uploadTicket = (file) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/tickets/upload', form)
}
export const sendMessage = (messages) =>
  api.post('/chat/', { messages })
export const getTickets = () => api.get('/tickets/')