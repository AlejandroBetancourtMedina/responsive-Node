const puppeteer = require('puppeteer');

const checkResponsive = async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  let browser;
  try {
    browser = await puppeteer.launch();
    const page = await browser.newPage();

    const viewports = [
      { width: 1920, height: 1080 }, // Pantalla de escritorio
      { width: 768, height: 1024 },  // Tablet
      { width: 375, height: 667 },   // Móvil
    ];

    let isResponsive = true;
    let failedViewport = null;

    for (const viewport of viewports) {
      await page.setViewport(viewport);
      await page.goto(url, { waitUntil: 'networkidle2' });

      // Verificar si cierto elemento es visible en la página en cada resolución
      // Esto es un ejemplo, ajusta la selección del elemento según tus necesidades
      const elementoVisible = await page.$('.clase-del-elemento');
      if (!elementoVisible) {
        isResponsive = false;
        failedViewport = viewport; // Guardar la resolución que falló
        break;
      }
    }

    await browser.close();

    // Si la página no es responsiva, incluir la resolución que falló en la respuesta
    if (!isResponsive) {
      res.json({ url, isResponsive, failedViewport });
    } else {
      res.json({ url, isResponsive });
      console.log(isResponsive, "lol");
    }
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  checkResponsive
};