'use strict'

import domReady from 'detect-dom-ready'
import libp2p from 'libp2p'
import PeerInfo from 'peer-info'
import WebRTCStar from 'libp2p-webrtc-star'
import KadDHT from 'libp2p-kad-dht'
import CID from 'cids'

class MyBundle extends libp2p {
  constructor (peerInfo) {
    const wstar = new WebRTCStar()
    const modules = {
      transport: [wstar],
      discovery: [
        wstar.discovery,
      ],
      DHT: KadDHT
    }
    super(modules, peerInfo)
  }
}

function createNode (callback) {
  PeerInfo.create((err, peerInfo) => {

    if (err) {
      return callback(err)
    }

    const peerIdStr = peerInfo.id.toB58String()
    const ma = `/dns4/star-signal.cloud.ipfs.team/wss/p2p-webrtc-star/ipfs/${peerIdStr}`
    
    peerInfo.multiaddrs.add(ma)
    const node = new MyBundle(peerInfo)
    node.idStr = peerIdStr
    callback(null, node)

  })
}

domReady(() => {
  createNode((err, node) => {

    if (err) {
      return console.log('Could not create the Node, t', err)
    }

    node.on('peer:discovery', (peerInfo) => {
      const idStr = peerInfo.id.toB58String()
      console.log('Discovered a peer:', idStr);
    })

    node.start((err) => {
      if (err) {
        return console.log('WebRTC not supported')
      }
      const idStr = node.peerInfo.id.toB58String()
      console.log('Node ' + idStr + ' has just started')
    })

  })
})
