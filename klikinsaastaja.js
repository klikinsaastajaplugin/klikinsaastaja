var otsikkoelementit_jquery;
var muutosten_maara = 0;
var kerta = 0;
var tabId;

function nappi(teksti, title) {
	var nappi = $("<button>!</button>");

	nappi.css("color", "#e2eaf3");
	nappi.css("background-color", "#4679BD");
	nappi.css("border", "2px solid #cfdcec");
	nappi.css("border-radius", "50%");
	nappi.css("box-shadow", "0 0 3px gray");
	nappi.css("margin-left", "7px");
	nappi.css("font-size", "8px");	
	nappi.css("font-weight", "bold");
	nappi.css("display", "inline-block");

	nappi.attr("title", title);

	return nappi;
}

function luoLiipasimet(otsikkoelementit, korvattavat, uutistyylit, asetukset) {	
	otsikkoelementit = JSON.parse(otsikkoelementit).otsikkoelementit;
	korvattavat = JSON.parse(korvattavat);
	asetukset = JSON.parse(asetukset);
	uutistyylit = JSON.parse(uutistyylit);
	
	if(!asetukset["kytke"]) {
		return;
	}
	
	otsikkoelementit_jquery = otsikkoelementit.join(",");

	// LUO LIIPAISIN SILLE, KUN DOM-ELEMENTTI OTETAAN VASTAAN (ENNEN KUIN DOM ON KONSTRUOITU)
	$(document).bind("DOMNodeInserted", function(event) {
		$(event.target).parent().find(otsikkoelementit_jquery).each(
			function (i, v) {
				var elementti = $(this);
				var onko_muokattu = false;
				var alkuperainen_teksti = false;
				var muokattu_teksti;
							
				elementti.attr("muokattu", "true");

				// POISTA EI-HERKILLE SUUNNATUT UUTISET, JOS PYYDETTY
				if( asetukset.eiherkille == 1 ) {
					if( elementti.html().search(uutistyylit.eiherkille) != -1 ) {
						elementti.parent().parent("a").remove();
					}
				}

				// POISTA ALIARVIOIVAT UUTISET, JOS PYYDETTY
				if( asetukset.aliarvio == 1 ) {
					if( elementti.html().search(uutistyylit.aliarvioivat) != -1 ) {
						elementti.parent().parent("a").remove();
					}
				}

				// POISTA NEUVOVAT UUTISET, JOS PYYDETTY
				if( asetukset.neuvova == 1 ) {
					if( elementti.html().search(uutistyylit.neuvovat) != -1 ) {
						elementti.parent("a").remove();
						elementti.parent().parent("a").remove();
					}
				}

				// POISTA PERSUJEN ININÄUUTISET, JOS PYYDETTY
				if( asetukset.persut == 1 ) {
					if( elementti.html().search(uutistyylit.persut) != -1 ) {
						elementti.parent().parent("a").remove();
					}
				}
										
				// KORVAUSOSUUS
				$.each(korvattavat, function (key, value) {
					var korvattavaregex = new RegExp(key, "g");

					muokattu_teksti = elementti.html().replace( korvattavaregex, value );
					
					if( muokattu_teksti != elementti.html() ) {
						onko_muokattu = true;
					
						if(!alkuperainen_teksti) {
							alkuperainen_teksti = elementti.text();
						}

						// MUUTA LAUSEIDEN ALKUKIRJAIMET ISOIKSI
						muokattu_teksti = muokattu_teksti.replace(
							RegExp("(\\>|\\>\s|^|\\.\\s|\\?\\s|\\!\\s|^\\s)([a-z])(.*)", "g"),
							"$1#$2#$3"
						);

						// MUUTA MERKATUT KIRJAIMET (#?#) ISOIKSI KIRJAIMIKSI
						muokattu_teksti = muokattu_teksti.replace(RegExp("#(.*)#", "g"), function(v) { 
							return v.toUpperCase().replace(/#/g, ""); 
						});
					
						elementti.html(muokattu_teksti);
					}
				});

				// MUUTA KAIKKI HUUTOMERKIT PISTEIKSI
				elementti.html( elementti.html().replace( RegExp("\!", "g"), "." ) );

				// LISÄÄ NAPPI OTSIKKOKOHDAN PERÄÄN ILMENTÄMÄÄN TEHTYÄ MUUTOSTA
				if(onko_muokattu) {
					muutosten_maara += 1;

					if(asetukset.indikaattori == 1) {
						elementti.css("cssText", "color: blue !important;");
						elementti.append(
							nappi("!", alkuperainen_teksti)
						);
					}
			
					// LÄHETÄ VIESTI BACKGROUND.JS:LLE
					chrome.extension.sendMessage({ tabid: true }, function(result) {
						tabId = result.tabId;
						chrome.runtime.sendMessage({ count:muutosten_maara, tabid: tabId });
					});
				}
			}
		);

		// MUOKKAA TYYLIÄ VÄHEMMÄN HYÖKKÄÄVÄKSI, JOS PYYDETTY
		if(asetukset.tyylitys == 1) {
			$("h2 > span").css("transform", "scale(0.4)");
			$("h2 > span").css("line-height", "0.4");
			$("h3 > span").css("transform", "scale(0.4)");
			$("h3 > span").css("line-height", "0.4");
		}
	});
}

// ALUSTA BADGEN TEKSTI
chrome.runtime.sendMessage({ count:muutosten_maara });
	
chrome.runtime.sendMessage({ elementit: true }, function(response) {
	luoLiipasimet(response.otsikkoelementit, response.korvattavat, response.uutistyylit, response.asetukset);
});
