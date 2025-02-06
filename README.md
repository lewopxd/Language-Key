---

# Multilingual Internationalization System

This system allows you to generate multilingual versions of a website using a JSON file for translations, custom HTML tags, and a processing script.

---

## 1. JSON File Structure

The JSON file contains translations for multiple languages. Each key includes a prefix that indicates its type of use (`lk`, `lk-text-content`, `label-lk-*`), ensuring a clear structure and avoiding conflicts between keys with similar names.

### Example JSON

```json
{
  "es": {
    "lk:title": "Bienvenido",
    "lk:description": "This is a description for <lk>.",
    "lk-text-content:description": "This is a description for lk-text-content.",
    "label-lk-src:image": "/assets/images/portrait_es.png",
    "label-lk-alt:imageAlt": "Spanish image"
  },
  "en": {
    "lk:title": "Welcome",
    "lk:description": "This is a description for <lk>.",
    "lk-text-content:description": "This is a description for lk-text-content.",
    "label-lk-src:image": "/assets/images/portrait_en.png",
    "label-lk-alt:imageAlt": "English image"
  }
}
```

### Prefixes and Their Meaning

| Prefix               | Usage                                                                                     | HTML Example                                      |
|----------------------|-------------------------------------------------------------------------------------------|--------------------------------------------------|
| `lk:`                | For wrapping text blocks using the `<lk k="...">` tag.                                    | `<lk k="title">Fallback</lk>`                   |
| `lk-text-content:`   | For changing the text of an element using the `lk-text-content k="..."` attribute.        | `<h1 lk-text-content k="description">Fallback</h1>` |
| `label-lk-*:`      | For modifying the `*`  attribute (src, alt, style... etc) of a tag using ex: `label-lk-src k="..."`.                  | `<img src="default.png" label-lk-src k="image-portrait">` |
 
### Corresponding HTML

Here’s how the JSON keys map to the HTML structure:

```html
<title><lk k="title">Example Title</lk></title>
<h1 lk-text-content k="description">Example description for lk-text-content</h1>
<img src="portrait_default.png" label-lk-src k="image" label-lk-alt k="imageAlt" alt="Portrait">
<p><lk k="description">Example description for <lk>.</lk></p>
```

---

## 2. Processing Script

The script processes the JSON file and generates translated versions of the HTML. You can find the source code for the script in the `generate-html.js` file.

---

## 3. Benefits of the System

- **Clarity**: Prefixes explicitly indicate the type of usage.
- **Conflict Avoidance**: Keys are unique thanks to prefixes.
- **Flexibility**: Easy to extend for new types or languages.
- **Ease of Maintenance**: Easy to understand and extend for other developers.

---
 
