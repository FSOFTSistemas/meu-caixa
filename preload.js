const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld("api", {
    
    login: (usuario, senha) =>
        ipcRenderer.invoke("login", usuario, senha),

    verificarLogin: () =>
        ipcRenderer.invoke("verificar-login"),

    logout: () =>
        ipcRenderer.invoke("logout"),

    salvarVenda: (valor, tipo , data, hora, formaPagamentoAtual) =>
        ipcRenderer.invoke("salvar-venda", valor, tipo,data, hora, formaPagamentoAtual ),

    obterVendasDia: (data) =>
        ipcRenderer.invoke("obter-vendas-dia", data),

    navegar: (pagina) =>
        ipcRenderer.invoke("navegar", pagina),


  removerLancamento: (id) => ipcRenderer.send("remover-lancamento", id),
  
  lancamentoRemovido: (callback) => ipcRenderer.on("lancamento-removido", callback)

});
