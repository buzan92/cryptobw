'use strict';
import Ticker from '../models/ticker';

const fee = 0.9975;

const tickers = async(market, limit = 0) => {
    try {
        let result = await Ticker.find({Market: market})
        .sort({_id:1})
        .limit(limit)
        //.skip(2000) //REMOVE THEN
        .catch(err => {
            throw new Error('Error while save ticker to DB');
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


export async function RSI(market = 'BTC-XRP', periods = 20, duration = 30) {
    let balance1 = 1;
    let balance2 = 0;
    let isBuying = true;
    let result = [];

    const count = periods * duration; 
    let allTickers = await tickers(market, 0);
    if (allTickers.length < count) {
        throw new Error('not enough tickers');
    }

    for (let i=0; i < allTickers.length - count; i++) {
        const tickers = allTickers.slice(i, i + count);
        const candles = getCandles(tickers, periods, duration);
        const RSI = calcRSI(candles)
        //console.log(RSI);
        if (isBuying) {
            if (RSI <=30) {
                balance2 = balance1 / allTickers[i+count].Sell[0].Rate * fee;
                //balance2 = balance1 / candles[periods-1].Last * fee;
                balance1 = 0;
                isBuying = false;
                result.push(`Покупка по ${allTickers[i+count].Sell[0].Rate} балансы: ${balance1} ${balance2}`);
            }
        } else {
            if (RSI >= 80) {
                balance1 = balance2 * allTickers[i+count].Buy[0].Rate * fee;
                //balance1 = balance2 * candles[periods-1].Last * fee;
                balance2 = 0;
                isBuying = true;
                result.push(`Продажа по ${allTickers[i+count].Buy[0].Rate} балансы: ${balance1} ${balance2}`);
            }
        }
    }
    console.log(result);
    return result;
}
