// DECLARAÇÃO DE VARIAVEIS GLOBAIS
const URL_SERVIDOR = "https://mock-api.driven.com.br/api/v6/uol/";
let nome;
let enviarPara = "Todos";
let privacidade = "message";
let usuarioSelecionado = document.querySelector(".selecionado");

/*
*  FUNÇÃO RESPONSAVEL POR RECUPERAR NOME DO USUARIO DADA NO INPUT
*  E ENVIAR O CADASTRO DO USUARIO PARA O SERVIDOR
*/
function entrarNaSala() {

    // Atribui o nome fornecido no input a variavel global
    nome = document.querySelector(".input input").value;

    // Construi o objeto que sera enviado ao servidor
    const usuario = {
        name: nome
    }
    // Faz o post no servidor
    const promessa = axios.post(URL_SERVIDOR + "participants", usuario);
    promessa.then(apagarTelaLogin);
    promessa.catch(tratarErros);

    // Limpa o campo do input do nome
    document.querySelector(".input input").value = "";
}

/*
*  FUNÇÃO RESPONSAVEL POR ATUALIZAR O LOGIN DO USUARIO
*  DEVE SER ATULIZADO A CADA 5 SEGUNDOS
*/
function atualizarStatus() {
    //Constroi o objeto
    const usuario = {
        name: nome
    }

    // Envia o objeto para o servidor
    axios.post(URL_SERVIDOR + "status", usuario);
}

/*
*  FUNÇÃO RESPONSAVEL POR APAGAR TELA LOGIN E DAR INICIO AS CHAMADAS 
*  INTERVALADAS DE FUNÇÕES QUE SÃO NECESSARIAS
*/
function apagarTelaLogin() {
    // retira alguns elementos da tela
    document.querySelector(".input input").classList.add("desaparecer");
    document.querySelector(".button").classList.add("desaparecer");
    document.querySelector(".aviso").classList.add("desaparecer");
    document.querySelector(".loading").classList.remove("desaparecer");
    // espera por 2 segundos antes de retirar toda a tela login
    setTimeout(esperaDoisSegundos, 2000);

    // Funções que devem ser iniciadas assim que o usuario loga
    carregarMensagens();
    carregarUsuarios();
    enviarMensagensEnter();

    // Determina intervalos para atualização de funções
    setInterval(atualizarStatus, 5000);
    setInterval(carregarMensagens, 3000);
    setInterval(carregarUsuarios, 10000);
}

/*
*  FUNÇÃO RESPONSAVEL POR APAGAR A TELA LOGIN APOS 2 SEGUNDOS
*/
function esperaDoisSegundos() {
    document.querySelector(".login").classList.add("desaparecer");
}

/*
*  FUNÇÃO RESPONSAVEL POR CARREGAR AS MENSAGENS DO SERVIDOR
*/
function carregarMensagens() {
    const promessa = axios.get(URL_SERVIDOR + "messages");
    promessa.then(renderizarMensagens);
    promessa.catch(window.location.reload);
}

/*
*  FUNÇÃO RESPONSAVEL POR RENDERIZAR AS MENSAGENS EM CASO DE SUCESSO DO SERVIDOR
*/
function renderizarMensagens(response) {

    // recupera a div que deve conter as mensagens
    let conteudo = document.querySelector(".conteudo");
    conteudo.innerHTML = "";

    for (let i = 0; i < response.data.length; i++) {
        mensagensDiv(response.data[i], conteudo);
    }
    // sempre deixa a mostra a ultima mensagem carregada
    conteudo.lastChild.scrollIntoView();
}

/*
*  FUNÇÃO RESPONSAVEL POR INSERIR AS MENSAGENS NA DIV
*/
function mensagensDiv(response, conteudo) {

    // verifica se a mensagem é pública, reservada ou status e as insere de acordo com o tipo
    if (response.type === "message") {
        conteudo.innerHTML += `<div class="message">
                        <p>(${response.time})  <strong>${response.from}</strong> para <strong>${response.to}</strong>:  ${response.text}</p>
                    </div>`
    }
    if (response.type === "private_message" && (response.from === nome || response.to === "Todos" || response.to === nome)) {
        conteudo.innerHTML += `<div class="message ${response.type}">
                        <p>(${response.time})  <strong>${response.from}</strong> reservadamente para <strong>${response.to}</strong>:  ${response.text}</p>
                    </div>`
    } 
    if (response.type === "status") {
        conteudo.innerHTML += `<div class="message ${response.type}">
                        <p>(${response.time})  <strong>${response.from}</strong> ${response.text}</p>
                    </div>`
    }

}

/*
*  FUNÇÃO RESPONSAVEL POR ATUALIZAR A LISTA DE USUARIOS
*/
function carregarUsuarios() {
    const promessa = axios.get(URL_SERVIDOR + "participants");
    promessa.then(listarUsuarios);
}

/*
*  FUNÇÃO RESPONSAVEL POR RENDERIZAR USUARIOS E INSERIR NA DIV
*/
function listarUsuarios(response) {

    // recupera a div que vai conter a lista de usuarios
    const usuario = document.querySelector(".usuarios");
    // limpa a div antes de inserir as mensagens
    usuario.innerHTML = "";
    // coleta o nome do usuario previamente selecionado
    const selecionado = usuarioSelecionado.querySelector(".nome-pessoa").innerHTML;
    let temSelecionado = false;

    for (let i = 0; i < response.data.length; i++) {
        // verifica se o nome que vem na lista de usuario é diferente do usuario logando,
        // se sim, insere o usuario na lista (o nome do usuario logado não deve aparecer,
        // pois não seria legal enviar mensagens reservadas para si mesmo!) 
        if (response.data[i].name !== nome) {
            // verifica se é o usuario previamente selecionado
            if (selecionado === response.data[i].name) {
                // a div carregada deixa o icone a mostra
                usuario.innerHTML += `<div class="usuario selecionado" onclick="selecionarUsuario(this)">
                                <div class="nome-usuario">
                                    <ion-icon name="person-circle"></ion-icon>
                                    <p class="nome-pessoa">${response.data[i].name}</p>
                                </div>
                                <ion-icon class="icone-usuario" name="checkmark-sharp"></ion-icon>
                            </div>`
                temSelecionado = true;
            } else {
                // caso não, os outros usuarios serão renderizados normalmente
                usuario.innerHTML += `<div class="usuario" onclick="selecionarUsuario(this)">
                                <div class="nome-usuario">
                                    <ion-icon name="person-circle"></ion-icon>
                                    <p class="nome-pessoa">${response.data[i].name}</p>
                                </div>
                                <ion-icon class="icone-usuario desaparecer" name="checkmark-sharp"></ion-icon>
                            </div>`
            }
        }
    }

    // verifica se o usuario selecionado esta logado, se não retorna para todos
    if (temSelecionado === false) {
        const todos = document.querySelector(".todos");
        todos.classList.add("selecionado");
        todos.querySelector(".icone-usuario").classList.remove("desaparecer");
        enviarPara = todos.querySelector(".nome-pessoa").innerHTML;
        modificarMensagem();
    }

}

/*
*  FUNÇÃO RESPONSAVEL POR ATUALIZAR O USUARIO SELECIONADO E ATIVAR O ICONE
*/
function selecionarUsuario(elemento) {
    usuarioSelecionado = document.querySelector(".selecionado");

    if (usuarioSelecionado !== null && usuarioSelecionado !== elemento) {
        elemento.querySelector(".icone-usuario").classList.remove("desaparecer");
        elemento.classList.add("selecionado");
        usuarioSelecionado.classList.remove("selecionado");
        usuarioSelecionado.querySelector(".icone-usuario").classList.add("desaparecer");
    }

    elemento.querySelector(".icone-usuario").classList.remove("desaparecer");
    elemento.classList.add("selecionado");
    usuarioSelecionado = elemento;

    // recupera nome da pessoa da lista
    enviarPara = elemento.querySelector(".nome-pessoa").innerHTML;
    modificarMensagem();
}

/*
*  FUNÇÃO RESPONSAVEL POR ATUALIZAR A VISIBILIDADE SELECIONADO E ATIVAR O ICONE
*/
function selecionarVisibilidade(elemento) {
    const selecionado = document.querySelector(".visibilidade-selecionada");

    if (selecionado !== null && selecionado !== elemento) {
        elemento.querySelector(".icone").classList.remove("desaparecer");
        elemento.classList.add("visibilidade-selecionada");
        selecionado.classList.remove("visibilidade-selecionada");
        selecionado.querySelector(".icone").classList.add("desaparecer");
    }

    elemento.querySelector(".icone").classList.remove("desaparecer");
    elemento.classList.add("visibilidade-selecionada");

    // recupera privacidade da mensagens a ser enviada
    privacidade = elemento.querySelector(".privacidade").innerHTML;
    modificarMensagem();
}

/*
*   FUNÇÃO RESPONSAVEL POR ATUALIZAR O AVISO ABAIXO DO INPUT DA MENSAGEM
*/
function modificarMensagem() {
    // variavel que recebe o tipo de visibilidade
    let texto;
    if (privacidade === "message" || privacidade === "Público") {
        texto = "Público";
    } else if (privacidade === "private_message" || privacidade === "Reservadamente") {
        texto = "Reservadamente";
    }

    // atualiza o aviso no html
    document.querySelector(".texto-mensagem p").innerHTML = `Enviando para ${enviarPara} (${texto})`;
}

/*
*   FUNÇÃO RESPONSAVEL POR MOSTRAR O MENU LATERAL
*/
function mostrarMenuLateral() {
    document.querySelector(".caixa-menu-lateral").classList.remove("desaparecer");
    let t = document.querySelector(".menu-lateral").classList.remove("desaparecer");
}

/*
*   FUNÇÃO RESPONSAVEL POR RETIRAR O MENU LATERAL
*/
function sumirMenuLateral(elemento) {
    let menu = document.querySelector(".menu-lateral");
    menu.classList.add("desaparecer");
    elemento.classList.add("desaparecer");
}

/*
*   FUNÇÃO RESPONSAVEL POR ENVIAR AS MENSAGENS PARA O SERVIDOR
*/
function enviarMensagens() {

    // verifica a privacidade para fazer a troca necessária 
    if (privacidade === "Público") {
        privacidade = "message";
    } else if (privacidade === "Reservadamente") {
        privacidade = "private_message";
    }

    // constroi o objeto
    let mensagem = {
        from: nome,
        to: enviarPara,
        text: document.querySelector(".texto-mensagem input").value,
        type: privacidade
    }

    // manda o objeto para o servidor
    const promessa = axios.post(URL_SERVIDOR + "messages", mensagem);
    promessa.then(carregarMensagens);
    promessa.catch(window.location.reload);

    // limpa o input das mensagens
    document.querySelector(".texto-mensagem input").value = '';
}

/*
*   FUNÇÃO RESPONSAVEL POR ATIVAR O ENVIO DE MENSAGENS CLICKANDO ENTER NO TECLADO
*/
function enviarMensagensEnter() {
    let input = document.querySelector(".texto-mensagem input");
    input.addEventListener("keyup", event => {
        // verifica se a tecla clickada tem o código da tecla enter
        if (event.keyCode === 13) {
            let btn = document.querySelector(".submit");
            btn.click();
        }
    })
}

/*
*   FUNÇÃO RESPONSAVEL POR MOSTRAR MENSAGEM DE ERRO NO LOGIN DO USUARIO 
*   E LIMPAR O INPUT QUE FOI INVALIDADO
*/
function tratarErros(error) {
    if (error.response.status === 400) {
        document.querySelector(".aviso").classList.remove("desaparecer");
        nome = document.querySelector(".input input").value = "";
    }
}

