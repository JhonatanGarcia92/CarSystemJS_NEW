// Autor: Carlos Nantes
var SIMULACAO = (function(){
    var modulo = {}
    var Storage  = window.localStorage;
    var carros = [];
    var simulacoes = [];
    var idSimulacao = 0;
    var simulacaoEmEdicao;

    //Simula jQuery $()
    function $$(id){
        return document.getElementById(id);
    }

    function Simulacao (codCarro, cliNome, op, dtInicio, dtFim, ori, dst, distancia){
        idSimulacao++;
        simulacao = {}
        simulacao.id = idSimulacao;
        simulacao.carroEscolhido = codCarro;
        simulacao.nomeCliente = cliNome;
        simulacao.opcao = op;
        simulacao.dateInicio = dtInicio;
        simulacao.dateFim = dtFim;
        simulacao.origem = ori;
        simulacao.destino = dst;
        simulacao.distancia = distancia;
        simulacao.toString = function(){
          return this.nomeCliente + ' ' + this.opcao;
        }
        return simulacao;
    }
    
    function carregaDoLocalStorage (){
        var simulacoesList = Storage.getItem('simulacoes');
        if (simulacoesList!=null) {
          simulacoes = JSON.parse(simulacoesList);
        }
        var idSimulacaoStorage = Storage.getItem('idSimulacao');
        if(idSimulacaoStorage !== null){
            idSimulacao = idSimulacaoStorage;
        }
    }

    //Método público. Os outros são privados.
    modulo.init = function (carrosCadastrados){
        carros = carrosCadastrados;
        carregaDoLocalStorage();
        var abaSimulacao = $$('abaSimulacao');
        abaSimulacao.addEventListener('click', carregaTelaSimulacao);
    }

    function carregaTelaSimulacao(){
        limpaFormSimulacao();
        mostraCarrosNaTela();
        mostraSimulacoesNatela();
        carregaEventos();
        $$('btnAdicionarSimulacao').classList.remove('hide');
        $$('btnSalvarSimulacao').classList.add('hide');
        $$('btnCancelarSimulacao').classList.add('hide');
    }
    
    function mostraCarrosNaTela(){
        console.log('mostraCarrosNaTela');
        var lista = $$('carroEscolhido');
        lista.textContent = '';
        for (var i = 0; i < carros.length; i++) {
            var carro = carros[i];
            var modelo = $$('opcoesCarro');
            var copia = modelo.content.firstElementChild.cloneNode(true);
            copia.value = carro.codigo;
            TPC.replaceWithData(copia, carro);
            lista.appendChild(copia);
        }
    }

    function carregaEventos (){
        var btnAdicionarSimulacao = $$('btnAdicionarSimulacao');
        btnAdicionarSimulacao.addEventListener('click', clickAdicionarSimulacao);
        var btnSalvarSimulacao = $$('btnSalvarSimulacao');
        btnSalvarSimulacao.addEventListener('click', clickSalvarSimulacao);
        var btnCancelarSimulacao = $$('btnCancelarSimulacao');
        btnCancelarSimulacao.addEventListener('click', clickCancelarSimulacao);
        $$('btnCalcularDistancia').addEventListener('click', clickCalcularDistancia);
        $$('btnMeuLocal').addEventListener('click', clickMeuLocal);
    }

    function clickMeuLocal(evento){
        evento.preventDefault();
        var campoOrigem = $$('origem');
        GEOLOCALIZACAO.obterMeuLocal( campoOrigem );
    }

    function clickAdicionarSimulacao (evento){
        evento.preventDefault();
        var simulacao = novaSimulacao();
        if( preenchimentoCorreto() ){
            adicionarSimulacao(simulacao);
            limpaFormSimulacao();
            mostraSimulacoesNatela();

            new PNotify({
                title: 'Simulação',
                text: 'Salvo com sucesso.',
                type: 'success'
            });
        }else{
            mostraMensagemDePreenchimentoIncorreto();
        }
    }

    function clickCalcularDistancia(evento){
        evento.preventDefault();
        var campoOrigem = $$('origem');
        var campoDestino = $$('destino');
        var campoDistancia = $$('distancia');
        GEOLOCALIZACAO.calculaDistanciaDoPercurso( campoOrigem, campoDestino, campoDistancia );
    }

    function mostraMensagemDePreenchimentoIncorreto(){
        camposInvalidos = document.querySelectorAll('#formNovaSimulacao .form-control:invalid');
        mensagem = "Campos Preenchidos Incorretamente: \n\n";
        for( var i=0, length = camposInvalidos.length; i < length; i++){
            campo = camposInvalidos[i];
            label = document.querySelector('#formNovaSimulacao label[for='+campo.id+']').innerText;
            mensagem = mensagem + label + ":  "+ campo.validationMessage + "\n";
        }
        new PNotify({
            title: 'Campos Obrigatórios',
            text: mensagem,
            type: 'error'
        });
    }

    function preenchimentoCorreto(){
      return $$('formNovaSimulacao').checkValidity();
    }

    function clickExcluirSimulacao (evento){
        evento.preventDefault();
        idDaLista = descobreIdNoArrayDeSimulacoes(evento);
        simulacaoAExcluir = simulacoes[idDaLista];
        if( simulacaoEmEdicao == simulacaoAExcluir ){
            desejaExcluir = new PNotify({
                title: 'Excluir Simulação',
                text: 'Esta simulação está em edição. Tem certeza que deseja excluir?',
                icon: 'glyphicon glyphicon-question-sign',
                hide: false,
                confirm: {
                    confirm: true
                },
                buttons: {
                    closer: false,
                    sticker: false
                },
                history: {
                    history: false
                }
            }).get().on('pnotify.confirm', function(){
                alert('Excluído com sucesso.');
            }).on('pnotify.cancel', function(){
                alert('Exclusão cancelada.');
            });
            if(desejaExcluir)
                limpaFormSimulacao();
        }else{
            desejaExcluir = new PNotify({
                title: 'Excluir Carro',
                text: 'Tem certeza que deseja excluir?',
                icon: 'glyphicon glyphicon-question-sign',
                hide: false,
                confirm: {
                    confirm: true
                },
                buttons: {
                    closer: false,
                    sticker: false
                },
                history: {
                    history: false
                }
            }).get().on('pnotify.confirm', function(){
                alert('Excluído com sucesso.');
            }).on('pnotify.cancel', function(){
                alert('Exclusão cancelada.');
            });
        }
        
        if( desejaExcluir ){
            excluirSimulacao(idDaLista);
            mostraSimulacoesNatela();
        }
    }

    function clickEditarSimulacao (evento){
        console.log('clickEditarSimulacao');
        evento.preventDefault();
        idDaLista = descobreIdNoArrayDeSimulacoes(evento);
        simulacaoEmEdicao = simulacoes[idDaLista];
        carregarSimulacaoNoForm(simulacaoEmEdicao);
        $$('btnAdicionarSimulacao').classList.add('hide');
        $$('btnSalvarSimulacao').classList.remove('hide');
        $$('btnCancelarSimulacao').classList.remove('hide');
    }

    function clickCancelarSimulacao (evento){
        console.log('clickCancelarSimulacao');
        evento.preventDefault();
        limpaFormSimulacao();
    }  

    function clickSalvarSimulacao (evento){
        console.log('clickSalvarSimulacao');
        evento.preventDefault();
        salvarEdicao(simulacaoEmEdicao);
        limpaFormSimulacao();
        mostraSimulacoesNatela();
     }

    function salvarEdicao (simulacao){
        simulacao.carroEscolhido =$$('carroEscolhido').value;
        simulacao.nomeCliente = $$('nomeCliente').value;
        simulacao.opcao = document.querySelector('.opcaoSimulacao:checked').value;
        simulacao.dateInicio = $$('dateInicio').value;
        simulacao.dateFim = $$('dateFim').value;
        simulacao.origem = $$('origem').value;
        simulacao.destino = $$('destino').value;
        simulacao.distancia = $$('distancia').value;
    }

    function descobreIdNoArrayDeSimulacoes (evento){
        tdRow = evento.target.parentNode.parentNode.querySelector('.row');
        idDaLista = parseInt( tdRow.innerText ) - 1;
        return idDaLista;
    }

    function mostraSimulacoesNatela (){
        var lista = $$('tblistaSimulacao');
        lista.textContent = '';
        for (var i = 0; i < simulacoes.length; i++) {
            var simulacao = simulacoes[i];
            var modelo = $$('listaSimulacao');
            var copia = modelo.content.firstElementChild.cloneNode(true);
            TPC.replaceWithData(copia, simulacao);
            copia.querySelector('.row').innerText = i + 1;
            copia.querySelector('.btnEditarSimulacao').addEventListener('click', clickEditarSimulacao);
            copia.querySelector('.btnExcluirSimulacao').addEventListener('click', clickExcluirSimulacao);
            lista.appendChild(copia);
        }
    }

    function limpaFormSimulacao (){
        $$('nomeCliente').value = '';
        $$('carroEscolhido').selectedIndex = 0;
        $$('opcoes').checked = true;
        $$('opcoesKm').checked = false;
        $$('dateInicio').value = '';
        $$('dateFim').value = '';
        $$('origem').value = '';
        $$('destino').value = '';
        $$('distancia').value = '';
        $$('btnAdicionarSimulacao').classList.remove('hide');
        $$('btnSalvarSimulacao').classList.add('hide');
        $$('btnCancelarSimulacao').classList.add('hide');
    }

    function novaSimulacao () {
        var simulacao = new Simulacao(
            $$('carroEscolhido').value,
            $$('nomeCliente').value,
            document.querySelector('.opcaoSimulacao:checked').value,
            $$('dateInicio').value,
            $$('dateFim').value,
            $$('origem').value,
            $$('destino').value,
            $$('distancia').value
        );
        return simulacao;
    }

    function carregarSimulacaoNoForm (simulacao){        
        $$('carroEscolhido').value = simulacao.carroEscolhido;
        $$('nomeCliente').value = simulacao.nomeCliente;
        if( simulacao.opcao == 'dias' ){
            $$('opcao').checked = true;
        }
        if( simulacao.opcao == 'km' ){
            $$('opcaoKm').checked = true;
        }
        $$('dateInicio').value = simulacao.dateInicio;
        $$('dateFim').value = simulacao.dateFim
        $$('origem').value = simulacao.origem ;
        $$('destino').value = simulacao.destino;
        $$('distancia').value = simulacao.distancia;
    }

    function excluirSimulacao (idDaLista){
        simulacoes.splice(idDaLista, 1);
        Storage.setItem('simulacoes', JSON.stringify(simulacoes));
    }

    function adicionarSimulacao (simulacao){
        simulacoes.push(simulacao);
        Storage.setItem('simulacoes', JSON.stringify(simulacoes));
        Storage.setItem('idSimulacao', JSON.stringify(idSimulacao));
    }

    return modulo;
})();