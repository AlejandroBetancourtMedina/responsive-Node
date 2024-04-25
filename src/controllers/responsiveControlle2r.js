const playwright = require('playwright');

const checkResponsiveWithPlaywright = async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  let browser;
  try {
    // Lanzar el navegador con Playwright
    browser = await playwright.chromium.launch();
    const context = await browser.newContext(); // Contexto para el navegador
    const page = await context.newPage(); // Nueva página en el contexto

    const viewports = [
      { width: 1920, height: 1080 }, // Pantalla de escritorio
      { width: 768, height: 1024 },  // Tablet
      { width: 375, height: 667 },   // Móvil
    ];

    let isResponsive = true;
    let failedViewport = null;

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto(url, { waitUntil: 'domcontentloaded' });

      // Realiza las comprobaciones necesarias para determinar si el sitio es responsivo
      // Ejemplo: comprobar si un elemento específico está presente o no
      const element = await page.$('.element-class');
      if (!element) {
        isResponsive = false;
        failedViewport = viewport;
        break;
      }
    }

    // Devolver los resultados
    res.json({ url, isResponsive, failedViewport });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  } finally {
    // Asegurarse de que el navegador se cierre correctamente
    if (browser) {
      await browser.close();
    }
  }
};

module.exports = { checkResponsiveWithPlaywright };