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

module.exports = {
    Browse
} 