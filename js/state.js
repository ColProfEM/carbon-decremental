/* --- GERENCIAMENTO DE RECURSOS (MUNDO) --- */

const worldMapImg = document.querySelector("#world_map img");

// Elementos da tela (DOM) - Carbono
const carbonVal = document.getElementById("carbon_val");
const carbonBar = document.getElementById("carbon_bar");
const carbonCard = carbonBar.parentElement;

// Elementos da tela (DOM) - Dinheiro
const moneyVal = document.getElementById("money_val");
const moneyBar = document.getElementById("money_bar");
const moneyCard = moneyBar.parentElement;

// Elementos da tela (DOM) - Pesquisa
const researchVal = document.getElementById("research_val");
const researchBar = document.getElementById("research_bar");
const researchCard = researchBar.parentElement;

// Limites dos Recursos
const CARBON_MIN = 350; // 0% na barra (Vitória)
const CARBON_MAX = 550; // 100% na barra (Extinção)
const MONEY_MAX = 5000000000000; // Meta de $5 Trilhões
const RESEARCH_MAX = 1000; // Meta de 1.000 pontos para a fase atual

// Estado Inicial do Jogo
let gameState = {
  carbonPPM: 426,
  money: 20000000000,
  research: 0,
};

// Objeto global para monitorar ganhos/perdas por segundo (Atualizado em skills.js)
window.gameRates = {
  carbon: 0.6666,
  money: 50000000,
  research: 0,
};

// 1. Formatação de números grandes
function formatMoney(value) {
  let isNegative = value < 0;
  let absValue = Math.abs(value);
  let formatted = "";

  if (absValue >= 1e12) formatted = `$${(absValue / 1e12).toFixed(2)}T`;
  else if (absValue >= 1e9) formatted = `$${(absValue / 1e9).toFixed(2)}B`;
  else if (absValue >= 1e6) formatted = `$${(absValue / 1e6).toFixed(2)}M`;
  else formatted = `$${absValue.toLocaleString("pt-BR")}`;

  return isNegative ? `-${formatted}` : formatted;
}

// 2. Formatação de números de pesquisa (Ex: 1.5K pts)
function formatResearch(value) {
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toString();
}

// 3. Função matemática para calcular a porcentagem de perigo
function calculateCarbonPercentage(ppm) {
  let percentage = ((ppm - CARBON_MIN) / (CARBON_MAX - CARBON_MIN)) * 100;
  return Math.max(0, Math.min(100, Math.round(percentage)));
}

// 4. Função que decide a cor e o texto descritivo baseado nos PPMs
function handleCarbonClimateFeedback(ppm) {
  carbonBar.classList.remove("bar-safe", "bar-warning", "bar-danger");

  if (ppm <= 390) {
    carbonBar.classList.add("bar-safe");
    carbonCard.title =
      "Nível Seguro (350-390 PPM): O clima global começa a se estabilizar.";
  } else if (ppm > 390 && ppm <= 460) {
    carbonBar.classList.add("bar-warning");
    carbonCard.title =
      "Alerta Global (391-460 PPM): Níveis perigosos. Ondas de calor e degelo acelerado.";
  } else {
    carbonBar.classList.add("bar-danger");
    carbonCard.title =
      "Risco de Extinção (461-550 PPM): Colapso iminente da biosfera e quebra de safras.";
  }
}

// 5. Função principal que atualiza tudo na tela com indicadores de variação
function updateDisplay() {
  // --- CARBONO ---
  let carbonPercent = calculateCarbonPercentage(gameState.carbonPPM);
  // Carbono descendo (<= 0) é bom -> Verde (#52b788). Subindo (> 0) é ruim -> Vermelho (#ff4d4d)
  let carbonRateText =
    window.gameRates.carbon >= 0
      ? `+${window.gameRates.carbon.toFixed(2)}`
      : `${window.gameRates.carbon.toFixed(2)}`;
  let carbonColor = window.gameRates.carbon <= 0 ? "#52b788" : "#ff4d4d";

  carbonVal.innerHTML = `
    ${gameState.carbonPPM.toFixed(2)} <abbr title="Partes por Milhão">PPM</abbr> (${carbonPercent}%)
    <span style="color: ${carbonColor}; font-weight: bold; margin-left: 8px; font-size: 0.9em;">(${carbonRateText}/s)</span>
  `;
  carbonBar.value = carbonPercent;
  handleCarbonClimateFeedback(gameState.carbonPPM);

  if (worldMapImg) {
    // Transiciona linearmente de 85deg (Verde do Sepia) para -35deg (Vermelho do Sepia)
    let hueAngle = 85 - 120 * (carbonPercent / 100);

    // Suaviza a transição aplicando o filtro CSS em tempo real
    worldMapImg.style.filter = `sepia(0.8) saturate(2.5) hue-rotate(${hueAngle}deg)`;
    worldMapImg.style.transition = "filter 0.5s ease"; // Deixa a mudança sutil e fluida
  }

  // --- DINHEIRO ---
  let moneyPercent = Math.min(
    100,
    Math.round((gameState.money / MONEY_MAX) * 100),
  );
  // Dinheiro subindo é bom -> Verde. Descendo é ruim -> Vermelho.
  let moneyRateText =
    window.gameRates.money >= 0
      ? `+${formatMoney(window.gameRates.money)}`
      : `${formatMoney(window.gameRates.money)}`;
  let moneyColor = window.gameRates.money >= 0 ? "#52b788" : "#ff4d4d";

  moneyVal.innerHTML = `
    ${formatMoney(gameState.money)} / $5T (${moneyPercent}%)
    <span style="color: ${moneyColor}; font-weight: bold; margin-left: 8px; font-size: 0.9em;">(${moneyRateText}/s)</span>
  `;
  moneyBar.value = moneyPercent;
  moneyCard.title = `Orçamento Financiado: ${moneyPercent}% da meta anual de $5 Trilhões para reverter a crise.`;

  // --- PESQUISA ---
  let researchPercent = Math.min(
    100,
    Math.round((gameState.research / RESEARCH_MAX) * 100),
  );
  // Pesquisa subindo é bom -> Verde. Parada -> Cinza (#888).
  let researchRateText =
    window.gameRates.research >= 0
      ? `+${window.gameRates.research}`
      : `${window.gameRates.research}`;
  let researchColor = window.gameRates.research > 0 ? "#52b788" : "#888";

  researchVal.innerHTML = `
    ${formatResearch(gameState.research)} / 1K pts (${researchPercent}%)
    <span style="color: ${researchColor}; font-weight: bold; margin-left: 8px; font-size: 0.9em;">(${researchRateText}/s)</span>
  `;
  researchBar.value = researchPercent;
  researchCard.title = `Prontidão Tecnológica: ${researchPercent}% do conhecimento necessário para a próxima era sustentável.`;
}

// Inicializa o painel assim que a página carrega
updateDisplay();

/* --- SISTEMA DE ÁUDIO (MÚSICA DE FUNDO) --- */

const bgMusic = document.getElementById("bg_music");
const musicToggle = document.getElementById("music_toggle");

// Configura o volume inicial para 25% (agradável para música de fundo)
if (bgMusic) {
  bgMusic.volume = 0.25;
}

// Função para ligar/desligar a música
function toggleMusic() {
  if (!bgMusic) return;

  if (bgMusic.paused) {
    bgMusic
      .play()
      .catch((err) =>
        console.log("Navegador bloqueou o áudio inicial. Aguardando clique."),
      );
    musicToggle.innerText = "🔊 Música: ON";
    musicToggle.classList.remove("muted");
  } else {
    bgMusic.pause();
    musicToggle.innerText = "🔇 Música: OFF";
    musicToggle.classList.add("muted");
  }
}

// Vincula o clique do botão à função de toggle
if (musicToggle) {
  musicToggle.addEventListener("click", toggleMusic);
}

// GATILHO DE SEGURANÇA: Inicia a música no primeiríssimo clique do jogador na página
document.addEventListener(
  "click",
  () => {
    // Só tenta tocar se a música já não estiver rodando e se o botão não foi mutado manualmente
    if (bgMusic && bgMusic.paused && !musicToggle.classList.contains("muted")) {
      bgMusic.play().catch(() => {});
    }
  },
  { once: true },
); // O '{ once: true }' faz esse escutador se autodestruir após o primeiro clique
