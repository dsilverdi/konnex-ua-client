const wrapper = require('./pkg/wrapper')
const ua = require('./ua/client')
const _ = require('lodash')

const ClientCfg = []

const SaveClientCfg = async (req, res) => {
    const payload = {
        url : req.body.url
    }

    if (_.isEmpty(payload, true)) {
        wrapper.send(res, 'Payload cannot be empty', 'Error', 400)
    }

    try{

       ClientCfg.push({
           id: 1,
           url: payload.url
       })

        wrapper.send(res, payload.url, 'Your Request Has Been Processed ', 201)

    }catch (err){
        wrapper.send(res, err, 'Error', 500)
    }
}

const BrowseNode = async (req, res) => {
    const payload = {
        id : req.query.id,
        node: req.query.node
    }

    console.log(req.query.node)

    if (_.isEmpty(payload, true)) {
        wrapper.send(res, 'Payload cannot be empty', 'Error', 400)
    }

    try{
        console.log(payload)
        console.log(ClientCfg[0].url)
        const references = await ua.Browse(ClientCfg[0].url, payload.node)

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
module.exports = {
    SaveClientCfg,
    BrowseNode
}