'use strict';

import Ticker from '../models/ticker';
import { RSI } from '../indicators/RSI'

export default router => {
    router
        .get('/api/calcrsi', calcRsi)
//      .post('/categories', mw.verifyToken, create)
//      .get('/categories', allCategory)
//      .patch('/categories/:id', mw.verifyToken, modify)
//      .delete('/categories/:id', mw.verifyToken, deleteCat)
}

async function calcRsi(ctx, next) {
    const {market, periods, duration} = ctx.request.query;
    let data = '';
    if (market && periods && duration) {
        data = await RSI(market, periods, duration);
    } else {
        data = 'example query: ?market=BTC-XVG&periods=14&duration=30';
    }

    ctx.body = {
        data: data,
        query: ctx.request.query
    }
    await next();
}