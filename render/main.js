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


	// === Functions ===

	function setLang(newLang) {
		// var currentLang = globalLang;
		var windowPosition = $(window).scrollTop();

		langContents('or').hide();
		langContents('en').hide();
		langContents('es').hide();

		langContents(newLang).show();
		$(window).scrollTop(windowPosition);

		$('#lang_switcher').find('.active').removeClass('active');
		$('.lang[data-lang="' + newLang + '"]').addClass('active');
		globalLang = newLang;
		Cookies.set('lang', globalLang, { expires: 365 });
	}

	function langContents(lang) {
		return $('.content_' + lang);
	}

	function setupTOC() {
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
});