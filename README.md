# 🌍 Carbon Decremental

> **Um jogo incremental com lógica invertida:** O teu objetivo não é fazer os números crescerem infinitamente, mas sim mitigar a maior crise climática da história humana antes que o tempo se esgote.

![Status do Jogo](https://img.shields.io/badge/Status-Em_Desenvolvimento-beta?style=for-the-badge&color=52b788)
![Tech](https://img.shields.io/badge/Made_with-HTML%20%7C%20CSS%20%7C%20JS-blue?style=for-the-badge)

---

## 🕹️ O Jogo - [Link para jogar](https://carbon-decremental-pearl.vercel.app/)

Em **Carbon Decremental**, tu assumes o controlo dos fundos globais e da comunidade científica para combater o aquecimento global. O jogo começa num cenário alarmante de **426 PPM** (Partes por Milhão) de CO₂ na atmosfera. 

Diferente dos jogos *idle* tradicionais, aqui o relógio corre contra ti. Se o carbono acumular e atingir os **550 PPM**, a biosfera colapsa e é **Fim de Jogo**. A tua missão é investir estrategicamente em tecnologias verdes para estabilizar o planeta nos **350 PPM**.

### 🌟 Funcionalidades Principais
* **Árvore de Tecnologias Dinâmica:** Upgrades modulares carregados diretamente via JSON, divididos em três vertentes essenciais: *Descarbonização*, *Economia Verde* e *Centros de Pesquisa*.
* **Feedback Visual em Tempo Real:** O mapa-múndi altera a sua coloração dinamicamente graças a filtros CSS customizados. O mundo passa de um tom verde tecnológico (estável) para um vermelho alarmante conforme a poluição sufoca o planeta.
* **Trilha Sonora Imersiva:** Música ambiente em loop integrada nativamente com controlos para o utilizador (*Mute/Unmute*) e contorno de bloqueio de autoplay dos navegadores.

---

## 📊 Condições de Vitória e Derrota

| Estado | Gatilho | Consequência |
| :--- | :--- | :--- |
| **🏆 Vitória** | Carbono $\le$ **350 PPM** | Crise revertida! A atmosfera é estabilizada para as próximas gerações. |
| **💥 Derrota** | Carbono $\ge$ **550 PPM** | Colapso climático irreversível. Fim de jogo. |

---

## 🛠️ Tecnologias Utilizadas

O projeto foi construído do zero focando-se em performance, modularidade e manipulação limpa da árvore do DOM:
* **HTML5:** Estrutura semântica e acessível.
* **CSS3:** Estilização com Grid, Flexbox e filtros gráficos dinâmicos (`sepia`, `saturate`, `hue-rotate`).
* **JavaScript (ES6+):** Arquitetura orientada a estados separados (`state.js`, `skills.js`) e consumo assíncrono de dados (`fetch`).

---

## 🚀 Como Executar Localmente

Como o jogo utiliza requisições assíncronas para carregar a árvore de habilidades (`data/skills.json`), **não podes abrir o ficheiro `index.html` diretamente no navegador clicando duas vezes**. Precisas de um servidor local simples.

1. **Clona o repositório:**
   ```bash
   git clone [https://github.com/TEU_UTILIZADOR/carbon-decremental.git](https://github.com/TEU_UTILIZADOR/carbon-decremental.git)
   cd carbon-decremental
