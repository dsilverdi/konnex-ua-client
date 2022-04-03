const App = require('./src/app')
const uaconfig = require('./src/ua/config')
server = new App()

server.init(process.env.PORT || 8000, () => {
    // influxDB.init()
    // mongodb.init()
    // redis.init()
    // mqtt.init()
    uaconfig.ReadConfiguration()
})

process.on('exit', function (){
    console.log('Saving All Configuration');
     uaconfig.SaveConfiguration();
 });
 
 process.on("SIGINT", function(){
     console.log("You Pressed CTRL+C");
     (async function(err){
         process.exit();
     })();
 });
 
