let videoList = [];
let URLCandidates;
let URL;
let params;
let query;
let sort;
let searchString;
let val;
let point;

let videoElement;
let videoSource;
let videoTitle;
let videoURL;
let videoVolume = 0.2//初期音量を変更する場合はここを変更する;

let appendVideo = function(URL){
  videoElement = document.createElement("video");
  videoElement.autoplay = true;
  videoElement.volume = videoVolume;
  videoElement.addEventListener("timeupdate", function(){
    chrome.runtime.sendMessage(
      {
        type: "videoPlaying",
        currentVideoTime: videoElement.currentTime
      },
      function(response) {
      }
    );
  });
  videoElement.addEventListener("ended", function(){
    initialize();
    judge();
	});
  videoSource = document.createElement("source");
  videoSource.src = URL;
  videoElement.appendChild(videoSource);
  document.body.appendChild(videoElement);

  videoElement.addEventListener("loadedmetadata", function(){//動画の読み込みが完了したら
    chrome.runtime.sendMessage(
      {
        type: "videoSetUp",
        videoTitle: videoTitle,
        videoURL: videoURL,
        videoTime: videoElement.duration,
        videoVolume: videoVolume
      },
      function(response) {
      }
    );
  });
}

addEventListener("timeupdate", function(){
  document.getElementById("ichi").innerHTML = v.currentTime;
});

let judge = function(){
  if(videoList.length == 1){//videoListが残り1の時点でvideoListを補充する
    setPoint();
    inputVideo().then(videoExists)
    .then(takeOutVideo)
    .catch(function (error) {
      console.log(error);
    });
  }else{
    takeOutVideo();
  }
}

let initialize = function(){
  if(videoElement && videoSource){
    videoElement.removeChild(videoSource); 
    videoElement.parentNode.removeChild(videoElement);
  }
}

let takeOutVideo = function(){
  if(!(videoList[0].contentId.match(/nm/))){
    console.log('https://www.nicovideo.jp/watch/' + videoList[0].contentId + "\nを視聴します")
    $.ajax({
      url: 'https://www.nicovideo.jp/watch/' + videoList[0].contentId,
      type:'GET'
    }).done(function(response, status, jqXHR) {
      URLCandidates = response.match(/https:\\\/\\\/smile-\w+\.s\w+\.nicovideo\.jp\\\/smile\?[a-z]=(\.|[0-9])+(low)*/g);
      if(URLCandidates){
        URL = URLCandidates[0].replace(/\\/g, "");
        console.log("動画URL\n" + URL);
        videoTitle = videoList[0].title;
        videoURL = "https://www.nicovideo.jp/watch/" + videoList[0].contentId;
        appendVideo(URL);
        videoList.shift();
      }else{
        console.log("動画URLが存在しないため、次の動画を取得します");
        videoList.shift();
        judge();
      }
    }).fail(function(jqXHR, status, error) {
      console.log("jqXHR.status: " + jqXHR.status);
      switch(jqXHR.status){
        case 503:
          console.log("再度取得します");
          setTimeout(judge, 5000);
          break;

        case 404:
          console.log("削除済み、あるいは存在しない動画のため、次の動画を取得します");
          videoList.shift();
          judge();
          break;
      }
    });
  }else{
    console.log("動画IDが\nhttps://www.nicovideo.jp/watch/" + videoList[0].contentId + "\nで始まるため、次の動画を取得します");
    videoList.shift();
    setTimeout(judge, 2000);
  }
}

let videoExists = function(){//視聴済みの動画をvideoListからまとめて排除する
  return new Promise(async function (resolve, reject){
    let deferredArray = []
    let nestFunc = function(vi){
      return new Promise(function (res, rej){
        console.log(vi + " < " + videoList.length + "なので続行します");
        $.ajax({
          url: 'http://localhost:3000/checkVideo/' + videoList[vi].contentId,
          type:'get'
        }).done(function(response, status, jqXHR) {
          if(!(response == "mishicho")){
            console.log(videoList[vi].title + "を排除します");
            videoList.splice(vi, 1);
            res(--vi);//位置がずれるため
          }else{
            res(vi);
          }
          console.log("vi: " + vi);
          console.log("videoListLength: " + videoList.length);
        }).fail(function(jqXHR, status, error) {
          //console.log("サーバを起動させてください");
          //deferredArray[di].reject("サーバを起動させてください");
          rej("サーバを起動させてください");
        });
      });
    }

    for(let vi = 0; vi < videoList.length - 1; vi++){
      vi = await nestFunc(vi).catch(function(error){
        reject(error);
      });
      console.log("nestFunc終了後のvi: " + vi);
    }
    resolve();
    console.table(videoList);
  });
}

let inputVideo = function(){
  query = $.param(params);
  console.log("query: " + query);
  return new Promise(function (resolve, reject){
    $.get("https://api.search.nicovideo.jp/api/v2/video/contents/search", query, function(response, status){
      if(response.meta.totalCount > 0){
        videoList = videoList.concat(response.data);
        console.table(videoList);
      }else{
        
      }
    }).done(function(){
      resolve();
    });
  });
}

let setPoint = function(){
  console.table(params);
  switch(sort){
    case "+viewCounter":
      val = videoList[0].viewCounter;
      searchString = "filters[viewCounter][gte]";
      break;
    
    case "-viewCounter":
      val = videoList[0].viewCounter;
      searchString = "filters[viewCounter][lte]";
      break;

    case "+startTime":
      val = videoList[0].startTime;
      searchString = "filters[startTime][gte]";
      break;

    case "-startTime":
      val = videoList[0].startTime;
      searchString = "filters[startTime][lte]";
      break;
  }
  for(let i = 0; i < params.length; i++){
    if(params[i].name == searchString){
      point = params[i];
      params.splice(i, 1);//添字の位置が変わる
      break;
    }
    if(!point){
      point = {name: searchString, value: ""};
    }
  }
  point.value = val;
  params.push(point);
  console.table(params);
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch(request.type){
    case "popupDisplay":
      if(videoElement){
        sendResponse(
          {
            videoTitle: videoTitle,
            videoURL: videoURL,
            videoTime: videoElement.duration,
            currentVideoTime: videoElement.currentTime,
            videoVolume: videoElement.volume
          }
        )
      }
      break;

    case "sendParams":
      initialize();
      videoList = [];
      params = [];
      point = null;
      params = request.params.concat();
      sort = request.sort;
      inputVideo().then(videoExists)
      .then(judge)
      .catch(function (error) {
        console.log(error);
      });
      break;
    
    case "seek":
      if(videoElement){
        videoElement.currentTime = request.currentTime;
      }
      break;

    case "volume":
      if(videoElement){
        videoElement.volume = request.currentVolume;
      }
      break;

    case "play":
      if(videoElement){
        videoElement.play();
      }
      break;

    case "pause":
      if(videoElement){
        videoElement.pause();
      }
      break;
  }
  return true;//非同期の処理を同期的に待つ
});