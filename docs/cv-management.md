# CV Library

The maintained CVs live in `cvs/`. There are three English profiles, each with an ATS and a Visual version. The ATS version is the primary editing and application document; keep the corresponding Visual copy factually identical.

| Profile | Primary ATS source | Secondary Visual source |
| --- | --- | --- |
| SAP ABAP | [ats.html](../cvs/sap-abap/ats.html) | [visual.html](../cvs/sap-abap/visual.html) |
| Software Engineer | [ats.html](../cvs/software-engineer/ats.html) | [visual.html](../cvs/software-engineer/visual.html) |
| AI Agent | [ats.html](../cvs/ai-agent/ats.html) | [visual.html](../cvs/ai-agent/visual.html) |

## Shared conventions

- Target titles end in `(Intern/Fresher)`. This is the desired application level, not a claim of previous employment in that role.
- Use `Summary`, `Education`, `Technical Skills`, `Experience`, `Projects`, and `Certifications` as section names. The Visual layout places education/skills in its sidebar; the ATS layout reads vertically in that order.
- Skills use `Foundations`, `Project Exposure`, `Tools`, and `Languages`. A technology used in a project does not automatically imply advanced proficiency.
- Tools are Git, Claude Code, and Codex. Languages are Vietnamese and English, without an unverified proficiency rating.
- Use full job titles and consistent dates such as `Jan 2025 - Apr 2025`. Do not invent project dates; projects currently follow relevance to the target profile.
- Keep original qualification names, degree, GPA, contact details, and team achievements consistent across profiles.

## ATS format and export

The ATS files use one linear column, local Inter, 10.5pt body and 9.5pt contact/context text, with 14mm horizontal and 13mm vertical insets. They contain no skill tables, photos, icons, text boxes, repeated page headers or footers. This follows documented parsing-risk guidance, rather than claiming universal compatibility. [Greenhouse parsing guidance](https://support.greenhouse.io/hc/en-us/articles/200989175-Unsuccessful-resume-parse).

One page is the target for this early-career content, with readable 10–12pt text. Do not shrink text or clip content to force a page count. [Columbia resume guidance](https://www.careereducation.columbia.edu/sites/default/files/DYNS%20Single%20Page%20PDF%20Form.pdf).

HTML is the editable source. Submit the format requested by the employer. For a PDF application:

### Repeatable PDF export (recommended)

Run from the repository root with Node.js 22.13+ (Node 24 recommended):

```bash
npm ci
npm run cv:setup
npm run cv:check
npm run cv:pdf -- --preview
```

Setup downloads the Chromium matching the exact Playwright version in the lockfile; it needs internet once. Re-run setup after updating Playwright. Export itself runs offline and needs no development server. All fonts, vector icons and the portrait are local. `CV_BROWSER_PATH` is an explicit diagnostic override; using another browser forfeits the default engine pin and requires fresh review. The manifest records the executable and version used.

The command exports all six documents to `cvs/pdf/tran-quoc-dat-{profile}-{ats|visual}.pdf`. `--preview` renders actual PDF pages into `cvs/pdf/previews/` at 144dpi; these PNGs are inspection artifacts, not submission files. Omit the flag for PDF-only export. Open the relevant PDF at 100% and 200% to review the text and certificate/project details before sending.

The exporter requests scale 1, CSS A4 sizing, backgrounds enabled and browser headers/footers disabled. Desktop HTML and print share a 210 × 297mm sheet; mobile HTML reflows separately. There is no forced cropping, first-page-only export or full-page rasterization. Chromium can still shrink overflowing content internally, so the checks also inspect source bounds and actual PDF font sizes. [Playwright PDF API](https://playwright.dev/docs/api/class-page#page-pdf).

Checks include one portrait A4 page, ATS text order including punctuation/Unicode, Visual text occurrence counts, hyperlink targets, embedded Inter font streams/Unicode maps, minimum 9.5pt PDF text (rounding tolerance only), text bounds and substantial text-box overlaps. Fonts must load and images decode; the portrait needs at least 240 effective DPI. These geometry heuristics complement visual review. Size budgets are 200 KiB ATS and 750 KiB Visual, project limits rather than ATS standards. Current reference outputs are about 37–39 KiB ATS and 115–117 KiB Visual.

All six are validated before outputs are replaced. The batch is written into a temporary directory first, then replaces `cvs/pdf/`; a failed staging write leaves the preceding batch untouched, and a failed final rename triggers a restore attempt. `cvs/pdf/` is a generated directory: do not store manually maintained files there. Without `--preview`, previous previews are removed with the old batch so they cannot be mistaken for the new PDFs. `validation.json` records hashes of HTML, CSS, fonts, portrait and PDFs, browser version, offline mode, dimensions, text sizes, embedded fonts, links and image DPI. PDF creation dates may differ between runs; matching input hashes and browser versions do not promise byte-identical PDFs across operating systems.

Generated PDFs, previews and reports are ignored by Git. Regenerate after any source/style/asset edit. `npm run cv:check` exercises PDF rejection cases, offline resources, desktop screen/print geometry parity and mobile overflow. These checks do not certify PDF/A, PDF/UA, optical quality or compatibility with every ATS.

### Visual composition and assets

The Visual layout keeps the navy sidebar, blue accents, portrait and certificate grouping. The sidebar fills the sheet height: the old bottom cutout was an allowance for a former online converter and is no longer needed by local export. Visual body is 10.5pt with 9.5pt secondary text, left-aligned paragraphs and no fixed-height overflow clipping. Spacing and type use the A4 sheet without forcing content to its edges. The blue shade is darker on white and lighter on navy for readable contrast. Text remains vector/selectable in the PDF. Icons are inline vector paths and the certificate check is a CSS shape, avoiding icon-font substitution.

GPA is highlighted as a blue badge. The GitHub contact uses Primer Octicons `mark-github-16`, with its [MIT license](../cvs/assets/icons/OCTICONS-LICENSE.txt) retained locally.

Shared styles are [ats.css](../cvs/styles/ats.css), [visual.css](../cvs/styles/visual.css) and [fonts.css](../cvs/styles/fonts.css). Inter Latin static faces come from `@fontsource/inter` 5.3.0; the [OFL license](../cvs/assets/fonts/OFL.txt) is retained. Font provenance: [Fontsource Inter](https://fontsource.org/fonts/inter/about). The candidate's existing Cloudinary portrait was saved as a 540 × 540 JPEG at `cvs/assets/portrait.jpg`, around 392 effective DPI at the displayed 35mm size. When sharing HTML, include the entire `cvs/` folder so relative assets remain available; PDF is self-contained.

### Manual fallback

1. Open the role's `ats.html` in Chrome or Edge.
2. Print to PDF, choose A4, 100% scale, no extra browser margins, background graphics enabled and browser headers/footers disabled. Spacing is already inside the HTML sheet. Prefer a clear filename such as `tran-quoc-dat-sap-abap-ats.pdf`.
3. Confirm one complete page, select/copy its text, and check name, contacts, section sequence and bullets. No text should be missing, clipped or interleaved.
4. Use the Visual export only when presentation is requested or a human reader is the intended recipient. It is not the ATS-first submission.

Follow a portal's DOCX or other format requirement when given; renaming HTML to `.docx` does not convert it. Lever accepts several formats, including HTML, PDF and Word, but that does not establish what another portal accepts. Selectable text and successful local extraction are useful checks, not a live ATS score or a guarantee of screening results. [Lever parsing documentation](https://help.lever.co/s/article/Understanding-Resume-Parsing).

## Credible wording

Use specific actions and their real context. Keep course projects distinct from employment. Active, factual language is preferable to broad claims about scale or expertise. [Harvard resume guidance](https://careerservices.fas.harvard.edu/resources/create-a-strong-resume/).

The following facts were confirmed by the candidate when this library was created:

- SAP training was FPT coursework/OJT, not an official SAP-issued qualification.
- Hengout's CV role is Backend Developer; describe coordination in its bullets rather than implying a company-level Tech Lead position.
- There is no load-test evidence supporting a high-concurrency claim. Do not add unmeasured performance, scale, efficiency or reliability results.
- The VND 50 million scholarship was awarded to the project team. Keep App Store delivery a team outcome and describe the candidate's contribution.
- Using coding assistants is a tool choice. A listed skill should still be supported by a project example the candidate can explain and discuss.

## Editing and publishing

Update the relevant ATS source first, mirror its facts into the Visual source, then check both print layouts and extracted text. For shared identity, education or training changes, update all three profiles. HTML remains directly editable without a template/data-generation build step. Shared CSS/assets make formatting consistent across all three profiles and work without network access.

The former root-level CV files were consolidated into these six sources. Their previous contents remain available in Git history.

Local CV sources are separate from the hosted download links in `src/content/site/hero.ts` and `public/llms.txt`. Those links still point to existing published snapshots; moving/editing these files does not upload a new PDF or switch the website's default resume. Export, review and upload the intended version before updating published URLs.
