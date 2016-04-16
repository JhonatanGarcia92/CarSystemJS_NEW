var GEOLOCALIZACAO = (function() {
    var modulo = {}

    var campoOrigem;
    //Chave será desativa após apresentação do trabalho.
    var chaveGoogleAPI = 'AIzaSyD1Bxz1GSOGFuzJZkKglsL13o4p-Gmketw'; 

   
    function executaSeLocalObtido(posicao) {
        var latitude = posicao.coords.latitude;
        var longitude = posicao.coords.longitude;
        setaEnderecoDeLatitudeLongitude(latitude, longitude);
    }

    function setaEnderecoDeLatitudeLongitude(latitude, longitude) {
        console.log('setaEnderecoDeLatitudeLongitude');
        var URL = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + latitude + ',' + longitude;
        var client = new XMLHttpRequest();
        client.open('GET', URL);
        client.onreadystatechange = function() {
            if (this.readyState === 4) {
                respostaObj = JSON.parse(this.responseText);
                campoOrigem.value = respostaObj.results[0].formatted_address;
            }
        }
        client.send();  
    }


    function executaSeErroObtido(error) {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                alert("Usuário rejeitou a solicitação de Geolocalização.");
                break;
            case error.POSITION_UNAVAILABLE:
                alert("Localização indisponível.");
                break;
            case error.TIMEOUT:
                alert("A requisição expirou.");
                break;
            case error.UNKNOWN_ERROR:
                alert("Algum erro desconhecido aconteceu.");
                break;
        }
    }


    //Métodos Públicos
    modulo.obterMeuLocal = function(campoParaIncluirLocal) {
        if (navigator.geolocation) {
            campoOrigem = campoParaIncluirLocal;
            navigator.geolocation.getCurrentPosition(executaSeLocalObtido, executaSeErroObtido);
        } else {
            alert("Seu browser não suporta Geolocalização.");
        }
    };

    modulo.calculaDistanciaDoPercurso = function(campoOrigem, campoDestino, campoDistancia) {
        var URL_CALCULAR_DISTANCIA = "https://maps.googleapis.com/maps/api/distancematrix/json?origins={{origem}}&destinations={{destino}}";
        var origem = campoOrigem.value;
        var destino = campoDestino.value;
        var urlComParametros = URL_CALCULAR_DISTANCIA.replace("{{origem}}", origem).replace("{{destino}}", destino);
        var urlEncodada = encodeURI(urlComParametros);
        var service = new google.maps.DistanceMatrixService;
        service.getDistanceMatrix({
            origins: [origem],
            destinations: [destino],
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC,
            avoidHighways: false,
            avoidTolls: false
        }, function(response, status) {
            var respostaObj = response;
            if (status === "OK" && respostaObj.rows[0].elements[0].status !== "NOT_FOUND") {
                campoDistancia.value = respostaObj.rows[0].elements[0].distance.value / 1000; //distancia vem em metros
                campoOrigem.value = respostaObj.originAddresses[0];
                campoDestino.value = respostaObj.destinationAddresses[0];
            } else {
                alert('Não foi possível calcular a distância entre origem e destino. Verifique se escreveu o nome da cidade corretamente.');
            }
        });
    };


    return modulo;
})();
