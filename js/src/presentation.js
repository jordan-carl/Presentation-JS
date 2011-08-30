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
		tocLink,
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
			
			window.console.log("Current Slide: " + currentSlide + "\nTotal Slides: " + totalSlides);
			previousButton.href = (currentSlide > 0) ? myOutline[currentSlide - 1].title.toHash() : '#';
			nextButton.href = (currentSlide < (totalSlides - 1)) ? myOutline[currentSlide + 1].title.toHash() : '#';
		},
		// Sets the title of the slide 
		setTitle = function () {
			// var slideTitle = document.getElementById('slideTitle'),
			// 	title = slideTitle.innerHTML.length > 0 ? slideTitle.innerHTML : '';
			// 
			// if (!!title) {
			// 	// $('#slide .title h1').hide();
			// 	fadeElement(slideTitle, "Out");
			// } else {
			// 	// $('#slide .title h1').show().html(title);
			// 	fadeElement(slideTitle, "In");
			// }
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
			document.location.hash = slide.title.toHash();
		    document.getElementsByTagName("title")[0].innerHTML = slide.title;
		},
		loadContent = function () {
			var slide = document.getElementById("slide"),
				link = this,
				callback = function () {
					var slide;
					if (hasClass(link, "previous")) {
						currentSlide -= 1;
					} else {
						currentSlide += 1;
					}
					slide = myOutline[currentSlide];
					setPageTitle(slide);
					setNavLinks(false);
					setTitle();
					return false;
				};

			fadeElement(slide, "Out");
			requestContent(link.href, callback);
			return false;
		},
		hasClass = function (elem, selector) {
			var className = " " + selector + " ",
				rclass = /[\n\t\r]/g,
				i = 0,
				l = elem.length;
			
			for (i; i < l; i + 1) {
				if (elem[i].nodeType === 1 && (" " + elem[i].className + " ").replace(rclass, " ").indexOf(className) > -1) {
					return true;
				}
			}
			return false;
		}, 
		loadTableOfContents = function () {
			var slideObject = document.getElementById("slide"),
				slideTitle = document.getElementsByTagName("title")[0],
				tableOfContents = document.createElement("div"),
				list,
				listItem,
				anchor,
				i,
				section,
				slide;

			tableOfContents.id = "tableOfContents";
			currentSlide = -1;

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
						anchor = document.createElement("a");
						anchor.className = "outlineLink";
						anchor.href = slide.title.toHash();
						anchor.innerHTML = slide.title;
						section.appendChild(anchor);
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
			
			setNavLinks(true);
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
				setPageTitle(initialSlide);
			});
			setNavLinks(false);
		},
		goToSlide = function () {
			var link = this;
			window.console.log("Link href: " + link.href + "\nLink href Hash: " + link.hash);
			document.location.hash = link.hash;
			document.location.reload();
		},
		init = function (outline, previousId, nextId, toc) {
			if (typeof outline !== 'object' || typeof previousId !== 'string' || typeof nextId !== 'string' || typeof toc !== 'string') {
				throw {
					name: 'TypeError',
					message: 'Initializing a presentation requires three values: outline, previousId and nextID'
				};
			}
			myOutline = outline;
			previousButton = document.getElementById(previousId);
			nextButton = document.getElementById(nextId);
			tocLink = document.getElementById(toc);
			totalSlides = myOutline.length;

			previousButton.addEventListener('click', goToSlide, false);
			nextButton.addEventListener('click', goToSlide, false);
			tocLink.addEventListener('click', goToSlide, false);

			setInitialPage();
			return true;
		};
	
	return {
		init: init
	};
}());