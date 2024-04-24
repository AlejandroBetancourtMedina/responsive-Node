const puppeteer = require('puppeteer');

const checkResponsive = async (req, res) => {
  const { url } = req.body;
  console.log("url", url)
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const viewports = [
      { width: 1920, height: 1080 }, // Pantalla de escritorio
      { width: 768, height: 1024 },  // Tablet
      { width: 375, height: 667 },   // Móvil
    ];

    let isResponsive = true;

    for (const viewport of viewports) {
      await page.setViewport(viewport);
      await page.goto(url, { waitUntil: 'networkidle2' });

      // Verificar si cierto elemento es visible en la página en cada resolución
      const elementoVisible = await page.$('.clase-del-elemento');
      if (!elementoVisible) {
        isResponsive = false;
        break; // Si el elemento no es visible, ya no necesitas verificar más resoluciones
      }
    }

    await browser.close();

    res.json({ url, isResponsive });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  checkResponsive
};
