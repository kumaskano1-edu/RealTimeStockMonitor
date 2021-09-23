const yahooFinance = require('yahoo-finance');


exports.getStockQuote = async(stockSymbol) => {
    let stockInfo = {}
    try {
        stockInfo = await yahooFinance.quote({
            symbol: stockSymbol,
            modules: ['summaryDetail', 'price']}, function(err, quotes) {
              if(err) {
                  throw err
              }
              return quotes
            })
        
    } catch(e) {
        stockInfo = e
    }
    return stockInfo
}