import { io } from 'socket.io-client'

const socket = io(import.meta.env.VITE_SERVER_IP, { autoConnect: false })

socket.onAny((event, ...args) => {
    console.log(event,args)
})

export default socket