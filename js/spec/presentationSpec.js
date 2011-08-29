describe("String Prototype Enhancements", function () {
	var string;
	
	beforeEach(function () {
		string = "Some String To Convert";
	})
	it("Should allow a string conversion to a hash", function () {
		expect(string.toHash()).toBeTruthy();
	})
	
	it("Should be able to convert a string to a hash", function () {
		expect(string.toHash()).toEqual("#some-string-to-convert");
	});
});

describe("Presentation", function () {
	it("Should have a presentation object", function () {
		expect(presentation).toBeTruthy();
	});
	it("Should see presentation.init as a function", function () {
		expect((typeof presentation.init)).toEqual("function");
	});
	
	describe("Initializing the Presentation", function () {
		var body,
			previousButton,
			nextButton,
			slide,
			slideTitle,
			outline;
			
		beforeEach(function () {
			document.location.hash = "#table-of-contents";
			body = document.getElementsByTagName("body")[0];
			previousButton = document.createElement("a");
			nextButton = document.createElement("a");
			slide = document.createElement("div");
			slideTitle = document.createElement("h1");
			outline = [
				{'sectionTitle': 'Samples'},
				{'url': '/sample-page-1.html', 'title': 'Sample Page 1'},
				{'url': '/sample-page-2.html', 'title': 'Sample Page 2'},
				{'url': '/sample-page-3.html', 'title': 'Sample Page 3'},
				{'url': '/sample-page-4.html', 'title': 'Sample Page 4'},
				{'sectionTitle': 'Second Section'},
				{'url': '/sample-page-1.html', 'title': 'Sample Page 5'},
				{'url': '/sample-page-2.html', 'title': 'Sample Page 6'},
				{'url': '/sample-page-3.html', 'title': 'Sample Page 7'},
				{'url': '/sample-page-4.html', 'title': 'Sample Page 8'}
			];

			previousButton.id = "previous";
			nextButton.id = "next";
			slide.id = "slide";
			slideTitle.id = "slideTitle";
			
			previousButton.innerHTML = "Previous";
			nextButton.innerHTML = "Next";
			slideTitle.innerHTML = "Slide Title";
			slide.appendChild(slideTitle);
			
			body.appendChild(previousButton);
			body.appendChild(nextButton);
			body.appendChild(slide);
		});

		it("Should initialize and show the table of contents", function () {
			expect(presentation.init(outline, "previous", "next")).toBe(true);
		});
	});

});