const URL_SERVIDOR = "https://mock-api.driven.com.br/api/v6/uol/";
const mensagens = [];
const participantes = [];
let nome;

perguntarNome();
setInterval(atualizarStatus, 4000);
setInterval(carregarMensagens, 3000);

function perguntarNome() {
    nome = prompt("Qual é o seu nome?");
    entrarNaSala();
}

function entrarNaSala() {

    const usuario = {
        name: nome
    }
    const promessa = axios.post(URL_SERVIDOR + "participants", usuario);
    promessa.then(carregarMensagens);
    promessa.catch(tratarErros);
}

function atualizarStatus(){
    const usuario = {
        name: nome
    }

    const promessa = axios.post(URL_SERVIDOR + "status", usuario);
}

function carregarMensagens() {
    const promessa = axios.get(URL_SERVIDOR + "messages");
    let conteudo = document.querySelector(".conteudo");

    let mensagem = {
        from: "",
        to: "",
        text: "",
        type: "",
        time: ""
    }

    promessa.then(function (response) {
        mensagens.push(response.data);

        for (let i = 0; i < response.data.length; i++) {

            if (response.data.type === "message") {
                conteudo.innerHTML += `<div class="message">
                                        <p>(${response.data[i].time})  <strong>${response.data[i].from}</strong> para <strong>${response.data[i].to}</strong>:  ${response.data[i].text}</p>
                                </div>`
            } else if (response.data.type === "private_message") {
                conteudo.innerHTML += `<div class="message">
                                        <p>(${response.data[i].time})  <strong>${response.data[i].from}</strong> reservadamente para <strong>${response.data[i].to}</strong>:  ${response.data[i].text}</p>
                                </div>`
            } else {
                conteudo.innerHTML += `<div class="message ${response.data[i].type}">
                                        <p>(${response.data[i].time})  <strong>${response.data[i].from}</strong>  ${response.data[i].text}</p>
                                </div>`
            }
        }
        conteudo.lastChild.scrollIntoView();
    });


}

function enviarMensagens() {

    let mensagem = {
        from: nome,
        to: "Todos",
        text: document.querySelector("input").value,
        type: "message"
    }

    const promessa = axios.post(URL_SERVIDOR + "messages", mensagem);
    promessa.then(carregarMensagens);
    promessa.catch(window.location.reload);
}

function buscarParticipantes() {
    const promessa = axios.get(URL_SERVIDOR + "participants");
    promessa.then(function () {
    });
}

function tratarErros(error) {
    if (error.promise.status === 400) {
        alert("Já existe um usuário com esse nome!");
        entrarNaSala();
    }
}

buscarParticipantes()

