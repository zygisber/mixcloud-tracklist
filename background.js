var audiofileid = 0;
var audiofileurl = "";
var audiofilename;

chrome.downloads.onChanged.addListener(function(delta) {
	if (delta.filename) {
		if (delta.id == localStorage.audiofileid) {
			localStorage.audiofilename = delta.filename.current;
			chrome.tabs.query({
				active: true 
			}, function(tabs){
    				chrome.tabs.sendMessage(tabs[0].id, {
					action: "audiofilename",
					name: localStorage.audiofilename
				}, function(response) {});  
			});
			return;
		} else {
			return;
		}
	}
});

chrome.downloads.onCreated.addListener(function (downloaditem) {
	if (downloaditem) {
		if (downloaditem.url == localStorage.audiofileurl) {
			localStorage.audiofileid = downloaditem.id;
		}
	}
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (!request.type) {
		return;
	}
	if (request.type == "init") {
		localStorage.audiofileid = 0;
		localStorage.audiofileurl = "";
		localStorage.audiofilename = "";
		return;
	}

	if (request.type == "saveaudio") {
		localStorage.audiofileurl = request.url;
		chrome.downloads.download({ 
			url: request.url, 
//			filename: request.filename + ".m4a", //commenting this out solves non-latin character problem in file nameing 
			saveAs: true 
		});
		return;
	}
	
	if (request.type === "savecdcue" || 
	    request.type === "savecdscript" || 
	    request.type === "cueplaylist" || 
	    request.type === "savem3ulist" || 
	    request.type === "splitaudio") {
		chrome.downloads.download({
			url: request.data,
			filename: request.filename,
			saveAs: true
		});
		return;
	}
});
                                                                                                                                
