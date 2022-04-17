const URL_SERVIDOR = "https://mock-api.driven.com.br/api/v6/uol/";
const mensagens = [];
const participantes = [];
let nome;
let enviarPara = "Todos";
let privacidade = "message";
const listaUsuariosLogados = [];
let texto;

function entrarNaSala() {

    nome = document.querySelector(".input input").value;

    const usuario = {
        name: nome
    }
    const promessa = axios.post(URL_SERVIDOR + "participants", usuario);
    promessa.then(apagarTelaLogin);
    promessa.catch(tratarErros);

    document.querySelector(".input input").value = "";
}

function atualizarStatus() {
    const usuario = {
        name: nome
    }

    axios.post(URL_SERVIDOR + "status", usuario);
}

function apagarTelaLogin() {
    document.querySelector(".input input").classList.add("desaparecer");
    document.querySelector(".button").classList.add("desaparecer");
    document.querySelector(".aviso").classList.add("desaparecer");
    document.querySelector(".loading").classList.remove("desaparecer");
    setTimeout(esperaDoisSegundos, 2000);

    carregarMensagens();
    carregarUsuarios();
    enviarMensagensEnter();

    setInterval(atualizarStatus, 5000);
    setInterval(carregarMensagens, 3000);
    setInterval(carregarUsuarios, 10000);

}

function esperaDoisSegundos(){
    document.querySelector(".login").classList.add("desaparecer");
}

function carregarMensagens() {
    const promessa = axios.get(URL_SERVIDOR + "messages");
    promessa.then(renderizarMensagens);
    promessa.catch(window.location.reload);
}

function renderizarMensagens(response) {
    mensagens.push(response.data);

    let conteudo = document.querySelector(".conteudo");
    conteudo.innerHTML = "";

    for (let i = 0; i < response.data.length; i++) {
        mensagensDiv(response.data[i], conteudo);
    }
    conteudo.lastChild.scrollIntoView();
}

function mensagensDiv(response, conteudo) {

    if (response.from === nome || response.to === "" || response.to === "Todos" || response.to === nome) {

        if (response.type === "message") {
            conteudo.innerHTML += `<div class="message">
                        <p>(${response.time})  <strong>${response.from}</strong> para <strong>${response.to}</strong>:  ${response.text}</p>
                    </div>`
        } else if (response.type === "private_message") {
            conteudo.innerHTML += `<div class="message ${response.type}">
                        <p>(${response.time})  <strong>${response.from}</strong> reservadamente para <strong>${response.to}</strong>:  ${response.text}</p>
                    </div>`
        } else {
            conteudo.innerHTML += `<div class="message ${response.type}">
                        <p>(${response.time})  <strong>${response.from}</strong> ${response.text}</p>
                    </div>`
        }
    }

}

function carregarUsuarios() {

    const menu = document.querySelector(".menu-lateral");

    if (menu.classList.contains("desaparecer")) {
        const promessa = axios.get(URL_SERVIDOR + "participants");
        promessa.then(listarUsuarios);
    }
    return;
}

function listarUsuarios(response) {

    const usuario = document.querySelector(".usuarios");
    usuario.innerHTML = "";

    for (let i = 0; i < response.data.length; i++) {
        if (response.data[i].name !== nome) {
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

function selecionarUsuario(elemento) {
    const selecionado = document.querySelector(".selecionado");

    if (selecionado !== null && selecionado !== elemento) {
        elemento.querySelector(".icone-usuario").classList.remove("desaparecer");
        elemento.classList.add("selecionado");
        selecionado.classList.remove("selecionado");
        selecionado.querySelector(".icone-usuario").classList.add("desaparecer");
    }

    elemento.querySelector(".icone-usuario").classList.remove("desaparecer");
    elemento.classList.add("selecionado");

    enviarPara = elemento.querySelector(".nome-pessoa").innerHTML;
    modificarMensagem();
}

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

    privacidade = elemento.querySelector(".privacidade").innerHTML;
    modificarMensagem();
}

function modificarMensagem() {
    
    if (privacidade === "message" || privacidade === "Público") {
        texto = "Público";
    } else if (privacidade === "private_message" || privacidade === "Reservadamente") {
        texto = "Reservadamente";
    }

    document.querySelector(".texto-mensagem p").innerHTML = `Enviando para ${enviarPara} (${texto})`;
}

function mostrarMenuLateral() {
    document.querySelector(".caixa-menu-lateral").classList.remove("desaparecer");
    let t = document.querySelector(".menu-lateral").classList.remove("desaparecer");
}

function sumirMenuLateral(elemento) {
    let menu = document.querySelector(".menu-lateral");
    menu.classList.add("desaparecer");
    elemento.classList.add("desaparecer");
}

function enviarMensagens() {

    if (privacidade === "Público") {
        privacidade = "message";
    } else if (privacidade === "Reservadamente") {
        privacidade = "private_message";
    }

    let mensagem = {
        from: nome,
        to: enviarPara,
        text: document.querySelector(".texto-mensagem input").value,
        type: privacidade
    }

    const promessa = axios.post(URL_SERVIDOR + "messages", mensagem);
    promessa.then(carregarMensagens);
    promessa.catch(window.location.reload);

    document.querySelector(".texto-mensagem input").value = '';
}

function enviarMensagensEnter() {
    let input = document.querySelector(".texto-mensagem input");
    input.addEventListener("keyup", event => {
        if (event.keyCode === 13) {
            let btn = document.querySelector(".submit");
            btn.click();
        }
    })
}

function tratarErros(error) {
    if (error.response.status === 400) {
        document.querySelector(".aviso").classList.remove("desaparecer");
        nome = document.querySelector(".input input").value = "";
    }
}

