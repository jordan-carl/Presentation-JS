(function () {
	"use strict";
	String.prototype.toHash = function () {
		return '#' + this.replace(/,|\?/g, '').replace(/\s|\//g, '-').toLowerCase();
	};
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
					if (alpha === targetAlpha) {
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
		goToSlide = function () {
			var link = this;
			window.console.log("Link href: " + link.href + "\nLink href Hash: " + link.hash);
			document.location.hash = link.hash;
			document.location.reload();
		},
		setNavLinks = function (flag) {
			if (flag) {
				if (currentSlide > 0) {
					previousButton.style.visibility = "visible";
					fadeElement(previousButton, "In");
				}
				if (currentSlide < (totalSlides - 1)) {
					nextButton.style.visibility = "visible";
					fadeElement(nextButton, "In");
				}

				previousButton.href = (currentSlide > 0) ? myOutline[currentSlide - 1].title.toHash() : '#';
				nextButton.href = (currentSlide < (totalSlides - 1)) ? myOutline[currentSlide + 1].title.toHash() : '#';
			}
		},
		setContent = function (html, callback) {
			var slide = document.getElementById("slide");
			slide.innerHTML = html;
			
			if (typeof callback === "function") {
				callback();
			}
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
		attachEventListener = function (elem, type, fn) {
			if (elem.addEventListener) {
				elem.addEventListener(type, fn, false);
				return true;
			} else if (elem.attachEvent) {
				elem['e' + type + fn] = fn;
				elem[type + fn] = function () { elem['e' + type + fn](window.event); };
				return elem.attachEvent('on' + type, elem[type + fn]);
			} else {
				elem['on' + type] = fn;
				return true;
			}
		},
		createListItem = function (item) {
			var result,
				anchor = document.createElement("a");
			anchor.className = "outlineLink";
			anchor.href = item.title.toHash();
			anchor.innerHTML = item.title;
			attachEventListener(anchor, "click", goToSlide);
			
			if (item.sectionTitle) {
				result = document.createElement("h2");
				result.appendChild(anchor);
			}
			
			return (typeof result === "object") ? result : anchor;
		},
		loadTableOfContents = function () {
			var slideObject = document.getElementById("slide"),
				slideTitle = document.getElementsByTagName("title")[0],
				contentDiv = document.createElement("div"),
				tableOfContents = document.createElement("div"),
				header = document.createElement("h1"),
				section = document.createElement("ol"),
				slide,
				list,
				listItem,
				i;

			tableOfContents.id = "tableOfContents";
			contentDiv.id = "content";
			contentDiv.className = "content";
			currentSlide = -1;
			
			header.innerHTML = "Table of Contents";
			
			contentDiv.appendChild(header);

			for (i in myOutline) {
				if (myOutline.hasOwnProperty(i)) {
					slide = myOutline[i];
					if (slide.sectionTitle) {
						if (typeof list === "object") {
							section.appendChild(list);
						}
						section.appendChild(createListItem(slide));
						list = document.createElement("ol");
					} else {
						listItem = document.createElement("li");
						
						listItem.appendChild(createListItem(slide));
						list.appendChild(listItem);
					}
				}
			}
			
			section.appendChild(list);
			tableOfContents.appendChild(section);

			slideTitle.innerHTML = "Table of Contents";
			contentDiv.appendChild(tableOfContents);
			slideObject.appendChild(contentDiv);
			
			setNavLinks(false);
		},
		keyPress = function (e) {
		    if (e.keyCode === 37 && (currentSlide > 0)) {
				window.console.log("Button Pressed: " + previousButton);
				goToSlide.apply(previousButton);
		    } else if (e.keyCode === 39 && (currentSlide < (totalSlides - 1))) {
				window.console.log("Button Pressed: " + nextButton);
				goToSlide.apply(nextButton);
			}
		},
		setPage = function () {
			var hash = document.location.hash,
				initialSlide = myOutline[0],
				i = 0,
				l = myOutline.length,
				slide;

			if (hash) {
				if (hash === '#table-of-contents') {
					loadTableOfContents();
					return false;
				}

				for (i; i < l; i = i + 1) {
					slide = myOutline[i];
					if (slide.title.toHash() === hash) {
						initialSlide = slide;
						currentSlide = i;
						break;
					}
				}
			} 

			attachEventListener(document.getElementById('tocLink'), 'click', goToSlide);
			attachEventListener(document, 'keydown', keyPress);

			requestContent(initialSlide.url, function () {
				setPageTitle(initialSlide);
				setNavLinks(true);
			});
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
			totalSlides = myOutline.length;
			
			attachEventListener(previousButton, 'click', goToSlide);
			attachEventListener(nextButton, 'click', goToSlide);
			
			setPage();
			return true;
		};
	
	return {
		init: init
	};
}());