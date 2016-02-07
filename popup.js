// TRIGGERÖI CHECKBOX-ARVOJEN MUUTOKSET JA TALLENNA TIEDOT LOCALSTORAGEEN
function valvoCheckboxeja(checkboxinid, asetukset, asetusnimi) {
	$("#" + checkboxinid).change(function() {
		if(this.checked) { 
			asetukset[asetusnimi] = 1; 
		} else { 
			asetukset[asetusnimi] = 0; 
		}
				
		chrome.storage.local.set({'asetukset': JSON.stringify(asetukset)});
		console.log("tallennettiin asetukset: " + JSON.stringify(asetukset));
	});	
}

function paivitaPopupsivu(asetukset) {
	$("#paivitetty_date").text(asetukset.paivitysaika).fadeOut(200).fadeIn(200);
	$("#asetus_indikaattori").prop('checked', asetukset.indikaattori);
	$("#asetus_tyylitys").prop('checked', asetukset.tyylitys);
	$("#asetus_eiherkille").prop('checked', asetukset.eiherkille);
	$("#asetus_aliarvio").prop('checked', asetukset.aliarvio);
	$("#asetus_persut").prop('checked', asetukset.persut);
	$("#asetus_neuvova").prop('checked', asetukset.neuvova);
	$("#asetus_kytke").prop('checked', asetukset.kytke);

	// LISÄÄ FILTTERIURLIT NÄKYVILLE
	$("#filtteriosoite").html(asetukset.otsikkoelementit_url + "<br />" + asetukset.korvattavat_url + "<br />" + asetukset.uutistyylit_url);
}

// HAE TALLENNETUT ASETUKSET
chrome.storage.local.get("asetukset", function(result) {
	asetukset = JSON.parse(result.asetukset);

	// TRIGGERÖI CHECKBOXIEN MUUTOKSET
	valvoCheckboxeja("asetus_indikaattori", asetukset, "indikaattori");
	valvoCheckboxeja("asetus_tyylitys", asetukset, "tyylitys");
	valvoCheckboxeja("asetus_eiherkille", asetukset, "eiherkille");
	valvoCheckboxeja("asetus_aliarvio", asetukset, "aliarvio");
	valvoCheckboxeja("asetus_persut", asetukset, "persut");
	valvoCheckboxeja("asetus_neuvova", asetukset, "neuvova");
	valvoCheckboxeja("asetus_kytke", asetukset, "kytke");

	paivitaPopupsivu(asetukset);

	// TRIGGERÖI PÄIVITYSNAPIN PAINALLUS
	$("#paivita").click(function() {
		chrome.runtime.sendMessage({ paivita_verkosta: "true" }, function(response) {
			if(response.valmis) {
				asetukset = response.asetukset;
				console.log("asetukset: " + JSON.stringify(asetukset));
				paivitaPopupsivu(asetukset);
			}
		});
	});	
});
