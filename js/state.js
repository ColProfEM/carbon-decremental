/* --- GERENCIAMENTO DE RECURSOS (MUNDO) --- */

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
  carbonPPM: 496,
  money: 0,
  research: 450,
};

// 1. Formatação de números grandes
function formatMoney(value) {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toLocaleString("pt-BR")}`;
}

// 2. Formatação de números de pesquisa (Ex: 1.5K pts)
function formatResearch(value) {
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toString();
}

// 3. Função matemática para calcular a porcentagem de perigo
function calculateCarbonPercentage(ppm) {
  let percentage = ((ppm - CARBON_MIN) / (CARBON_MAX - CARBON_MIN)) * 100;
  // Limita o resultado entre 0 e 100 e arredonda o número
  return Math.max(0, Math.min(100, Math.round(percentage)));
}

// 4. Função que decide a cor e o texto descritivo baseado nos PPMs
function handleCarbonClimateFeedback(ppm) {
  // Limpa as classes de cor que estavam antes
  carbonBar.classList.remove("bar-safe", "bar-warning", "bar-danger");

  if (ppm <= 390) {
    // Verde
    carbonBar.classList.add("bar-safe");
    carbonCard.title =
      "Nível Seguro (350-390 PPM): O clima global começa a se estabilizar.";
  } else if (ppm > 390 && ppm <= 460) {
    // Amarelo
    carbonBar.classList.add("bar-warning");
    carbonCard.title =
      "Alerta Global (391-460 PPM): Níveis perigosos. Ondas de calor e degelo acelerado.";
  } else {
    // Vermelho
    carbonBar.classList.add("bar-danger");
    carbonCard.title =
      "Risco de Extinção (461-550 PPM): Colapso iminente da biosfera e quebra de safras.";
  }
}

// 5. Função principal que atualiza tudo na tela
function updateDisplay() {
  // Carbono
  let carbonPercent = calculateCarbonPercentage(gameState.carbonPPM);
  carbonVal.innerHTML = `${gameState.carbonPPM} <abbr title="Partes por Milhão">PPM</abbr> (${carbonPercent}%)`;
  carbonBar.value = carbonPercent;
  handleCarbonClimateFeedback(gameState.carbonPPM);

  // Dinheiro
  let moneyPercent = Math.min(
    100,
    Math.round((gameState.money / MONEY_MAX) * 100),
  );
  moneyVal.innerText = `${formatMoney(gameState.money)} / $5T (${moneyPercent}%)`;
  moneyBar.value = moneyPercent;
  moneyCard.title = `Orçamento Financiado: ${moneyPercent}% da meta anual de $5 Trilhões para reverter a crise.`;

  // Pesquisa
  let researchPercent = Math.min(
    100,
    Math.round((gameState.research / RESEARCH_MAX) * 100),
  );
  researchVal.innerText = `${formatResearch(gameState.research)} / 1K pts (${researchPercent}%)`;
  researchBar.value = researchPercent;
  researchCard.title = `Prontidão Tecnológica: ${researchPercent}% do conhecimento necessário para a próxima era sustentável.`;
}

// Inicializa o painel assim que a página carrega
updateDisplay();
