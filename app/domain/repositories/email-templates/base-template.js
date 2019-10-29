function buildBaseTemplate(data) {
  const {
    title,
    actionUrl,
  } = data;

  const template = `
  <!DOCTYPE html>
  <html lang="${lang}">

  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, height=device-height, initial-scale=1">
    <title>${title}</title>
  </head>

  <body style="margin:0;padding:0; background-color: white;">
    <a href="${actionUrl}">link</a>
  </body>

  </html>
`;

  return template.replace(/[\n\r]+/g, '').replace(/\s{2,10}/g, '');
}

module.exports = buildBaseTemplate;
