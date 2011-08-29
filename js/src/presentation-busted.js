(function () {
	"use strict";
	String.prototype.toHash = function () {
		return '#' + this.replace( /,|\?/g, '' ).replace( /\s|\//g, '-' ).toLowerCase();
	};
	
	// Fix MS to use addEventListener
	if ( !window.addEventListener ) {
		window.addEventListener = function ( type, listener, useCapture ) {
			attachEvent( 'on' + type, function () { listener(event); } );
		};
	}
	
	var Presentation = function ( outline, previousId, nextId ) {
		if (typeof outline !== 'object' || typeof previousId !== 'string' || typeof nextId !== 'string') {
			throw {
				name: 'TypeError',
				message: 'Initializing a presentation requires three values: outline, previousId and nextID'
			}
		}
		var outline = outline,
			previousButton = document.getElementById( previousId ),
			nextButton = document.getElementById( nextId );

		//Covert title to hash
		if (previousButton) {
			previousButton.addEventListener( 'click', loadContent );
		}
		if (nextButton) {
			nextButton.addEventListener( 'click', loadContent );
		}
		//setInitialPage();
	};
	
	Presentation.prototype = function () {
		var currentSlide = 0,
		// Fades elements in and out
		fadeElement = function ( elem, direction, target ) {
			var flag = ( direction === "In" ) ? 1 : -1,
			targetAlpha = ( target )  ? target : ( ( direction === "In" ) ? 100 : 0 ),
			alpha = elem.style.opacity ? parseFloat( elem.style.opacity ) * 100 : 0,
			tween = function () {
				if ( alpha === target ) {
					clearInterval( elem.si );
				} else {
					var value = Math.round( alpha + ( ( target - alpha ) * 0.05 ) ) + ( 1 * flag );
					elem.style.opacity = value / 100;
					elem.style.filter = 'alpha(opacity=' + value + ')';
					alpha = value;
				}
			},
			si = setInterval( function () { tween(); }, 20 );
			clearInterval( elem.si );
		},
		setNavLinks = function () {
			var direction = ( currentSlide > 0 ) ? "In" : "Out";
			fadeElement( previousButton, direction );
			
			direction = ( currentSlide <= totalSlides - 1 ) ? "In" : "Out";
			fadeElement( nextButton, direction );
		},
		// Sets the title of the slide 
		setTitle = function () {
			var slideTitle = document.getElementById( 'slideTitle' );
			var title = slideTitle.length > 0 ? slideTitle.val() : '';

			if ( !!title ) {
				// $('#slide .title h1').hide();
				fadeElement( slideTitle, "Out" );
			} else {
				// $('#slide .title h1').show().html(title);
				fadeElement( slideTitle, "In" );
			}
		}
		requestContent = function ( url, callback ) {
			var xmlHttpReq = false,
			self = this;
			// Mozilla/Safari
			if ( window.XMLHttpRequest ) {
				self.xmlHttpReq = new XMLHttpRequest();
			}
			// IE
			else if ( window.ActiveXObject ) {
				self.xmlHttpReq = new ActiveXObject( "Microsoft.XMLHTTP" );
			}
			self.xmlHttpReq.open( 'GET', url, false );
			self.xmlHttpReq.onreadystatechange = function () {
				if ( self.xmlHttpReq.readyState == 4 ) {
					setContent( self.xmlHttpReq.responseText, callback );
				}
			}
			self.xmlHttpReq.send();
		},
		setContent = function ( html, callback ) {
			
		},
		setPageTitle = function ( slide ) {
			
		},
		loadContent = function () {
			var link = this;
			var callback = function () {
				if ( link.hasClass( 'previous' ) ) {
					currentSlide--;
				} else {
					currentSlide++;
				}

				var slide = outline[currentSlide];
				setPageInformation( slide );
				prettyPrint();
				setNavLinks();
				setTitle();
				return false;
			};

			setContent( link.attr( 'href' ), callback );
			return false;
		},
		hasClass = function ( selector ) {
			var className = " " + selector + " ",
			rclass = /[\n\t\r]/g;
			
			for ( var i = 0, l = this.length; i < l; i++ ) {
				if ( this[i].nodeType === 1 && ( " " + this[i].className + " " ).replace( rclass, " " ).indexOf( className ) > -1 ) {
					return true;
				}
			}
			return false;
		},
		loadTableOfContents = function () {
		    var beginning = true;
		    var tableOfContents = $( '<div id="tableOfContents"></div>' );
		    var html = '';

		    for ( var i in outline ) {
		        var slide = outline[i];
		        if ( slide.sectionTitle ) {
		            html += ( beginning ? '' : '</ol>' )
		                 + '<h3>' + slide.title + '</h3>'
		                 + '<ol>'
		        }
		        else {
		            html += '<li><a class="outlineLink" href="' 
		                 + slide.title.toHash() + '">' 
		                 + slide.title + '</a></li>';
		        }
		        beginning = false;
		    }

		    html += '</ol>';

		    tableOfContents.html( html );
		    $( '#slide .content' ).empty().append( tableOfContents );
		    $( '#slide .title h1' ).show().html( 'Table of Contents' );
		},
		
		setInitialPage = function ( slide ) {
			var hash = document.location.hash;
			var initialSlide = outline[0];

			if ( hash ) {
				if ( hash === '#table-of-contents' ) {
					loadTableOfContents();
					return false;
				}

				for ( var i = 0; i < outline.length; i++ ) {
					var slide = outline[i];
					if ( slide.title.toHash() === hash ) {
						initialSlide = slide;
						currentSlide = i;
						break;
					}
				}
			} 

			setContent( initialSlide.url, function () { prettyPrint(); setTitle(); } );
			setNavLinks();
		}
		;
		
		return {
			setInitialPage: setInitialPage
		};
	};
	window.Presentation = Presentation;
	
})();