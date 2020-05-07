chrome.tabs.onActivated.addListener(
    function(activeInfo){
        chrome.browserAction.setBadgeText({
            text: ""
        });
    }
);

chrome.tabs.onUpdated.addListener(
    function(tabId, changeInfo, tab){
        if(changeInfo.status == "loading"){
            chrome.browserAction.setBadgeText({
                text: ""
            });
        }
    }
);

chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse){
        chrome.browserAction.setBadgeText({
            text: message.status
        });
        return true;
    }
);
/*
chrome.browserAction.onClicked.addListener(
    function(tab){
        chrome.windows.create({
            url: "http://127.0.0.1:3000/debug",
            width: 650,
            height: 400,
            focused: true,
            type: "popup"
        });
    }
);
*/
