window.onload = init;

function loadScript(url, callback){
	var script = document.createElement('script');
	script.src = url;
	if (callback!==undefined) {
		script.addEventListener('load', callback);
	}
	var local = document.getElementsByTagName('script')[0].parentNode;
	local.appendChild(script);
}

function init(){
	loadScript('lib/jquery/dist/jquery.min.js', function(){
		loadScript('lib/bootstrap/dist/js/bootstrap.min.js');
	});
	loadScript('tpc.js', function(){
		loadScript('carros.js', function(){
			loadScript('geolocalizacao.js', function(){
				loadScript('simulacoes.js', function() {
					CARRO.init();
					CARRO.carregaTela();
					SIMULACAO.init(CARRO.getCarros());
				});
			});
		});
	});

}
