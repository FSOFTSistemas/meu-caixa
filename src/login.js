document.getElementById('formLogin').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const usuario = document.getElementById('usuario').value;
  const senha = document.getElementById('senha').value;
  const mensagem = document.getElementById('mensagem');
  
  mensagem.textContent = 'Autenticando...';
  mensagem.className = 'mensagem info';
  
  try {
    const resultado = await window.api.login(usuario, senha);
    
    if (resultado.sucesso) {
      mensagem.textContent = 'Login realizado com sucesso!';
      mensagem.className = 'mensagem sucesso';
      
      setTimeout(() => {
        window.api.navegar('calculadora');
      }, 500);
    } else {
      mensagem.textContent = resultado.mensagem;
      mensagem.className = 'mensagem erro';
    }
  } catch (erro) {
    mensagem.textContent = 'Erro: ' + erro.message;
    mensagem.className = 'mensagem erro';
  }
});

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("usuario").focus();
});
