$(function(){
    var color = "";
    $.ajax({
        url: 'http://localhost:3000/checkVideo/' + JSON.parse($("#js-initial-watch-data").attr("data-api-data")).video.id,
        type: 'get'
    }).then(
    // 1つめは通信成功時のコールバック
    function(response){
        badge("成功");
        switch(response){
            case "ari":
                color = "#ff7300";//オレンジ
                hyouka = "あり";
                break;
            case "imaichi":
                color = "#0d00ff";//青
                hyouka = "イマイチ";
                break;
            case "good":
                color = "#1eff00";//黄緑
                hyouka = "良い";
                break;
            case "deletezumi":
                color = "#6f6e6f";//灰色
                hyouka = "削除済み";
                break;
            case "sonota":
                color = "#ff00e3";//ピンク
                hyouka = "その他";
                break;
            default:
                color = "#ffffff";//白
                hyouka = "未視聴";
        }
        $(".WatchAppContainer").css("background-color", color);
        $(".WatchAppContainer").prepend("<span style='font-size:50px'>" + hyouka + "</span>");
    },
    // 2つめは通信失敗時のコールバック
    function (XMLHttpRequest, textStatus, errorThrown) {
        console.log("ajax通信に失敗しました");
        console.log("XMLHttpRequest : " + XMLHttpRequest.status);
        console.log("textStatus     : " + textStatus);
        console.log("errorThrown    : " + errorThrown.message);
    });

    function badge(status){
        chrome.runtime.sendMessage({
            status: status
        });
    }
});