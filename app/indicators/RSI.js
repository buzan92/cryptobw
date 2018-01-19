'use strict';
import Ticker from '../models/ticker';

const fee = 0.9975;

const getTickersCount = async(market) => {
    try {
        let result = await Ticker.find({Market: market})
        .count()
        .catch(err => {
            throw new Error('Error while get tickers count from DB')
        })
        return result;
    } catch(err) {
        console.log(err);
    }
}

const tickers = async(market, limit = 0, skip = 0) => {
    try {
        let result = await Ticker.find({Market: market})
        .sort({_id:1})
        .limit(limit)
        .skip(skip) 
        .catch(err => {
            throw new Error('Error while get tickers from DB');
        })
        return result;
    } catch(err) {
        console.log(err);
    }
}

const getCandles = (tickers, periods, duration) => {
    let candles = [];
    for (let i = 0; i < periods; i++) {
        const currentCandle = tickers.slice(i * duration, (i + 1) * duration);
        const candle = {
            First: currentCandle[0].Last,
            Last: currentCandle[duration-1].Last,
            Max: Math.max(...currentCandle.map(o => o.Last)),
            Min: Math.min(...currentCandle.map(o => o.Last))
        }
        candles.push(candle);
    }
    return candles;
}

const calcRSI = (candles) => {
    let result = 0;
    let growth = {
        sum: 0,
        count: 0
    };
    let fall = {
        sum: 0,
        count: 0
    };
    for (let i = 1; i < candles.length; i++) {
        if (candles[i].Last > candles[i-1].Last && candles[i].Last != candles[i-1].Last) {
            growth.sum += candles[i].Last - candles[i-1].Last;
            growth.count++;
        } else {
            fall.sum += candles[i-1].Last - candles[i].Last;
            fall.count++;
        }
    }
    if (fall.count === 0) {
        result = 100;
    } else {
        if (growth.count === 0) {
            result = 0;
        } else {
            let RS = (growth.sum / growth.count) / (fall.sum / fall.count);
            result = 100 - (100 / (1 + RS));
        }
    }
    return result;
}




const tradeRSI = () => {
    let str = '';

}


export async function RSI(market = 'BTC-XVG', periods = 20, duration = 30) {
    let balance1 = 1;
    let balance2 = 0;
    let isBuying = true;
    let result = [];


    const count = periods * duration; 
    const tickersCount = await getTickersCount(market);
    if (tickersCount < count) {
        throw new Error('not enough tickers');
    }
    const portionCount = Math.ceil(tickersCount / 1000);
    console.log('port count: ', portionCount);

    for (let j = 0; j < portionCount; j++) {
        
        var t0 = performance.now();
        let allTickers = await tickers(market, 1000, j * 1000);
        var t1 = performance.now();
        console.log("Call to allTickers ", (t1 - t0), " ms.")

        for (let i=0; i < allTickers.length - count; i++) {
            const tickers = allTickers.slice(i, i + count);
            const candles = getCandles(tickers, periods, duration);
            const RSI = calcRSI(candles)
            //console.log(RSI);
            if (isBuying) {
                if (RSI <=30) {
                    balance2 = balance1 / allTickers[i+count].Sell[0].Rate * fee;
                    balance1 = 0;
                    isBuying = false;
                    result.push(`Покупка по ${allTickers[i+count].Sell[0].Rate} балансы: ${balance1} ${balance2}`);
                }
            } else {
                if (RSI >= 80) {
                    balance1 = balance2 * allTickers[i+count].Buy[0].Rate * fee;
                    balance2 = 0;
                    isBuying = true;
                    result.push(`Продажа по ${allTickers[i+count].Buy[0].Rate} балансы: ${balance1} ${balance2}`);
                }
            }
        }
    }
    console.log(result);
    return result;
}
