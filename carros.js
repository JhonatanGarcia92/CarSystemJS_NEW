// Autor: Carlos Nantes
var CARRO = (function() {
    var modulo = {}
    var codCarro = 0;
    var carros = [];
    var Storage = window.localStorage;
    var carroEmEdicao;

    //Simula jQuery $()
    function $$(id) {
        return document.getElementById(id);
    }


    function Carro(fab, mod, ano, cor, pla, vlrdia, vlrkm) {
        codCarro++;
        this.codCarro = codCarro;
        this.fabricante = fab;
        this.modelo = mod;
        this.ano = ano;
        this.cor = cor;
        this.valorDiaria = vlrdia || 150.00;
        this.valorKm = vlrkm || 2.5;
        this.placa = (function(str) {
            return str.toUpperCase();
        })(pla);
    }

    function carregaDoLocalStorage() {
        var carrosList = Storage.getItem('carros');
        if (carrosList != null) {
            carros = JSON.parse(carrosList);
        }
        var codCarroStorage = Storage.getItem('codCarro');
        if (codCarroStorage !== null) {
            codCarro = codCarroStorage;
        }
    }


    function validaCharsPlaca() {
        var inputPlaca = document.getElementById('placa');
        inputPlaca.value = inputPlaca.value.replace(/[^a-z0-9]/gmi, '');
    }


    //Método público. Os outros são privados.
    modulo.init = function() {
        carregaDoLocalStorage();
        var abaCarro = $$('abaCarro');
        abaCarro.addEventListener('click', carregaTelaCarro);

        var inputPlaca = $$('placa');
        inputPlaca.addEventListener('keyup', validaCharsPlaca, false);
    }



    function carregaTelaCarro() {
        limpaFormCarro();
        mostraCarrosNatela();
        carregaEventos();
        $$('btnAdicionarCarro').classList.remove('hide');
        $$('btnSalvarCarro').classList.add('hide');
        $$('btnCancelarCarro').classList.add('hide');
    }


    function carregaEventos() {
        var btnAdicionarCarro = $$('btnAdicionarCarro');
        btnAdicionarCarro.addEventListener('click', clickAdicionarCarro);
        var btnSalvarCarro = $$('btnSalvarCarro');
        btnSalvarCarro.addEventListener('click', clickSalvarCarro);
        var btnCancelarCarro = $$('btnCancelarCarro');
        btnCancelarCarro.addEventListener('click', clickCancelarCarro);
    }

    function clickAdicionarCarro(evento) {
        console.log('clickAdicionarCarro');
        evento.preventDefault();
        var carro = novoCarro();
        if (preenchimentoCorreto()) {
            adicionarCarro(carro);
            limpaFormCarro();
            mostraCarrosNatela();
            
            new PNotify({
                title: 'Carro',
                text: 'Salvo com sucesso.',
                type: 'success'
            });

        } else {
            mostraMensagemDePreenchimentoIncorreto();
        }
    }

    function mostraMensagemDePreenchimentoIncorreto() {
        camposInvalidos = document.querySelectorAll('#formNovoCarro .form-control:invalid');
        mensagem = "Campos Preenchidos Incorretamente: \n\n";
        for (var i = 0, length = camposInvalidos.length; i < length; i++) {
            campo = camposInvalidos[i];
            label = document.querySelector('#formNovoCarro label[for=' + campo.id + ']').innerText;
            mensagem = mensagem + label + ":  " + campo.validationMessage + "\n";
        }
        alert(mensagem);
    }

    function preenchimentoCorreto() {
        return $$('formNovoCarro').checkValidity();
    }

    function clickExcluirCarro(evento) {
        console.log('clickExcluirCarro');
        evento.preventDefault();
        idDaLista = descobreIdNoArrayDeCarros(evento);
        carroAExcluir = carros[idDaLista];
        if (carroEmEdicao == carroAExcluir) {
            desejaExcluir = new PNotify({
                title: 'Excluir Carro',
                text: 'Este carro está em edição. Tem certeza que deseja excluir?',
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
            if (desejaExcluir)
                limpaFormCarro();
        } else {
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

        if (desejaExcluir) {
            excluirCarro(idDaLista);
            mostraCarrosNatela();
        }
    }

    function clickEditarCarro(evento) {
        console.log('clickEditarCarro');
        evento.preventDefault();
        idDaLista = descobreIdNoArrayDeCarros(evento);
        carroEmEdicao = carros[idDaLista];
        carregarCarroNoForm(carroEmEdicao);
        $$('btnAdicionarCarro').classList.add('hide');
        $$('btnSalvarCarro').classList.remove('hide');
        $$('btnCancelarCarro').classList.remove('hide');
    }

    function clickCancelarCarro(evento) {
        console.log('clickCancelarCarro');
        evento.preventDefault();
        limpaFormCarro();
    }

    function clickSalvarCarro(evento) {
        console.log('clickSalvarCarro');
        evento.preventDefault();
        salvarEdicao(carroEmEdicao);
        limpaFormCarro();
        mostraCarrosNatela();
    }

    function salvarEdicao(carro) {
        carro.fabricante = $$('fabricante').value;
        carro.modelo = $$('modelo').value;
        carro.ano = $$('ano').value;
        carro.cor = $$('cor').value;
        carro.placa = $$('placa').value;
        carro.valorDiaria = $$('valorDiaria').value;
        carro.valorKm = $$('valorKm').value;
    }

    function descobreIdNoArrayDeCarros(evento) {
        tdRow = evento.target.parentNode.parentNode.querySelector('.row');
        idDaLista = parseInt(tdRow.innerText) - 1;
        return idDaLista;
    }

    function mostraCarrosNatela() {
        var lista = $$('tblistaCarros');
        lista.textContent = '';
        for (var i = 0; i < carros.length; i++) {
            var carro = carros[i];
            var modelo = $$('listaCarros');
            var copia = modelo.content.firstElementChild.cloneNode(true);
            TPC.replaceWithData(copia, carro);
            copia.querySelector('.row').innerText = i + 1;
            copia.querySelector('.btnEditarCarro').addEventListener('click', clickEditarCarro);
            copia.querySelector('.btnExcluirCarro').addEventListener('click', clickExcluirCarro);
            lista.appendChild(copia);
        }
    }

    function limpaFormCarro() {
        $$('fabricante').value = '';
        $$('modelo').value = '';
        $$('ano').value = '';
        $$('cor').value = '';
        $$('placa').value = '';
        $$('valorDiaria').value = '';
        $$('valorKm').value = '';
        $$('btnAdicionarCarro').classList.remove('hide');
        $$('btnSalvarCarro').classList.add('hide');
        $$('btnCancelarCarro').classList.add('hide');
    }

    function novoCarro() {
        var carro = new Carro(
            $$('fabricante').value,
            $$('modelo').value,
            $$('ano').value,
            $$('cor').value,
            $$('placa').value,
            $$('valorKm').value,
            $$('valorDiaria').value
        );
        return carro;
    }

    function carregarCarroNoForm(carro) {
        $$('fabricante').value = carro.fabricante;
        $$('modelo').value = carro.modelo;
        $$('ano').value = carro.ano;
        $$('cor').value = carro.cor;
        $$('placa').value = carro.placa;
        $$('valorKm').value = carro.valorKm;
        $$('valorDiaria').value = carro.valorDiaria;
    }


    function excluirCarro(idDaLista) {
        carros.splice(idDaLista, 1);
        Storage.setItem('carros', JSON.stringify(carros));
    }

    function adicionarCarro(carro) {
        carros.push(carro);
        Storage.setItem('carros', JSON.stringify(carros));
        Storage.setItem('codCarro', JSON.stringify(codCarro));
    }

    //Métdos públicos
    modulo.getCarros = function() {
        return carros;
    };

    modulo.carregaTela = function() {
        carregaTelaCarro();
    };

    return modulo;
})();
