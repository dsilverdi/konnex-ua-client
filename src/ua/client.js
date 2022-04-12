const opcua = require('node-opcua')

const connectionStrategy = {
    initialDelay: 1000,
    maxRetry: 1
}
const options = {
    applicationName: "MyClient",
    connectionStrategy: connectionStrategy,
    securityMode: opcua.MessageSecurityMode.None,
    securityPolicy: opcua.SecurityPolicy.None,
    endpointMustExist: false,
    
};

const Browse = async (url, node) => {
    try {
            const client = opcua.OPCUAClient.create(options);
        
            // step 1 : connect to
            await client.connect(url);
        
            // step 2 : createSession
            const session = await client.createSession();   
        
            // step 3 : browse
            const browseResult = await session.browse(node);

            await session.close()

            await client.disconnect()

            return browseResult.references
    
    }catch (err){
        console.log(err)
    }

    return
}

const Read = async (url, node) => {
    try {
        const client = opcua.OPCUAClient.create(options);
    
        // step 1 : connect to
        await client.connect(url);
    
        // step 2 : createSession
        const session = await client.createSession();   
    
        // step 3 : read
        const maxAge = 0;
        const nodeToRead = {
            nodeId: node, 
            attributeId: opcua.AttributeIds.Value
        }

        const dataValue = await session.read(nodeToRead, maxAge)

        await session.close()

        await client.disconnect()

        return dataValue

    }catch (err){
        console.log(err)
    }

    return
}

const Monitor = async (url, node, ws) => {
    try{
        const client = opcua.OPCUAClient.create(options);
    
        // step 1 : connect to
        await client.connect(url);
    
        // step 2 : createSession
        const session = await client.createSession();  

        const subscription = opcua.ClientSubscription.create(session, {
            requestedPublishingInterval: 1000,
            requestedLifetimeCount:      100,
            requestedMaxKeepAliveCount:   10,
            maxNotificationsPerPublish:  100,
            publishingEnabled: true,
            priority: 10
        });

        const itemToMonitor =  {
            nodeId: node,
            attributeId: opcua.AttributeIds.Value
        };

        const parameters = {
            samplingInterval: 100,
            discardOldest: true,
            queueSize: 10
        };
        
        const monitoredItem  = opcua.ClientMonitoredItem.create(
            subscription,
            itemToMonitor,
            parameters,
            opcua.TimestampsToReturn.Both
        );
        
        monitoredItem.on("changed", (dataValue) => {
            ws.send(dataValue.value.value.toString())
        });

        ws.on('close', async function(){
            console.log('closing websocket')
            await subscription.terminate();
            await session.close()

            await client.disconnect()
        })

    }catch (err){
        console.log(err)
    }

}

module.exports = {
    // CreateSession,
    Browse,
    Read,
    Monitor
} 