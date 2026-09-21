# Language-Key

> Lightweight multilingual HTML processing system built with JavaScript and JSON.

Language-Key is a custom internationalization workflow for static websites. It uses a JSON translation source and custom HTML attributes/tags to generate localized HTML while keeping the source markup readable.

## What it does

- Defines translations in a structured JSON file.
- Supports text nodes and HTML attributes.
- Uses custom keys such as `lk:`, `lk-text-content:`, and `label-lk-*:`.
- Processes HTML with a JavaScript generation script.
- Keeps localization logic separate from the site's content structure.

## Example

Translation data:

```json
{
  "en": {
    "lk:title": "Welcome",
    "lk-text-content:description": "A multilingual website"
  },
  "es": {
    "lk:title": "Bienvenido",
    "lk-text-content:description": "Un sitio web multilingüe"
  }
}
```

HTML:

```html
<title><lk k="title">Fallback title</lk></title>
<h1 lk-text-content-k="description">Fallback description</h1>
```

The processing step produces the corresponding localized HTML.

## Why it exists

The project explores a simple alternative to introducing a full internationalization framework into lightweight/static websites. The goal is to make multilingual content explicit in the markup while keeping the build process understandable and customizable.

## Technology

- JavaScript
- HTML5
- JSON
- Static-site processing
- Custom HTML attributes and elements

## Status

Experimental / personal tooling project.

## Author

**Leonardo Merchán — lewopxd**

Part of a broader practice combining software development, creative technology, design and research.

[GitHub profile](https://github.com/lewopxd) · [0zdev](https://github.com/0zdev)
