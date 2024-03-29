const wrapper = require('./pkg/wrapper')
const ua = require('./ua/client')
const uaconfig = require('./ua/config')
const {v4: uuidv4} = require('uuid');
const _ = require('lodash');
const redis = require('redis')

const rediscl = redis.createClient(6380);

rediscl.connect();

rediscl.on("error", (error) => {
    console.error(error);
});

const SaveClientCfg = async (req, res) => {
      const payload = {
        name: req.body.name,
        url : req.body.url
    }

    const currentUser = req.user.Username

    if (_.isEmpty(payload, true)) {
        wrapper.send(res, 'Payload cannot be empty', 'Error', 400)
    }

    try{
        clientcfg = uaconfig.GetClient()
        clientcfg.push({
            id: uuidv4(),
            name: payload.name,
            url: payload.url,
            owner: currentUser
        })

        wrapper.send(res, payload.url, 'Your Request Has Been Processed ', 201)

    }catch (err){
        wrapper.send(res, err, 'Error', 500)
    }
}

const GetClientCfg = async (req, res) => {

    const currentUser = req.user.Username

    try{
        clientcfg = uaconfig.GetClient().filter(obj=>obj.owner===currentUser)

        const data = []
        clientcfg.map((cl)=>{
            data.push({
                id: cl.id,
                url: cl.url,
                name: cl.name
            })
        })

        

        if (req.query.id) {
            const ClientInfo = data.find(obj=>obj.id === req.query.id)
            wrapper.send(res, ClientInfo, 'Your Request Has Been Processed ', 201)
        }else{
            wrapper.send(res, data, 'Your Request Has Been Processed ', 201)
        }
         
     }catch (err){
         wrapper.send(res, err, 'Error', 500)
     }
}

const DeleteClient = async (req,res) => {
    const id = req.query.id
    if (id){
        client = uaconfig.GetClient()
    
        uaconfig.UpdateClient(
            client.filter(obj=>obj.id !== id)
        )
        
        wrapper.send(res, 'Success Delete Client', 'Success', 201)
    }else{
        wrapper.send(res, 'Empty Query', 'Error', 400)
    }
}

const BrowseNode = async (req, res) => {
    urlkey = req.url

    const value = await rediscl.get(urlkey);
    if (value) {
        wrapper.send(res, JSON.parse(value), 'cached', 201)
    }else{
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
    
            const references = await ua.Browse(client.url, payload.node)
    
            const data = []
            references.map((ref)=>{
                data.push({
                    node_id : ref.nodeId,
                    browse_name : ref.browseName.toString()
                })
            })

            await rediscl.set(urlkey, JSON.stringify(data));
            await rediscl.expire(urlkey, 12*60);

            wrapper.send(res, data, 'Your Request Has Been Processed ', 201)
    
        }catch(err){
            wrapper.send(res, err, 'Error', 500)
        }
    }
    
}

const ReadNode = async (req, res) => {
    urlkey = req.url
    
    const value = await rediscl.get(urlkey);
    if (value) {
        wrapper.send(res, JSON.parse(value), 'cached', 201)
    }else{
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

            await rediscl.set(urlkey, JSON.stringify(readval));
            await rediscl.expire(urlkey, 10);

            wrapper.send(res, readval, 'Your Request Has Been Processed ', 201)
    
        }catch(err){
            wrapper.send(res, err, 'Error', 500)
        }
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
    
    clientcfg = uaconfig.GetClient()
    client = clientcfg.find(obj => {
        return obj.id === payload.id
    })

    await ua.Monitor(client.url, payload.node, ws)
}
 
module.exports = {
    SaveClientCfg,
    GetClientCfg,
    DeleteClient,
    BrowseNode,
    // BrowseAllNode,
    ReadNode,
    MonitorNode
}