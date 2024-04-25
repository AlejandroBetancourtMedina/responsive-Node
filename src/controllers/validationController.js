const htmlValidator = require('html-validator');
const axios = require('axios');
const cheerio = require('cheerio');
const stylelint = require('stylelint'); // Asegúrate de que stylelint esté instalado

const validateHTML = async (req, res) => {
  const endpoint = req.body.endpoint;
  try {
    // Obtener el HTML del endpoint
    const response = await axios.get(endpoint);
    const html = response.data;
    // Validar el HTML obtenido
    const options = {
      data: html,
      format: 'json',
    };
    const validationResults = await htmlValidator(options);

    // Procesar los resultados para incluir detalles de ubicación de errores
    const errorsWithLocation = validationResults.messages.filter(message => message.type === 'error').map(error => {
      // Puedes acceder a error.firstLine, error.lastLine, error.firstColumn y error.lastColumn para obtener la ubicación
      // También puedes incluir el extracto de código HTML si está disponible
      return {
        type: error.type,
        message: error.message,
        extract: error.extract ? error.extract.trim() : 'N/A', // El extracto proporciona un fragmento del HTML donde ocurrió el error
        firstLine: error.firstLine,
        lastLine: error.lastLine,
        firstColumn: error.firstColumn,
        lastColumn: error.lastColumn
      };
    });

    // Enviar solo los errores con detalles de ubicación en la respuesta
    res.json(errorsWithLocation); // Devolvemos directamente el array de errores
  } catch (error) {
    res.status(500).json({ message: `Error fetching or validating HTML: ${error.message}` });
  }
};

const validateCSS = async (req, res) => {
  const webpageUrl = req.body.url;

  try {
    const htmlResponse = await axios.get(webpageUrl);
    const html = htmlResponse.data;
    const $ = cheerio.load(html);

    const cssLinks = $('link[rel="stylesheet"]').map((index, element) => {
      const cssHref = $(element).attr('href');
      return new URL(cssHref, webpageUrl).href;
    }).get();

    const globalErrorsMap = new Map();

    // Esperar a que todas las promesas de validación se resuelvan
    await Promise.all(cssLinks.map(async (cssUrl) => {
      try {
        const cssResponse = await axios.get(cssUrl);
        const css = cssResponse.data;
        const lintResults = await stylelint.lint({
          code: css,
          config: {
            extends: 'stylelint-config-standard'
          }
        });
        for (const warning of lintResults.results[0].warnings) {
          const rule = warning.rule;
          const currentCount = globalErrorsMap.get(rule) || 0;
          globalErrorsMap.set(rule, currentCount + 1);
        }
      } catch (error) {
        console.error(`Error validating CSS from ${cssUrl}: ${error.message}`);
        // Manejar errores individuales sin detener el flujo del programa
      }
    }));

    const errorSummary = Array.from(globalErrorsMap).map(([rule, count]) => ({
      rule,
      count
    }));
    res.json({ errorSummary });
  } catch (error) {
    res.status(500).json({ message: `Error fetching HTML or validating CSS: ${error.message}` });
  }
};


module.exports = {
  validateCSS,
  validateHTML
};