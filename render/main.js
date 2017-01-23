$(function() {

	var globalLang;
	if (Cookies.get('lang') !== undefined) {
		globalLang = Cookies.get('lang');
	} else {
		globalLang = 'or';
	}
	setLang(globalLang);
	
	$('li.lang').click(function() {
		if ($(this).hasClass('active')) return;
		
		var newLang = $(this).data('lang');
		setLang(newLang);
	});

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
})