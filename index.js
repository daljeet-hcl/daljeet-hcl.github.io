var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return JSON.parse(xmlHttp.responseText);
}

var response=httpGet("https://api.gurbaninow.com/v2/ang/129")
console.log(response.pageno);
//console.log(response.page);
response.page.map((line)=>{
    console.log(line.line.transliteration.devanagari.text);
    console.log(line.line.translation.english.default);
    //console.log(line.devanagari.text);
})
