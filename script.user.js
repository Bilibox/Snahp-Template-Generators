// ==UserScript==
// @name        Snahp Android Template Generator
// @version     1.1.0
// @description Generates a Template for the Android section of Forum.Snahp.it
// @author      BiliTheBox
// @icon        https://forum.snahp.it/favicon.ico
// @homepage    https://github.com/Bilibox/Snahp-Template-Generators/
// @supportURL  https://github.com/Bilibox/Snahp-Template-Generators/issues/
// @updateURL   https://github.com/Bilibox/Snahp-Template-Generators/raw/Android/script.user.js
// @downloadURL https://github.com/Bilibox/Snahp-Template-Generators/raw/Android/script.user.js
// @include     /^https?:\/\/forum\.snahp\.it\/posting\.php\?mode\=post\&f\=(47)/
// @require     https://code.jquery.com/jquery-3.6.0.min.js
// @grant       GM_addStyle
// @grant       GM_xmlhttpRequest
// @grant       GM_setClipboard
// @run-at      document-end
// ==/UserScript==

const htmlTemplate = `
<button class="button--primary button button--icon" id="showTemplate" name="templateButton" style="display:none" type="button">Show</button>
<dr style="clear: left;" id="ApkGenerator">
<dl style="clear: left;">
<dt> <label id="GPSlink" for="GooglePlayLink">Play Store Link:</label> </dt>
<dd> <input type="text" id="GooglePlayLink" value="" class="inputbox autowidth" size="45" placeholder="Google Play Store Link"></input> </dd>
</dl>
<dl style="clear: left;">
<dt> <label id="modsinfo" for="ModificationInformation">Mod Info:</label> </dt>
<dd> <textarea rows="1" style="width:100%;" class="inputbox autowidth" id="ModificationInformation" size="45" placeholder="Mod Details"></textarea> </dd>
</dl>
<dl style="clear: left;">
<dt> <label id="VT" for="VirusTotalLink">VirusTotal Link:</label> </dt>
<dd> <input type="text" id="VirusTotalLink" value="" class="inputbox autowidth" size="45" placeholder="VirusTotal Link"></input> </dd>
</dl>
<dl style="clear: left;">
<dt> <label id="DLAndroid" for="DownloadLink">Download Links:</label> </dt>
<dd> <input type="text" id="DownloadLink" value="" class="inputbox autowidth" size="45" placeholder="Download Link"></input> </dd>
</dl>
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
<button class="button--primary button button--icon" id="generateTemplate" name="templateButton" type="button">Generate Template</button>
&nbsp;
<button class="button--primary button button--icon" id="clearBtn" name="templateButton" type="reset">Clear</button>
&nbsp;
<button class="button--primary button button--icon" id="hideTemplate" name="templateButton" type="button">Hide</button>
&nbsp;
</dd>
</dr>
`;

// Run the Main function
Main();

// Main function that runs the script
function Main() {
	if (window.location.href.includes('preview')) {
		return;
	}
	var temphtml = document.getElementsByTagName('dl')[0]; // Grab div under the inputs
	temphtml.insertAdjacentHTML('afterend', htmlTemplate); // Place our HTML under the inputs
	var titlechange = document.getElementsByName('title')[0]; // Grab "Title" bar from HTML
	if (titlechange) {
		titlechange.className += 'input'; // Change title to less boldness using different class
	}
	document.getElementById('hideTemplate').addEventListener(
		'click',
		function () {
			HideTemplate();
		},
		false
	);
	document.getElementById('showTemplate').addEventListener(
		'click',
		function () {
			ShowTemplate();
		},
		false
	);
	document.getElementById('generateTemplate').addEventListener(
		'click',
		function () {
			GenerateTemplate();
		},
		false
	);
}

// Show Template HTML and hide "Show" button
function ShowTemplate() {
	document.getElementById('gmShowTemplate').style.display = 'none';
	document.getElementById('ApkGenerator').style.display = 'block';
}

// Hide Template HTML and unhide "Show" button
function HideTemplate() {
	document.getElementById('gmShowTemplate').style.display = 'block';
	document.getElementById('ApkGenerator').style.display = 'none';
}

//* Start Filter functions
// Return div holding text "Size"
function FilterSize(element) {
	return element.textContent === 'Size';
}

// Return div holding text "Current Version"
function FilterCurrentVersion(element) {
	return element.textContent === 'Current Version';
}

// Return div holding text "Requires Android"
function FilterRequiredVersion(element) {
	return element.textContent === 'Requires Android';
}
//* End Filter functions

/*fix word casing*/
function UpperCase(str) {
	str = str.toLowerCase(); // First make entire string lowercase
	return str.replace(/(^|\s)\S/g, function (t) {
		// Return Uppercase for every word in String
		return t.toUpperCase();
	});
}

// Handle BBCode for Screeshots
function ScreenshotHandler(images) {
	var screenshotBBCode = '';
	let counter = 0;
	let fimg = '';
	for (let image of images) {
		if (image.alt == 'Screenshot Image') {
			if (image.width > '200') {
				fimg = '[fimg=500,300]';
			} else {
				fimg = '[fimg=300,500]';
			}

			if (!image.dataset | !image.dataset.srcset) {
				screenshotBBCode +=
					fimg + image.srcset.replace('-rw', '').replace(' 2x', '') + '[/fimg]';
				counter++;
			} else {
				screenshotBBCode +=
					fimg +
					image.dataset.srcset.replace('-rw', '').replace(' 2x', '') +
					'[/fimg]';
				counter++;
			}

			if (counter == 3) {
				break;
			}
		}
	}
	let screenshotBBCode = `[size=200][color=rgb(26, 162, 96)][B]Screenshots[/B][/color][/size]\n\n${screenshotBBCode}[/center]\n[hr][/hr]\n\n`;
	return screenshotBBCode;
}

function GenerateTemplate() {
	// Create variables from HTML Input
	let [link, modinfo, vtsplit, DDLS, mod, unlocked, adfree, lite, premium] = [
		document.getElementById('GooglePlayLink').value,
		document.getElementById('ModificationInformation').value,
		document.getElementById('VirusTotalLink').value.split(' '),
		document.getElementById('DownloadLink').value,
		document.querySelector('input[value="mod"]').checked ? ' [Mod]' : '',
		document.querySelector('input[value="unlocked"]').checked
			? ' [Unlocked]'
			: '',
		document.querySelector('input[value="adfree"]').checked ? ' [Ad-Free]' : '',
		document.querySelector('input[value="lite"]').checked ? ' [Lite]' : '',
		document.querySelector('input[value="premium"]').checked
			? ' [Premium]'
			: '',
	];

	var titleExtra = mod + unlocked + premium + adfree + lite;

	// Create Prefix placeholder per DDLs
	var DDLPrefix = '';
	var megaDomains = ['mega.nz', 'mega.co.nz']; // In case using old Mega link
	if (megaDomains.some((el) => DDLS.includes(el))) {
		DDLPrefix += '[Mega]';
	}
	if (DDLS.includes('zippyshare.com')) {
		DDLPrefix += '[Zippy]';
	}
	if (DDLS.includes('drive.google.com')) {
		DDLPrefix += '[Gdrive]';
	}
	DDLS = DDLS.split(' '); // Split into array for Auto DDL detection

	// Error Messages for required fields
	if (!link | (vtsplit[0] == '')) {
		var errors = '';
		errors += !link ? 'No Google Play link Found!' : '';
		errors += vtsplit[0] == '' ? '\nNo Virustotal Found!' : '';
		alert(errors);
		return;
	}
	link = link.includes('&hl')
		? link.replace(/\&.*$/, '&hl=en_US')
		: link + '&hl=en_US';

	// Split VT links 1 per line
	let VT = '';
	for (let vts of vtsplit) {
		VT += `[url=${vts}][size=150][color=#40BFFF][B]VirusTotal[/B][/color][/size][/url]\n`;
	}

	// Get GPS page & details for post
	GM_xmlhttpRequest({
		method: 'GET',
		url: link,
		onload: function (response) {
			let [page, parser] = [response.responseText, new DOMParser()];
			let parsedHtml = parser.parseFromString(page, 'text/html');

			// Grab json from parse
			let gplayjson = parsedHtml.querySelector(
				'script[type="application/ld+json"]'
			).text;
			gplayjson = JSON.parse(gplayjson);

			// Turn nodelist into an array
			let h2 = Array.prototype.slice.call(parsedHtml.querySelectorAll('div'));

			// Filter wanted results
			let [siz, curVer, reqAndr] = [
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

			// Review Star Rating
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

			// Review Count
			try {
				var reviewscount = gplayjson.aggregateRating.ratingCount
					? '[fimg=50,50]https://i.postimg.cc/nV6RDhJ3/Webp-net-resizeimage-002.png[/fimg]' +
					  Number(gplayjson.aggregateRating.ratingCount).toLocaleString() +
					  '[/size]\n\n'
					: '';
			} catch (e) {
				console.log(e);
				reviewscount = '';
			}

			//Grab Screenshots
			var screens = ScreenshotHandler(images);

			// Grab App Details from Play Store HTML parse
			// App Description
			let description = gplayjson.description
				? `[size=200][color=rgb(26, 162, 96)][B]App Description[/B][/color][/size]\n\n[code]\n${gplayjson.description}\n[/code]\n[hr][/hr]\n\n`
				: '';

			// Developer Name
			let dev = gplayjson.author.name
				? `[size=200][color=rgb(26, 162, 96)][B]App Details[/B][/color][/size]\n[list]\n[*][B]Developer: [/B] ${UpperCase(
						gplayjson.author.name
				  )}`
				: '';

			// App Category
			let category = gplayjson.applicationCategory
				? `\n[*][B]Category: [/B] ${UpperCase(gplayjson.applicationCategory)}`
				: '';

			// Age Content Rating
			let ContentRating = gplayjson.contentRating
				? '\n[*][B]Content Rating: [/B] ' + gplayjson.contentRating
				: '';

			// Required Android Version
			let requiredAndroid = reqAndr[0].nextElementSibling.innerText
				? `\n[*][B]Required Android Version: [/B] ${reqAndr[0].nextElementSibling.innerText}`
				: '';

			// App Size
			let size = siz[0].nextElementSibling.innerText
				? `\n[*][B]Size (From The Play Store): [/B] ${siz[0].nextElementSibling.innerText}`
				: '';

			// Latest Version from the Playstore
			let LatestPlayStoreVersion = curVer[0].nextElementSibling.innerText
				? `\n[*][B]Latest Google Play Version: [/B]${curVer[0].nextElementSibling.innerText}\n[/LIST]\n`
				: '';

			// Add BBCode for "Get this on Google Play Store"
			link = `[url=${link}][fimg=300,115]https://i.postimg.cc/mrWtVGwr/image.png[/fimg][/url]\n\n`;

			// Don't add modinfo line if not needed
			modinfo = modinfo
				? `[size=200][color=rgb(26, 162, 96)][B]Mod Info[/B][/COLOR][/SIZE]\n\n${modinfo}\n\n[hr][/hr]\n\n`
				: '';
			VT = `[size=200][color=rgb(26, 162, 96)][B]Virustotal[/B][/color][/size]\n\n${VT}\n\n[hr][/hr]\n\n`;

			// Auto DDL detection
			let whichddls = '[hide][b]';
			if (DDLS == null) {
				whichddls += '[url=][size=150]Download Link[/size][/url]';
			} else {
				// Allow for multiple DDLS of same type, auto fill in DDL
				for (let link of DDLS) {
					if (megaDomains.some((el) => link.includes(el))) {
						whichddls += `[url=${link}][size=150][color=#FF0000]MEGA[/color][/size][/url]\n`;
					} else if (link.includes('zippyshare.com')) {
						whichddls += `[url=${link}][size=150][color=#FFFF00]ZippyShare[/color][/size][/url]\n`;
					} else if (link.includes('drive.google.com')) {
						whichddls += `[url=${link}][size=150][color=#00FF00]Gdrive[/color][/size][/url]\n`;
					} else {
						whichddls += `[url=${link}][size=150]Download Link[/size][/url]\n`;
					}
				}
			}

			let ddl = `[size=200][color=rgb(26, 162, 96)][B]Download Link[/B][/COLOR][/size]\n\n[center]\n${whichddls}[/b][/hide][/CENTER]`;
			let updateLog = `\n\n[size=200][color=rgb(26, 162, 96)][B]Update Log[/B][/color][/size]\n[code]\n\n[/code]`;
			let dump = `${logo}${title}${rating}${reviewscount}${screens}${description}${dev}${category}${ContentRating}${requiredAndroid}${size}${LatestPlayStoreVersion}${link}${modinfo}${VT}${ddl}${updateLog}`;

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
					let ver =
						curVer[0].nextElementSibling.innerText != 'Varies with device'
							? ' v' + curVer[0].nextElementSibling.innerText
							: '';
					document.getElementsByName('subject')[0].value =
						DDLPrefix +
						'[Android]' +
						gplayjson.name +
						ver +
						titleExtra +
						' [MB]';
				}
			}
		},
	});
}

//--- CSS styles make it work...
GM_addStyle(
	'                                         \
    @media screen and (min-width: 300px) {	  \
    	.inputbox {                           \
        	max-width:330px;                  \
        }                                     \
    	.result {                             \
            max-height:10px;                  \
            display:unset;                    \
    	}                                     \
    	.content {                            \
            overflow:unset;                   \
            min-height:unset;                 \
            cursor:pointer;                   \
            padding-bottom:unset;             \
            line-height:unset;                \
		}                                     \
		textarea#ModificationInformation {    \
    		width: 100% !important;           \
		}                                     \
	}'
);
