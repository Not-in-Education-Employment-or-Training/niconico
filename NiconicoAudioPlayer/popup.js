window.onload = function(){
  let submitButton = document.getElementById('submitButton');
  let datetimeLocalList = document.querySelectorAll("input[type='datetime-local']");
  let newDatetimeLocalList = [];
  let inputs;
  let playButton = document.getElementById("playButton");
  let pauseButton = document.getElementById("pauseButton");
  let playingSong = document.getElementById("playingSong");
  let seekBar = document.getElementById("seekBar");
  let currentTime = document.getElementById("currentTime");
  let maxTime = document.getElementById("maxTime");
  let volumeBar = document.getElementById("volumeBar");
  let sort = document.getElementsByName('_sort')[0];
  //下3つは未実装
  let q = document.getElementsByName('q');
  let LowPlayCount = document.getElementsByName('LowPlayCount');
  let HighPlayCount = document.getElementsByName('HighPlayCount');

  //ポップアップ表示時の動作
  chrome.runtime.sendMessage(
    {
      type: "popupDisplay",
    },
    function(response) {
      console.log(response);
      if(response){
        playingSong.textContent = response.videoTitle;
        playingSong.href = response.videoURL;
        seekBar.max = response.videoTime;
        seekBar.value = response.currentVideoTime;
        currentTime.textContent = response.currentVideoTime;
        maxTime.textContent = response.videoTime;
        volumeBar.value = response.videoVolume;
      }
    }
  );

  submitButton.addEventListener("click", () => {
    //日時に"+9:00"を付け足す
    if(datetimeLocalList[0].value || datetimeLocalList[1].value){
      for (let i = 0; i < datetimeLocalList.length; i++) {
        if(!datetimeLocalList[i].value){
          continue;
        }
        newDatetimeLocalList[i] = document.createElement("input");
        newDatetimeLocalList[i].type = "hidden";
        newDatetimeLocalList[i].value = datetimeLocalList[i].value + "+09:00";
        switch(i){
          case 0:
            newDatetimeLocalList[i].name = "filters[startTime][gte]";
            break;
          case 1:
            newDatetimeLocalList[i].name = "filters[startTime][lte]";
            break;
        }
        document.getElementsByTagName("form")[0].appendChild(newDatetimeLocalList[i]);
        datetimeLocalList[i].disabled = true;
      }
    }
    //空のinputを送信しないようにする
    inputs = document.getElementsByTagName("input");
    for (let i = 0; i < inputs.length; i++) {
      if(!inputs[i].value){
        inputs[i].disabled = true;
      }
    }
    console.log($('form').serializeArray());
    //フォームの入力値を保存
    
    //送信
    chrome.runtime.sendMessage(
      {
        type: "sendParams",
        params: $('form').serializeArray(),
        sort: sort.options[sort.selectedIndex].value
      },
      function(response) {
      }
    );
  });

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch(request.type){
      case "videoSetUp":
        playingSong.textContent = request.videoTitle;
        playingSong.href = request.videoURL;
        seekBar.max = request.videoTime;
        maxTime.textContent = request.videoTime;
        volumeBar.value = request.videoVolume;
        break;

      case "videoPlaying":
        seekBar.value = request.currentVideoTime;
        currentTime.textContent = request.currentVideoTime;
        break;
    }
    return true;//非同期の処理を同期的に待つ
  });

  playingSong.addEventListener("click", () => {
    chrome.tabs.create({url: playingSong.href});
  });

  seekBar.addEventListener("input", () => {
    chrome.runtime.sendMessage(
      {
        type: "seek",
        currentTime: seekBar.value
      },
      function(response) {
      }
    );
  });

  volumeBar.addEventListener("input", () => {
    chrome.runtime.sendMessage(
      {
        type: "volume",
        currentVolume: volumeBar.value
      },
      function(response) {
      }
    );
  });

  playButton.addEventListener("click", () => {
    chrome.runtime.sendMessage(
      {
        type: "play"
      },
      function(response) {
      }
    );
  });

  pauseButton.addEventListener("click", () => {
    chrome.runtime.sendMessage(
      {
        type: "pause"
      },
      function(response) {
      }
    );
  });
}