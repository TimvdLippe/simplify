
// == SIMPL =====================================================
// Add simpl style to html tag
var htmlEl = document.getElementsByTagName('html')[0];
htmlEl.classList.add('simpl');

// Add keyboard shortcut for toggling on/off custom style
function toggleSimpl(event) {
	// If Cmd+J was pressed, toggle simpl
	if (event.metaKey && event.which == 74) {
		htmlEl.classList.toggle('simpl');
		event.preventDefault();
	}
}
window.addEventListener('keydown', toggleSimpl, false);

// Add simpl Toggle button
window.addEventListener('load', function() {
	var elem = document.createElement("div");
	elem.id = 'simplToggle';
	elem.addEventListener('click', toggleSimpl, false);
	document.body.insertBefore(elem, document.body.childNodes[0]);
}, false);

// Hide Search box by default
htmlEl.classList.add('hideSearch');



// == URL HISTORY =====================================================

// Set up urlHashes to track and update for closing Search and leaving Settings
var closeSearchUrlHash = location.hash.substring(1, 7) == "search" || "label/" ? "#inbox" : location.hash;
var closeSettingsUrlHash = location.hash.substring(1, 9) == "settings" ? "#inbox" : location.hash;

window.onhashchange = function() {
	// togglePagination();

	if (location.hash.substring(1, 7) != "search" && location.hash.substring(1, 6) != "label") {
		closeSearchUrlHash = location.hash;
	}
	if (location.hash.substring(1, 9) != "settings")  {
		closeSettingsUrlHash = location.hash;
		htmlEl.classList.remove('inSettings');
	}
	if (location.hash.substring(1, 9) == "settings")  {
		htmlEl.classList.add('inSettings');
	}

	// if we were supposed to check the theme later, do it now
	if (checkThemeLater) {
		detectTheme();
	}
}

// Show back button if page loaded on Settings
if (location.hash.substring(1, 9) == "settings") {
	htmlEl.classList.add('inSettings');
}




// == INIT =====================================================

// Turn debug loggings on/off
var simplifyDebug = true;

// Global variable to track if we should ignore focus (temp fix)
var ignoreSearchFocus = false; 

// Setup search event listeners
var initSearchLoops = 0;
function initSearch() {
	// See if Search form has be added to the dom yet
	var headerBar = document.getElementById('gb');
	var searchForm = (headerBar) ? headerBar.getElementsByTagName('form')[0] : false;

	// Setup Search functions to show/hide Search at the 
	// right times if we have access to the search field
	if (searchForm) {
		// Add .gb_vd, Gmail's own class to minimize search
		searchForm.classList.toggle('gb_vd');
		
		// Add function to search button to toggle search open/closed
		var searchButton = document.getElementsByClassName('gb_Ue')[0];
		var searchIcon = searchButton.getElementsByTagName('svg')[0];
		searchIcon.addEventListener('click', function() {
			htmlEl.classList.toggle('hideSearch');
			searchForm.classList.toggle('gb_vd');
			// toggleSearchFocus();
		}, false);

		// Add functionality to search close button to close search and go back
		var searchCloseButton = document.getElementsByClassName('gb_Xe')[0];
		var searchCloseIcon = searchCloseButton.getElementsByTagName('svg')[0];
		
		/* THIS IS JANKY -- clicking on the close search input 
		 * gives it focus which keeps it open b/c of the event listener
		 * to keep it open in case it gets focus via keyboard shortcut
		 */		
		searchCloseIcon.addEventListener('click', function(e) {
			ignoreSearchFocus = true;
			searchForm.getElementsByTagName('input')[0].blur();
			htmlEl.classList.toggle('hideSearch');
			searchForm.classList.add('gb_vd');
			searchForm.classList.remove('gb_oe');
			location.hash = closeSearchUrlHash;
			setTimeout(function() { ignoreSearchFocus = false; }, 200);
			// toggleSearchFocus();
		}, false);

		// Unrelated to search but hide the pagination controls if there are fewer than 50 items
		// togglePagination();

		// TODO: If initial page loaded is a search, show search box
		// ...

	} else {
		initSearchLoops++;
		if (simplifyDebug) { 
			console.log('initSearch loop #' + initSearchLoops);
		}
		
		// only try 20 times and then asume something is wrong
		if (initSearchLoops < 21) {
			// Call init function again if the gear button field wasn't loaded yet
			setTimeout(initSearch, 500);
		}
	}
}

var initSearchFocusLoops = 0;
function initSearchFocus() {
	// If the search field gets focus and hideSearch hasn't been applied, add it
	var searchInput = document.querySelectorAll('header input[name="q"]')[0];
	if (!searchInput) {
		// aria-label doesn't work with non-english interfaces but .gb_Ie changes often
		searchInput = document.getElementsByClassName('gb_Ie')[0];
	} 

	if (searchInput) {
		if (location.hash.substring(1, 7) == "search" || "label/") {
			htmlEl.classList.remove('hideSearch');
		}
		searchInput.addEventListener('focus', function() { 
			if (!ignoreSearchFocus) {
				htmlEl.classList.remove('hideSearch');
			}
		}, false );
	} else {
		initSearchFocusLoops++;
		if (simplifyDebug) { 
			console.log('initSearchFocus loop #' + initSearchFocusLoops); 
		}

		// only try 20 times and then asume something is wrong
		if (initSearchFocusLoops < 21) {
			// Call init function again if the search input wasn't loaded yet
			setTimeout(initSearchFocus, 500);
		}
	}
}

var detectThemeLoops = 0;
var checkThemeLater = false;
function detectTheme() {
	var threadlistItem = document.querySelectorAll('div[gh="tl"] tr')[0];
	var conversation = document.querySelectorAll('table[role="presentation"]');
	if (threadlistItem) {
		var itemBg = window.getComputedStyle(threadlistItem, null).getPropertyValue("background-color");
		if (parseInt(itemBg.substr(5,3)) < 100) {
			htmlEl.classList.add('darkTheme');
		} else {
			htmlEl.classList.add('lightTheme');
		}
		checkThemeLater = false;
	} else if (conversation.length == 0) {
		// if we're not looking at a conversation, maybe the threadlist just hasn't loaded yet
		detectThemeLoops++;
		if (simplifyDebug) { 
			console.log('detectTheme loop #' + detectThemeLoops);
		}

		// only try 10 times and then asume you're in a thread
		if (detectThemeLoops < 11) {
			setTimeout(detectTheme, 500);		
		}
	} else {
		// We are looking at a conversation, check the theme when the view changes
		checkThemeLater = true;
	}
}


// Setup settigs event listeners
var initSettingsLoops = 0;
function initSettings() {
	// See if settings gear has be added to the dom yet
	var backButton = document.querySelector('header#gb div[aria-label="Go back"] svg');
	if (!backButton) {
		// aria-label doesn't work with non-english interfaces but .gb_1b changes often
		backButton = document.querySelector('header#gb div.gb_1b svg');
	}

	if (backButton) {
		backButton.addEventListener('click', function() {		
			if (location.hash.substring(1, 9) == "settings") {
				location.hash = closeSettingsUrlHash;
				htmlEl.classList.remove('inSettings');
			}
		}, false);
	} else {
		initSettingsLoops++;
		if (simplifyDebug) { 
			console.log('initSettings loop #' + initSettingsLoops);
		}

		// only try 20 times and then asume something is wrong
		if (detectThemeLoops < 21) {
			// Call init function again if the gear button field wasn't loaded yet
			setTimeout(initSettings, 500);
		}
	}
}

// Initialize everything
function init() {
	initSearch();
	initSettings();
	initSearchFocus();
	detectTheme();
}
window.addEventListener('DOMContentLoaded', init, false);





// == SCRAPS =====================================================

/* Focus search input – NOT WORKING
function toggleSearchFocus() {
	var searchInput = document.querySelectorAll('input[aria-label="Search mail"]')[0];

	// We are about to show Search if hideSearch is still on the html tag
	if (htmlEl.classList.contains('hideSearch')) {
		searchInput.blur();
	} else {
		searchInput.focus();
	}
}
*/


/* Toggle pagination controls to only show when you need them
 * BUG: doesn't catch when you switch between inbox tabs
function togglePagination() {
	// If in list view, and pagination conrols exist, and fewer 
	// than 50 items, hide controls 
	var paginationControl = document.querySelectorAll('.aeH .Dj .ts')[2];
	if (paginationControl) {
		if (paginationControl.innerText < 50) { 
			console.log('hide pagination'); 
		} else { 
			console.log('show pagination'); 
		}	
	} else {
		console.log('no pagination control');
	}
}
*/