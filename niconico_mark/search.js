$(function(){
    var color = "";
    $("[data-video-item]").each(function (index, value) {
        $.ajax({
            url: 'http://localhost:3000/checkVideo/' + $(value).attr("data-video-id"),
            type:'get'
        }).done(function(response, status, jqXHR) {
            switch(response){
                case "ari":
                    color = "#ff7300";//オレンジ
                    break;
                case "imaichi":
                    color = "#0d00ff";//青
                    break;
                case "good":
                    color = "#1eff00";//黄緑
                    break;
                case "deletezumi":
                    color = "#6f6e6f";//灰色
                    break;
                case "sonota":
                    color = "#ff00e3";//ピンク
                    break;
                default:
                    color = "#ffffff";//白
            }
            $(value).css("background-color", color);
        }).fail(function(jqXHR, status, error) {
            console.log("サーバを起動させてください");
        });
    });
    badge("成功");

    function badge(status){
        chrome.runtime.sendMessage({
            status: status
        });
    }
});
