/* --- SISTEMA DE ÁRVORE DE HABILIDADES (VIA JSON) --- */

// Variável global local para armazenar os upgrades vindos do JSON
let upgradeDatabase = null;

// 1. FUNÇÃO PARA CARREGAR O JSON E INICIALIZAR A ÁRVORE
async function loadSkillsData() {
  try {
    // Procura o ficheiro na pasta data/
    const response = await fetch("data/skills.json");
    const data = await response.json();

    // Guarda os upgrades na nossa variável de controle
    upgradeDatabase = data.upgrades;

    // Monta a estrutura HTML interna e renderiza os botões
    setupSkillsLayout();
    renderSkillsTree();

    // Inicia o Game Loop passivo após o carregamento dos dados
    startGameLoop();
  } catch (error) {
    console.error("Erro crítico ao carregar o ficheiro skills.json:", error);
  }
}

// 2. MONTAGEM AUTOMÁTICA DO LAYOUT INTERNO (Mantém o index.html limpo)
function setupSkillsLayout() {
  const panel = document.getElementById("skills_panel");
  if (!panel) return;

  panel.innerHTML = `
    <div class="initial-upgrade-container">
        <h3>Geração de Conhecimento Base</h3>
        <div id="container-inicial"></div>
    </div>

    <div class="branches-wrapper">
        <div class="branch-column" id="branch-decarbonization">
            <h2>🌿 Descarbonização</h2>
            <div class="upgrades-list" id="list-decarbonization"></div>
        </div>

        <div class="branch-column" id="branch-green_economy">
            <h2>💰 Economia Verde</h2>
            <div class="upgrades-list" id="list-green_economy"></div>
        </div>

        <div class="branch-column" id="branch-research_centers">
            <h2>🔬 Centros de Pesquisa</h2>
            <div class="upgrades-list" id="list-research_centers"></div>
        </div>
    </div>
  `;
}

// 3. AUXILIARES PARA MAPEAR AS MOEDAS DO JSON COM O STATE.JS
function getCurrencyValue(currencyName) {
  if (currencyName === "money") return gameState.money;
  if (currencyName === "research_points") return gameState.research; // Mapeia research_points -> research
  return 0;
}

function subtractCurrencyValue(currencyName, amount) {
  if (currencyName === "money") gameState.money -= amount;
  if (currencyName === "research_points") gameState.research -= amount;
}

// 4. CÁLCULO DE CUSTOS DINÂMICOS (COM DESCONTOS DO SEU PROPRIO JSON)
function getCalculatedCost(upgrade) {
  let finalCost = upgrade.repeatable
    ? upgrade.base_cost *
      Math.pow(upgrade.cost_increase_factor, upgrade.current_level)
    : upgrade.cost;

  if (!upgrade.repeatable) {
    // Desconto de 25% das Células de Perovskita (Aplica a Money e agora também a Research Points!)
    if (upgradeDatabase["celulas_perovskita"]?.purchased) {
      finalCost *=
        1 - upgradeDatabase["celulas_perovskita"].effect.global_discount;
    }
    // Desconto de 20% do Desinvestimento (apenas ramos de Carbono e Pesquisa)
    if (
      upgradeDatabase["desinvestimento"]?.purchased &&
      (upgrade.branch === "decarbonization" ||
        upgrade.branch === "research_centers")
    ) {
      finalCost *= 1 - upgradeDatabase["desinvestimento"].effect.green_discount;
    }
  }

  // Se a moeda for Pontos de Pesquisa, arredonda para evitar custos decimais quebrados na árvore
  if (upgrade.cost_currency === "research_points") {
    return Math.round(finalCost);
  }

  return finalCost;
}

// 5. RENDERIZAÇÃO DINÂMICA DOS BOTÕES
function renderSkillsTree() {
  if (!upgradeDatabase) return;

  const containerInicial = document.getElementById("container-inicial");
  const listDecarbonization = document.getElementById("list-decarbonization");
  const listGreenEconomy = document.getElementById("list-green_economy");
  const listResearchCenters = document.getElementById("list-research_centers");

  // Limpa os botões anteriores antes de redesenhar
  containerInicial.innerHTML = "";
  listDecarbonization.innerHTML = "";
  listGreenEconomy.innerHTML = "";
  listResearchCenters.innerHTML = "";

  for (let key in upgradeDatabase) {
    const upgrade = upgradeDatabase[key];
    const actualCost = getCalculatedCost(upgrade);

    const btn = document.createElement("button");
    btn.className = "upgrade-btn";
    if (upgrade.purchased) btn.classList.add("purchased");

    let costText = "";
    if (upgrade.purchased) {
      costText = "ADQUIRIDO";
    } else if (upgrade.repeatable) {
      costText = `Nv. ${upgrade.current_level} | Custo: ${formatMoney(actualCost)}`;
    } else {
      costText =
        upgrade.cost_currency === "money"
          ? `Custo: ${formatMoney(actualCost)}`
          : `Custo: ${formatResearch(actualCost)} PP`;
    }

    btn.innerHTML = `
      <div class="upgrade-name">${upgrade.name}</div>
      <div class="upgrade-desc">${upgrade.description}</div>
      <div class="upgrade-cost ${upgrade.cost_currency === "money" ? "text-money" : "text-research"}">${costText}</div>
    `;

    // Lógica de Pré-requisitos (Bloqueio)
    let isLocked = false;
    if (upgrade.requires) {
      const parent = upgradeDatabase[upgrade.requires];
      if (
        (parent.repeatable && parent.current_level === 0) ||
        (!parent.repeatable && !parent.purchased)
      ) {
        isLocked = true;
      }
    }

    // Bloqueio se o jogador não tiver saldo suficiente
    if (getCurrencyValue(upgrade.cost_currency) < actualCost) {
      isLocked = true;
    }

    if (isLocked && !upgrade.purchased) btn.disabled = true;
    if (upgrade.purchased) btn.disabled = true;

    btn.onclick = () => buyUpgrade(upgrade.id);

    // Injeta na coluna correspondente do layout dinâmico
    if (upgrade.id === "init_escopos") {
      containerInicial.appendChild(btn);
    } else {
      document.getElementById(`list-${upgrade.branch}`).appendChild(btn);
    }
  }
}

// 6. SISTEMA DE COMPRA
function buyUpgrade(id) {
  if (!upgradeDatabase) return;

  const upgrade = upgradeDatabase[id];
  const cost = getCalculatedCost(upgrade);
  const currency = upgrade.cost_currency;

  if (getCurrencyValue(currency) >= cost) {
    subtractCurrencyValue(currency, cost);

    if (upgrade.repeatable) {
      upgrade.current_level++;

      // Recompensa de Pesquisa escalada por bónus científicos do JSON
      let ppReward = upgrade.reward_per_level.research_points;
      if (upgradeDatabase["gemeos_digitais"]?.purchased)
        ppReward *=
          upgradeDatabase["gemeos_digitais"].effect.research_multiplier;
      else if (upgradeDatabase["portao_bolsas_pesquisa"]?.purchased)
        ppReward *=
          upgradeDatabase["portao_bolsas_pesquisa"].effect.research_multiplier;

      gameState.research += ppReward;
    } else {
      upgrade.purchased = true;
      if (upgrade.effect?.instant_cash) {
        gameState.money += upgrade.effect.instant_cash;
      }
    }

    updateDisplay(); // Atualiza as barras de recursos nativas do seu state.js
    renderSkillsTree(); // Redesenha a árvore com os novos status
  }
}

// 7. GAME LOOP CENTRAL DE CÁLCULO PASSIVO (1 SEGUNDO)
function startGameLoop() {
  // Guardamos o ID do loop numa variável global para podermos pará-lo no fim do jogo
  window.gameInterval = setInterval(() => {
    if (!upgradeDatabase) return;

    // --- LÓGICA DO CARBONO ---
    let baseCarbonIncrease = 0.6666;
    let playerReduction = 0;

    if (upgradeDatabase["portao_reflorestamento"]?.purchased)
      playerReduction +=
        upgradeDatabase["portao_reflorestamento"].effect.carbon_ps;
    if (upgradeDatabase["biometano_industrial"]?.purchased)
      playerReduction +=
        upgradeDatabase["biometano_industrial"].effect.carbon_ps;
    if (upgradeDatabase["eletrificacao_frotas"]?.purchased)
      playerReduction +=
        upgradeDatabase["eletrificacao_frotas"].effect.carbon_ps;
    if (upgradeDatabase["captura_direta_dac"]?.purchased) {
      let dacEffect = upgradeDatabase["captura_direta_dac"].effect.carbon_ps;
      if (upgradeDatabase["fusao_nuclear"]?.purchased)
        dacEffect *=
          upgradeDatabase["fusao_nuclear"].effect.carbon_efficiency_multiplier;
      playerReduction += dacEffect;
    }

    // Alimenta a taxa de carbono global e aplica no estado
    window.gameRates.carbon = baseCarbonIncrease - playerReduction;
    gameState.carbonPPM += window.gameRates.carbon;

    // --- VERIFICAÇÃO DE VITÓRIA OU DERROTA ---

    // 1. Condição de Vitória: Carbono atingiu o mínimo seguro (350 PPM ou menos)
    if (gameState.carbonPPM <= CARBON_MIN) {
      gameState.carbonPPM = CARBON_MIN; // Força o limite visual correto
      window.gameRates.carbon = 0;
      window.gameRates.money = 0;
      updateDisplay(); // Atualiza o ecrã para mostrar 0% de perigo

      clearInterval(window.gameInterval); // Para os ganhos passivos do jogo

      setTimeout(() => {
        alert(
          "🌍 VITÓRIA GLOBAL! 🎉\n\nParabéns! Conseguiste reduzir os níveis de carbono para 350 PPM. A atmosfera do planeta foi estabilizada, revertendo a crise climática e garantindo o futuro das próximas gerações!",
        );
      }, 100);
      return;
    }

    // 2. Condição de Derrota: Carbono atingiu o limite crítico (550 PPM ou mais)
    if (gameState.carbonPPM >= CARBON_MAX) {
      gameState.carbonPPM = CARBON_MAX; // Força o limite visual correto
      window.gameRates.carbon = 0;
      window.gameRates.money = 0;
      updateDisplay(); // Atualiza o ecrã para mostrar 100% de perigo

      clearInterval(window.gameInterval); // Para os ganhos passivos do jogo

      setTimeout(() => {
        alert(
          "💥 FIM DE JOGO (DERROTA) ⚠️\n\nO nível de carbono na atmosfera atingiu os 550 PPM. O aquecimento global tornou-se irreversível, desencadeando um colapso em cadeia nos ecossistemas e inviabilizando a vida humana moderna. O planeta colapsou.",
        );
      }, 100);
      return;
    }

    // --- LÓGICA DO DINHEIRO PASSIVO ---
    let passiveIncome = 50000000;
    if (upgradeDatabase["portao_auditoria"]?.purchased)
      passiveIncome *=
        upgradeDatabase["portao_auditoria"].effect.money_multiplier;
    if (upgradeDatabase["taxa_carbono"]?.purchased) {
      passiveIncome +=
        gameState.carbonPPM *
        upgradeDatabase["taxa_carbono"].effect.money_from_ppm *
        100000000;
    }

    // Penalidade de Manutenção
    let maintenancePenalty = 0;
    if (
      upgradeDatabase["eletrificacao_frotas"]?.purchased &&
      !upgradeDatabase["fusao_nuclear"]?.purchased
    ) {
      maintenancePenalty +=
        upgradeDatabase["eletrificacao_frotas"].effect.money_ps_penalty;
    }

    // Alimenta a taxa de dinheiro global e aplica no estado
    window.gameRates.money = passiveIncome - maintenancePenalty;
    gameState.money += window.gameRates.money;

    if (gameState.money < 0) gameState.money = 0;
    if (gameState.money > MONEY_MAX) gameState.money = MONEY_MAX;

    // Monitoramento de pesquisa passiva
    window.gameRates.research = 0;

    // Sincroniza as atualizações na tela se o jogo continuar rodando
    updateDisplay();
    renderSkillsTree();
  }, 1000);
}

// Executa a inicialização do Fetch ao ler o script
loadSkillsData();
