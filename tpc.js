/**
 * Created by Jhonatan Garcoa on 09/04/2016.
 */
var TPC = (function(){
    var tpc = {};
    tpc.replaceWithData = function (target, obj) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                var pattern = '\{\{' + prop + '\}\}';
                var er = new RegExp(pattern, 'g');
                target.innerHTML = target.innerHTML.replace(er,obj[prop]);
            }
        }
    };
    return tpc;
})();

function getCity(GMapsResult) {
    var localidade="";
    if (GMapsResult.hasOwnProperty("results")) {
        for (var prop in GMapsResult.results) {
            if ((GMapsResult.results.hasOwnProperty(prop)) && (localidade==="")) {
                if (GMapsResult.results[prop].hasOwnProperty("address_components")) {
                    var address_components = GMapsResult.results[prop].address_components;
                    for (var prop2 in address_components) {
                        if ((address_components.hasOwnProperty(prop2)) && (localidade==="")) {
                            var address_components_details = address_components[prop2];
                            if (address_components_details.hasOwnProperty("types")) {
                                var indexForLocality = address_components_details.types.indexOf("locality");
                                if (indexForLocality>=0) {
                                    localidade = address_components_details.long_name;
                                }
                            }
                        }
                    }
                } else {
                    console.warn("não possui address_components");
                }
            }
        }
        return localidade;
    } else {
        console.error("Não há resultados válidos");
        return null;
    }

}

function getCountry(GMapsResult) {
    var country="";
    if (GMapsResult.hasOwnProperty("results")) {
        for (var prop in GMapsResult.results) {
            if ((GMapsResult.results.hasOwnProperty(prop)) && (country==="")) {
                if (GMapsResult.results[prop].hasOwnProperty("address_components")) {
                    var address_components = GMapsResult.results[prop].address_components;
                    for (var prop2 in address_components) {
                        if ((address_components.hasOwnProperty(prop2)) && (country==="")) {
                            var address_components_details = address_components[prop2];
                            if (address_components_details.hasOwnProperty("types")) {
                                var indexForLocality = address_components_details.types.indexOf("country");
                                if (indexForLocality>=0) {
                                    country = address_components_details.long_name;
                                }
                            }
                        }
                    }
                } else {
                    console.warn("não possui address_components");
                }
            }
        }
        return country;
    } else {
        console.error("Não há resultados válidos");
        return null;
    }

}
