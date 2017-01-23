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


	// === Actions ===
	
	$('li.lang').click(function() {
		if ($(this).hasClass('active')) return;
		
		var newLang = $(this).data('lang');
		setLang(newLang);
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
				var tocObj = data[i];

				var html = '';
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

				$('header #toc').append(html);
			};
			$('header #toc').find('.content_' + globalLang).show();
		})
	}
})