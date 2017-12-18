(function ($) {
	
	// Enable strict mode.
	'use strict';

	// Define global SUI object if it doesn't exist.
	if ('object' !== typeof window.SUI) {
		window.SUI = {};
	}


	// Add event handlers to show overlay dialogs.
	$(".sui-2-0-0-alpha-1").on("click", "a[rel=dialog]", showDialog);
	function showDialog(ev) {
		var el = $(this);
		var args = {};

		if (el.data("width")) { args.width = el.data("width"); }
		if (el.data("height")) { args.height = el.data("height"); }
		if (el.data("class")) { args.class = el.data("class"); }
		if (el.data("title")) { args.title = el.data("title"); }

		if (el.is("dialog")) {
			SUI.showOverlay("#" + el.attr("id"), args);
		} else if (el.attr("href")) {
			SUI.showOverlay(el.attr("href"), args);
		}
		return false;
	}
	/**
	 * Display a modal overlay on the screen.
	 * Only one overlay can be displayed at once.
	 *
	 * The dialog source must be (or contain) an <dialog> element.
	 * Only the <dialog> element is parsed and displayed in the overlay.
	 *
	 * @since  4.0.0
	 * @param  dialogSource Either CSS class/ID, URL or HTML string.
	 *         - ID must start with a hash '#'.
	 *         - Class must start with a dot '.'.
	 *         - URL contains '://' (absolute URL).
	 *         - URL starts with slash '/' (relative URL).
	 *         - Everything else is considered HTML string.
	 * @param  args Optional arguments, like callbacks (array)
	 *         @var callback  onShow
	 *         @var int       width (only for iframes)
	 *         @var int       height (only for iframes)
	 *         @var string    class
	 *         @var string    title
	 */
	SUI.showOverlay = function(dialogSource, args) {
		var retry = false;

		if ('object' !== typeof args) { args = {}; }
		args.onShow = args.onShow || false;

		// 1.) fetch the dialog code from the appropriate source.
		if ('#' === dialogSource[0] || '.' === dialogSource[0]) {
			/*
             * Type 1: CSS selector
             * The page contains a <dialog> element that is instantly displayed.
             */
			var dialog = $('dialog' + dialogSource);
			showTheDialog(dialog);
		} else if (-1 !== dialogSource.indexOf('://') || '/' === dialogSource[0]) {
			var type;
			if ('/' === dialogSource[0]) { type = 'ajax'; }
			else if (0 === dialogSource.indexOf(SUI.data.site_url)) { type = 'ajax'; }
			else { type = 'iframe'; }

			if ('ajax' === type) {
				/*
                 * Type 2a: AJAX handler
                 * The URL is relative or starts with the WordPress site_url. The
                 * URL is called as ajax handler. Result can be either HTML code or
                 * a JSON object with attributes `obj.success` and `obj.data.html`
                 * In either case, the returned HTML needs to contain a <dialog> tag
                 */
				$.get(
					dialogSource,
					'',
					function(resp) {
						var el;
						if ('{' === resp[0]) { resp = $.parseJSON(resp); }
						if ('object' === typeof resp) {
							if (resp && resp.success && resp.data.html) {
								el = $(resp.data.html);
							}
						} else {
							el = $(resp);
						}

						if (!el || !el.length) { return; }
						if (el.is('dialog')) { showTheDialog(el); }
						else { showTheDialog(el.find('dialog')); }
					}
				);
			} else if ('iframe' === type) {
				/*
                 * Type 2b: iframe container
                 * An external URL is loaded inside an iframe which is displayed
                 * inside the dialog. The external URL may return any content.
                 */
				var iframe = $('<div><iframe class="fullsize"></iframe></div>');
				iframe.find('iframe').attr('src', dialogSource);
				if (args.width) { iframe.find('iframe').attr('width', args.width); }
				if (args.height) { iframe.find('iframe').attr('height', args.height); }
				showTheDialog(iframe);
			}
		} else {
			/*
             * Type 3: Plain HTML code
             * The dialog source is plain HTML code that is parsed and displayed;
             * the code needs to contain an <dialog> element.
             */
			var el = $(dialogSource);
			if (el.is('dialog')) { showTheDialog(el); }
			else { showTheDialog(el.find('dialog')); }
		}

		// 2.) Render the dialog.
		function showTheDialog(dialog) {
			if ( ! dialog.length ) { return; }
			if ( ! SUI.prepareOverlay() ) {
				if ( ! retry ) {
					retry = true;
					SUI.closeOverlay();
					window.setTimeout(function() { showTheDialog(dialog); }, 610);
				}
				return;
			}

			if (! args.title) {
				args.title = dialog.attr('title');
			}
			if (args.class) {
				dialog.addClass(args.class);
			}

			SUI.overlay.box_title.find('h3').html(args.title);
			SUI.overlay.box_content.html(dialog.html());

			SUI.overlay.wrapper.addClass(dialog.attr('class'));
			if (dialog.hasClass('no-close')) {
				SUI.overlay.wrapper.addClass('no-close');
				SUI.overlay.close.remove();
			}
			if (dialog.find('.title-action').length) {
				SUI.overlay.box_content.find('.title-action').appendTo(SUI.overlay.box_title);
			}

			SUI.overlay.box_content.on('click', '.close', SUI.closeOverlay);
			$(window).on('resize', SUI.positionOverlay);

			SUI.overlay.container.addClass('has-overlay');
			SUI.overlay.wrapper.show();
			SUI.overlay.box.addClass('bounce-in');
			SUI.overlay.back.addClass('fade-in');
			SUI.overlay.visible = true;

			SUI.positionOverlay();

			window.setTimeout(function(){
				SUI.overlay.box.removeClass('bounce-in');
				SUI.overlay.back.removeClass('fade-in');
			}, 1000);

			if ('function' === typeof args.onShow) { args.onShow(); }
		}

		return SUI;
	};

	/**
	 * Closes the current modal overlay again.
	 *
	 * @since  4.0.0
	 */
	SUI.closeOverlay = function() {
		if ( SUI.prepareOverlay() ) { return SUI; }

		SUI.overlay.container.removeClass('has-overlay');
		SUI.overlay.box.addClass('bounce-out');
		SUI.overlay.back.addClass('fade-out');
		$(window).off('resize', SUI.positionOverlay);

		window.setTimeout(function() {
			SUI.overlay.wrapper.hide()
		}, 550);
		window.setTimeout(function() {
			SUI.overlay.wrapper.remove();
			SUI.overlay.wrapper = null;
			SUI.overlay.visible = false;
		}, 600);

		return SUI;
	};

	/**
	 * Updates the position of the overlay to keep it vertically centered on the
	 * screen.
	 *
	 * @since  4.0.0
	 */
	SUI.positionOverlay = function() {
		var availHeight, needHeight, newOffset;

		if ( SUI.prepareOverlay() ) { return SUI; }

		availHeight = SUI.overlay.scroll.height();
		needHeight = SUI.overlay.box.outerHeight();
		newOffset = (availHeight - needHeight) / 2;

		if ( newOffset < 20 ) { newOffset = 20; }
		SUI.overlay.box.css({ marginTop: newOffset });

		return SUI;
	};

	/**
	 * Creates all the DOM elements needed to display the overlay element.
	 *
	 * @since  4.0.0
	 * @return bool True if the modal is ready to be displayed.
	 */
	SUI.prepareOverlay = function() {
		var offset = $('#wpcontent').offset();

		SUI.overlay = SUI.overlay || {};

		if ( SUI.overlay.visible ) { return false; }

		if ( ! SUI.overlay.wrapper ) {
			SUI.overlay.container = $('#wpcontent');
			SUI.overlay.wrapper = $('<div class="dev-overlay"></div>');
			SUI.overlay.back = $('<div class="back"></div>');
			SUI.overlay.scroll = $('<div class="box-scroll"></div>');
			SUI.overlay.box = $('<div class="box"></div>');
			SUI.overlay.box_title = $('<div class="title"><h3></h3></div>');
			SUI.overlay.box_content = $('<div class="content"></div>');
			SUI.overlay.close = $('<div aria-hidden="true" class="close">&times;</div><button class="sui-screen-reader-text"><span class="sui-screen-reader-text">Close</span></button>');

			SUI.overlay.back.appendTo(SUI.overlay.wrapper);
			SUI.overlay.scroll.appendTo(SUI.overlay.wrapper);
			SUI.overlay.box.appendTo(SUI.overlay.scroll);
			SUI.overlay.box_title.appendTo(SUI.overlay.box);
			SUI.overlay.box_content.appendTo(SUI.overlay.box);
			SUI.overlay.close.appendTo(SUI.overlay.box_title);
			SUI.overlay.wrapper.appendTo('body');

			SUI.overlay.close.click(SUI.closeOverlay);
		}

		return true;
	};
}($));
