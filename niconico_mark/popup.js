window.onload = function(){
  let tab;
  let title;
  let video_id;
  let tagText;
  let submitButton = document.getElementById("submitButton");
  let submitForm = document.getElementById("form");
  let hyouka = document.getElementById("hyouka");
  let comment = document.getElementById("comment");
  let resultText = document.getElementById("resultText");

  chrome.tabs.query({active: true, lastFocusedWindow: true}, function(result){
    tab = result[0];
    title = tab.title.replace(/ - ニコニコ動画/,'');
    video_id = tab.url.replace(/https:\/\/www\.nicovideo\.jp\/watch\//,'');
    tagText = document.getElementById("tagText");
    tagText.value = title + "ID=" + video_id;
  });

  submitButton.addEventListener("click", () => {
    video_id = document.createElement("input");
    video_id.type = "hidden";
    video_id.name = "video_id";
    video_id.value = tagText.value.substr(tagText.value.lastIndexOf("=") + 1);
    title = document.createElement("input");
    title.type = "hidden";
    title.name = "title";
    title.value = tagText.value.substring(0, tagText.value.lastIndexOf("I"));
    submitForm.appendChild(video_id);
    submitForm.appendChild(title);
    $.ajax({
      url: 'http://localhost:3000/update',
      type:'POST',
      data:{
        title: title.value,
        video_id: video_id.value,
        hyouka: hyouka.value,
        comment: comment.value
      }
    }).done(function(response, status, jqXHR) {
      resultText.textContent = "成功しました";
    }).fail(function(jqXHR, status, error) {
      resultText.textContent = "エラー";
    });
  });
}
