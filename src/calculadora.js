let valorDigitado = "";         // Armazena apenas números
let tipoAtual = 'entrada';
let formaPagamentoAtual
const display = document.getElementById('display');
const mensagem = document.getElementById('mensagem');

// Verificar login ao carregar
window.addEventListener('load', async () => {
  const logado = await window.api.verificarLogin();
  if (!logado) {
    window.api.navegar('login');
  }
});

// ----------------------------
// Função para formatar moeda
// ----------------------------
function formatarMoeda(valor) {
  const numero = Number(valor) / 100;
  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function atualizarDisplay() {
  if (valorDigitado === "") {
    display.textContent = "R$ 0,00";
  } else {
    display.textContent = formatarMoeda(valorDigitado);
  }

  // Remove animação para reiniciar
  display.classList.remove("display-animacao");

  // Reativa animação (pequeno delay de 1ms para reinicializar)
  setTimeout(() => {
    display.classList.add("display-animacao");
  }, 1);
}

// ----------------------------
// Botões de números
// ----------------------------
document.querySelectorAll('.btn-numero').forEach(btn => {
  btn.addEventListener('click', () => {
    const numero = btn.dataset.numero;

    if (numero === ".") return; // ignora ponto
    if (valorDigitado.length >= 12) return; // limite

    valorDigitado += numero;
    atualizarDisplay();
  });
});

// ----------------------------
// LIMPAR
// ----------------------------
document.getElementById('btnLimpar').addEventListener('click', () => {
  valorDigitado = "";
  atualizarDisplay();
  mensagem.textContent = '';
});

// ----------------------------
// ENTRADA / SAÍDA
// ----------------------------
document.getElementById('btnEntrada').addEventListener('click', () => {
  tipoAtual = 'entrada';
  formaPagamentoAtual = null
  document.getElementById('btnEntrada').classList.add('ativo');
  document.getElementById('btnSaida').classList.remove('ativo');
  document.getElementById('btnPix').classList.remove('ativo');
});

document.getElementById('btnSaida').addEventListener('click', () => {
  tipoAtual = 'saida';
  formaPagamentoAtual = null

  document.getElementById('btnSaida').classList.add('ativo');
  document.getElementById('btnEntrada').classList.remove('ativo');
  document.getElementById('btnPix').classList.remove('ativo');
});

document.getElementById('btnPix').addEventListener('click', () => {
  tipoAtual = 'entrada'
  formaPagamentoAtual = 'pix';

  document.getElementById('btnPix').classList.add('ativo')
  document.getElementById('btnSaida').classList.remove('ativo')
  document.getElementById('btnEntrada').classList.remove('ativo');
});
// ----------------------------
// SALVAR (OK)
// ----------------------------
document.getElementById('btnOK').addEventListener('click', async () => {
  if (valorDigitado === "") {
    mensagem.textContent = "Digite um valor válido!";
    mensagem.className = "mensagem erro";
    return;
  }

  const valor = Number(valorDigitado) / 100;

  if (valor <= 0) {
    mensagem.textContent = "Valor inválido!";
    mensagem.className = "mensagem erro";
    return;
  }

  const agora = new Date();
  const data = agora.toISOString().split("T")[0];
  const hora = agora.toTimeString().split(" ")[0];

  try {

    if (tipoAtual === 'entrada' && !formaPagamentoAtual) {
      formaPagamentoAtual = 'dinheiro';
    }

    if (tipoAtual === 'saida') {
      formaPagamentoAtual = 'saida';
    }

    const resultado = await window.api.salvarVenda(valor, tipoAtual, formaPagamentoAtual, data, hora);

    if (resultado.sucesso) {
      mensagem.textContent = `Valor ${formatarMoeda(valorDigitado)} (${tipoAtual}) salvo!`;
      mensagem.className = "mensagem sucesso";

      valorDigitado = "";
      atualizarDisplay();

      setTimeout(() => mensagem.textContent = "", 3000);
    } else {
      mensagem.textContent = resultado.mensagem;
      mensagem.className = "mensagem erro";
    }
  } catch (erro) {
    mensagem.textContent = "Erro: " + erro.message;
    mensagem.className = "mensagem erro";
  }
});

// ----------------------------
// NAVEGAR RELATÓRIO & LOGOUT
// ----------------------------
document.getElementById('btnRelatorio')?.addEventListener('click', () => {
  window.api.navegar('relatorio');
});

document.getElementById('btnLogout')?.addEventListener('click', async () => {
  await window.api.logout();
  window.api.navegar('login');
});

// ----------------------------
// SUPORTE AO TECLADO FÍSICO
// ----------------------------
document.addEventListener("keydown", (e) => {
  // Atalho: "+" para Entrada, "-" para Saída
  if (e.key === "+" || e.key === "=") {   // alguns teclados enviam "=" no lugar de "+"
    tipoAtual = "entrada";
    formaPagamentoAtual = null;
    document.getElementById("btnEntrada").classList.add("ativo");
    document.getElementById("btnSaida").classList.remove("ativo");
    return; // evita cair nos outros atalhos
  }

  if (e.key === "-") {
    tipoAtual = "saida";
    formaPagamentoAtual = null;
    document.getElementById("btnSaida").classList.add("ativo");
    document.getElementById("btnEntrada").classList.remove("ativo");
    return;
  }

  if (e.key >= "0" && e.key <= "9") {
    if (valorDigitado.length < 12) {
      valorDigitado += e.key;
      atualizarDisplay();
    }
  }

  if (e.key === "Backspace") {
    valorDigitado = valorDigitado.slice(0, -1);
    atualizarDisplay();
  }

  if (e.key === "Enter") {
    document.getElementById("btnOK").click();
  }

  if (e.key === "Escape") {
    valorDigitado = "";
    atualizarDisplay();
  }
});

// ----------------------------
atualizarDisplay();
// ----------------------------