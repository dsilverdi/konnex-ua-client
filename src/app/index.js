const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
// const basicAuth = require('../lib/auth/basic')
const logger = require('../pkg/logger')
const api = require('../api')

class Server {
  constructor () {
    this.app = express()
    this.app.use(bodyParser.json())
    this.app.use(bodyParser.urlencoded({ extended: true }))
    this.app.use(cors())
    // this.app.use(basicAuth.init())

    // endpoint
    this.app.get('/', (req, res) => {
      res.send('This service is running properly ')
    })

    this.app.get('/client', api.BrowseNode)
    this.app.post('/client', api.SaveClientCfg)
  }

  init (port, next) {
    this.app.listen(port, () => {
        logger.info('app-init', `app run on ${port} `, '')
    })
    next()
  }
}

module.exports = Server