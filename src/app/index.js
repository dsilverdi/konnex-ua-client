const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const expressWs = require('express-ws')(app);
const logger = require('../pkg/logger')
const api = require('../api')

class Server {
  constructor () {
    this.app = app
    this.app.use(bodyParser.json())
    this.app.use(bodyParser.urlencoded({ extended: true }))
    this.app.use(cors())
    // this.app.use(basicAuth.init())

    // endpoint
    this.app.get('/', (req, res) => {
      res.send('This service is running properly ')
    })

    //Config API
    this.app.get('/client', api.GetClientCfg)
    this.app.post('/client', api.SaveClientCfg)

    //Browse API
    this.app.get('/client/browse', api.BrowseNode)

    //Reading API
    this.app.get('/client/read', api.ReadNode)

    //Websocket API Start Here
    this.app.ws('/client/monitor', api.MonitorNode)
  }

  init (port, next) {
    this.app.listen(port, () => {
        logger.info('app-init', `app run on ${port} `, '')
    })
    next()
  }
}

module.exports = Server