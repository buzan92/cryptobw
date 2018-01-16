import Koa from 'koa';
import config from  'config';
import err from './middleware/error';

import mongoose from 'mongoose';
import { bittrex } from './controllers/bittrex'
//import {routes, allowedMethods} from './middleware/routes';

import cluster from 'cluster';
import os from 'os';
//const numCPUs = require('os').cpus().length;
const numCPUs = os.cpus().length;
console.log('!!!', numCPUs);


mongoose.connect(config.mongodb.url, config.mongodb.options);
mongoose.connection.on('error', console.error);

const app = new Koa();

app.use(err);
//app.use(routes());
//app.use(allowedMethods());


app.listen(config.server.port, function () {
    console.log('%s listening at port %d', config.app.name, config.server.port);
});



cluster.setupMaster({
    exec: bittrex()
    //exec: "worker.js"
});

// Fork workers as needed.
for (let i=0; i<numCPUs; i++) {
    console.log('ssss');
    cluster.fork();
}
