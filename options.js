function save_options() {
	var timestamp = document.getElementById('timestamp').checked;
	var downloads = document.getElementById('downloads').checked;
	chrome.storage.sync.set({
		timestamp: timestamp,
		downloads: downloads
	}, function () {
//    window.close();
	});
}

function restore_options() {
	chrome.storage.sync.get({
		timestamp: false,
		downloads: false
	}, function (items) {
		document.getElementById('timestamp').checked = items.timestamp;
		document.getElementById('downloads').checked = items.downloads;
	});
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
