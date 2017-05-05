function save_options() {
	var timestamp = document.getElementById('timestamp').checked;
	var downloads = document.getElementById('downloads').checked;
	var reload = false;
		
	chrome.storage.sync.get({
		timestamp: true,
		downloads: true
	}, function (items) {
		if (timestamp != items.timestamp ||
			downloads != items.downloads) {
			reload = true;
			chrome.storage.sync.set({
				timestamp: timestamp,
				downloads: downloads,
				reload: reload
			}, function () {});
		};
	});

}

function restore_options() {
	chrome.storage.sync.get({
		timestamp: true,
		downloads: true
	}, function (items) {
		document.getElementById('timestamp').checked = items.timestamp;
		document.getElementById('downloads').checked = items.downloads;
	});
}

function close_options() {
	window.close();
}

function reset_storage() {
	chrome.storage.sync.set({
		timestamp: false,
		downloads: false,
		reload: true
	}, function () {
	});
	restore_options();
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
document.getElementById('close').addEventListener('click', close_options);
document.getElementById('reset').addEventListener('click', reset_storage);