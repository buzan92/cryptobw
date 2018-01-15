import Koa from 'koa';
import config from  'config';
import err from './middleware/error';
import mongoose from 'mongoose';
import { bittrex } from './controllers/bittrex'
//import {routes, allowedMethods} from './middleware/routes';



mongoose.connect(config.mongodb.url, config.mongodb.options);
mongoose.connection.on('error', console.error);

const app = new Koa();

app.use(err);
//app.use(routes());
//app.use(allowedMethods());

app.listen(config.server.port, function () {
    console.log('%s listening at port %d', config.app.name, config.server.port);
});

//let x = app.post('http://amopizza.ru/goods2.json');
//let a = bittrex().apiUrl;
bittrex();
//console.log(a); 
