var otsikkoelementit, korvattavat;
var asetukset = {
	"paivitysaika": "-",
	"indikaattori": 0,
	"tyylitys": 0,
	"eiherkille": 0,
	"aliarvio": 0,
	"persut": 0,
	"neuvova": 0,
	"kytke": 1,
	"otsikkoelementit_url": "http://www.internjet.cc/klikinsaastaja/otsikkoelementit.json",
	"korvattavat_url": "http://www.internjet.cc/klikinsaastaja/korvattavat.json",
	"uutistyylit_url": "http://www.internjet.cc/klikinsaastaja/uutistyylit.json"
};

chrome.browserAction.setBadgeBackgroundColor({ color: "#444444"});

chrome.runtime.onInstalled.addListener(function() {
	// TALLENNA OLETUSASETUKSET
	chrome.storage.local.set({ 'asetukset': JSON.stringify(asetukset) });
	lataaFiltteritVerkosta(asetukset);
});

// POISTAA TEKSTISTÄ RIVINVAIHDOT JA TABULAATTORIT
function unMultiline(str) {
	return str.replace(/(\r\n|\n|\r|\t)/gm,"")
}

// JSON-TIEDOSTON HAKUFUNKTIO
function haeJSONVerkosta(URL) {
	json_string = $.ajax({
		url: URL,
		async: false,
		success: function(data, textStatus, jqXHR) {
			console.log("Ladattu " + URL + " onnistuneesti...");
        },
        error: function(jqXHR, textStatus, errorThrown) {
        	alert("VIRHE LADATESSA: " + URL + "\n" + errorThrown + jqXHR);
			console.log(errorThrown);
			console.log(jqXHR);
        }
	}).responseText;

	return json_string;
}

// ASETUSTEN VERKKOLATAUSFUNKTIO
function lataaFiltteritVerkosta(asetukset) {
	$.ajaxSetup({cache: false});

	var json_string;
	var paivitysaika = new Date().toJSON().slice(0,19).replace("T", " ");

	asetukset["paivitysaika"] = paivitysaika;
	
	console.log("====================================\nLADATAAN ASETUKSET VERKOSTA!!!!\n====================================");

	// KORVAUSASETUKSET
	korvattavat = JSON.parse(unMultiline(haeJSONVerkosta(asetukset.korvattavat_url)));
	otsikkoelementit = JSON.parse(unMultiline(haeJSONVerkosta(asetukset.otsikkoelementit_url)));
	uutistyylit = JSON.parse(unMultiline(haeJSONVerkosta(asetukset.uutistyylit_url)));
	
	chrome.storage.local.set({'korvattavat': JSON.stringify(korvattavat)});
	chrome.storage.local.set({'otsikkoelementit': JSON.stringify(otsikkoelementit)});
	chrome.storage.local.set({'uutistyylit': JSON.stringify(uutistyylit)});
	chrome.storage.local.set({'asetukset': JSON.stringify(asetukset)});
	
	$("#paivitetty_date").text(asetukset.paivitysaika);
}

// KUUNTELIJA, JOTTA POPUP.JS VOI PYYTÄÄ MM. ASETUKSIIN TALLENNETTUJA TIETOJA LENNOSTA
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {		
		if (request.count) {
			chrome.browserAction.setBadgeText({text: String(request.count), tabId: request.tabid});
		}

		if(request.tabid) {
			sendResponse({ tabId: sender.tab.id });
		}
		
		if (request.elementit) {
			chrome.storage.local.get(null, function(result){
				asetukset = result.asetukset;
				otsikkoelementit = result.otsikkoelementit;
				uutistyylit = result.uutistyylit;
				korvattavat = result.korvattavat;

				sendResponse({ 
					"otsikkoelementit": otsikkoelementit, 
					"korvattavat": korvattavat, 
					"uutistyylit": uutistyylit, 
					"asetukset": asetukset 
				});
			});
		}
		
		if (request.paivita_verkosta) {
			chrome.storage.local.get('asetukset', function(result){
				console.log("Päivitetään verkosta. Asetuksina so far: " + result.asetukset);
				asetukset = JSON.parse(result.asetukset);
				lataaFiltteritVerkosta(asetukset);
		
				console.log("Indikaattori: " + asetukset.indikaattori);
				sendResponse( {"valmis": true, "asetukset": asetukset} );
			});
		}

		return true;
});

