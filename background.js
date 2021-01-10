chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.get('firstLoad', function(obj) {
        if (obj.firstLoad === undefined || obj.firstLoad === -1) {
            init()
        }
    });
});

chrome.runtime.setUninstallURL('', function() {
    chrome.storage.sync.set({'firstLoad': -1})
})

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request == "init") init()
  }
);