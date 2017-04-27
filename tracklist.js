/*
 * Mixcloud Tracklist browser extension
 *
 * Copyright (c) 2015 Andrew Lawson <http://adlawson.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @link https://github.com/adlawson/mixcloud-tracklist
 */

'use strict';

const dust = require('dustjs-linkedin');
dust.helper = require('dustjs-helpers');
const request = require('request');
const browser = require('./browser');

main();
browser.onChange(browser.querySelector('[m-contents="maincontent"]'), main);

function main() {
	const parent = browser.querySelector('[ng-controller="CloudcastHeaderCtrl"]');
	
	if (parent !== null) {
		fetchData(window.location, (data) => {
			const tracklistTemplate = require('./templates/tracklist')(dust); // Required by both new and legacy
			const empty = parent.querySelector('[ng-init]');
			const toggleContainer = browser.querySelector('footer.actions');
			const moreButton = toggleContainer.querySelector('[ng-controller="DropdownCtrl"]');
			const existingButton = toggleContainer.querySelector('[m-click="tracklistShown=!tracklistShown"]');
			if (existingButton === null) { // If looking at your own mix
				render(tracklistTemplate, data.cloudcast, tracklistHtml => {
					browser.insert(empty, tracklistHtml);
					render(require('./templates/toggle')(dust), {}, toggleHtml => {
						browser.insertBefore(toggleContainer, moreButton, toggleHtml);
						toggleEvents(empty, toggleContainer, data.cloudcast);
					});
				});
 			}
 		});
 	}
}

function fetchData(location, fn) {
	request({
		"uri": "/player/details",
		"baseUrl": location.protocol + "//" + location.hostname,
		"qs": { "key": location.pathname },
		"json": true
	}, (error, response, data) => {
		if (!error && response.statusCode === 200 && data.cloudcast.sections.length > 0) {
			chrome.storage.sync.get({
				timestamp: true,
				downloads: true
			}, (options) => {
				fn(updateData(data, options));
			});
		} else {
			console.error(error);
		}
	});
}

function updateData(data, options) {
        if (options.timestamp) data.cloudcast.timestamps = true;
        if (options.downloads) data.cloudcast.downloads = true;
	data.cloudcast.sections.forEach((section, i) => {
        	section.track_number = i + 1;
		section.track_number2 = ("0" + section.track_number).slice(-2);
		if (!section.chapter) {
			if (!section.title) {
				section.chapter = "Unknown";
			} else {
				section.chapter = section.title;
			}
		};
		if (!section.artist) section.artist = "Unknown";

        	if (section.start_time !== null) {
            		const minutes = Math.floor(section.start_time / 60);
            		const seconds = ("0" + section.start_time % 60).slice(-2);
            		section.timestamp = `${minutes}:${seconds}`+":00";
        	};
	
		if (i == data.cloudcast.sections.length - 1) {
			section.track_length = data.cloudcast.audio_length - section.start_time;
		} else {
			section.track_length = data.cloudcast.sections[i + 1].start_time - section.start_time;
		};
    	});
	return data;
}

function render(source, data, fn) {
	dust.render(source, data, (error, html) => {
		if (!error) fn(html);
		else console.error(error);
	});
}

function mixlinkclick(event) {
	console.log(event);
}

function toggleEvents(tracklistContainer, toggleContainer, data) {
	const button = toggleContainer.querySelector('.tracklist-toggle-text');
	const tracklist = tracklistContainer.querySelector('.cloudcast-tracklist');
	const audiofilelink = document.getElementById('audiofilelink');
	const audiocdscript = document.getElementById('audiocdscript');
	const spiltscript = document.getElementById('cuescript');

	button.addEventListener('click', event => {
		const hide = button.querySelector('[ng-show="tracklistShown"]');
		const show = button.querySelector('[ng-show="!tracklistShown"]');
		hide.classList.toggle('ng-hide');
		show.classList.toggle('ng-hide');
		button.classList.toggle('btn-toggled');
		tracklist.classList.toggle('ng-hide');
	});

	data.filename = data.owner_name + " - " + data.title;

	var index = 0;
	for (index = 0; index < data.sections.length; ++index) {
		console.log(data.sections[index]);
		var tracklink = document.getElementById(data.sections[index].track_number2);		
		tracklink.addEventListener('click', function (event) {
			var audio = browser.querySelector('audio');			
			audio.currentTime = event.srcElement.attributes.timestamp.nodeValue;
  		});

	}	

	if (!data.downloads) return;	

	audiofilelink.addEventListener('click', function (event) {
		chrome.runtime.sendMessage({
			type: "saveaudio",
			url: "http://download.mixcloud-downloader.com/download" + data.url,
			filename: data.filename
		});
	});

	spiltscript.addEventListener('click', function (event) {

		if (!data.audiofilename) { 
			alert("Please download audio file first.");
			return; 
		};

		render(require('./templates/cuelist')(dust), data, cuelist => {
			data.cuelistUTF8 = convertUTF(encodeURI(cuelist));
			console.log(cuelist)
		});

		chrome.runtime.sendMessage({
			type: "cueplaylist", 
			filename: "playlist - " + data.audiofilenamenoext + ".cue",
			data: 'data:text/plain;charset=utf-8,' + data.cuelistUTF8
		});

		render(require('./templates/splitaudio')(dust), data, splitaudio => {
			data.splitaudio = convertUTF(encodeURI(splitaudio));
			console.log(splitaudio)
		});


		chrome.runtime.sendMessage({
			type: "splitaudio", 
			filename: "extracttracks.bat",
			data: 'data:text/plain;charset=utf-8,' + data.splitaudio
		});
	});


	audiocdscript.addEventListener('click', function (event) {

		if (!data.audiofilename) { 
			alert("Please download audio file first.");
			return; 
		};

		render(require('./templates/audiocdcuelist')(dust), data, audiocdcuelist => {
			data.audiocdcuelistUTF8 = convertUTF(encodeURI(audiocdcuelist));
			console.log(audiocdcuelist)
		});

		chrome.runtime.sendMessage({
			type: "savecdcue", 
			filename: data.audiofilenamenoext + ".cue",
			data: 'data:text/plain;charset=utf-8,' + data.audiocdcuelistUTF8
		});

		render(require('./templates/audiocdconvert')(dust), data, audiocdconvert => {
			data.audiocdconvert = convertUTF(encodeURI(audiocdconvert));
			console.log(audiocdconvert)
		});


		chrome.runtime.sendMessage({
			type: "savecdscript", 
			filename: "audiocdconvert.bat",
			data: 'data:text/plain;charset=utf-8,' + data.audiocdconvert
		});

	});

	chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
		if (msg.action == 'audiofilename') {
			data.audiofilename = msg.name;
			data.audiofilenamenoext = data.audiofilename.substring(0, data.audiofilename.lastIndexOf('.'));
			return;
		}; 
	});
}

function convertUTF (string) {
	string = string.replace(/\r\n/g,"\n");
	var utftext = "";

 	for (var n = 0; n < string.length; n++) {

	var c = string.charCodeAt(n);

	if (c < 128) {
		utftext += String.fromCharCode(c);
	}
	else if((c > 127) && (c < 2048)) {
		utftext += String.fromCharCode((c >> 6) | 192);
		utftext += String.fromCharCode((c & 63) | 128);
	}
	else {
		utftext += String.fromCharCode((c >> 12) | 224);
		utftext += String.fromCharCode(((c >> 6) & 63) | 128);
		utftext += String.fromCharCode((c & 63) | 128);
	}
}

 return utftext;
}

