const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Handle save proposal
ipcMain.handle('save-proposal', async (event, proposalData) => {
  try {
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Save WRAP Proposal Data',
      defaultPath: `${proposalData.clientInfo.lastName}_WRAP_${new Date().toISOString().split('T')[0]}.json`,
      filters: [{ name: 'JSON Files', extensions: ['json'] }]
    });

    if (filePath) {
      fs.writeFileSync(filePath, JSON.stringify(proposalData, null, 2));
      return { success: true, path: filePath };
    }
    return { success: false, message: 'Save cancelled' };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

// Handle load proposal
ipcMain.handle('load-proposal', async () => {
  try {
    const { filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: 'Load WRAP Proposal Data',
      filters: [{ name: 'JSON Files', extensions: ['json'] }],
      properties: ['openFile']
    });

    if (filePaths && filePaths.length > 0) {
      const data = fs.readFileSync(filePaths[0], 'utf-8');
      return { success: true, data: JSON.parse(data) };
    }
    return { success: false, message: 'Load cancelled' };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

// Handle PDF generation
ipcMain.handle('generate-pdf', async (event, htmlContent, filename) => {
  try {
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Save WRAP Proposal PDF',
      defaultPath: filename,
      filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
    });

    if (!filePath) {
      return { success: false, message: 'Export cancelled' };
    }

    // Write HTML to temp file
    const tempHtmlPath = path.join(app.getPath('temp'), 'proposal.html');
    fs.writeFileSync(tempHtmlPath, htmlContent);

    // Use Puppeteer to generate PDF
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(`file://${tempHtmlPath}`, { waitUntil: 'networkidle0' });
    
    await page.pdf({
      path: filePath,
      format: 'Letter',
      printBackground: true,
      margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' }
    });

    await browser.close();
    fs.unlinkSync(tempHtmlPath);

    return { success: true, path: filePath };
  } catch (error) {
    return { success: false, message: error.message };
  }
});
