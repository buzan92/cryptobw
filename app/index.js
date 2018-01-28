import Koa from 'koa';
import config from  'config';
import err from './middleware/error';
import mongoose from 'mongoose';
import logger from 'koa-logger';
import { bittrex } from './controllers/bittrex';
import { RSI } from './indicators/RSI';
import cluster from 'cluster';
import os from 'os';
import router from './router'

const numCPUs = os.cpus().length;




mongoose.set('debug', true);
mongoose.connect(config.mongodb.url, config.mongodb.options);
mongoose.Promise = global.Promise;
mongoose.connection.on('error', console.error);

const app = new Koa();
app.use(err)
    .use(logger())
    .use(router.routes())
    .use(router.allowedMethods());

app.listen(config.server.port, function () {
    console.log('%s listening at port %d', config.app.name, config.server.port);
});




bittrex();
//let aa = RSI();
//console.log(aa);


//console.log('process ' + process.pid + ' says hello!')


/*
cluster.setupMaster({
    exec: bittrex()
    //exec: "worker.js"
});

// Fork workers as needed.
for (let i=0; i<numCPUs; i++) {
    console.log('ssss');
    cluster.fork();
}
*/