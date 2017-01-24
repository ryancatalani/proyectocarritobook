$(function() {

	// === Setup ===

	var globalLang;
	if (Cookies.get('lang') !== undefined) {
		globalLang = Cookies.get('lang');
	} else {
		globalLang = 'or';
	}
	setLang(globalLang);

	setupTOC();
	setHeaderImgHeight();
	getHiResImages();

	var footnotes = {};
	getFootnotes();

	var tocOpen = false;

	// === Actions ===
	
	$('li.lang').click(function() {
		if ($(this).hasClass('active')) return;
		
		var newLang = $(this).data('lang');
		setLang(newLang);
	});

	$('#toc_button').click(function(e) {
		e.preventDefault();
		$toc = $('#toc');
		if (tocOpen) {
			$toc.hide();
			$(this).removeClass('active');
		} else {
			$toc.show();
			$(this).addClass('active');
		}

		tocOpen = !tocOpen;
		return false;
	});

	$('#toc_close').click(function() {
		$('#toc').hide();
		$('#toc_button').removeClass('active');
		tocOpen = false;
	});

	$('.fn').click(function() {
		var fnRef = $(this).attr('href').replace('#','');
		var fn = footnotes[fnRef];

		var $fnBox = $('#footnote_box');
		$fnBox.find('.content_or').text(fn.original);
		$fnBox.find('.content_en').text(fn.english);
		$fnBox.find('.content_es').text(fn.spanish);

		$fnBox.fadeIn('fast');
	});	

	$('#fn_close').click(function() {
		$('#footnote_box').fadeOut('fast');
	});

	$(window).resize(function(){
		setTOCheight();
		setHeaderImgHeight();
	});



	// === Functions ===

	function setLang(newLang) {
		var windowPosition = $(window).scrollTop();

		langContents('or').hide();
		langContents('en').hide();
		langContents('es').hide();

		langContents(newLang).show();
		// $(window).scrollTop(windowPosition);

		$('#lang_switcher').find('.active').removeClass('active');
		$('.lang[data-lang="' + newLang + '"]').addClass('active');
		globalLang = newLang;
		Cookies.set('lang', globalLang, { expires: 365 });
	}

	function langContents(lang) {
		return $('.content_' + lang);
	}

	function setTOCheight() {
		if ($(window).width() >= 600) {
			$('header #toc').css('max-height', $(window).height()-44);	
		} else {
			$('header #toc').css('max-height', '');
		}
	}

	function setHeaderImgHeight() {
		if ($(window).width() >= 600) {
			$('.header_img').css('height', $(window).height()*0.9);
		} else {
			$('.header_img').css('height', '');
		}
	}

	function setupTOC() {
		setTOCheight();

		$.getJSON('/contents.json', function(data) {
			for (var i = 0; i < data.length; i++) {
				var secObj = data[i];

				var html = '<li class="toc_section">';
				if (secObj.title_or.length > 0) {
					html += '<div class="section_title">';
					html += '<span class="content_or" style="display:none">' + secObj.title_or + '</span>';
					html += '<span class="content_en" style="display:none">' + secObj.title_en + '</span>';
					html += '<span class="content_es" style="display:none">' + secObj.title_es + '</span>';	
					html += '</div>';
				}				
				html += '<ol>';

				var chapterData = secObj.contents;
				for (var j = 0; j < chapterData.length; j++) {
					var tocObj = chapterData[j];

					if (window.location.pathname.indexOf(tocObj.slug) === -1) {
						html += '<li>';
					} else {
						html += '<li class="active">';

						if (i == 0 && j == 0) {
							// beginning of book
							setupPrevLink('none');
						} else if (i > 0 && j == 0) {
							// beginning of section
							var prevIndex = data[i-1].contents.length-1;
							setupPrevLink(data[i-1].contents[prevIndex]);
						} else {
							// middle of section
							setupPrevLink(chapterData[j-1]);
						}

						if (i == data.length-1 && j == chapterData.length-1) {
							// end of book
							setupNextLink('none');
						} else if (i < data.length-1 && j == chapterData.length-1) {
							// end of section
							setupNextLink(data[i+1].contents[0]);
						} else {
							// middle of section
							setupNextLink(chapterData[j+1]);
						}
					}

					html += '<a href="/chapters/' + tocObj.slug + '.html">';
					html += '<span class="content_or" style="display:none">' + tocObj.title_or + '</span>';
					html += '<span class="content_en" style="display:none">' + tocObj.title_en + '</span>';
					html += '<span class="content_es" style="display:none">' + tocObj.title_es + '</span>';
					html += '</a></li>';
				};

				html += '</ol></li>';
				$('header #toc').append(html);
			};

			$('header #toc').find('.content_' + globalLang).show();
		});
	}

	function setupPrevLink(chapter) {
		if (chapter !== 'none') {
			setupPrevNextLink('#prev_link', chapter);
		}
	}

	function setupNextLink(chapter) {
		if (chapter !== 'none') {
			setupPrevNextLink('#next_link', chapter);
		}
	}

	function setupPrevNextLink(el, chapter) {
		if (chapter !== undefined) {
			var $link = $(el).find('a');
			$link.find('.content_or').text(chapter.title_or);
			$link.find('.content_en').text(chapter.title_en);
			$link.find('.content_es').text(chapter.title_es);

			var href = '/chapters/' + chapter.slug + '.html';
			$link.attr('href', href);

			$(el).show();
		}
	}

	function getHiResImages() {
		if ($(window).width() >= 1000 || window.devicePixelRatio > 1) {
			var imgUrlComp = $('.header_img').css('background-image').split('.');
			imgUrlComp[imgUrlComp.length-2] += '@2x';
			var imgUrl = imgUrlComp.join('.');
			$('.header_img').css('background-image', imgUrl);
		}
	}

	function getFootnotes() {
		if ( $('.fn').length > 0 ) {
			$.getJSON('/footnotes.json', function(data) {
				footnotes = data;
			});
		}
	}

});