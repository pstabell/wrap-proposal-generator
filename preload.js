const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveProposal: (data) => ipcRenderer.invoke('save-proposal', data),
  loadProposal: () => ipcRenderer.invoke('load-proposal'),
  generatePDF: (html, filename) => ipcRenderer.invoke('generate-pdf', html, filename)
});
