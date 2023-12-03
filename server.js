const express = require('express')
const http = require('http')
const WebSocket = require('ws')
const dgram = require('dgram')

const UDP_PORT = process.argv[2] || 1023 // The port for the UDP server

if (!process.argv[2]) {
  console.log('No UDP port provided, using default port 1023')
}

const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

const WEBSOCKET_PORT = 3000 // The port for the WebSocket server

// Creating a UDP server
const udpServer = dgram.createSocket('udp4')

udpServer.on('error', (err) => {
  console.log(`UDP Server error:\n${err.stack}`)
  udpServer.close()
})

udpServer.on('message', (msg, rinfo) => {
  console.log(`UDP server got: ${msg} from ${rinfo.address}:${rinfo.port}`)
  // Forwarding the message to all WebSocket clients
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg.toString())
    }
  })
})

udpServer.on('listening', () => {
  const address = udpServer.address()
  console.log(`UDP server listening ${address.address}:${address.port}`)
})

udpServer.bind(UDP_PORT)

// WebSocket server setup
wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    console.log('Received message:', message)
  })
  ws.send('Connected to WebSocket server')
})

server.listen(WEBSOCKET_PORT, () => {
  console.log(`WebSocket server started on port ${WEBSOCKET_PORT}`)
})
