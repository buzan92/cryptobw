'use strict';
import axios from 'axios';
import Ticker from '../models/ticker'

const apiURL = 'https://bittrex.com/api/v1.1/public/'; //getticker';
const markets = [
    'BTC-NEO', 'BTC-ETH', 'BTC-XRP',
    'BTC-XVG', 'BTC-ADA', 'BTC-SC',
    'BTC-BCC', 'BTC-XLM', 'BTC-BTG',
    'BTC-ETC', 'BTC-STRAT', 'BTC-LTC',
    'BTC-XEM', 'BTC-DGB', 'BTC-QTUM',
    'BTC-RDD', 'BTC-LSK', 'BTC-DOGE',
    'BTC-ZEC', 'BTC-XMR'
];
//const market = 'BTC-XVG';

const getMarkets = async () => {
    try {
        const time = new Date().toLocaleTimeString();
        const URL = apiURL + 'getmarkets';
        const response = await axios.get(URL);
        const data = response.data;
        if (data.success !== true) {
            const msg = (data.message) ? data.message : '';
            throw new Error(`Unsuccessful getMarkets query to bittrex: ${time} msg: ${msg}`);
        } else {
            const result = data.result;
            let markets = [];
            for (let i = 0; i < result.length; i++) {
                if (result[i].BaseCurrency === 'BTC' && result[i].IsActive) {
                    markets.push(result[i].MarketName);
                }
            }
            return markets;
        }
    } catch(err) {
        console.log(err);
    }
};

const getTicker = async (market) => {
    try {
        const time = new Date().toLocaleTimeString();
        const URL = apiURL + 'getticker';
        const response = await axios.get(URL, {
            params: {
                market: market
            }
        }).catch(err => {
            throw new Error(`axios getOrderBook error: ${err}`);
        });
        const data = response.data;
        if (data.success !== true) {
            const msg = (data.message) ? data.message : '';
            throw new Error(`Unsuccessful getTicker query to bittrex for market: ${market} ${time} msg: ${msg}`);
        } else {
            console.log(`${time} - ticke - ${market}`);
            const ticker = {
                time: time,
                bid: data.result.Bid,
                ask: data.result.Ask,
                last: data.result.Last
            }
            return ticker;
        }
    } catch(err) {
        console.log(err);
    }
};

const getOrderBook = async (market) => {
    try {
        const time = new Date().toLocaleTimeString();
        const URL = apiURL + 'getorderbook';
        const response = await axios.get(URL, {
            params: {
                market: market,
                type: 'both'
            }
        }).catch(err => {
            throw new Error(`axios getOrderBook error: ${err}`);
        });
        const data = response.data;
        if (data.success !== true) {
            const msg = (data.message) ? data.message : '';
            throw new Error(`Unsuccessful getOrderBook query for market: ${market} ${time} msg: ${msg}`)
        } else {
            console.log(`${time} - order - ${market}`);
            const orderBook = {
                buy: data.result.buy.slice(0, 10),
                sell: data.result.sell.slice(0, 10)
            }
            return orderBook;
        }
    } catch (err) {
        console.log(err);
    }
}

const addToDb = async (market, ticker, orderBook) => {
    try {
        const time = new Date().toLocaleTimeString();
        const newticker = new Ticker({
            Market: market, 
            Time: ticker.time,
            Bid: ticker.bid,
            Ask: ticker.ask,
            Last: ticker.last,
            Buy: orderBook.buy,
            Sell: orderBook.sell
        });

        await newticker.save().catch(err => {
            throw new Error('Error while save ticker to DB');
        })
        console.log(`${time} - adddb - ${market}`);
    } catch(err) {
        console.log(err);
    }
}

export async function bittrex() {
       
    //const markets = await getMarkets();
    
    setInterval(
        () => {
        markets.forEach(async item => {
            let [ticker, orderBook] = await Promise.all([getTicker(item), getOrderBook(item)]);
            if (ticker && orderBook) {
                let x = await addToDb(item, ticker, orderBook);
            } 
        })
    }, 2000);
}


