(function () {
	"use strict";
	String.prototype.toHash = function () {
		return '#' + this.replace(/,|\?/g, '').replace(/\s|\//g, '-').toLowerCase();
	};

	// Fix MS to use addEventListener
	if (!window.addEventListener) {
		window.addEventListener = function (type, listener, useCapture) {
			attachEvent('on' + type, function () { listener(event); });
		};
	}
}());

var presentation = (function () {
	"use strict";
	var currentSlide = 0,
		totalSlides,
		myOutline,
		previousButton,
		nextButton,
		fadeElement = function (elem, direction, target, callback) {
			var flag = (direction === "In") ? 1 : -1,
				targetAlpha = target || ((direction === "In") ? 100 : 0),
				alpha = elem.style.opacity ? parseFloat(elem.style.opacity) * 100 : 0,
				tween = function () {
					if (alpha === target) {
						clearInterval(elem.si);
						if (typeof callback === "function") {
							callback();
						}
					} else {
						var value = Math.round(alpha + ((targetAlpha - alpha) * 0.05)) + flag;
						elem.style.opacity = value / 100;
						elem.style.filter = 'alpha(opacity=' + value + ')';
						alpha = value;
					}
				};
			clearInterval(elem.si);
			elem.si = setInterval(function () { tween(); }, 20);
		},
		setNavLinks = function () {
			var direction = (currentSlide > 0) ? "In" : "Out";
			fadeElement(previousButton, direction);
			
			direction = (currentSlide <= totalSlides - 1) ? "In" : "Out";
			fadeElement(nextButton, direction);
		},
		// Sets the title of the slide 
		setTitle = function () {
			var slideTitle = document.getElementById('slideTitle'),
				title = slideTitle.innerHTML.length > 0 ? slideTitle.innerHTML : '';

			if (!!title) {
				// $('#slide .title h1').hide();
				fadeElement(slideTitle, "Out");
			} else {
				// $('#slide .title h1').show().html(title);
				fadeElement(slideTitle, "In");
			}
		},
		setContent = function (html, callback) {
			var slide = document.getElementById("slide");
			slide.innerHTML = html;
			fadeElement(slide, "In", 100, function () {
				if (typeof callback === "function") {
					callback();
				}
			});
		},
		requestContent = function (url, callback) {
			var xmlHttpReq = false;
			if (window.XMLHttpRequest) {
				// Mozilla/Safari
				xmlHttpReq = new XMLHttpRequest();
			} else if (window.ActiveXObject) {
				// IE
				xmlHttpReq = new ActiveXObject("Microsoft.XMLHTTP");
			}
			xmlHttpReq.open('GET', url, false);
			xmlHttpReq.onreadystatechange = function () {
				if (xmlHttpReq.readyState === 4) {
					setContent(xmlHttpReq.responseText, callback);
				}
			};
			xmlHttpReq.send();
		},
		setPageTitle = function (slide) {
		    document.getElementsByTagName("title")[0].innerHTML = slide.title;
		},
		setPageLocationHash = function (slide) {
			document.location.hash = slide.title.toHash();
		    document.getElementsByTagName("title")[0].innerHTML = slide.title;
		},
		loadContent = function () {
			var slide = document.getElementById("slide"),
				link = this,
				callback = function () {
					var slide;
					if (link.hasClass('previous')) {
						currentSlide -= 1;
					} else {
						currentSlide += 1;
					}
					slide = myOutline[currentSlide];
					setPageLocationHash(slide);
					setPageTitle(slide);
					setNavLinks();
					setTitle();
					return false;
				};

			fadeElement(slide, "Out");
			requestContent(link.attr('href'), callback);
			return false;
		},
/*		hasClass = function (selector) {
			var className = " " + selector + " ",
				rclass = /[\n\t\r]/g,
				i = 0,
				l = this.length;
			
			for (i; i < l; i + 1) {
				if (this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf(className) > -1) {
					return true;
				}
			}
			return false;
		}, */
		loadTableOfContents = function () {
			var slideObject = document.getElementById("slide"),
				slideTitle = document.getElementById("slideTitle"),
				tableOfContents = document.createElement("div"),
				list,
				listItem,
				anchor,
				i,
				section,
				slide;

			tableOfContents.id = "tableOfContents";

			for (i in myOutline) {
				if (myOutline.hasOwnProperty(i)) {
					slide = myOutline[i];
					if (slide.sectionTitle) {
						if (typeof list === "object") {
							tableOfContents.appendChild(list);
							list = document.createElement("ol");
						} else {
							list = document.createElement("ol");
						}
						section = document.createElement("h2");
						section.innerHTML = slide.sectionTitle;
						tableOfContents.appendChild(section);
					} else {
						listItem = document.createElement("li");
						anchor = document.createElement("a");
						anchor.className = "outlineLink";
						anchor.href = slide.title.toHash();
						anchor.innerHTML = slide.title;
						
						listItem.appendChild(anchor);
						list.appendChild(listItem);
					}
				}
			}
			
			tableOfContents.appendChild(list);

			slideTitle.innerHTML = "Table of Contents";
			slideObject.appendChild(tableOfContents);
		},
		
		setInitialPage = function () {
			var hash = document.location.hash,
				initialSlide = myOutline[0],
				i = 0,
				slide;

			if (hash) {
				if (hash === '#table-of-contents') {
					loadTableOfContents();
					return false;
				}

				for (i; i < myOutline.length; i + 1) {
					slide = myOutline[i];
					if (slide.title.toHash() === hash) {
						initialSlide = slide;
						currentSlide = i;
						break;
					}
				}
			} 

			requestContent(initialSlide.url, function () {
				setTitle();
			});
			setNavLinks();
		},
		init = function (outline, previousId, nextId) {
			if (typeof outline !== 'object' || typeof previousId !== 'string' || typeof nextId !== 'string') {
				throw {
					name: 'TypeError',
					message: 'Initializing a presentation requires three values: outline, previousId and nextID'
				};
			}
			myOutline = outline;
			previousButton = document.getElementById(previousId);
			nextButton = document.getElementById(nextId);

			previousButton.addEventListener('click', loadContent, false);
			nextButton.addEventListener('click', loadContent, false);

			setInitialPage();
			return true;
		};
	
	return {
		init: init
	};
}());