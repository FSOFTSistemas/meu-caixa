let displayValue = '0';
let tipoAtual = 'entrada';
const display = document.getElementById('display');
const mensagem = document.getElementById('mensagem');

// Verificar login ao carregar
window.addEventListener('load', async () => {
  const logado = await window.api.verificarLogin();
  if (!logado) {
    window.api.navegar('login');
  }
});

// Botões de números
document.querySelectorAll('.btn-numero').forEach(btn => {
  btn.addEventListener('click', () => {
    const numero = btn.dataset.numero;
    
    if (numero === '.') {
      if (!displayValue.includes('.')) {
        displayValue += numero;
      }
    } else {
      if (displayValue === '0') {
        displayValue = numero;
      } else {
        displayValue += numero;
      }
    }
    
    atualizarDisplay();
  });
});

// Botão limpar
document.getElementById('btnLimpar').addEventListener('click', () => {
  displayValue = '0';
  atualizarDisplay();
  mensagem.textContent = '';
});

// Seletor de tipo
document.getElementById('btnEntrada').addEventListener('click', () => {
  tipoAtual = 'entrada';
  document.getElementById('btnEntrada').classList.add('ativo');
  document.getElementById('btnSaida').classList.remove('ativo');
});

document.getElementById('btnSaida').addEventListener('click', () => {
  tipoAtual = 'saida';
  document.getElementById('btnSaida').classList.add('ativo');
  document.getElementById('btnEntrada').classList.remove('ativo');
});

// Botão OK - Salvar venda
document.getElementById('btnOK').addEventListener('click', async () => {
  const valor = parseFloat(displayValue);
  
  if (isNaN(valor) || valor <= 0) {
    mensagem.textContent = 'Digite um valor válido!';
    mensagem.className = 'mensagem erro';
    return;
  }
  
  const agora = new Date();
  const data = agora.toISOString().split('T')[0]; // YYYY-MM-DD
  const hora = agora.toTimeString().split(' ')[0]; // HH:MM:SS
  
  try {
    const resultado = await window.api.salvarVenda(valor, tipoAtual, data, hora);
    
    if (resultado.sucesso) {
      mensagem.textContent = `Venda de R$ ${valor.toFixed(2)} (${tipoAtual}) salva com sucesso!`;
      mensagem.className = 'mensagem sucesso';
      
      displayValue = '0';
      atualizarDisplay();
      
      setTimeout(() => {
        mensagem.textContent = '';
      }, 3000);
    } else {
      mensagem.textContent = resultado.mensagem;
      mensagem.className = 'mensagem erro';
    }
  } catch (erro) {
    mensagem.textContent = 'Erro: ' + erro.message;
    mensagem.className = 'mensagem erro';
  }
});

// Botão Relatório
document.getElementById('btnRelatorio').addEventListener('click', () => {
  window.api.navegar('relatorio');
});

// Botão Logout
document.getElementById('btnLogout').addEventListener('click', async () => {
  await window.api.logout();
  window.api.navegar('login');
});

// Atualizar display
function atualizarDisplay() {
  display.textContent = displayValue;
}

// Inicializar
atualizarDisplay();
