# Language-Key

A lightweight multilingual HTML processing system built with JavaScript and JSON.

Language-Key provides a custom internationalization workflow for static websites. Translation data is kept in JSON and applied to HTML through custom attributes and elements during a generation step.

## Features

- Structured JSON translation sources.
- Localization of text nodes and HTML attributes.
- Custom localization keys and HTML attributes.
- JavaScript-based HTML generation.
- Separation between source markup and translated output.

## Example

Translation data:

    {
      "en": {
        "lk:title": "Welcome"
      },
      "es": {
        "lk:title": "Bienvenido"
      }
    }

HTML can reference the same keys while retaining fallback content in the source markup.

## Approach

The project explores a simple build-time localization workflow for lightweight and static websites, avoiding a runtime translation layer when it is not required.

## Technology

JavaScript · HTML5 · JSON · static-site processing

## Status

Experimental tooling project.

## Project

Developed by Leonardo Merchán as part of his work across software development, creative technology and web design.

[GitHub](https://github.com/lewopxd) · [0zdev](https://github.com/0zdev)