import { Console } from "console";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Obtener __dirname usando ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicio del tiempo de ejecución
const startTime = Date.now();

// Rutas principales
const jsonPath = "./dev/locales/universal.json";
const devDir = path.join(__dirname, "./dev");
const preBuildDir = path.join(__dirname, "./pre-build");

// Validar si el archivo JSON existe - si no, terminar
if (!fs.existsSync(jsonPath)) {
  console.error("\x1b[31mError:\x1b[0m The JSON file does not exist at:", jsonPath);
  process.exit(1);
}else{
  console.log(`\x1b[34mInfo:\x1b[0m Language JSON file: ${jsonPath}: `+"\x1b[32mOK\x1b[0m");
}


// Validar Carpeta DEV - si no terminar
if (!fs.existsSync(devDir)) {
  console.error("\x1b[31mError:\x1b[0m Dev folder does not exist at:", devDir);
  process.exit(1);
}else{
  console.log(`\x1b[34mInfo:\x1b[0m Dev Folder: /dev: `+"\x1b[32mOK\x1b[0m");
}

// Crear la carpeta `pre-build` si no existe
if (!fs.existsSync(preBuildDir)) {
  fs.mkdirSync(preBuildDir);
  console.log("\x1b[32mCreated:\x1b[0m Folder: /pre-build");
}else{
  console.log(`\x1b[34mInfo:\x1b[0m Pre-Build Folder: /pre-build: `+"\x1b[32mOK\x1b[0m");
}

// Leer el archivo JSON
const rawData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
const { metadata, ...translations } = rawData;

// Obtener el idioma predeterminado y los idiomas disponibles
const fallbackLanguage = metadata.file.fallbackLanguage || "en";
const supportedLanguages = Object.keys(translations);
console.log(`\x1b[34mInfo:\x1b[0m Default language set to: ${fallbackLanguage}`);
console.log(`\x1b[34mInfo:\x1b[0m Supported languages in .json: [${supportedLanguages.join(", ")}]`);

// Función para encontrar todos los archivos HTML en el árbol de directorios
function findHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      results = results.concat(findHtmlFiles(filePath));
    } else if (path.extname(file) === ".html") {
      results.push(filePath);
    }
  });

  return results;
}


// Función para evaluar y almacenar las etiquetas personalizadas
function evaluateAndStoreLabels(html, filePath) {
  const labelsMap = {
    lk: [],
    labelLk: [],
    lkTextContent: [],
  };

  // Dividir el HTML en líneas
  const lines = html.split('\n');

  // Iterar sobre cada línea del HTML
  lines.forEach((line, lineNumber) => {
    const lineNum = lineNumber + 1; // Número de línea (1-based)

    //----------------- [ Evaluar etiquetas <lk> ]------------------------------- 
    const allLkTags = line.matchAll(/<lk\b[^>]*>(.*?)<\/lk>/g);
    const allBadClosedLkTags = line.matchAll(/<lk\b[^>]*>(?![^<]*<\/lk>)/g);

    

    // Procesar etiquetas <lk> correctamente cerradas
    for (const match of allLkTags) {
      const fullTag = match[0]; // Etiqueta completa <lk ...>...</lk>
      const attributes = match[1]; // Contenido dentro de la etiqueta

      // Validar que la etiqueta tenga un atributo 'k' con un valor no vacío
      const keyMatch = fullTag.match(/k="([^"]*)"/);
      const key = keyMatch ? keyMatch[1].trim() : null;

      if (!key) {
        console.error(
          `\x1b[31mError:\x1b[0m Missing or empty 'k' attribute in <lk> tag in file: ${filePath}. Line: ${lineNum}, Tag: ${fullTag}`
        );
        process.exit(1);
      }

      // Validar que el contenido no contenga otras etiquetas HTML
      const content = match[1].trim();
      if (/<[^>]+>/.test(content)) {
        console.error(
          `\x1b[31mError:\x1b[0m Invalid content inside "<lk> ? </lk>" tag. Must be text, another  tags are not allowed. File: ${filePath}. Line: ${lineNum}, Tag: ${fullTag}`
        );
        process.exit(1);
      }

      // Almacenar la coincidencia válida
    //  console.log(`Line: ${lineNum}, key: [${key}]; content: [${content}]`);
      labelsMap.lk.push({ key, content });
    }

    // Validar etiquetas mal cerradas
    for (const badTag of allBadClosedLkTags) {
      const fullTag = badTag[0]; // Etiqueta completa <lk ...>
      console.error(
        `\x1b[31mError:\x1b[0m Unclosed <lk> tag in file: ${filePath}. Line: ${lineNum}, Tag: ${fullTag}`
      );
      process.exit(1);
    }

    



    

    //------------ [ Evaluar atributos label-lk-* ] -------------------------
const labelLkTags = line.matchAll(/<([^>]*?)\s+label-lk-\w+-k="[^"]+"[^>]*>/g);

for (const tagMatch of labelLkTags) {
  const fullTag = tagMatch[0]; // La etiqueta completa desde < hasta >
  
  // Buscar todos los atributos label-lk-* dentro de la etiqueta
  const labelLkMatchesInside = fullTag.matchAll(/\s+label-lk-(\w+)-k="([^"]+)"/g);

  for (const match of labelLkMatchesInside) {
    const attrName = match[1]; // Ejemplo: 'src' en label-lk-src-k
    const key = match[2]; // Ejemplo: 'image-portrait' en label-lk-src-k="image-portrait"

    // Validar que los atributos necesarios estén presentes
    if (!attrName || !key) {
      console.error(
        `\x1b[31mError:\x1b[0m Malformed label-lk-* attribute in file: ${filePath}. Line: ${lineNum}, Tag: ${fullTag}`
      );
      process.exit(1);
    }

    // Almacenar la coincidencia válida
    // console.log(`Line: ${lineNum}, tag: [${fullTag}]; attrName: [${attrName}]; key: [${key}]`);
    labelsMap.labelLk.push({ tag: fullTag, attrName, key });
  }
}










    //--------[ Evaluar atributos lk-text-content-k ]-------------------------------------------------
const lkTextContentMatches = line.matchAll(/<([^>]*?)\s+lk-text-content-k="([^"]+)"[^>]*>/g);

for (const match of lkTextContentMatches) {
  const fullTag = match[0]; // Etiqueta completa
  const key = match[2]; // Valor del atributo lk-text-content-k

  // Verificar que la etiqueta esté bien formada (comienza con < y termina con >)
  if (!/^<[^>]+>$/.test(fullTag)) {
    console.error(
      `\n\x1b[31mError:\x1b[0m Malformed HTML tag in file: ${filePath}. Line: ${lineNum}, Tag: ${fullTag}`
    );
    process.exit(1);
  }

  // Verificar que el atributo lk-text-content-k="..." esté presente
  if (!key) {
    console.error(
      `\n\x1b[31mError:\x1b[0m Missing 'lk-text-content-k' attribute in file: ${filePath}. Line: ${lineNum}, Tag: ${fullTag}`
    );
    process.exit(1);
  }

  // Almacenar la coincidencia válida
  //console.log(`Line: ${lineNum}, tag: [${fullTag}]; key: [${key}]`);
  labelsMap.lkTextContent.push({ tag: fullTag, key });
}

  //-------------------> end 




  });
  return labelsMap;
}






// Función para traducir y guardar archivos HTML
function translateAndSaveHtml(devPath, outputPath, lang, texts, fallbackLanguage, labelsMap) {
  let html = fs.readFileSync(devPath, "utf-8");
   

 //reemplazar el idioma del html
 html = html.replace(/<html\s+lang="[^"]*"/, `<html lang="${lang}"`);
  
  // Contar etiquetas personalizadas
  const totalLabels =
    labelsMap.lk.length + labelsMap.labelLk.length + labelsMap.lkTextContent.length;
  let processedLabels = 0;

   
   


// ----------------- [Reemplazar etiquetas <lk> ] ----------------------------------------------

labelsMap.lk.forEach(({ key, content }) => {
  
   
  // Obtener el valor traducido del JSON o usar el idioma predeterminado (fallback)
  const value = texts[`lk:${key}`] || translations[fallbackLanguage][`lk:${key}`];

  if (!value) {
    console.error(
      `\x1b[31mError:\x1b[0m Translation missing for key 'lk:${key}' in file: ${filePath}.`
    );
    process.exit(1);
  }

  // Construir una expresión regular para encontrar la etiqueta completa
  const regex = new RegExp(`<lk\\s+k="${key}"[^>]*>.*?</lk>`, "g");

  // Reemplazar la etiqueta completa con la versión modificada
  html = html.replaceAll(regex, `${value}`);

  processedLabels++;
  updateProgress(processedLabels, totalLabels, key);
});



// ----------------[ Reemplazar atributos label-lk-*]------------------------------
labelsMap.labelLk.forEach(({ attrName, key }) => {
  // Obtener el valor traducido del JSON
  const value = texts[`label-lk-${attrName}:${key}`]; // Valor en el idioma actual
  const fallbackValue = translations[fallbackLanguage][`label-lk-${attrName}:${key}`]; // Valor en el idioma predeterminado

  // Verificar si la clave existe en el idioma actual
  if (!value) {
    if (fallbackValue) {
      console.warn(
        `\n\x1b[33mWarning:\x1b[0m Key 'label-lk-${attrName}:${key}' not found in language '${lang}'. Using fallback language '${fallbackLanguage}'.`
      );
    } else {
      console.error(
        `\n\x1b[31mError:\x1b[0m Key 'label-lk-${attrName}:${key}' not found in language '${lang}' or fallback language '${fallbackLanguage}'. Stopping execution.`
      );
      process.exit(1);
    }
  }

  // Usar el valor del idioma actual o el predeterminado
  const finalValue = value || fallbackValue;

  // Construir la expresión regular para encontrar la etiqueta que contiene el atributo específico
  const tagRegex = new RegExp(`<([^>]*?)\\s+label-lk-${attrName}-k="${key}"[^>]*>`, "g");

  // Bandera para verificar si se realizó algún reemplazo
  let replaced = false;

  // Reemplazar la etiqueta que contiene el atributo específico
  html = html.replace(tagRegex, (match) => {
    replaced = true; // Marcamos que se realizó un reemplazo

    let updatedTag = match;

    // Verificar si el atributo ya existe en la etiqueta
    const existingAttrRegex = new RegExp(`${attrName}="[^"]+"`);
    if (existingAttrRegex.test(updatedTag)) {
      // Si el atributo ya existe, reemplazar su valor
      updatedTag = updatedTag.replace(existingAttrRegex, `${attrName}="${finalValue}"`);
    } else {
      // Si el atributo no existe, agregarlo antes del cierre de la etiqueta
      updatedTag = updatedTag.replace(/>$/, ` ${attrName}="${finalValue}">`);
    }

    // Eliminar el atributo específico `label-lk-${attrName}-k="${key}"`
    updatedTag = updatedTag.replace(new RegExp(`\\s+label-lk-${attrName}-k="${key}"`), "");

    return updatedTag;
  });

  // Logs para verificar si se realizó el reemplazo
  if (!replaced) {
    console.warn(
      `\n\x1b[33mWarning:\x1b[0m No match found for attribute 'label-lk-${attrName}-k="${key}"'. Skipping replacement.`
    );
  } else {
    //console.log(`\n\x1b[32mSuccess:\x1b[0m Successfully replaced 'label-lk-${attrName}-k="${key}"' with '${attrName}="${finalValue}"'.`);
  }

  processedLabels++;
  updateProgress(processedLabels, totalLabels, key);
});




//------------------[ Reemplazar contenido lk-text-content-k ]--------------------
labelsMap.lkTextContent.forEach(({ tag, key }) => {
  // Obtener el valor traducido del JSON
  const value = texts[`lk-text-content:${key}`]; // Valor en el idioma actual
  const fallbackValue = translations[fallbackLanguage][`lk-text-content:${key}`]; // Valor en el idioma predeterminado

  // Verificar si la clave existe en el idioma actual
  if (!value) {
    if (fallbackValue) {
      console.warn(
        `\n\x1b[33mWarning:\x1b[0m Key 'lk-text-content:${key}' not found in language '${lang}'. Using fallback language '${fallbackLanguage}'.`
      );
    } else {
      console.error(
        `\n\x1b[31mError:\x1b[0m Key 'lk-text-content:${key}' not found in language '${lang}' or fallback language '${fallbackLanguage}'. Stopping execution.`
      );
      process.exit(1);
    }
  }

  // Usar el valor del idioma actual o el predeterminado
  const finalValue = value || fallbackValue;

  // Guardar el HTML antes del reemplazo
  const originalHtml = html;

  // Construir la expresión regular para encontrar la etiqueta completa
  const regex = new RegExp(`${tag}([^]*?)</${tag.match(/^<([^\s>]+)/)[1]}>`, "g");

  // Reemplazar la etiqueta original con la versión modificada
  html = html.replace(regex, (match, innerContent) => {
    // Eliminar el atributo `lk-text-content-k="..."`
    let updatedTag = match.replace(/\s+lk-text-content-k="[^"]+"/, "");

    // Reemplazar el contenido interno con el valor traducido
    updatedTag = updatedTag.replace(/>([^]*?)<\/([^\s>]+)>/, `>${finalValue}</$2>`);

    return updatedTag;
  });

  // Verificar si hubo algún cambio
  if (html === originalHtml) {
    console.error(
      `\n\x1b[31mError:\x1b[0m No changes were made for tag with key 'lk-text-content:${key}' in file: ${filePath}. Tag: ${tag}`
    );
  } else {
    processedLabels++;
    updateProgress(processedLabels, totalLabels, key);
  }
});


//--->

  // Guardar el HTML traducido
  fs.writeFileSync(outputPath, html);

 
  console.log(`\n\x1b[36mTranslated:\x1b[0m File: ${outputPath}`);
}

// Función para actualizar el progreso dinámicamente
function updateProgress(current, total, label) {
  const percentage = ((current / total) * 100).toFixed(2);
  process.stdout.clearLine(); // Limpiar la línea actual
  process.stdout.cursorTo(0); // Mover el cursor al inicio de la línea
  process.stdout.write(`      Label: [${current}/${total}] ${percentage}% : ${label}`);
  if (current === total) {
    console.log(); // Salto de línea al finalizar
  }
}



// Encontrar todos los archivos HTML
const htmlFiles = findHtmlFiles(devDir);

// Evaluar y almacenar etiquetas personalizadas para cada archivo
const allLabelsMap = {};
let totalLk = 0,
  totalLabelLk = 0,
  totalLkTextContent = 0;

htmlFiles.forEach((htmlFile) => {
  const html = fs.readFileSync(htmlFile, "utf-8");
  const labelsMap = evaluateAndStoreLabels(html, htmlFile);
  allLabelsMap[htmlFile] = labelsMap;

  totalLk += labelsMap.lk.length;
  totalLabelLk += labelsMap.labelLk.length;
  totalLkTextContent += labelsMap.lkTextContent.length;
});

// Mostrar conteo total de etiquetas
console.log(
  `\x1b[34mInfo:\x1b[0m Total HTML files: ${htmlFiles.length}\n      Total Labels: ${totalLk + totalLabelLk + totalLkTextContent} ->  [ lk: ${totalLk}; label-lk: ${totalLabelLk}; lk-text-content: ${totalLkTextContent} ]`
);

// Procesar todos los idiomas
for (const [lang, texts] of Object.entries(translations)) {
  console.log(`\x1b[36m---------------------------------------------------------------------------------\x1b[0m`);

  console.log(`\x1b[36mTranslating:\x1b[0m "${lang.toUpperCase()}" from ${jsonPath}`);

  const langDir = path.join(preBuildDir, lang);
  if (!fs.existsSync(langDir)) {
    fs.mkdirSync(langDir);
  }

  // Traducir cada archivo HTML
  htmlFiles.forEach((htmlFile) => {
    const relativePath = path.relative(devDir, htmlFile); // Obtener ruta relativa desde /dev
    const outputPath = path.join(langDir, relativePath); // Construir ruta de salida

    // Crear la carpeta necesaria para el archivo
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Obtener el mapa de etiquetas para este archivo
    const labelsMap = allLabelsMap[htmlFile];

    // Mostrar conteo de etiquetas para este archivo
    console.log(
      `\x1b[34mInfo:\x1b[0m File: ${relativePath}\n      Labels: ${
        labelsMap.lk.length + labelsMap.labelLk.length + labelsMap.lkTextContent.length
      } ->  [ lk: ${labelsMap.lk.length}; label-lk: ${labelsMap.labelLk.length}; lk-text-content: ${labelsMap.lkTextContent.length} ]`
    );

    // Traducir y guardar el archivo
    translateAndSaveHtml(htmlFile, outputPath, lang, texts, fallbackLanguage, labelsMap);
  });
}

// Fin del tiempo de ejecución
const endTime = Date.now();
const totalTime = ((endTime - startTime) / 1000).toFixed(2);

  console.log(`\x1b[36m---------------------------------------------------------------------------------\x1b[0m`);
console.log(`\x1b[34mSummary:\x1b[0m Processed ${htmlFiles.length} files and ${totalLk + totalLabelLk + totalLkTextContent} labels in ${totalTime} seconds.`);
console.log("\x1b[32mALL OK\x1b[0m");
