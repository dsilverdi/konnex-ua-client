const wrapper = require('./pkg/wrapper')
const ua = require('./ua/client')
const uaconfig = require('./ua/config')
const {v4: uuidv4} = require('uuid');
const _ = require('lodash');

const SaveClientCfg = async (req, res) => {
    const payload = {
        url : req.body.url
    }

    if (_.isEmpty(payload, true)) {
        wrapper.send(res, 'Payload cannot be empty', 'Error', 400)
    }

    try{
        // session = ua.CreateSession(payload.url)

        clientcfg = uaconfig.GetClient()
        clientcfg.push({
            id: uuidv4(),
            url: payload.url,
            // session: session
        })

        wrapper.send(res, payload.url, 'Your Request Has Been Processed ', 201)

    }catch (err){
        wrapper.send(res, err, 'Error', 500)
    }
}

const GetClientCfg = async (req, res) => {
    try{
        clientcfg = uaconfig.GetClient()

        const data = []
        clientcfg.map((cl)=>{
            data.push({
                id: cl.id,
                url: cl.url
            })
        })

        wrapper.send(res, data, 'Your Request Has Been Processed ', 201) 
     }catch (err){
         wrapper.send(res, err, 'Error', 500)
     }
}

const BrowseNode = async (req, res) => {
    const payload = {
        id : req.query.id,
        node: req.query.node
    }

    if (_.isEmpty(payload, true)) {
        wrapper.send(res, 'Payload cannot be empty', 'Error', 400)
    }

    try{      

        clientcfg = uaconfig.GetClient()
        client = clientcfg.find(obj => {
            return obj.id === payload.id
        })

        console.log(client)

        const references = await ua.Browse(client.url, payload.node)

        const data = []
        references.map((ref)=>{
            data.push({
                node_id : ref.nodeId,
                browse_name : ref.browseName.toString()
            })
        })
        wrapper.send(res, data, 'Your Request Has Been Processed ', 201)

    }catch(err){
        wrapper.send(res, err, 'Error', 500)
    }
}

const ReadNode = async (req, res) => {
    const payload = {
        id : req.query.id,
        node: req.query.node
    }

    if (_.isEmpty(payload, true)) {
        wrapper.send(res, 'Payload cannot be empty', 'Error', 400)
    }

    try{
        clientcfg = uaconfig.GetClient()
        client = clientcfg.find(obj => {
            return obj.id === payload.id
        })

        const readval = await ua.Read(client.url, payload.node)
        wrapper.send(res, readval, 'Your Request Has Been Processed ', 201)

    }catch(err){
        wrapper.send(res, err, 'Error', 500)
    }

}

const MonitorNode = async (ws, req) => {
    ws.on('connect', function(connection) {
        console.log('WebSocket Client Connected');

        connection.on('error', function(error){
            console.log("Connection Error: " + error.toString());
        })
    })

    var payload = {
        id : req.query.id,
        node: req.query.node
    }

    // var number = 21
    // setInterval(function(){
    //     ws.send(number)
    //     number = number + 2
    // ;}, 1000);
    
    clientcfg = uaconfig.GetClient()
    client = clientcfg.find(obj => {
        return obj.id === payload.id
    })

    await ua.Monitor(client.url, payload.node, ws)
}
 
module.exports = {
    SaveClientCfg,
    GetClientCfg,
    BrowseNode,
    ReadNode,
    MonitorNode
}