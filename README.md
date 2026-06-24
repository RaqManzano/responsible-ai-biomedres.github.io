# Responsible AI for Biomedical Research

This repository contains a Quarto website for a modular, public-facing resource hub on responsible generative AI use in biomedical research.

## Purpose

The site is designed to support a fellowship project that will:

- map how generative AI is being used in biomedical research
- turn that learning into practical guidance, training and decision tools
- keep draft and reviewed resources visibly separate
- maintain useful resource pages, including literature notes and local support links
- accept new suggestions through GitHub Issue Forms

## Site structure

The content is organised around three practical resource types:

- `guidance/`
- `training/`
- `resources/`

Core site pages live at the repository root:

- `index.qmd`
- `about.qmd`
- `contribute.qmd`

## Local development

Render the site locally with:

```bash
quarto render
```

Preview it during editing with:

```bash
quarto preview
```

## Publishing

The repository includes a GitHub Actions workflow at `.github/workflows/publish.yml` that renders the site and deploys it to GitHub Pages on pushes to `main`.

## Contributing and reuse

Please see `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md` before opening issues or suggesting material.

Website code, written content and third-party assets have different reuse terms. See `LICENSE.md` and `assets/ATTRIBUTION.md`.

## Content model

Each resource page should include these front matter fields:

- `title`
- `description`
- `resource_type`
- `audience`
- `status`
- `reviewed_on`
- `contributors`
- `tags`
- `references`

Use `templates/resource-template.qmd` as the starting point for new entries.
