
const botaoVoz = document.getElementById("voz");
const statusVoz = document.getElementById("statusVoz");

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

let reconhecimento;
let redirecionando = false;

if (!SpeechRecognition) {
  statusVoz.textContent =
    "Seu navegador não oferece suporte ao reconhecimento de voz. Tente usar o Google Chrome.";
  botaoVoz.disabled = true;
} else {
  reconhecimento = new SpeechRecognition();

  reconhecimento.lang = "pt-BR";
  reconhecimento.continuous = true;
  reconhecimento.interimResults = false;
  reconhecimento.maxAlternatives = 3;

  botaoVoz.addEventListener("click", () => {
    if (redirecionando) return;

    try {
      reconhecimento.start();
      botaoVoz.disabled = true;
      statusVoz.textContent =
        "Ouvindo... Diga “sim” ou “não”.";
    } catch (erro) {
      statusVoz.textContent =
        "O reconhecimento já está ativo ou não pôde ser iniciado.";
    }
  });

  reconhecimento.onresult = (evento) => {
    if (redirecionando) return;

    const resultadoAtual = evento.results[evento.resultIndex];

    const alternativas = Array.from(resultadoAtual).map(item =>
      item.transcript
        .normalize("NFC")
        .trim()
        .toLocaleLowerCase("pt-BR")
    );

    console.log("Alternativas reconhecidas:", alternativas);

    statusVoz.textContent =
    `Ouvi: "${alternativas.join('" / "')}"`;

    for (const frase of alternativas) {
      const respostaSim = /\bsim\b/.test(frase);
      const respostaNao = /\bnão\b|\bnao\b/.test(frase);

    if (respostaSim && !respostaNao) {
      redirecionar("nó3.1.html");
      return;
    }

    if (respostaNao && !respostaSim) {
      redirecionar("nó2.3.html");
      return;
    }
  }

    statusVoz.textContent =
      `Não reconheci “sim” ou “não”. Ouvi: ${alternativas[0]}`;
  };

  reconhecimento.onerror = (evento) => {
    statusVoz.textContent =
      `Erro no reconhecimento de voz: ${evento.error}`;

    if (!redirecionando) {
      botaoVoz.disabled = false;
    }
  };

  reconhecimento.onend = () => {
    if (!redirecionando) {
      botaoVoz.disabled = false;
      statusVoz.textContent =
        "Reconhecimento encerrado. Clique para tentar novamente.";
    }
  };
}

function redirecionar(pagina) {
  if (redirecionando) return;

  redirecionando = true;
  statusVoz.textContent = "Resposta reconhecida! Continuando a história...";

  if (reconhecimento) {
    reconhecimento.onend = null;
    reconhecimento.stop();
  }

  window.location.href = pagina;
}