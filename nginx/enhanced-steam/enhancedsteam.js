window.addEventListener('DOMContentLoaded', function() { main(window.jQuery); }, false);

function main($) {	
	var apps;
	var appid_promises = {};

	// Session storage functions.
	function setValue(key, value) {
		window.sessionStorage.setItem(key, JSON.stringify(value));
	}

	function getValue(key) {
		var v = window.sessionStorage.getItem(key);
		if (v === undefined) return v;
		return JSON.parse(v);
	}

	// Helper prototypes
	String.prototype.startsWith = function(prefix) {
		return this.indexOf(prefix) === 0;
	};

	Number.prototype.formatMoney = function(places, symbol, thousand, decimal) {
		places = !isNaN(places = Math.abs(places)) ? places : 2;
		symbol = symbol !== undefined ? symbol : "$";
		thousand = thousand || ",";
		decimal = decimal || ".";
		var number = this,
			negative = number < 0 ? "-" : "",
			i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + "",
			j = (j = i.length) > 3 ? j % 3 : 0;
		return symbol + negative + (j ? i.substr(0, j) + thousand : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousand) + (places ? decimal + Math.abs(number - i).toFixed(places).slice(2) : "");
	};
	
	function escapeHTML(str) {
		return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') ;
	}

	// DOM helpers
	function xpath_each(xpath, callback) {
		var res = document.evaluate(xpath, document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
		var node;
		for (var i = 0; i < res.snapshotLength; ++i) {
			node = res.snapshotItem(i);
			callback(node);
		}
	}

	function get_http(url, callback) {
		var http = new window.XMLHttpRequest();
		http.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				callback(this.responseText);
			}
		};
		http.open('GET', url, true);
		http.send(null);
	}

	function get_appid(t) {
		if (t && t.match(/(?:store\.steampowered|steamcommunity)\.com\/app\/(\d+)\/?/)) return RegExp.$1;
		else return null;
	}

	function get_subid(t) {
		if (t && t.match(/(?:store\.steampowered|steamcommunity)\.com\/sub\/(\d+)\/?/)) return RegExp.$1;
		else return null;
	}

	function get_appid_wishlist(t) {
		if (t && t.match(/game_(\d+)/)) return RegExp.$1;
		else return null;
	}

	// colors the tile for owned games
	function highlight_owned(node) {
		highlight_node(node, "#5c7836");  
	}

	// colors the tile for wishlist games
	function highlight_wishlist(node) {
		highlight_node(node, "#496e93");
	}

	function highlight_node(node, color) {
		var $node = $(node);
		// Carousel item
		if (node.classList.contains("cluster_capsule")) {
			$node = $(node).find(".main_cap_content");
		}
		
		// Genre Carousel items
		if (node.classList.contains("large_cap")) {
			$node = $(node).find(".large_cap_content");
		}
		
		$node.css("backgroundImage", "none");
		$node.css("backgroundColor", color);

		// Set text color to not conflict with highlight.
		if (node.classList.contains("tab_row")) $node.find(".tab_desc").css("color", "lightgrey");
		if (node.classList.contains("search_result_row")) $node.find(".search_name").css("color", "lightgrey");
	}

	// adds "empty cart" button at checkout
	function add_empty_cart_button() {
		if (document.URL.indexOf("store.steampowered.com/cart/") >= 0) {    
			addtext = "<a href='javascript:document.cookie=\"shoppingCartGID=0; path=/\";window.location.reload();' class='btn_checkout_blue' style='float: left; margin-top: 14px;'><div class='leftcap'></div><div class='rightcap'></div>Empty Cart</a>";
		
			var loc = 0;	
			xpath_each("//div[contains(@class,'checkout_content')]", function (node) {		
				loc = loc + 1;
				if (loc == 2) { node.insertAdjacentHTML('afterbegin', addtext); }
			});
		} 
	}

	// User profile pages
	function add_community_profile_links() {
		var steamID = document.getElementsByName("abuseID")[0].value;
		var htmlstr = '';
		htmlstr += '<div class="profile_count_link"><a href="http://www.steamgifts.com/user/id/' + steamID + '" target="_blank"><span class="count_link_label">SteamGifts</span>&nbsp;<img src="http://www.enhancedsteam.com/firefox/ico/steamgifts.ico" width="24" height="24" border="0" /></a></div>';
		htmlstr += '<div class="profile_count_link"><a href="http://www.steamtrades.com/user/id/' + steamID + '" target="_blank"><span class="count_link_label">SteamTrades</span>&nbsp;<img src="http://www.enhancedsteam.com/firefox/ico/steamtrades.ico" width="24" height="24" border="0" /></a></div>';
		htmlstr += '<div class="profile_count_link"><a href="http://steamrep.com/profiles/' + steamID + '" target="_blank"><span class="count_link_label">SteamRep</span>&nbsp;<img src="http://www.enhancedsteam.com/firefox/ico/steamrep.ico" width="24" height="24" border="0" /></a></div>';
		htmlstr += '<div class="profile_count_link"><a href="http://wastedonsteam.com/id/' + steamID + '" target="_blank"><span class="count_link_label">Wasted On Steam</span>&nbsp;<img src="http://www.enhancedsteam.com/firefox/ico/wastedonsteam.ico" width="24" height="24" border="0" /></a></div>';
		htmlstr += '<div class="profile_count_link"><a href="http://sapi.techieanalyst.net/?page=profile&id=' + steamID + '" target="_blank"><span class="count_link_label">sAPI</span>&nbsp;<img src="http://www.enhancedsteam.com/firefox/ico/sapi.ico" width="24" height="24" border="0" /></a></div>';
		htmlstr += '<div class="profile_count_link"><a href="http://backpack.tf/profiles/' + steamID + '" target="_blank"><span class="count_link_label">backpack.tf</span>&nbsp;<img src="http://www.enhancedsteam.com/firefox/ico/backpacktf.ico" width="24" height="24" border="0" /></a></div>';
		htmlstr += '<div class="profile_count_link"><a href="http://www.achievementstats.com/index.php?action=profile&playerId=' + steamID + '" target="_blank"><span class="count_link_label">Achievement Stats</span>&nbsp;<img src="http://www.enhancedsteam.com/firefox/ico/achievementstats.ico" width="24" height="24" border="0" /></a></div>';

		if (htmlstr != '') { $(".profile_item_links").append(htmlstr); }
	}

	function appdata_on_wishlist() {
		xpath_each("//a[contains(@class,'btn_visit_store')]", function (node) {
			var app = get_appid(node.href);
			get_http('//store.steampowered.com/api/appdetails/?appids=' + app, function (data) {
				var storefront_data = JSON.parse(data);
				$.each(storefront_data, function(appid, app_data) {
					if (app_data.success) {
						// Add "Add to Cart" button
						if (app_data.data.packages && app_data.data.packages[0]) {
							var htmlstring = '<form name="add_to_cart_' + app_data.data.packages[0] + '" action="http://store.steampowered.com/cart/" method="POST">';
							htmlstring += '<input type="hidden" name="snr" value="1_5_9__403">';
							htmlstring += '<input type="hidden" name="action" value="add_to_cart">';
							htmlstring += '<input type="hidden" name="subid" value="' + app_data.data.packages[0] + '">';
							htmlstring += '</form>';
							$(node).before('</form>' + htmlstring + '<a href="#" onclick="document.forms[\'add_to_cart_' + app_data.data.packages[0] + '\'].submit();" class="btn_visit_store">Add to Cart</a>  ');
						}
						
						// Adds platform information
						if (app_data.data.platforms) {
							var htmlstring = "";
							var platforms = 0;
							if (app_data.data.platforms.windows) { htmlstring += "<span class='platform_img win'></span>"; platforms += 1; }
							if (app_data.data.platforms.mac) { htmlstring += "<span class='platform_img mac'></span>"; platforms += 1; }
							if (app_data.data.platforms.linux) { htmlstring += "<span class='platform_img linux'></span>"; platforms += 1; }

							if (platforms > 1) { htmlstring = "<span class='platform_img steamplay'></span>" + htmlstring; }

							$(node).parent().parent().parent().find(".bottom_controls").append(htmlstring);
						}
					}
				});
			});
			
			if ($(node).parent().parent().parent().html().match(/discount_block_inline/)) {
				$(node).before("<div id='es_sale_type_" + app + "' style='margin-top: -10px; margin-bottom: -10px; color: #7cb8e4; display: none;'></div>");
				$("#es_sale_type_" + app).load("http://store.steampowered.com/app/" + app + " .game_purchase_discount_countdown:first", function() {
					if ($("#es_sale_type_" + app).html() != "") {
						$("#es_sale_type_" + app).html($("#es_sale_type_" + app).html().replace(/\!(.+)/, "!"));
						$("#es_sale_type_" + app).show();					
					}
				});
			};	
		});
	}

	// fixes "Image not found" in wishlist
	function fix_wishlist_image_not_found() {
		var items = document.getElementById("wishlist_items");
		if (items) {
				imgs = items.getElementsByTagName("img");
				for (var i = 0; i < imgs.length; i++)
				if (imgs[i].src == "http://media.steampowered.com/steamcommunity/public/images/avatars/33/338200c5d6c4d9bdcf6632642a2aeb591fb8a5c2.gif") {
						var gameurl = imgs[i].parentNode.href;
						imgs[i].src = "http://cdn.steampowered.com/v/gfx/apps/" + gameurl.substring(gameurl.lastIndexOf("/") + 1) + "/header.jpg";
				}
		}
	}

	function show_pricing_history(appid, type) {
		storestring = "steam,amazonus,impulse,gamersgate,greenmangaming,gamefly,origin,uplay,indiegalastore,gametap,gamesplanet,getgames,desura,gog,dotemu,beamdog,adventureshop,nuuvem,shinyloot,dlgamer,humblestore";

		// Get country code from Steam cookie
		var cookies = document.cookie;
		var matched = cookies.match(/fakeCC=([a-z]{2})/i);
		var cc = "us";
		if (matched != null && matched.length == 2) {
			cc = matched[1];
		} else {
			matched = cookies.match(/steamCC(?:_\d+){4}=([a-z]{2})/i);
			if (matched != null && matched.length == 2) {
				cc = matched[1];
			}
		}
				
		get_http("http://www.enhancedsteam.com/gamedata/price.php?search=" + type + "/" + appid + "&region=us&stores=" + storestring + "&cc=" + cc, function (txt) {
			document.getElementById('game_area_purchase').insertAdjacentHTML('afterbegin', txt);
		});
	}

	// pull DLC gamedata from enhancedsteam.com
	function dlc_data_from_site(appid) {
		if ($("div.game_area_dlc_bubble").length > 0) {
			var appname = $(".apphub_AppName").html();
			appname = appname.replace("&amp;", "and");
			appname = appname.replace("\"", "");
			appname = appname.replace("“", "");		
			get_http("http://www.enhancedsteam.com/gamedata/gamedata.php?appid=" + appid + "&appname=" + appname, function (txt) {
				var block = "<div class='block'><div class='block_header'><h4>Downloadable Content Details</h4></div><div class='block_content'><div class='block_content_inner'>" + txt + "</div></div></div>";
			
				var dlc_categories = document.getElementById('demo_block');
				dlc_categories.insertAdjacentHTML('afterend', block);
			});
		}
	}

	// Add SteamDB links to pages
	function add_steamdb_links(appid, type) {
		switch (type) {
			case "gamehub":
				$(".apphub_OtherSiteInfo").append('<a href="http://steamdb.info/app/' + appid + '/" class="btn_darkblue_white_innerfade btn_medium" target="_blank"><span>Steam Database</span>');
				break;
			case "gamegroup":
				$('#rightActionBlock' ).append('<div class="actionItemIcon"><img src="http://www.enhancedsteam.com/firefox/steamdb.png" width="16" height="16" alt=""></div><a class="linkActionMinor" target="_blank" href="http://steamdb.info/app/' + appid + '/">View In Steam Database</a>');
				break;
			case "app":
				$('#demo_block').find('.block_content_inner').find('.share').before('<div class="demo_area_button"><a class="game_area_wishlist_btn" target="_blank" href="http://steamdb.info/app/' + appid + '/" style="background-image:url(http://www.enhancedsteam.com/firefox/steamdb_store.png)">View In Steam Database</a></div>');
				break;
			case "sub":	
				$(".share").before('<a class="game_area_wishlist_btn" target="_blank" href="http://steamdb.info/sub/' + appid + '/" style="background-image:url(http://www.enhancedsteam.com/firefox/steamdb_store.png)">View In Steam Database</a>');
				break;
		}
	}

	// Adds red warnings for 3rd party DRM
	function drm_warnings() {
		var gfwl;
		var uplay;
		var securom;
		var tages;
		var stardock;
		var rockstar;
		var kalypso;
		var otherdrm;

		var text = $("#game_area_description").html();
		text += $("#game_area_sys_req").html();
		text += $("#game_area_legal").html();
		text += $(".game_details").html();

		// Games for Windows Live detection
		if (text.toUpperCase().indexOf("GAMES FOR WINDOWS LIVE") > 0) { gfwl = true; }
		if (text.toUpperCase().indexOf("GAMES FOR WINDOWS - LIVE") > 0) { gfwl = true; }
		if (text.indexOf("Online play requires log-in to Games For Windows") > 0) { gfwl = true; }
		if (text.indexOf("INSTALLATION OF THE GAMES FOR WINDOWS LIVE SOFTWARE") > 0) { gfwl = true; }
		if (text.indexOf("Multiplayer play and other LIVE features included at no charge") > 0) { gfwl = true; }
		if (text.indexOf("www.gamesforwindows.com/live") > 0) { gfwl = true; }

		// Ubisoft Uplay detection
		if (text.toUpperCase().indexOf("CREATION OF A UBISOFT ACCOUNT") > 0) { uplay = true; }
		if (text.toUpperCase().indexOf("UPLAY") > 0) { uplay = true; }

		// Securom detection
		if (text.toUpperCase().indexOf("SECUROM") > 0) { securom = true; }

		// Tages detection
		if (text.indexOf("Tages") > 0) { tages = true; }
		if (text.indexOf("Angebote des Tages") > 0) { tages = false; }
		if (text.indexOf("Tagesangebote") > 0) { tages = false; }
		if (text.indexOf("TAGES") > 0) { tages = true; }
		if (text.indexOf("ANGEBOT DES TAGES") > 0) { tages = false; }
		if (text.indexOf("SOLIDSHIELD") > 0) { tages = true; }
		if (text.indexOf("Solidshield Tages") > 0) { tages = true; }
		if (text.indexOf("Tages Solidshield") > 0) { tages = true; }

		// Stardock account detection
		if (text.indexOf("Stardock account") > 0) { stardock = true; }

		// Rockstar social club detection
		if (text.indexOf("Rockstar Social Club") > 0) { rockstar = true; }
		if (text.indexOf("Rockstar Games Social Club") > 0) { rockstar = true; }

		// Kalypso Launcher detection
		if (text.indexOf("Requires a Kalypso account") > 0) { kalypso = true; }

		// Detect other DRM
		if (text.indexOf("3rd-party DRM") > 0) { otherdrm = true; }
		if (text.indexOf("No 3rd Party DRM") > 0) { otherdrm = false; }
		
		if (gfwl) {
			var drm = document.getElementById('game_area_purchase'); 
			drm.insertAdjacentHTML('beforebegin', '<div class="game_area_already_owned" style="background-image: url( http://www.enhancedsteam.com/firefox/game_area_warning.png );">Warning: This title uses 3rd party DRM (Games for Windows Live)</div>');
			otherdrm = false;
		}
		
		if (uplay) {
			var drm = document.getElementById('game_area_purchase'); 
			drm.insertAdjacentHTML('beforebegin', '<div class="game_area_already_owned" style="background-image: url( http://www.enhancedsteam.com/firefox/game_area_warning.png );">Warning: This title uses 3rd party DRM (Ubisoft Uplay)</div>');
			otherdrm = false;
		}
		
		if (securom) {
			var drm = document.getElementById('game_area_purchase'); 
			drm.insertAdjacentHTML('beforebegin', '<div class="game_area_already_owned" style="background-image: url( http://www.enhancedsteam.com/firefox/game_area_warning.png );">Warning: This title uses 3rd party DRM (SecuROM)</div>');
			otherdrm = false;
		}
		
		if (tages) {
			var drm = document.getElementById('game_area_purchase'); 
			drm.insertAdjacentHTML('beforebegin', '<div class="game_area_already_owned" style="background-image: url( http://www.enhancedsteam.com/firefox/game_area_warning.png );">Warning: This title uses 3rd party DRM (Tages)</div>');
			otherdrm = false;
		}
		
		if (stardock) {
			var drm = document.getElementById('game_area_purchase'); 
			drm.insertAdjacentHTML('beforebegin', '<div class="game_area_already_owned" style="background-image: url( http://www.enhancedsteam.com/firefox/game_area_warning.png );">Warning: This title uses 3rd party DRM (Stardock Account Required)</div>');
			otherdrm = false;
		}
		
		if (rockstar) {
			var drm = document.getElementById('game_area_purchase'); 
			drm.insertAdjacentHTML('beforebegin', '<div class="game_area_already_owned" style="background-image: url( http://www.enhancedsteam.com/firefox/game_area_warning.png );">Warning: This title uses 3rd party DRM (Rockstar Social Club)</div>');
			otherdrm = false;
		}
		
		if (kalypso) {
			var drm = document.getElementById('game_area_purchase'); 
			drm.insertAdjacentHTML('beforebegin', '<div class="game_area_already_owned" style="background-image: url( http://www.enhancedsteam.com/firefox/game_area_warning.png );">Warning: This title uses 3rd party DRM (Kalypso Launcher)</div>');
			otherdrm = false;
		}
		
		if (otherdrm) {
			var drm = document.getElementById('game_area_purchase'); 
			drm.insertAdjacentHTML('beforebegin', '<div class="game_area_already_owned" style="background-image: url( http://www.enhancedsteam.com/firefox/game_area_warning.png );">Warning: This title uses 3rd party DRM</div>');
		}
	}

	function add_carousel_descriptions() {
		var capsule_appids = $.map($(".cluster_capsule"), function(obj){return get_appid(obj.href);});

		get_http("//store.steampowered.com/api/appdetails/?appids=" + capsule_appids.join(","), function(txt) {
			
			var description_height_to_add = 62;  // 60 is good for 4 lines; most strings are 2 or 3 lines than this.
			$(".main_cluster_content").css("height", parseInt($(".main_cluster_content").css("height").replace("px", ""), 10) + description_height_to_add + "px");

			var data = JSON.parse(txt);

			$.each($(".cluster_capsule"), function(i, _obj) {
				var appid = get_appid(_obj.href),
					$desc = $(_obj).find(".main_cap_content"),
					$desc_content = $("<p></p>");
					
				if (data[appid] !== undefined) {
					if (data[appid].success) {					
						$desc.css("height", parseInt($desc.css("height").replace("px", ""), 10) + description_height_to_add + "px");
						$desc.parent().css("height", parseInt($desc.parent().css("height").replace("px", ""), 10) + description_height_to_add + "px");

						var raw_string = $(data[appid].data.about_the_game).text();  // jQuery into DOM then get only text; no html pls.

						// Split the string into sentences (we only want the first two).
						// Replace delimiters with themselves and a unique string to split upon, because we want to include the delimiter once split.
						raw_string = raw_string.replace(/([\.\!\?])/g, "$1 Wow_so_unique");
						var string_sentences = raw_string.split("Wow_so_unique"),
							display_string;

						if (string_sentences.length >= 2) {
							display_string = string_sentences[0] + string_sentences[1];
						}
						else {
							display_string = raw_string;
						}

						$desc_content.html(display_string);

						$desc.append($desc_content);
					}
				}    
			});
		});
	}
	
	function bind_ajax_content_highlighting () {
		// checks content loaded via AJAX
		var observer = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				for (var i = 0; i < mutation.addedNodes.length; i++) {
					var node = mutation.addedNodes[i];
					// Check the node is what we want, and not some unrelated DOM change.
					if (node.classList && node.classList.contains("tab_row")) start_highlighting_node(node);
					if (node.id == "search_result_container") start_highlights_and_tags();					
					if (node.classList && node.classList.contains("match")) start_highlighting_node(node);
					if (node.classList && node.classList.contains("search_result_row")) start_highlighting_node(node);		
					if ($(node).parent()[0] && $(node).parent()[0].classList.contains("search_result_row")) start_highlighting_node($(node).parent()[0]);
				}
			});
		});
		observer.observe(document, { subtree: true, childList: true });			
	}

	function start_highlights_and_tags(){
		var selectors = [
				"div.tab_row",			// Storefront rows
				"div.dailydeal",		// Christmas deals; https://www.youtube.com/watch?feature=player_detailpage&v=2gGopKNPqVk#t=52s
				"div.wishlistRow",		// Wishlist row
				"a.game_area_dlc_row",	// DLC on app pages
				"a.small_cap",			// Featured storefront items, and "recommended" section on app pages.
				"a.search_result_row",	// Search result row.
				"a.match",				// Search suggestions row.
				"a.cluster_capsule",	// Carousel items.
				"div.recommendation_highlight",	// Recommendation page.
				"div.recommendation_carousel_item",	// Recommendation page.
				"div.friendplaytime_game"	// Recommendation page.
			];

		// Get all appids and nodes from selectors.
		$.each(selectors, function (i, selector) {
			$.each($(selector), function(j, node){				
				var appid = get_appid(node.href || $(node).find("a")[0].href) || get_appid_wishlist(node.id);				
				if (appid) {
					get_app_details(appid, node);
				}
			});
		});
	}

	function get_app_details(appid, node) {
		get_http('//store.steampowered.com/api/appuserdetails/?appids=' + appid, function (data) {			
			var storefront_data = JSON.parse(data);
			$.each(storefront_data, function(appid, app_data){
				if (app_data.success) {					
					setValue(appid + "wishlisted", (app_data.data.added_to_wishlist === true));
					setValue(appid + "owned", (app_data.data.is_owned === true));
				}
				if (getValue(appid + "owned")) highlight_owned(node);
				if (getValue(appid + "wishlisted")) highlight_wishlist(node);
			});
		});
	}
	
	function change_user_background() {
		var steamID;
		if ($("#reportAbuseModal").length > 0) { steamID = document.getElementsByName("abuseID")[0].value; }
		if (steamID === undefined) { steamID = document.documentElement.outerHTML.match(/steamid"\:"(.+)","personaname/)[1]; }

		get_http("http://api.enhancedsteam.com/profile/?steam64=" + steamID, function (txt) {
			if (txt) {
				$(".no_header")[0].style.backgroundImage = "url(" + txt + ")";
				if ($(".profile_background_image_content").length > 0) {
					$(".profile_background_image_content")[0].style.backgroundImage = "url(" + txt + ")";
				} else {
					$(".no_header").addClass("has_profile_background");
					$(".profile_content").addClass("has_profile_background");
					$(".profile_content").prepend('<div class="profile_background_holder_content"><div class="profile_background_overlay_content"></div><div class="profile_background_image_content " style="background-image: url(' + txt + ');"></div></div></div>');
				}
			}
		});
	}

	$(document).ready(function(){
		switch (window.location.host) {
			case "store.steampowered.com":			
				switch (true) {
					case /^\/cart\/.*/.test(window.location.pathname):
						add_empty_cart_button();
						break;

					case /^\/app\/.*/.test(window.location.pathname):
						var appid = get_appid(window.location.host + window.location.pathname);
						show_pricing_history(appid, "app");
						dlc_data_from_site(appid);
						drm_warnings();
						add_steamdb_links(appid, "app");
						break;

					case /^\/sub\/.*/.test(window.location.pathname):
						var subid = get_subid(window.location.host + window.location.pathname);
						drm_warnings();
						show_pricing_history(subid, "sub");
						add_steamdb_links(subid, "sub");
						break;

					case /^\/$/.test(window.location.pathname):
						add_carousel_descriptions();
						break;
				}

				start_highlights_and_tags();
				bind_ajax_content_highlighting();
				break;

			case "steamcommunity.com":
				switch (true) {
					case /^\/(?:id|profiles)\/.+\/wishlist/.test(window.location.pathname):
						appdata_on_wishlist();
						fix_wishlist_image_not_found();
						start_highlights_and_tags();
						break;

					case /^\/(?:id|profiles)\/[^\/]+\/?$/.test(window.location.pathname):
						add_community_profile_links();
						change_user_background();
						break;

					case /^\/app\/.*/.test(window.location.pathname):
						var appid = get_appid(window.location.host + window.location.pathname);
						add_steamdb_links(appid, "gamehub");
						break;
						
					case /^\/games\/.*/.test(window.location.pathname):
						var appid = document.querySelector( 'a[href*="http://steamcommunity.com/app/"]' );
						appid = appid.href.match( /(\d)+/g );
						add_steamdb_links(appid, "gamegroup");
						break;
				}
				break;		
		}
	});  
}