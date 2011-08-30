// Sets up Next and Back links
function setNavLinks() {
    with ($('#nav a.previous')) {
        if (currentSlide > 0) 
            show()
                .attr('href', outline[currentSlide - 1].url)
                .attr('title', outline[currentSlide - 1].title);
        else hide();
    }
    with ($('#nav a.next')) {
        if (currentSlide < (totalSlides - 1)) 
            show()
                .attr('href', outline[currentSlide + 1].url)
                .attr('title', outline[currentSlide + 1].title);    
        else hide();
    }
}

// Sets the title of the slide 
function setTitle() {
    var slideTitle = $('#slideTitle');
    var title = slideTitle.length > 0 ? slideTitle.val() : '';
    
    if (title == '') {
        $('#slide .title h1').hide();   
    } else {
        $('#slide .title h1').show().html(title);
    }
}

// Sets content of the slide
function setContent(url, callback) {
    $('#slide .content').load(url, callback);
}

// Sets title and hash on page
function setPageInformation(slide) {
    document.location.hash = slide.title.toHash();
    $('title').text(slide.title);
}

// Loads initial page
function setInitialPage(slide) {
    var hash = document.location.hash;
    var initialSlide = outline[0];
    
    if (hash) {
        if (hash == '#table-of-contents') {
            loadTableOfContents();
            return false;
        }
        
        for (var i = 0; i < outline.length; i++) {
            var slide = outline[i];
            if (slide.title.toHash() == hash) {
                initialSlide = slide;
                currentSlide = i;
                break;
            }
        }
    } 
    
    setContent(initialSlide.url, function() { prettyPrint(); setTitle(); });
    setNavLinks();
}

function loadContent() {
    var link = $(this);
    var callback = function () {
        if (link.hasClass('previous')) {
            currentSlide--;
        } else {
            currentSlide++;
        }

        var slide = outline[currentSlide];
        setPageInformation(slide);
        prettyPrint();
        setNavLinks();
        setTitle();
        return false;
    };

    setContent(link.attr('href'), callback);
    return false;
}

function goToSlide() {
    document.location.hash = $(this).attr('href');
    document.location.reload();
    return false;
}

// Covert title to hash
String.prototype.toHash = function() {
    return '#' + this
        .replace(/,|\?/g, '')
        .replace(/\s|\//g, '-')
        .toLowerCase();
}

// Adds a new src to a target
function swapSrc(target, src) {
    $(target).attr('src', src);
}

function loadTableOfContents() {
    var beginning = true;
    var tableOfContents = $('<div id="tableOfContents"></div>');
    var html = '';

    for (var i in outline) {
        var slide = outline[i];
        if (slide.sectionTitle) {
            html += (beginning ? '' : '</ol>')
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
    
    tableOfContents.html(html);
    $('#slide .content').empty().append(tableOfContents);
    $('#slide .title h1').show().html('Table of Contents');
}

function keyDown(e) {
    if (e.keyCode == 37) {
        $('.previous').click();
    } else if (e.keyCode == 39) {
        $('.next').click();
    }
}

// Ready function
$(function () {
    setInitialPage();
    $('.contentLoader').live('click', loadContent);
    $('.outlineLink').live('click', goToSlide);
    document.addEventListener('keydown', keyDown, false);
});


