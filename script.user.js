// ==UserScript==
// @name        Snahp Movie/TV Template Generator
// @version     1.0.1
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
// @grant       GM_xmlhttpRequest
// @grant       GM.setValue
// @grant       GM.getValue
// ==/UserScript==

Main();

const htmlTemplate = `
<button id="show-template" name="template-button" style="display:none" type="button">Show</button>
<dr style="clear: left;" id="omdb-generator">
<dl style="clear: left;">
<dt> <label id="imdb-search" for="Semantic Search">Imdb Search:</label> </dt>
<dd> <input type="text" id="hidden-id-value" value="" style="display:none">
<div class="ui search" id="search-box" size="45">
<input type="text" class="prompt inputbox autowidth" id="omdb-search-box" size="45" placeholder="IMDB ID, Title, or Link"></input>
<div class="results inputbox" id="search-results" size="45" style="display:none;"></div> </dd>
</dl>
<dl style="clear: left;">
<dt> <label id="screen-fill" for="Screenshots">Screenshot Links:</label> </dt>
<dd> <input type="text" id="screen-links" value="" class="inputbox autowidth" size="45"></input> </dd>
</dl>
<dl style="clear: left;">
<dt> <label id="mediainfo-output" for="Mediainfo Text Output">Mediainfo:</label> </dt>
<dd> <textarea rows="1" style="width:100%;" class="inputbox autowidth" id="mediainfo-textarea" size="45"></textarea> </dd>
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

var sectionType;

function Main() {
	GM.getValue('APIKEY', 'foo').then((APIVALUE) => {
		var tabURL = window.location.href;
		if (tabURL.includes('preview')) {
			return;
		}
		const htmlpush = document.getElementsByTagName('dl')[0];
		htmlpush.innerHTML += APIVALUE !== 'foo' ? htmlTemplate : omdbinput;
		SectionSearch(APIVALUE, tabURL);
		$(document).on('keydown', function (event) {
			if (event.key == 'Escape') {
				$('#omdb-generator').hide();
				document.getElementById('show-template').style.display = 'block';
			}
		});
		$('#hide-template').click(() => HideTemplate());
		$('#show-template').click(() => ShowTemplate());
		$('#save-key').click(() => SaveApiKey(APIVALUE, htmlpush));
		$('#generate-template').click(() => GenerateTemplate(APIVALUE));
	});
}

function ShowTemplate() {
	document.getElementById('show-template').style.display = 'none';
	$('#omdb-generator').show();
}
function HideTemplate() {
	document.getElementById('show-template').style.display = 'block';
	$('#omdb-generator').hide();
}

function SectionSearch(APIVALUE, tabURL) {
	var sectionCheck = tabURL.match(/\d+/, '');
	var Movies = '26 29 30 42 55 56 66 72 73 88';
	var Series = '31 32 33 57 61 62 64 65 74 75 84';
	var query;
	if (Series.includes(sectionCheck)) {
		query = `https://www.omdbapi.com/?apikey=${APIVALUE}&r=JSON&s={query}&type=series`;
		sectionType = 'series';
	} else if (Movies.includes(sectionCheck)) {
		query = `https://www.omdbapi.com/?apikey=${APIVALUE}&r=JSON&s={query}&type=movie`;
		sectionType = 'movies';
	} else {
		query = `https://www.omdbapi.com/?apikey=${APIVALUE}&r=JSON&s={query}`;
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
					var Name = item.Title + ' (' + item.Year + ')';
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
			$('#hidden-id-value').val(response.imdbID);
			$('#omdb-search-box').val(response.title);
		},
		minCharacters: 3,
	});
}

function SaveApiKey(APIVALUE) {
	if (APIVALUE == 'foo') {
		let omdbKey = $('#omdb-api-key').val();
		if (omdbKey) {
			GM.setValue('APIKEY', omdbKey);
		} else {
			alert("You Didn't Enter Your Key!!");
		}
		document.getElementById('omdb-generator').remove();
		document.getElementById('show-template').remove();
		Main();
	}
}

// Parses Mediainfo for Title values
function ParseMediaInfo(mediaInfo, premadeTitle) {
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
}

function GenerateTemplate(APIVALUE) {
	var [imdbID, screenshots, mediainfo] = [
		document.getElementById('hidden-id-value').value
			? document.getElementById('hidden-id-value').value
			: document.getElementById('searchID').value,
		document.getElementById('screen-links').value,
		document.getElementById('mediainfo-textarea').value,
	];
	if (!imdbID) {
		alert("You Didn't Select A Title or Enter a IMDB ID!");
		return;
	}
	if (imdbID.includes('imdb')) {
		imdbID = imdbID.match(/tt\d+/)[0];
	}
	if (screenshots) {
		screenshots = screenshots.split(' ');
		var screen = `\n[hr][/hr][size=150][color=#fac51c][b]Screenshots[/b][/color][/size]\n\n`;
		for (let ss of screenshots) {
			screen += `[img]${ss}[/img]`;
		}
		screen += `\n`;
	} else {
		screen = '';
	}
	GM_xmlhttpRequest({
		method: 'GET',
		url: `http://www.omdbapi.com/?apikey=${APIVALUE}&i=${imdbID}&plot=full&y&r=json`,
		onload: function (response) {
			let json = JSON.parse(response.responseText);
			let poster =
				json.Poster && json.Poster !== 'N/A'
					? '[center][img]' + json.Poster + '[/img]\n'
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
					? '[url=https://www.imdb.com/title/' +
					  json.imdbID +
					  '][img]https://i.imgur.com/rcSipDw.png[/img][/url]'
					: '';
			let rating =
				json.imdbRating && json.imdbRating !== 'N/A'
					? '[size=150][b]' + json.imdbRating + '[/b]/10[/size]\n'
					: '';
			let imdbvotes =
				json.imdbVotes && json.imdbVotes !== 'N/A'
					? '[size=150][img]https://i.imgur.com/sEpKj3O.png[/img]' +
					  json.imdbVotes +
					  '[/size][/center]\n'
					: '';
			let plot =
				json.Plot && json.Plot !== 'N/A'
					? '[hr][/hr][size=150][color=#fac51c][b]Plot[/b][/color][/size]\n\n ' +
					  json.Plot +
					  '\n'
					: '';
			let rated =
				json.Rated && json.Rated !== 'N/A'
					? '[B]Rating: [/B]' + json.Rated + '\n'
					: '';
			let genre =
				json.Genre && json.Genre !== 'N/A'
					? '[*][B]Genre: [/B] ' + json.Genre + '\n'
					: '';
			let director =
				json.Director && json.Director !== 'N/A'
					? '[*][B]Directed By: [/B] ' + json.Director + '\n'
					: '';
			let writer =
				json.Writer && json.Writer !== 'N/A'
					? '[*][B]Written By: [/B] ' + json.Writer + '\n'
					: '';
			let actors =
				json.Actors && json.Actors !== 'N/A'
					? '[*][B]Starring: [/B] ' + json.Actors + '\n'
					: '';
			let released =
				json.Released && json.Released !== 'N/A'
					? '[*][B]Release Date: [/B] ' + json.Released + '\n'
					: '';
			let runtime =
				json.Runtime && json.Runtime !== 'N/A'
					? '[*][B]Runtime: [/B] ' + json.Runtime + '\n'
					: '';
			let production =
				json.Production && json.Production !== 'N/A'
					? '[*][B]Production: [/B] ' + json.Production + '\n'
					: '';
			let titleBool = !document.getElementsByName('subject')[0].value;
			let premadeTitle = titleBool ? `${json.Title} (${json.Year})` : '';
			if (titleBool && mediainfo) {
				premadeTitle = ParseMediaInfo(mediainfo, premadeTitle);
			}
			mediainfo = mediainfo
				? `[hr][/hr][size=150][color=#fac51c][b]Media Info[/b][/color][/size]\n\n [mediainfo]${mediainfo}\n[/mediainfo]\n`
				: '';
			let ddl = `[hr][/hr][center][size=150][color=#fac51c][b]Download Link[/b][/color][/size]\n
[hide][b][url=][color=#FF0000]MEGA[/color][/url]
[url=][color=#FFFF00]ZippyShare[/color][/url]
[url=][color=#00FF00]Gdrive[/color][/url]
[/b][/hide]
[/center]`;
			let dump = `${poster}${fullName}${imdbId}${rating}${imdbvotes}${plot}${screen}
[hr][/hr][size=150][color=#fac51c][b]Movie Info[/b][/color][/size]\n
[LIST][*]${rated}${genre}${director}${writer}${actors}${released}${runtime}${production}[/LIST]\n${mediainfo}${ddl}`;
			try {
				document.getElementsByName('message')[0].value = dump;
			} catch (err) {
				alert(
					`Something went wrong! Please report to my Developer.... I get scared when I crash ☹️ ${err}`
				);
			} finally {
				if (!titleBool) {
					document.getElementsByName('subject')[0].value = premadeTitle;
				}
			}
		},
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
}
`);
