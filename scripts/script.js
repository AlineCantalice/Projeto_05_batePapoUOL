const URL_SERVIDOR = "https://mock-api.driven.com.br/api/v6/uol/";
const mensagens = [];
let nome;

entrarNaSala();

function entrarNaSala() {
    nome = prompt("Qual é o seu nome?");
    const usuario = {
        name: nome
    }
    const promessa = axios.post(URL_SERVIDOR + "participants", usuario);
    promessa.then(carregarMensagens);
    promessa.catch(tratarErros);
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
            conteudo.innerHTML += `<div class="message ${response.data[i].type}">
                                        <p>(${response.data[i].time})  <strong>${response.data[i].from}</strong>  ${response.data[i].text}</p>
                                </div>`
        }
    });


}

function enviarMensagens() {

    let mensagem = {
        from: nome,
        to: "Todos",
        text: document.querySelector("input").value,
        type: ""
    }

    const promessa = axios.post(URL_SERVIDOR + "messages", mensagem);
    promessa.then(carregarMensagens);
}

function tratarErros(error) {
    if (error.promise.status === 400) {
        alert("Já existe um usuário com esse nome!");
        entrarNaSala();
    }
}