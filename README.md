# Responsible AI for Biomedical Research

Quarto source for the CAKE fellowship website on responsible generative AI use in biomedical research.

Current website: https://raqmanzano.github.io/responsible-ai-biomedres.github.io/

## Purpose

The site is designed to support a [CAKE fellowship](https://www.cake.ac.uk/about/ke-fellowships/) project that will:

- map how generative AI is being used in biomedical research
- turn that learning into practical guidance, training and materials
- keep draft and reviewed resources visibly separate
- maintain useful materials, including literature notes and local support links
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

Supporting repository files include:

- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- `LICENSE.md`
- `assets/ATTRIBUTION.md`

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

The repository includes a GitHub Actions workflow at `.github/workflows/publish.yml` that renders the Quarto site and deploys `_site/` to GitHub Pages on pushes to `main`.

## Contributing and reuse

Please see `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md` before opening issues or suggesting material.

Website code, written content and third-party assets have different reuse terms. See `LICENSE.md` and `assets/ATTRIBUTION.md`.

## Content model

Each resource page should include these front matter fields:

- `title`
- `description`
- `resource_type`
- `status`
- `reviewed_on`
- `contributors`
- `tags`
- `references`

Use DOI identifiers for scholarly papers where available. Use stable URLs for websites, tools or repositories.

Use `templates/resource-template.qmd` as the starting point for new entries.
