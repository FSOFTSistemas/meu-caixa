const dataSelecionada = document.getElementById('dataSelecionada');
const btnCarregar = document.getElementById('btnCarregar');
const corpoTabela = document.getElementById('corpoTabela');
const totalEntradas = document.getElementById('totalEntradas');
const totalSaidas = document.getElementById('totalSaidas');
const totalResultado = document.getElementById('totalResultado');
const mensagem = document.getElementById('mensagem');

// Verificar login ao carregar
window.addEventListener('load', async () => {
  const logado = await window.api.verificarLogin();
  if (!logado) {
    window.api.navegar('login');
  }
  
  // Definir data padrão como hoje
  const hoje = new Date().toISOString().split('T')[0];
  dataSelecionada.value = hoje;
});

// Botão Carregar
btnCarregar.addEventListener('click', carregarVendas);

// Carregar vendas ao mudar data
dataSelecionada.addEventListener('change', carregarVendas);

async function carregarVendas() {
  const data = dataSelecionada.value;
  
  if (!data) {
    mensagem.textContent = 'Selecione uma data';
    mensagem.className = 'mensagem erro';
    return;
  }
  
  try {
    const resultado = await window.api.obterVendasDia(data);
    
    if (resultado.sucesso) {
      const vendas = resultado.vendas;
      
      if (vendas.length === 0) {
        corpoTabela.innerHTML = '<tr><td colspan="3" class="sem-dados">Nenhuma venda registrada</td></tr>';
        totalEntradas.textContent = 'R$ 0,00';
        totalSaidas.textContent = 'R$ 0,00';
        totalResultado.textContent = 'R$ 0,00';
        return;
      }
      
      // Calcular totais
      let somaEntradas = 0;
      let somaSaidas = 0;
      
      vendas.forEach(venda => {
        if (venda.tipo === 'entrada') {
          somaEntradas += venda.valor;
        } else {
          somaSaidas += venda.valor;
        }
      });
      
      const resultado_final = somaEntradas - somaSaidas;
      
      // Atualizar totais
      totalEntradas.textContent = 'R$ ' + somaEntradas.toFixed(2).replace('.', ',');
      totalSaidas.textContent = 'R$ ' + somaSaidas.toFixed(2).replace('.', ',');
      totalResultado.textContent = 'R$ ' + resultado_final.toFixed(2).replace('.', ',');
      
      // Atualizar cor do resultado
      const elementoResultado = document.querySelector('.resumo-item.resultado');
      if (resultado_final >= 0) {
        elementoResultado.classList.remove('negativo');
      } else {
        elementoResultado.classList.add('negativo');
      }
      
      // Preencher tabela
      corpoTabela.innerHTML = '';
      vendas.forEach(venda => {
        const linha = document.createElement('tr');
        linha.className = venda.tipo;
        
        linha.innerHTML = `
          <td>${venda.hora}</td>
          <td>${venda.tipo === 'entrada' ? '✓ Entrada' : '✗ Saída'}</td>
          <td>R$ ${venda.valor.toFixed(2).replace('.', ',')}</td>
        `;
        
        corpoTabela.appendChild(linha);
      });
      
      mensagem.textContent = '';
    } else {
      mensagem.textContent = resultado.mensagem || 'Erro ao carregar vendas';
      mensagem.className = 'mensagem erro';
    }
  } catch (erro) {
    mensagem.textContent = 'Erro: ' + erro.message;
    mensagem.className = 'mensagem erro';
  }
}

// Botão Imprimir
document.getElementById('btnImprimir').addEventListener('click', () => {
  window.print();
});

// Botão Voltar
document.getElementById('btnVoltar').addEventListener('click', () => {
  window.api.navegar('calculadora');
});
