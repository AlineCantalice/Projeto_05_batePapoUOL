const URL_SERVIDOR = "https://mock-api.driven.com.br/api/v6/uol/";
const mensagens = [];
const participantes = [];
let nome;

function entrarNaSala() {

    nome = document.querySelector(".input input").value;

    const usuario = {
        name: nome
    }
    const promessa = axios.post(URL_SERVIDOR + "participants", usuario);
    promessa.then(apagarTelaLogin);
    promessa.catch(tratarErros);

    nome = document.querySelector(".input input").value = "";
}

function atualizarStatus() {
    const usuario = {
        name: nome
    }

    axios.post(URL_SERVIDOR + "status", usuario);
}

function apagarTelaLogin() {
    document.querySelector(".login").classList.add("desaparecer");

    carregarMensagens();
    carregarUsuarios();
    enviarMensagensEnter();

    setInterval(atualizarStatus, 5000);
    setInterval(carregarMensagens, 3000);
    setInterval(carregarUsuarios, 10000);

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

function carregarUsuarios() {
    const promessa = axios.get(URL_SERVIDOR + "participants");
    promessa.then(listarUsuarios);
}

function listarUsuarios(response) {

    let usuario = document.querySelector(".usuarios");
    usuario.innerHTML = "";

    for (let i = 0; i < response.data.length; i++) {
        usuario.innerHTML += `<div class="usuario">
                                <div class="nome-usuario">
                                    <ion-icon name="person-circle"></ion-icon>
                                    <p>${response.data[i].name}</p>
                                </div>
                                <ion-icon class="desaparecer" name="checkmark-sharp"></ion-icon>
                            </div>`
    }

}

function mostrarMenuLateral() {
    document.querySelector(".caixa-menu-lateral").classList.toggle("desaparecer");
}

function enviarMensagens() {

    let mensagem = {
        from: nome,
        to: "Todos",
        text: document.querySelector(".texto-mensagem input").value,
        type: "message"
    }

    const promessa = axios.post(URL_SERVIDOR + "messages", mensagem);
    promessa.then(carregarMensagens);
    promessa.catch(window.location.reload);

    document.querySelector(".texto-mensagem input").value = '';
}

function enviarMensagensEnter(){
    let input = document.querySelector(".texto-mensagem input");
    input.addEventListener("keyup", event => {
        if(event.keyCode === 13){
            console.log(event);
            let btn = document.querySelector(".submit");
            btn.click();
        }
    })
}

function tratarErros(error) {
    if (error.response.status === 400) {
        document.querySelector(".aviso").innerHTML = "Já existe um usuário com esse nome!";
        entrarNaSala();
    }
}

