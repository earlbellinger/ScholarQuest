chrome.runtime.onInstalled.addListener(init());

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request == "init") init()
  }
);