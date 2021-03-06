var responseData; //this would be array
var info = {}; //contains pageno, Source , writer 
var query; //shabad query
var pageType; //whether shabad,query or page
var shabadID; //shabad being displayed if any
var pageID; // page being displayed
var lineId; //lineId to be scrolled to 

var baniLanguage = Cookies.get('baniLanguage');
if (baniLanguage != "gurmukhi") {
    baniLanguage = "devnagari";
}

var translationLanguage = Cookies.get("translationLanguage");

if (translationLanguage != "punjabi") {
    translationLanguage = "english";
}

//for top navigation
/* Set the width of the side navigation to 250px and the left margin of the page content to 250px and add a black background color to body */
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    // document.getElementById("main").style.marginLeft = "250px";
    document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
}

/* Set the width of the side navigation to 0 and the left margin of the page content to 0, and the background color of body to white */
function closeNav() {
    if (document.getElementById("mySidenav").style.width == "250px") {
        applySettings();
    }
    document.getElementById("mySidenav2").style.width = "0";
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
    document.body.style.backgroundColor = "white";
}

function showSettings() {
    document.getElementById("mySidenav").style.width = "250px";
    //   document.getElementById("main").style.marginLeft = "250px";
    document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
    $('#' + baniLanguage).prop("checked", true); //select radio buttons as per cookies
    $('#' + translationLanguage).prop("checked", true);
}

function applySettings() {
    baniLanguage = $("input[name='bani-language']:checked").val();
    translationLanguage = $("input[name='translation']:checked").val();
    Cookies.set("baniLanguage", baniLanguage);
    Cookies.set("translationLanguage", translationLanguage);
    if (pageType) {
        pageType();
    }
}

function showSearchBar() {
    document.getElementById("mySidenav2").style.width = "260px";
    // document.getElementById("main").style.marginLeft = "250px";
    document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
}


//method called from UI
function refresh() {
    $("input:checkbox").prop('checked', false); //uncheck all checkboxes   
}

//method called from UI
function loadPageButtonListener() {
    pageType = loadPageAng;
    pageID = $("#pageID").val();
    history.pushState(null, null, "index.html?page=" + pageID);
    loadPageAng();
    closeNav();
}

//method called from UI
function searchQueryButtonListener() {
    pageType = loadQueryResult;
    query = $("#query").val();
    history.pushState(null, null, "index.html?query=" + query);
    loadQueryResult();
    closeNav();
}

//method caled from UI arrows and query Result
function loadPage(id, line) {
    pageType = loadPageAng;
    pageID = id;
    lineId = line;
    if (lineId) {
        history.pushState(null, null, "index.html?page=" + pageID + "&line=" + lineId);
    } else {
        history.pushState(null, null, "index.html?page=" + pageID);
    }
    loadPageAng();
}

//method caled from UI
function shabadLinkListener(id, line) {
    pageType = loadShabad;
    shabadID = id;
    lineId = line;
    if (lineId) {
        history.pushState(null, null, "index.html?shabad=" + shabadID + "&line=" + lineId);
    } else {
        history.pushState(null, null, "index.html?shabad=" + shabadID);
    }
    loadShabad();
}

window.addEventListener("popstate", popState);

$(window).on("load", popState);

function popState() {
    pageID = getURLParameter("page");
    query = getURLParameter("query");
    lineId = getURLParameter("line");

    if (query != null) {
        // $("#query").val(query);
        pageType = loadQueryResult;
        loadQueryResult();
    } else {
        if (pageID != null) {
            //   $("#page").val(pageID);
            pageType = loadPageAng;
            loadPageAng();
        } else {
            shabadID = getURLParameter("shabad");
            if (shabadID != null) {
                pageType = loadShabad;
                loadShabad();
            }
        }
    }
}


function getURLParameter(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
}



//get data for sending on whatsApp
function shareBani() {
    var firstSelectedLine = $($('input:checkbox').filter(':checked')[0]).val();
    if (!firstSelectedLine) {
        alert("first select some bani lines using checkbox");
        return;
    }
    if (pageID != null) {
        info.pageno = pageID;
        info.source = "Guru Granth Sahib";
        info.writer = responseData[firstSelectedLine].line.writer.english;
    }

    var data = info.writer + " page " + info.pageno + " " + info.source;
    var baniText = '';
    var baniTranslation = '';
    if (baniLanguage == "gurmukhi") {
        baniText = "responseData[lineNo].line.gurmukhi.unicode";
    } else {
        baniText = "responseData[lineNo].line.transliteration.devanagari.text";
    }
    if (translationLanguage == "english") {
        baniTranslation = "responseData[lineNo].line.translation.english.default";
    } else {
        baniTranslation = "responseData[lineNo].line.translation.punjabi.default.unicode";
    }

    $('input:checkbox').filter(':checked').map(function () {
        var lineNo = $(this).val();
        data += '\n\r*' + eval(baniText) + '*\n\r';
        data += eval(baniTranslation) + '\n';
        console.log(eval(baniText));
    });

    if(lineId){
      data +=  location.href.replace(lineId,responseData[firstSelectedLine].line.id);  
    }else{
    data += location.href+ '&line=' + responseData[firstSelectedLine].line.id;
    }
    window.open('whatsapp://send?text=' + encodeURI(data));
}

function drawContent(header, content, source) {
    $("#demo").html(header); //add header
    var baniText = '';
    var baniTranslation = '';
    if (baniLanguage == "gurmukhi") {
        baniText = "line.line.gurmukhi.unicode";
    } else {
        baniText = "line.line.transliteration.devanagari.text";
    }
    if (translationLanguage == "english") {
        baniTranslation = "line.line.translation.english.default";
    } else {
        if (translationLanguage == "punjabi")
            baniTranslation = "line.line.translation.punjabi.default.unicode";
    }
    content.map((line, index) => {
        $("#demo").html($("#demo").html() + "<br/> <span class='bani' id='" + line.line.id +
            "'><label> <input type='checkbox' value=" + index + '><b>' + eval(baniText) +
            '</b> </label> <br/> </span>' +
            eval(baniTranslation) + "<br/>");
    });

    //  $("#demo").html($("#demo").html() + header); //add footer
    var element = document.getElementById(lineId); //find anchor
    if (element != null) {
        element.scrollIntoView(); //scoll to anchor if any
        element.style.backgroundColor = 'Highlight';
        element.style.color = 'HighlightText';
    }
}

function getPageLink(id, classname) {
    return '<a href="javascript:void(0);" onclick="loadPage(' + id + ')"> <i class="' + classname + '" style="font-size:24px"></i> </a>';
}

function loadPageAng() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var response = JSON.parse(this.responseText);
            responseData = response.page;
            console.log(response.pageno);
            var previous = pageID - 1
            var next = parseInt(pageID) + 1;
            var header = "<div id='pageheader'><p/>" + getPageLink(previous, "fa fa-arrow-left") + "Page No = " + response.pageno + getPageLink(next, "fa fa-arrow-right") + "<br/></div>";
            drawContent(header, response.page);
        }
    };
    xhttp.open("GET", "https://api.gurbaninow.com/v2/ang/" + pageID, true);
    xhttp.send();
}

function loadShabad() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var response = JSON.parse(this.responseText);
            responseData = response.shabad;
            info.source = response.shabadinfo.source.english;
            info.writer = response.shabadinfo.writer.english;
            info.pageno = response.shabadinfo.pageno;

            var shabadinfo = info.writer + " <b> <a href='javascript:void(0);'+ onclick='loadPage("+info.pageno+")'>page " + info.pageno +'</a> </b> ';
            console.log(response.shabadinfo.shabadid);
            var previous = shabadID - 1;
            var next = parseInt(shabadID) + 1;
            var header = "<div id='pageheader'><p/><div id='bani-source'> <b style='margin-left: 40px;'>" + info.source + "</b><br/></div><a href='javascript:void(0);'  onclick='shabadLinkListener("+previous+")'><i class='fa fa-arrow-left' style='font-size:24px'></i>  </a> " + shabadinfo + "  <a hhref='javascript:void(0);'  onclick='shabadLinkListener("+ next +")'><i class='fa fa-arrow-right' style='font-size:24px'></i></a><br/></div>";

            drawContent(header, response.shabad);
        }
    };
    xhttp.open("GET", "https://api.gurbaninow.com/v2/shabad/" + shabadID, true);
    xhttp.send();
}

function loadQueryResult() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var response = JSON.parse(this.responseText);
            console.log(response.count);
            console.log(response.shabads);
            $("#demo").html("<p/>");
            $("#demo").html($("#demo").html() + "Result Count = " + response.count);
            $("#demo").html($("#demo").html() + "<br/>");

            var baniText;
            if (baniLanguage == "gurmukhi") {
                baniText = "x.shabad.gurmukhi.unicode";
            } else {
                baniText = "x.shabad.transliteration.devanagari.text";
            }
            response.shabads.map((x, index) => {
                console.log(x);
                $("#demo").html($("#demo").html() + "<br/> <b> <a href='javascript:void(0);' onclick='shabadLinkListener("+x.shabad.shabadid+','+x.shabad.id+")'>" + eval(baniText) + '</a> </b><br/>' + x.shabad.source.english +"   <b> <a href='javascript:void(0);' onclick='loadPage("+x.shabad.pageno+','+x.shabad.id +")'>" + x.shabad.pageno +'</a><b>   ' + x.shabad.writer.english + "<br/>");
            });
        }
    };
    xhttp.open("GET", "https://api.gurbaninow.com/v2/search/" + query, true);
    xhttp.send();
}

function getDataFromAPI(url, callback) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            response = JSON.parse(this.responseText);
            callback(response);

        }
    }
    xhttp.open("GET", url, true);
    xhttp.send();
}


var prevScrollpos = window.pageYOffset;
window.onscroll = function () {
    // closeNav();
    var currentScrollPos = window.pageYOffset;
    if (prevScrollpos > currentScrollPos) {
        document.getElementById("icon-bar").style.top = "0";
    } else {
        document.getElementById("icon-bar").style.top = "-40px";
    }
    prevScrollpos = currentScrollPos;
}