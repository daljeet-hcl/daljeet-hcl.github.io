  var responseData; //this would be array
  var info = {}; //contains pageno, Source , writer 
  var query; //shabad query
  var pageType; //whether shabad,query or page
  var shabadID; //shabad being displayed if any
  var pageID; // page being displayed

  var baniLanguage = Cookies.get('baniLanguage');
  if (baniLanguage == null) {
      baniLanguage = "devnagari";
  }

  var translationLanguage = Cookies.get("translationLanguage");
  if (translationLanguage == null) {
      translationLanguage = "english";
  }

  //for top navigation
  function showHideSettings() {
      document.getElementById("searchBar").style.display = "none"; //hide search bar 
      var x = document.getElementById("myLinks");
      if (x.style.display === "block") {
          hideSettings(x);
      } else {
          window.scrollTo(0,0);
          x.style.display = "block";
          $('#' + baniLanguage).prop("checked", true); //select radio buttons as per cookies
          $('#' + translationLanguage).prop("checked", true);
      }
  }

  function hideSettings(x) {
      if (x.style.display === "block") {
          x.style.display = "none";
          baniLanguage = $("input[name='bani-language']:checked").val();
          translationLanguage = $("input[name='translation']:checked").val();
          Cookies.set("baniLanguage", baniLanguage);
          Cookies.set("translationLanguage",translationLanguage);
          if (pageType) {
              pageType();
          }
      }
  }

  function showHideSearchBar() {
      document.getElementById("myLinks").style.display = "none";
      var x = document.getElementById("searchBar");
      if (x.style.display === "block") {
          x.style.display = "none";
      } else {
          window.scrollTo(0,0);
          x.style.display = "block";
      }
  }

  function hideMenu() {
      hideSettings(document.getElementById("myLinks"));
      document.getElementById("searchBar").style.display = "none";
  }

  $(window).on("load", function () {
      pageID = getURLParameter("page");
      query = getURLParameter("query");
      if (query != null) {
          $("#query").val(query);
          pageType = loadQueryResult;
          loadQueryResult();
      } else {
          if (pageID != null) {
              $("#page").val(pageID);
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
  });

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
  function getData() {
      var firstSelectedLine = $($('input:checkbox').filter(':checked')[0]).val();
      if (pageID != null) {
          info.pageno = pageID;
          info.source = "Guru Granth Sahib";
          info.writer = responseData[firstSelectedLine].line.writer.english;
      }

      var url = window.location.href;
      if (url.includes('#')) {
          url = url.slice(0, url.indexOf('#')); //remove # from url
      }
      info.link = url + '#' + responseData[firstSelectedLine].line.id;
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

      data += info.link;
      return encodeURI(data);
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

      $("#demo").html($("#demo").html() + header); //add footer
      var element = document.getElementById(location.hash.substr(1)); //find anchor
      if (element != null) {
          element.scrollIntoView(); //scoll to anchor if any
          element.style.backgroundColor = 'Highlight';
          element.style.color = 'HighlightText';
      } else {
          //  document.getElementById(content[0].line.id).scrollIntoView(); //scrol into first element
      }

      var checkboxes = $("input[type='checkbox']");
      //disable whats app button if no checkbox selected
      checkboxes.click(function () {
          $('#whatsapp').attr("disabled", !checkboxes.is(":checked"));
      });
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
              var header = "<p/><a href='?page=" + previous +
                  "' class='btn btn-default btn-sm'> <span class='glyphicon glyphicon-circle-arrow-left'> </span>  </a>  Page No = " +
                  response.pageno + "  <a href='?page=" + next +
                  "' class='btn btn-default btn-sm'> <span class='glyphicon glyphicon-circle-arrow-right'></span> </a><br/>"
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

              var shabadinfo = info.writer + " <b> <a href='index.html?page=" + info.pageno + "'>page " + info.pageno +
                  '</a> ' + '</b>  ';
              console.log(response.shabadinfo.shabadid);
              var previous = shabadID - 1;
              var next = parseInt(shabadID) + 1;
              var header = "<p/><div id='bani-source'> <b style='margin-left: 40px;'>" + info.source +
                  "</b><br/></div><a href='?shabad=" + previous +
                  "' class='btn btn-default btn-sm'> <span class='glyphicon glyphicon-circle-arrow-left'> </span>  </a> " +
                  shabadinfo + "  <a href='?shabad=" + next +
                  "' class='btn btn-default btn-sm'> <span class='glyphicon glyphicon-circle-arrow-right'></span> </a><br/>"

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
                  $("#demo").html($("#demo").html() + "<br/> <b> <a href='?shabad=" + x.shabad.shabadid + "#" + x.shabad.id +
                      "'>" + eval(baniText) + '</a> </b><br/>' + x.shabad.source.english +
                      "   <b> <a href='?page=" + x.shabad.pageno + "#" + x.shabad.id + "'>" + x.shabad.pageno +
                      '</a><b>   ' + x.shabad.writer.english + "<br/>");
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

  window.onscroll = function () {
    hideMenu();
  }
  
/*
  var prevScrollpos = window.pageYOffset;
  window.onscroll = function () {
      hideMenu();
      var currentScrollPos = window.pageYOffset;
      if (prevScrollpos > currentScrollPos) {
          document.getElementById("icon-bar").style.top = "0";
      } else {
          document.getElementById("icon-bar").style.top = "-40px";
      }
      prevScrollpos = currentScrollPos;
  }
  */