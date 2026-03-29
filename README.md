<div align="center">
  <img src="assets/logo.svg" alt="HRecipe" width="80" />
  <h1>HRecipe</h1>
  <p><b>A lovely home recipe management app focused on practicality.</b></p>
  <p>
    <b>English</b>&nbsp;&nbsp;|&nbsp;&nbsp;<a href="README_ZH_CN.md">简体中文</a>
  </p>
</div>

---

## UI/UX

<table>
  <tr>
    <td width="50%"><img src="docs/README/recipes.png" alt="Recipe List" /></td>
    <td width="50%"><img src="docs/README/recipe_details.png" alt="Recipe Details" /></td>
  </tr>
  <tr>
    <td align="center">Recipe List — Search & Tag Filtering</td>
    <td align="center">Recipe Details — Ingredients & Steps at a Glance</td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/README/combos.png" alt="Combo List" /></td>
    <td width="50%"><img src="docs/README/combo_details.png" alt="Combo Details" /></td>
  </tr>
  <tr>
    <td align="center">Combo List</td>
    <td align="center">Combo Details — Multi-Dish Meal Planning</td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/README/shopping_list.png" alt="Shopping List" /></td>
    <td width="50%"><img src="docs/README/slideshow.png" alt="Cooking Slideshow" /></td>
  </tr>
  <tr>
    <td align="center">Shopping List — Auto-Merge & One-Click Copy</td>
    <td align="center">Cooking Slideshow — Cook as You Watch</td>
  </tr>
</table>

## Features

- **Recipe Management** — Create, edit, delete recipes; Markdown descriptions & steps; multi-image upload
- **Ingredients & Tags** — Unified ingredient library and tag system with search and filtering
- **Combos** — Combine multiple dishes into a single meal, auto-calculate total cooking time
- **Shopping List** — Auto-generated from recipes or combos, smart ingredient merging, grouped/merged views, one-click copy as plain text
- **Cooking Slideshow** — Fullscreen step-by-step view with images, cook as you watch
- **Review System** — Family members can rate and comment on recipes (toggleable via environment variable)
- **i18n** — Built-in Simplified Chinese & English, auto-detects browser language
- **Dark / Light Theme** — Follows system preference or manual toggle
- **MCP Server** — Built-in [Model Context Protocol](https://modelcontextprotocol.io) server, AI assistants can manage recipes directly
- **Export as Plain Text** — Shopping lists exportable as text or JSON for easy sharing
- **SQLite Database** — Zero-config, single-file persistence, perfect for home use
- **Docker Deployment** — Up and running with a single command

## Deployment

### Docker Run

```bash
docker run -d \
  --name hrecipe \
  -p 3000:3000 \
  -v hrecipe-data:/app/data \
  ghcr.io/ykdz/hrecipe
```

Visit `http://localhost:3000` to get started.

Data (SQLite database + uploaded images) is persisted in the `/app/data` directory.

### Docker Compose

Create a `compose.yml`:

```yaml
services:
  hrecipe:
    image: ghcr.io/ykdz/hrecipe
    container_name: hrecipe
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - hrecipe-data:/app/data
    environment:
      - TITLE=HRecipe
      - FALLBACK_LOCALE=zh-CN
      - REVIEWS_ENABLED=true
      - HIDE_LANGUAGE_SWITCHER=false
      - FORCE_FALLBACK_LOCALE=false
      - MAX_FILE_SIZE=52428800

volumes:
  hrecipe-data:
```

```bash
docker compose up -d
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server listening port |
| `DATABASE_URL` | `/app/data/recipes.db` | SQLite database file path |
| `UPLOAD_DIR` | `./data/uploads` | Upload image storage directory |
| `MAX_FILE_SIZE` | `52428800` (50 MB) | Maximum upload file size in bytes |
| `TITLE` | `HRecipe` | Page title |
| `REVIEWS_ENABLED` | `true` | Enable review system (`true` / `false`) |
| `FALLBACK_LOCALE` | `zh-CN` | Fallback language when browser language cannot be detected |
| `HIDE_LANGUAGE_SWITCHER` | `false` | Hide the language switcher (`true` to hide) |
| `FORCE_FALLBACK_LOCALE` | `false` | Force fallback language, ignoring browser and cookie settings |

> **Tip**: For a Chinese-only interface, set `FORCE_FALLBACK_LOCALE=true` and `HIDE_LANGUAGE_SWITCHER=true`.

## MCP Integration

HRecipe includes a built-in [Model Context Protocol](https://modelcontextprotocol.io) server at `/mcp`.

AI assistants (such as Claude, GitHub Copilot, etc.) can manage your recipe data directly via the MCP protocol, including:

- Query / create / edit / delete recipes, ingredients, tags, combos, and reviews
- Search recipes (by name, description, or tags)
- Generate shopping lists (with merging & plain text output)

MCP configuration example:

```json
{
  "servers": {
    "hrecipe": {
      "type": "streamable-http",
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

## Credits

Made by [YKDZ](https://github.com/YKDZ) with ❤️ and `GitHub Copilot`.