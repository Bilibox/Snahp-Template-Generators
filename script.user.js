// ==UserScript==
// @name        Snahp Movie/TV Template Generator
// @version     2.0.0
// @description Creates a BBCode template for the Movie/TV section on Snahp forums.
// @author      BiliTheBox
// @icon        https://forum.snahp.it/favicon.ico
// @homepage    https://github.com/Bilibox/Snahp-Template-Generators/
// @homepageURL https://github.com/Bilibox/Snahp-Template-Generators/
// @supportURL  https://github.com/Bilibox/Snahp-Template-Generators/issues/
// @updateURL   https://github.com/Bilibox/Snahp-Template-Generators/raw/Omdb/script.user.js
// @downloadURL https://github.com/Bilibox/Snahp-Template-Generators/raw/Omdb/script.user.js
// @include     /^https?:\/\/forum\.snahp\.it\/posting\.php\?mode\=post\&f\=(42|55|26|29|66|30|88|56|72|73|64|31|32|65|84|33|61|62|57|74|75)/
// @require     https://code.jquery.com/jquery-3.6.0.min.js
// @require     https://code.jquery.com/ui/1.12.1/jquery-ui.js
// @require     https://raw.githubusercontent.com/Semantic-Org/UI-Search/master/search.js
// @require     https://raw.githubusercontent.com/Semantic-Org/UI-Api/master/api.js
// @grant       GM_addStyle
// @grant       GM.xmlHttpRequest
// @grant       GM.setValue
// @grant       GM.getValue
// @connect     omdbapi.com
// ==/UserScript==

const tabURL = window.location.href;
var sectionType;

const htmlTemplate = `
<button class="button--primary button button--icon" id="show-template" name="template-button" style="display: none;" type="button">Show</button>
<dr id="omdb-generator" style="clear: left;">
<dl style="clear: left;">
<dt> <label id="imdb-search" for="Semantic Search">Imdb Search:</label> </dt>
<dd> <input id="hidden-id-value" style="display:none" type="text" value=""><div class="ui search" id="search-box" size="45">
<input class="prompt inputbox autowidth" type="text" id="omdb-search-box" size="45" placeholder="Enter IMDB ID/Link OR Search the Title"></input>
<div class="results inputbox" id="search-results" size="45" style="display:none;"></div> </dd>
</dl>
<dl style="clear: left;">
<dt> <label id="screenshots-label" for="Screenshots">Screenshot Links:</label> </dt>
<dd> <input class="inputbox autowidth" id="screen-links" size="45" type="text" value="" placeholder="Enter Direct File URLS w/ Spaces Between"></input> </dd>
</dl>
<dl style="clear: left;">
<dt> <label id="mediainfo-output-label" for="Mediainfo Text Output">Mediainfo:</label> </dt>
<dd> <textarea class="inputbox autowidth" id="mediainfo-textarea" rows="1" size="45" style="width:100%;" placeholder="Enter Full Mediainfo With The [General] Section"></textarea> </dd>
</dl>
<dl style="clear: left;">
<dt> <label id="download-omdb-label" for="DownloadLink">Download Links:</label> </dt>
<dd> <input class="inputbox autowidth" id="DownloadLink" size="45" type="text" value="" placeholder="Enter DDLS w/ Spaces Between"></input> </dd>
</dl>
<dt><label> </label></dt>
<dd>
<button class="button--primary button button--icon" id="generate-template" name="template-button" type="button">Generate Template</button>
&nbsp;
<button class="button--primary button button--icon" id="clear-button" name="template-button" type="reset">Clear</button>
&nbsp;
<button class="button--primary button button--icon" id="hide-template" name="template-button" type="button">Hide</button>
&nbsp;
</dd>
</dr>
`;

const omdbinput = `
<button id="show-template" name="template-button" style="display:none" type="button">Show</button>
<dr style="clear: left;" id="omdb-generator">
<dt>
<label id="key-label" for="Omdb Api Key">OMDB Key:</label>
</dt>
<dd>
<input type="text" id="omdb-api-key" value="" class="inputbox autowidth"/>
<button class="button--primary button button--icon" id="save-key" name="template-button" type="button">Save Key</button>
&nbsp;
<button class="button--primary button button--icon" id="clear-button" name="template-button" type="reset">Clear</button>
&nbsp;
<button class="button--primary button button--icon" id="hide-template" name="template-button" type="button">Hide</button>
&nbsp;
</dd>
</dr>
`;
///////////////////////////////////////////////////////////////////////////
//                             Shortcut Keys                             //
///////////////////////////////////////////////////////////////////////////

$(document).on('keydown', function (event) {
	if (event.key == 'Escape') {
		$('#omdb-generator').hide();
		document.getElementById('show-template').style.display = 'block';
	}
});

///////////////////////////////////////////////////////////////////////////
//                                Utility                                //
///////////////////////////////////////////////////////////////////////////

const ShowTemplate = () => {
	document.getElementById('show-template').style.display = 'none';
	$('#omdb-generator').show();
};

const HideTemplate = () => {
	document.getElementById('show-template').style.display = 'block';
	$('#omdb-generator').hide();
};

// Asyncronous http requests
const RequestUrl = async (method, url, data, headers) => {
	return await new Promise((resolve, reject) => {
		GM.xmlHttpRequest({
			method: method,
			url: url,
			data: data,
			headers: headers,
			onload: (response) => {
				resolve(response);
			},
			onerror: (response) => {
				reject(response);
			},
		});
	});
};

// Check response status from API
const CheckApiStatus = async (url) => {
	return RequestUrl('GET', url)
		.then(function (response) {
			if (response.status !== 200) {
				if (response.status === 401) {
					let data = JSON.parse(response.responseText);
					alert(
						`Something Messed Up! Check The Omdb Error Below. \n ${data.message}`
					);
					throw Error('401 Response');
				} else {
					throw Error(
						`Unable To Verify API Key. \n HTTP STATUS CODE: ${response.status}`
					);
				}
			}
			return true;
		})
		.catch(function (error) {
			if (error.message !== '401 Response') {
				alert(
					`Something Messed Up! Check The Omdb Error Below. \n ${error.message}`
				);
			}
			console.error(error);
			return false;
		});
};

// Submit Generated BBCode to the forum
const SubmitToForum = (forumBBCode, title, titleBool) => {
	try {
		document.getElementsByName('message')[0].value = forumBBCode;
	} catch (err) {
		alert(
			`Something went wrong! Please report to my Developer.... I get scared when I crash ☹️\n\n err`
		);
	} finally {
		if (titleBool) {
			document.getElementsByName('subject')[0].value = title;
		}
	}
};

///////////////////////////////////////////////////////////////////////////
//                                Search                                 //
///////////////////////////////////////////////////////////////////////////

const SectionSearch = (apiKey) => {
	const section = parseInt(tabURL.match(/\d+/, '')[0]);
	const [movies, series] = [
		[26, 29, 30, 30, 42, 55, 56, 66, 72, 73, 88],
		[31, 32, 33, 57, 61, 62, 64, 65, 74, 75, 84],
	];
	var query;
	if (series.includes(section)) {
		query = `https://www.omdbapi.com/?apikey=${apiKey}&r=JSON&s={query}&type=series`;
		sectionType = 'series';
	} else if (movies.includes(section)) {
		query = `https://www.omdbapi.com/?apikey=${apiKey}&r=JSON&s={query}&type=movie`;
		sectionType = 'movies';
	} else {
		query = `https://www.omdbapi.com/?apikey=${apiKey}&r=JSON&s={query}`;
		sectionType = 'unknown';
	}
	$('#search-box').search({
		type: 'category',
		apiSettings: {
			url: query,
			onResponse: function (myfunc) {
				var response = {
					results: {},
				};
				$.each(myfunc.Search, function (index, item) {
					var category = item.Type.toUpperCase() || 'Unknown',
						maxResults = 10;
					if (index >= maxResults) {
						return false;
					}
					if (response.results[category] === undefined) {
						response.results[category] = {
							name: '~~~~~~~~~~' + category + '~~~~~~~~~~',
							results: [],
						};
					}
					var Name = `${item.Title} (${item.Year})`;
					response.results[category].results.push({
						title: Name,
						description: Name,
						imdbID: item.imdbID,
					});
				});
				return response;
			},
		},
		fields: {
			results: 'results',
			title: 'name',
		},
		onSelect: function (response) {
			document.getElementById('hidden-id-value').value = response.imdbID;
			document.getElementById('omdb-search-box').value = response.title;
		},
		minCharacters: 3,
	});
};

///////////////////////////////////////////////////////////////////////////
//                            Parsers                                    //
///////////////////////////////////////////////////////////////////////////

class Parser {
	// parse download links
	downloadLinks = (downloadLinks, megaDomains) => {
		let downloadLinkBBCode = '[hide][b]';
		if (downloadLinks == null) {
			downloadLinkBBCode += '[url=][size=150]Download Link[/size][/url]';
		} else {
			for (let link of downloadLinks) {
				if (megaDomains.some((el) => link.includes(el))) {
					downloadLinkBBCode += `[url=${link}][size=150][color=#FF0000]MEGA[/color][/size][/url]\n`;
				} else if (link.includes('zippyshare.com')) {
					downloadLinkBBCode += `[url=${link}][size=150][color=#FFFF00]ZippyShare[/color][/size][/url]\n`;
				} else if (link.includes('drive.google.com')) {
					downloadLinkBBCode += `[url=${link}][size=150][color=#00FF00]Gdrive[/color][/size][/url]\n`;
				} else {
					downloadLinkBBCode += `[url=${link}][size=150]Download Link[/size][/url]\n`;
				}
			}
		}
		return `[size=200][color=#fac51c][B]Download Links:[/B][/COLOR][/size]\n\n[center]\n${downloadLinkBBCode}[/b][/hide][/CENTER]\n`;
	};

	// parse screenshot links
	screenshots = (screenshots) => {
		var screen = `\n[hr][/hr][size=200][color=#fac51c][b]Screenshots:[/b][/color][/size]\n\n`;
		for (let ss of screenshots) {
			screen += `[img]${ss}[/img]`;
		}
		screen += `\n`;
		return screen;
	};

	// Parses Mediainfo for Title values
	mediaInfo = (mediaInfo, premadeTitle) => {
		let videoInfo = mediaInfo.match(/(Video|Video #1)$.^[\s\S]*?(?=\n{2,})/ms);
		if (videoInfo) {
			videoInfo = videoInfo[0];
			let videoWidth = videoInfo.match(/Width.*/);
			if (videoWidth) {
				videoWidth = videoWidth[0];
				if (videoWidth.includes('3 840')) {
					premadeTitle += ' 2160p';
				} else if (videoWidth.includes('1 920')) {
					premadeTitle += ' 1080p';
				} else if (videoWidth.includes('1 280')) {
					premadeTitle += ' 720p';
				} else if (videoWidth.includes('720')) {
					premadeTitle += ' 480p';
				}
			}
			let videoWritingLib = videoInfo.match(/Writing library.*/);
			if (
				videoWritingLib &
				(videoWritingLib[0].includes('x265') |
					videoWritingLib[0].includes('x264'))
			) {
				videoWritingLib = videoWritingLib[0];
				if (videoWritingLib.includes('x265')) {
					premadeTitle += ' x265';
				} else if (videoWritingLib.includes('x264')) {
					premadeTitle += ' x264';
				}
			} else {
				let videoFormat = videoInfo.match(/Format.*/);
				if (videoFormat) {
					videoFormat = videoFormat[0];
					if (videoFormat.includes('HEVC')) {
						premadeTitle += ' HEVC';
					} else if (videoFormat.includes('AVC')) {
						premadeTitle += ' AVC';
					}
				}
			}
			let videoBitDepth = videoInfo.match(/Bit depth.*/);
			if (videoBitDepth) {
				videoBitDepth = videoBitDepth[0];
				premadeTitle += videoBitDepth.match(/\d.*/)
					? ` ${videoBitDepth.match(/\d.*/)[0].replace(' bits', 'bit')}`
					: '';
			}
		}
		let audioInfo = mediaInfo.match(/(Audio|Audio #1)$.^[\s\S]*?(?=\n{2,})/ms);
		if (audioInfo) {
			audioInfo = audioInfo[0];
			let audioCodec = audioInfo.match(/Codec ID.*/);
			if (audioCodec) {
				audioCodec = audioCodec[0];
				premadeTitle += audioCodec.match(/(?<=A_).*/)
					? ` ${audioCodec.match(/(?<=A_).*/)[0]}`
					: '';
			}
		}
		if (sectionType === 'movies') {
			let generalInfo = mediaInfo.match(/General$.^[\s\S]*?(?=\n{2,})/ms);
			if (generalInfo) {
				generalInfo = generalInfo[0];
				let mediaSize = generalInfo.match(/File size.*/);
				if (mediaSize) {
					mediaSize = mediaSize[0];
					premadeTitle += mediaSize.match(/\d.*/)
						? ` [${mediaSize.match(/\d.*/)[0]}]`
						: '';
				}
			}
		}
		return premadeTitle;
	};
}

const SaveApiKey = () => {
	let omdbKey = document.getElementById('omdb-api-key').value;
	if (omdbKey) {
		let apiResult = CheckApiStatus(
			`https://www.omdbapi.com/?apikey=${omdbKey}`
		);
		apiResult.then(function (result) {
			if (result) {
				GM.setValue('APIKEY', omdbKey);
				document.getElementById('omdb-generator').remove();
				document.getElementById('show-template').remove();
				Main();
			}
		});
	} else {
		alert("You Didn't Enter Your Key!!");
		return;
	}
};

const GenerateTemplate = async (apiKey) => {
	var [imdbID, downloadLinks, mediainfo, screenshots] = [
		document.getElementById('hidden-id-value').value
			? document.getElementById('hidden-id-value').value
			: document.getElementById('omdb-search-box').value,
		document.getElementById('DownloadLink').value,
		document.getElementById('mediainfo-textarea').value,
		document.getElementById('screen-links').value,
	];
	if (!imdbID) {
		alert("You Didn't Select A Title or Enter a IMDB ID!");
		return;
	}
	if (imdbID.includes('imdb')) {
		imdbID = imdbID.match(/tt\d+/)[0];
	}
	// Create Prefix placeholder per DDLs
	let titleBool = !document.getElementsByName('subject')[0].value;
	let titlePrefix = '';
	var megaDomains = ['mega.nz', 'mega.co.nz']; // In case using old Mega link
	if (titleBool) {
		if (megaDomains.some((el) => downloadLinks.includes(el))) {
			titlePrefix += '[Mega]';
		}
		if (downloadLinks.includes('zippyshare.com')) {
			titlePrefix += '[Zippy]';
		}
		if (downloadLinks.includes('drive.google.com')) {
			titlePrefix += '[Gdrive]';
		}
	}
	screenshots = screenshots
		? new Parser().screenshots(screenshots.split(' '))
		: '';
	const response = await RequestUrl(
		'GET',
		`http://www.omdbapi.com/?apikey=${apiKey}&i=${imdbID}&plot=full&y&r=json`
	);
	let json = JSON.parse(response.responseText);
	let poster =
		json.Poster && json.Poster !== 'N/A'
			? `[center][img]${json.Poster}[/img]\n`
			: '';
	if (json.Title && json.Title !== 'N/A') {
		var title = `${json.Title}`;
	} else {
		alert(
			"You Messed Up! Check That You've Entered Something Into The IMDB Field!"
		);
	}
	let year = json.Year && json.Year !== 'N/A' ? ` (${json.Year})` : '';
	let fullName = `[color=#fac51c][b][size=150][url='/search.php?keywords=${imdbID}&sf=titleonly']${title}${year}[/url][/size][/b][/color]\n`;
	let imdbId =
		json.imdbID && json.imdbID !== 'N/A'
			? `[url=https://www.imdb.com/title/${json.imdbID}][img]https://i.imgur.com/rcSipDw.png[/img][/url]`
			: '';
	let rating =
		json.imdbRating && json.imdbRating !== 'N/A'
			? `[size=150][b]${json.imdbRating}[/b]/10[/size]\n`
			: '';
	let imdbvotes =
		json.imdbVotes && json.imdbVotes !== 'N/A'
			? `[size=150][img]https://i.imgur.com/sEpKj3O.png[/img]${json.imdbVotes}[/size][/center]\n`
			: '';
	let plot =
		json.Plot && json.Plot !== 'N/A'
			? `[hr][/hr][size=200][color=#fac51c][b]Plot:[/b][/color][/size]\n\n ${json.Plot}\n`
			: '';
	let movieInfo = '';
	if (json.Rated && json.Rated !== 'N/A') {
		movieInfo += `[B]Rating: [/B] ${json.Rated}\n`;
	}
	if (json.Genre && json.Genre !== 'N/A') {
		movieInfo += `[*][B]Genre: [/B] ${json.Genre}\n`;
	}
	if (json.Director && json.Director !== 'N/A') {
		movieInfo += `[*][B]Directed By: [/B] ${json.Director}\n`;
	}
	if (json.Writer && json.Writer !== 'N/A') {
		movieInfo += `[*][B]Written By: [/B] ${json.Writer}\n`;
	}
	if (json.Actors && json.Actors !== 'N/A') {
		movieInfo += `[*][B]Starring: [/B] ${json.Actors}\n`;
	}
	if (json.Released && json.Released !== 'N/A') {
		movieInfo += `[*][B]Release Date: [/B] ${json.Released}\n`;
	}
	if (json.Runtime && json.Runtime !== 'N/A') {
		movieInfo += `[*][B]Runtime: [/B] ${json.Runtime}\n`;
	}
	if (json.Production && json.Production !== 'N/A') {
		movieInfo += `[*][B]Production: [/B] ${json.Production}\n`;
	}
	if (movieInfo) {
		movieInfo = `\n[hr][/hr][size=200][color=#fac51c][b]Movie Info:[/b][/color][/size]\n\n[LIST][*]${movieInfo}[/LIST]\n`;
	}
	let premadeTitle = titleBool
		? `${titlePrefix} ${json.Title} (${json.Year})`
		: '';
	if (titleBool && mediainfo) {
		premadeTitle = new Parser().mediaInfo(mediainfo, premadeTitle);
	}
	mediainfo = mediainfo
		? `[hr][/hr][size=200][color=#fac51c][b]Media Info:[/b][/color][/size]\n\n[mediainfo]${mediainfo}\n[/mediainfo]\n`
		: '';
	let downloadLinkBBCode = new Parser().downloadLinks(
		downloadLinks.split(' '),
		megaDomains
	);
	let forumBBCode = `${poster}${fullName}${imdbId}${rating}${imdbvotes}${plot}${screenshots}${movieInfo}${mediainfo}${downloadLinkBBCode}`;
	SubmitToForum(forumBBCode, premadeTitle, titleBool);
};

function Main() {
	GM.getValue('APIKEY', 'foo').then((apiKey) => {
		const htmlpush = document.getElementsByTagName('dl')[0];
		if (apiKey !== 'foo') {
			htmlpush.insertAdjacentHTML('afterend', htmlTemplate);
		} else {
			htmlpush.insertAdjacentHTML('afterend', omdbinput);
		}
		document.getElementById('hide-template').addEventListener(
			'click',
			() => {
				HideTemplate();
			},
			false
		);
		document.getElementById('show-template').addEventListener(
			'click',
			() => {
				ShowTemplate();
			},
			false
		);
		if (apiKey !== 'foo') {
			SectionSearch(apiKey);
			document.getElementById('generate-template').addEventListener(
				'click',
				() => {
					GenerateTemplate(apiKey);
				},
				false
			);
		} else {
			document.getElementById('save-key').addEventListener(
				'click',
				() => {
					SaveApiKey();
				},
				false
			);
		}
	});
}

// Add css to our elements
GM_addStyle(`
@media screen and (min-width: 300px) {
	.inputbox {
		max-width: 330px;
	}
	.result {
		max-height: 10px;
		display: unset;
	}
	.content {
		overflow: unset;
		min-height: unset;
		cursor: pointer;
		padding-bottom: unset;
		line-height: unset;
	}
	#mediainfo-textarea {
		width: 100% !important; 
	}
}
`);

if (!tabURL.includes('preview')) {
	Main();
}
