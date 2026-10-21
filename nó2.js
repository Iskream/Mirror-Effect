import {
  FaceLandmarker,
  FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/vision_bundle.mjs";

const botao = document.getElementById("ativar");
const video = document.getElementById("camera");
const resultado = document.getElementById("resultado");
const contador = document.getElementById("sorriso");

const TEMPO_LIMITE = 5000;
const LIMIAR_SORRISO = 0.55;

let detector;
let stream;
let inicioSorriso = null;
let inicioSemSorriso = null;
let finalizado = false;
let analisando = false;

botao.addEventListener("click", ativarCamera);

async function ativarCamera() {
  if (analisando || finalizado) return;

  botao.disabled = true;
  resultado.textContent = "Preparando a câmera...";
  contador.textContent = "Aguarde...";

  try {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
    );

    detector = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
      },
      runningMode: "VIDEO",
      numFaces: 1,
      outputFaceBlendshapes: true
    });

    // A câmera só é solicitada depois do clique.
    stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    });

    video.srcObject = stream;
    await video.play();

    analisando = true;
    resultado.textContent = "Câmera ativada. Olhe para ela.";
    contador.textContent = "Detectando rosto...";
    requestAnimationFrame(analisar);

  } catch (erro) {
    resultado.textContent =
      "Não foi possível ativar a câmera. Verifique a permissão e tente novamente.";
    contador.textContent = erro.message;
    botao.disabled = false;
  }
}

function analisar() {
  if (!analisando || finalizado) return;

  if (video.readyState >= 2) {
    const agora = performance.now();
    const deteccao = detector.detectForVideo(video, agora);
    const rostoDetectado = deteccao.faceLandmarks.length > 0;

    const categorias =
      deteccao.faceBlendshapes?.[0]?.categories ?? [];

    function pontuacao(nome) {
      return categorias.find(
        item => item.categoryName === nome
      )?.score ?? 0;
    }

    const sorrindo =
      rostoDetectado &&
      pontuacao("mouthSmileLeft") > LIMIAR_SORRISO &&
      pontuacao("mouthSmileRight") > LIMIAR_SORRISO;

    if (!rostoDetectado) {
      inicioSorriso = null;
      inicioSemSorriso = null;
      resultado.textContent = "Nenhum rosto detectado. Posicione-se diante da câmera.";
      contador.textContent = "Aguardando rosto...";
    } else if (sorrindo) {
      inicioSemSorriso = null;

      if (inicioSorriso === null) inicioSorriso = agora;

      const decorrido = agora - inicioSorriso;
      const restante = Math.max(
        0,
        Math.ceil((TEMPO_LIMITE - decorrido) / 1000)
      );

      resultado.textContent = "Sorriso detectado: resposta SIM.";
      contador.textContent = `Mantenha o sorriso: ${restante}s`;

      if (decorrido >= TEMPO_LIMITE) {
        finalizar("nó2.1.html");
        return;
      }
    } else {
      inicioSorriso = null;

      if (inicioSemSorriso === null) inicioSemSorriso = agora;

      const decorrido = agora - inicioSemSorriso;
      const restante = Math.max(
        0,
        Math.ceil((TEMPO_LIMITE - decorrido) / 1000)
      );

      resultado.textContent = "Sorriso não detectado: resposta NÃO.";
      contador.textContent = `Mantenha a expressão séria: ${restante}s`;

      if (decorrido >= TEMPO_LIMITE) {
        finalizar("nó2.2.html");
        return;
      }
    }
  }

  requestAnimationFrame(analisar);
}

function finalizar(pagina) {
  if (finalizado) return;

  finalizado = true;
  analisando = false;

  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }

  window.location.href = pagina;
}