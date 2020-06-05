// ==UserScript==
// @name        Snahp Android Template Generator
// @version     1.0.0
// @description Generates a Template for the Android section of Forum.Snahp.it
// @author      BiliTheBox
// @icon        https://forum.snahp.it/favicon.ico
// @homepage    https://github.com/Bilibox/Snahp-Template-Generators/
// @supportURL  https://github.com/Bilibox/Snahp-Template-Generators/issues/
// @updateURL   https://github.com/Bilibox/Snahp-Template-Generators/raw/Android/script.user.js
// @downloadURL https://github.com/Bilibox/Snahp-Template-Generators/raw/Android/script.user.js
// @include     /^https?:\/\/forum\.snahp\.it\/posting\.php\?mode\=post\&f\=(47)/
// @require     https://code.jquery.com/jquery-3.5.1.min.js
// @grant       GM_addStyle
// @grant       GM_xmlhttpRequest
// @grant       GM_setClipboard
// @run-at      document-end
// ==/UserScript==

const htmlTemplate = `
<button class="button--primary button button--icon" id="gmShowTemplate" name="templateButton" style="display:none" type="button">Show</button>
<dr style="clear: left;" id="ApkGenerator">
<dt> <label id="GPSlink" for="GooglePlayLink">Play Store Link:</label> </dt>
<dd> <input type="text" id="gplaylink" value="" class="inputbox autowidth" size="45" placeholder="Google Play Store Link"></input> </dd>
<dt> <label id="modsinfo" for="ModificationInformation">Mod Info:</label> </dt>
<dd> <textarea rows="1" style="width:100%;" class="inputbox autowidth" id="modinfo" size="45" placeholder="Mod Details"></textarea> </dd>
<dt> <label id="VT" for="VirusTotalLink">VirusTotal Link:</label> </dt>
<dd> <input type="text" id="virustotal" value="" class="inputbox autowidth" size="45" placeholder="VirusTotal Link"></input> </dd>
<dt><label> </label></dt>
<dd>
<span>Mod</span>
<label class="switch">
<input type="checkbox" id="mod" value="mod" >
<span class="slider round"></span></label>
<span>Unlocked</span>
<label class="switch">
<input type="checkbox" id="unlocked" value="unlocked" >
<span class="slider round"></span></label>
<span>Premium</span>
<label class="switch">
<input type="checkbox" id="premium" value="premium" >
<span class="slider round"></span></label>
<span>Ad-Free</span>
<label class="switch">
<input type="checkbox" id="adfree" value="adfree" >
<span class="slider round"></span></label>
<span>Lite</span>
<label class="switch">
<input type="checkbox" id="lite" value="lite" >
</dd>
<dd>
<button class="button--primary button button--icon" id="gmGenerate" name="templateButton" type="button">Generate Template</button>
&nbsp;
<button class="button--primary button button--icon" id="gmClearBtn" name="templateButton" type="reset">Clear</button>
&nbsp;
<button class="button--primary button button--icon" id="gmHideTemplate" name="templateButton" type="button">Hide</button>
&nbsp;
</dd>
</dr>
`;

var errPopup = `<div class="overlay-container is-active" name='errorpopup' id="js-XFUniqueId2"><div class="overlay" tabindex="-1" role="alertdialog" id="errBox" aria-hidden="false">
<div class="overlay-title">
<a class="overlay-titleCloser js-overlayClose" role="button" tabindex="0" aria-label="Close"></a>
Oops! We ran into some problems.</div>
<div class="overlay-content">
<div class="blockMessage">
<ul>
errormessages
</ul>
</div></div></div></div>`;
// Run the Main function
main();

// Main function that runs the script
function main() {
	if (window.location.href.includes('preview')) {
		return;
	}
	var temphtml = document.getElementsByTagName('dl')[0]; // Grab div under the inputs
	temphtml.innerHTML += htmlTemplate; // Place our HTML under the inputs
	var titlechange = document.getElementsByName('title')[0]; // Grab "Title" bar from HTML
	if (titlechange) {
		titlechange.className += 'input'; // Change title to less boldness using different class
	}
	$('#gmHideTemplate').click(() => hideTemplate()); // When Hide button clicked, run hide function
	$('#gmShowTemplate').click(() => showTemplate()); // When Show button clicked, run Show function
	$('#gmGenerate').click(() => generateTemplate()); // When Generate button clicked, run Generate function
}

// Close Error Popup if overlay clicked
$(document).click(function (e) {
	if (
		(!$('#errBox').is(e.target) & $('#js-XFUniqueId2').is(e.target)) |
		$('.js-overlayClose').is(e.target)
	) {
		document.getElementsByName('errorpopup')[0].remove();
	}
});

// Add Hotkey "Escape" to Hide fields
$(document).on('keydown', function (event) {
	if (event.key == 'Escape') {
		$('#ApkGenerator').hide();
		document.getElementById('gmShowTemplate').style.display = 'block';
	}
});

// Show Template HTML and hide "Show" button
function showTemplate() {
	document.getElementById('gmShowTemplate').style.display = 'none';
	$('#ApkGenerator').show();
}

// Hide Template HTML and unhide "Show" button
function hideTemplate() {
	document.getElementById('gmShowTemplate').style.display = 'block';
	$('#ApkGenerator').hide();
}

// Popup for Errors
function Popup(errors) {
	let errOutput = errPopup.replace('errormessages', errors);
	var body = document.getElementsByTagName('Body')[0];
	body.insertAdjacentHTML('beforeend', errOutput);
}

// Grab Specific divs
function filterSize(element) {
	return element.textContent === 'Size'; // Return div holding text "Size"
}
function filterCurVer(element) {
	return element.textContent === 'Current Version'; // Return div holding text "Current Version"
}
function filterReqAndr(element) {
	return element.textContent === 'Requires Android'; // Return div holding text "Requires Android"
}

/*fix word casing*/
function upperCase(str) {
	str = str.toLowerCase(); // First make entire string lowercase
	return str.replace(/(^|\s)\S/g, function (t) {
		// Return Uppercase for every word in String
		return t.toUpperCase();
	});
}

function generateTemplate() {
	// Create variables from HTML
	let [link, modinfo, VT, mod, unlocked, adfree, lite, premium] = [
		$('#gplaylink').val(),
		$('#modinfo').val(),
		$('#virustotal').val(),
		document.querySelector('input[value="mod"]'),
		document.querySelector('input[value="unlocked"]'),
		document.querySelector('input[value="adfree"]'),
		document.querySelector('input[value="lite"]'),
		document.querySelector('input[value="premium"]'),
	];
	// Error Messages for required fields
	if (!link | !VT) {
		var errors = '';
		errors += !link ? '<li>No Google Play link Found!</li>' : '';
		errors += !VT ? '<li>No Virustotal Found!</li>' : '';
		Popup(errors);
	} else {
		link = link.includes('&hl')
			? link.replace(/\&.*$/, '&hl=en_US')
			: link + '&hl=en_US';

		// Split VT links 1 per line
		let vtsplit = VT.split(' ');
		VT = '';
		counter = 0;
		for (let vts of vtsplit) {
			counter += 1;
			VT += `[url=${vts}][size=150][color=#40BFFF][B] ${counter} VirusTotal[/B][/color][/size][/url]\n`;
		}
		// Check for pressed buttons
		mod = mod.checked ? ' [Mod]' : '';
		unlocked = unlocked.checked ? ' [Unlocked]' : '';
		adfree = adfree.checked ? ' [Ad-Free]' : '';
		premium = premium.checked ? ' [Premium]' : '';
		lite = lite.checked ? ' [Lite]' : '';
		var titleExtra = mod + unlocked + premium + adfree + lite;
		// Get GPS page & details for post
		GM_xmlhttpRequest({
			method: 'GET',
			url: link,
			onload: function (response) {
				let [page, parser] = [response.responseText, new DOMParser()];
				let parsedHtml = parser.parseFromString(page, 'text/html');
				// Grab json from parse
				var gplayjson = parsedHtml.querySelector(
					'script[type="application/ld+json"]'
				).text;
				gplayjson = JSON.parse(gplayjson);
				// Turn nodelist into an array
				var h2 = Array.prototype.slice.call(parsedHtml.querySelectorAll('div'));
				// Array of matches
				// Filter Function
				var [siz, curVer, reqAndr] = [
					h2.filter(filterSize),
					h2.filter(filterCurVer),
					h2.filter(filterReqAndr),
				];
				// Grab all images & find logo
				let images = parsedHtml.getElementsByTagName('img');
				for (let logoimg of images) {
					let logoattr = logoimg.alt;
					if (logoattr == 'Cover art') {
						var logo =
							'[CENTER][fimg=180,180]' +
							logoimg.srcset.replace('-rw', '').replace(' 2x', '') +
							'[/fimg]\n\n';
					}
				}
				// App Name
				let title = gplayjson.name
					? '[COLOR=rgb(26, 162, 96)][B][size=200]' +
					  gplayjson.name +
					  '[/size][/B][/COLOR]\n'
					: '';
				//Review Star Rating
				try {
					var rating = gplayjson.aggregateRating.ratingValue
						? '\n[fimg=50,50]https://i.postimg.cc/g28wfSTs/630px-Green-star-41-108-41-svg.png[/fimg][size=130][B]' +
						  Math.floor(gplayjson.aggregateRating.ratingValue) +
						  '/5[/B]'
						: '';
				} catch (e) {
					console.log(e);
					rating = '';
				}
				// Amount of Reviews
				try {
					var reviewscount = gplayjson.aggregateRating.ratingCount
						? '[fimg=50,50]https://i.postimg.cc/nV6RDhJ3/Webp-net-resizeimage-002.png[/fimg]' +
						  gplayjson.aggregateRating.ratingCount +
						  '[/size]\n\n'
						: '';
				} catch (e) {
					console.log(e);
					reviewscount = '';
				}
				// Grab SS from images (Only grab 3!)
				var screenshots = [];
				for (let screen of images) {
					let screenattr = screen.alt;
					if (screenattr == 'Screenshot Image') {
						if (!screen.dataset | !screen.dataset.srcset) {
							screenshots.push(
								screen.srcset.replace('-rw', '').replace(' 2x', '') + '\n'
							);
						} else {
							screenshots.push(
								screen.dataset.srcset.replace('-rw', '').replace(' 2x', '') +
									'\n'
							);
						}
					}
					if (screenshots.length == '3') {
						break;
					}
				}
				var screens = '';
				for (let ss of screenshots) {
					screens += '[fimg=300,500]' + ss + '[/fimg]';
				}
				screens =
					'[size=200][color=rgb(26, 162, 96)][B]Screenshots[/B][/color][/size]\n\n' +
					screens +
					'[/center]\n[hr][/hr]\n\n';
				// Grab App Details from Play Store HTML parse
				// App Description
				let description = gplayjson.description
					? '[size=200][color=rgb(26, 162, 96)][B]App Description[/B][/color][/size]\n\n[code]\n' +
					  gplayjson.description +
					  '\n[/code]\n[hr][/hr]\n\n'
					: '';
				// Developer Name
				let dev = gplayjson.author.name
					? '[size=200][color=rgb(26, 162, 96)][B]App Details[/B][/color][/size]\n[list]\n[*][B]Developer: [/B] ' +
					  upperCase(gplayjson.author.name)
					: '';
				// App Category
				let category = gplayjson.applicationCategory
					? '\n[*][B]Category: [/B] ' + upperCase(gplayjson.applicationCategory)
					: '';
				// Age Content Rating
				let ContentRating = gplayjson.contentRating
					? '\n[*][B]Content Rating: [/B] ' + gplayjson.contentRating
					: '';
				// Required Android Version
				let requiredAndroid = reqAndr[0].nextElementSibling.innerText
					? '\n[*][B]Required Android Version: [/B] ' +
					  reqAndr[0].nextElementSibling.innerText
					: '';
				// App Size
				let size = siz[0].nextElementSibling.innerText
					? '\n[*][B]Size: [/B] ' +
					  siz[0].nextElementSibling.innerText +
					  ' (Taken from the Google Play Store)'
					: '';
				// Latest Version from the Playstore
				let LatestPlayStoreVersion = curVer[0].nextElementSibling.innerText
					? '\n[*][B]Latest Google Play Version: [/B] ' +
					  curVer[0].nextElementSibling.innerText +
					  '\n[/LIST]\n'
					: '';
				// Add BBCode for "Get this on Google Play Store"
				link =
					'[url=' +
					link +
					'][fimg=300,115]https://i.postimg.cc/mrWtVGwr/image.png[/fimg][/url]\n\n';
				// Don't add modinfo line if not needed
				modinfo = modinfo
					? `[SIZE=200][COLOR=rgb(26, 162, 96)][B]Mod Info[/B][/COLOR][/SIZE]\n\n${modinfo}\n\n[hr][/hr]\n\n`
					: '';
				VT = `[SIZE=200][COLOR=rgb(26, 162, 96)][B]Virustotal[/B][/color][/size]\n\n${VT}\n\n[hr][/hr]\n\n`;
				ddl = `[size=200][COLOR=rgb(26, 162, 96)][B]Download Link[/B][/COLOR][/SIZE]\n\n[CENTER]\n[hide][b][url=][size=150][color=#FF0000]MEGA[/color][/size][/url]\n[url=][size=150][color=#FFFF00]ZippyShare[/color][/size][/url]\n[url=][size=150][color=#00FF00]Gdrive[/color][/size][/url]\n[/b][/hide][/CENTER]`;
				let dump = `${logo}${title}${rating}${reviewscount}${screens}${description}${dev}${category}${ContentRating}${requiredAndroid}${size}${LatestPlayStoreVersion}${link}${modinfo}${VT}${ddl}`;
				// Try to paste to page. Alert user if error
				try {
					document.getElementsByName('message')[0].value = dump;
				} catch (err) {
					alert(
						'Something went wrong! Please report to my Developer.... I get scared when I crash ☹️' +
							err
					);
				} finally {
					let xf_title_value = document.getElementsByName('subject')[0].value;
					if (!xf_title_value) {
						document.getElementsByName('subject')[0].value =
							'[Mega][Zippy][Gdrive][Android]' +
							gplayjson.name +
							' ' +
							curVer[0].nextElementSibling.innerText +
							' ' +
							titleExtra;
					}
				}
			},
		});
	}
}

//--- CSS styles make it work...
GM_addStyle(
	'                                         \
    @media screen and (min-width: 300px) {    \
      .inputbox{                              \
            max-width:330px;                  \
            }                                 \
      .result{                                \
            max-height:10px;                  \
            display:unset;                    \
      }                                       \
      .content{                               \
            overflow:unset;                   \
            min-height:unset;                 \
            cursor:pointer;                   \
            padding-bottom:unset;             \
            line-height:unset;                \
}                                             \
'
);
