function s(){
    var wd = new TradingView.widget(
        {
            "autosize": true,
            "symbol": "BITSTAMP:BTCUSD",
            "interval": "D",
            "timezone": "America/Sao_Paulo",
            "theme": "dark",
            "style": "1",
            "locale": "br",
            "toolbar_bg": "#f1f3f6",
            "enable_publishing": false,
            "hide_side_toolbar": false,
            "allow_symbol_change": true,
            "details": true,
            "container_id": "tradingview_f9a16"
        }
);
return wd;
}