# Jnbz Painting website

A one-page website for **Jnbz Painting**, interior house painters serving Langley, Surrey, Vancouver and BC’s Lower Mainland. Its main job is getting visitors to call or request a free written quote.

It’s a plain static site: no build step, no frameworks, nothing to install.

| File | What it is |
| --- | --- |
| `index.html` | All the page content (text, links, phone numbers, form) |
| `styles.css` | Colours, fonts, sizes and layout. The colours are listed at the top |
| `script.js` | Animations, the photo viewer, the project-type buttons and form sending |
| `jnbz/` | Logo and project photos |
| `404.html` | Shown when someone visits a page that doesn’t exist |
| `robots.txt` | Tells search engines they can index the site |

## Preview it on your computer

Open a terminal in this folder and run:

```bash
python3 -m http.server
```

Then go to <http://localhost:8000> in your browser. Press `Ctrl + C` in the terminal to stop it.

(You can also double-click `index.html`, but a local server is closer to how the live site behaves.)

## Put it online

No build is needed. Just upload this folder as-is.

- **Netlify:** go to <https://app.netlify.com/drop> and drag this folder onto the page. Or connect the GitHub repo, leave the build command empty and set the publish directory to `/`.
- **Vercel:** “Add New → Project”, import the GitHub repo, choose the **Other** framework preset, and leave the build command and output directory empty.
- **GitHub Pages:** in the repo, go to Settings → Pages, choose “Deploy from a branch”, pick your branch and the `/ (root)` folder.

All three show `404.html` automatically for missing pages.

### After the site has its real web address

Search for `jnbzpainting.ca` in `index.html` and `robots.txt`. There are comments showing where to add:

- the **canonical** link,
- `og:url` and full image URLs for social sharing previews,
- the `"url"` line in the business details block (JSON-LD) that Google reads,
- the sitemap line in `robots.txt` (optional).

## Editing text, phone number and email

All the words are in `index.html`. Each section starts with a comment like `<!-- ============ REVIEWS ============ -->`, so you can find your place.

The **phone number** appears in several places. Search `index.html` for **both**:

- `778-552-4926`, the number people see, and
- `17785524926`, the number phones dial (in `href="tel:17785524926"`).

Also update `"telephone"` in the business details block near the top of `index.html`, and the number in `404.html`.

The **email** (`info@jnbzpainting.ca`) and **address** are in the “QUOTE + CONTACT FORM” section and in the business details block.

**Colours** are at the top of `styles.css` (for example `--green: #43A447;`).

## Hooking up the form

There’s no server, so the quote form needs a form service to email you the requests. [Formspree](https://formspree.io) works well (it has a free plan). Others like Basin or Getform work the same way.

1. Create a free Formspree account and a new form. It gives you an address like `https://formspree.io/f/abcdwxyz`.
2. Open `script.js`. Near the top, change

   ```js
   const FORM_ENDPOINT = '';
   ```

   to

   ```js
   const FORM_ENDPOINT = 'https://formspree.io/f/abcdwxyz';
   ```

3. Upload the site again, and send yourself a test request.

How it works:

- The form sends these fields: `name`, `phone`, `email`, `city`, `project_types` (the selected buttons, for example “Interior, Cabinets”) and `message`.
- It’s sent as a normal form `POST` with the header `Accept: application/json`, which is what Formspree expects.
- If it’s sent successfully, the form is replaced by “Thanks. Jan will be in touch to book your free quote.”
- If sending fails, a red message asks the visitor to try again or call.
- **While `FORM_ENDPOINT` is empty**, the thank-you message still shows but **nothing is sent**. A warning appears in the browser’s developer console. Remember to set it before launch!

## Good to know

- Animations switch off automatically for visitors whose device is set to “reduce motion”.
- If JavaScript is off, everything still shows. Only the animations and form sending need it.
- Don’t put `support.js` from the design handoff on the site. It was only for the prototype.
