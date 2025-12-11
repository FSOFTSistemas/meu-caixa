const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const fs = require('fs');

let mainWindow;
let db;
let usuarioLogado = null;

// Inicializar banco de dados
function inicializarBanco() {
  const dbPath = path.join(__dirname, 'database', 'banco.sqlite');
  
  // Criar diretório se não existir
  if (!fs.existsSync(path.join(__dirname, 'database'))) {
    fs.mkdirSync(path.join(__dirname, 'database'), { recursive: true });
  }
  
  db = new Database(dbPath);
  
  // Criar tabelas
  db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario TEXT NOT NULL UNIQUE,
      senha_hash TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS vendas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      valor REAL NOT NULL,
      tipo TEXT NOT NULL,
      data TEXT NOT NULL,
      hora TEXT NOT NULL
    );
  `);
  
  // Criar usuário padrão se não existir
  try {
    const senhaHash = bcrypt.hashSync('123', 10);
    db.prepare('INSERT INTO usuarios (usuario, senha_hash) VALUES (?, ?)').run('admin', senhaHash);
  } catch (e) {
    // Usuário já existe
  }
}

// Criar janela principal
function criarJanela() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false
    }
  });
  
  mainWindow.loadFile(path.join(__dirname, 'src', 'login.html'));
  mainWindow.webContents.openDevTools(); // Remover em produção
}

// Evento de app pronto
app.on('ready', () => {
  inicializarBanco();
  criarJanela();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    criarJanela();
  }
});

// IPC: Login
ipcMain.handle('login', async (event, usuario, senha) => {
  try {
    const user = db.prepare('SELECT * FROM usuarios WHERE usuario = ?').get(usuario);
    
    if (!user) {
      return { sucesso: false, mensagem: 'Usuário não encontrado' };
    }
    
    const senhaValida = bcrypt.compareSync(senha, user.senha_hash);
    
    if (!senhaValida) {
      return { sucesso: false, mensagem: 'Senha incorreta' };
    }
    
    usuarioLogado = usuario;
    return { sucesso: true, mensagem: 'Login realizado com sucesso' };
  } catch (erro) {
    return { sucesso: false, mensagem: 'Erro ao fazer login: ' + erro.message };
  }
});

// IPC: Verificar se está logado
ipcMain.handle('verificar-login', async (event) => {
  return usuarioLogado !== null;
});

// IPC: Logout
ipcMain.handle('logout', async (event) => {
  usuarioLogado = null;
  return true;
});

// IPC: Salvar venda
ipcMain.handle('salvar-venda', async (event, valor, tipo, data, hora) => {
  if (!usuarioLogado) {
    return { sucesso: false, mensagem: 'Não autorizado' };
  }
  
  try {
    db.prepare('INSERT INTO vendas (valor, tipo, data, hora) VALUES (?, ?, ?, ?)').run(valor, tipo, data, hora);
    return { sucesso: true, mensagem: 'Venda salva com sucesso' };
  } catch (erro) {
    return { sucesso: false, mensagem: 'Erro ao salvar venda: ' + erro.message };
  }
});

// IPC: Obter vendas do dia
ipcMain.handle('obter-vendas-dia', async (event, data) => {
  if (!usuarioLogado) {
    return { sucesso: false, vendas: [] };
  }
  
  try {
    const vendas = db.prepare('SELECT * FROM vendas WHERE data = ? ORDER BY hora DESC').all(data);
    return { sucesso: true, vendas };
  } catch (erro) {
    return { sucesso: false, vendas: [], mensagem: erro.message };
  }
});

// IPC: Navegar para página
ipcMain.handle('navegar', async (event, pagina) => {
  mainWindow.loadFile(path.join(__dirname, 'src', pagina + '.html'));
  return true;
});
