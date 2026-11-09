# SpecMatch

Side-by-side spec comparison for phones, tablets, watches, laptops, earbuds, monitors and smart home devices. The best value in every row is highlighted.

Live: <https://tech-compare-j1k5.vercel.app>

The catalogue covers 196 products from Apple, Google, Samsung and Xiaomi in 7 categories. You pick a category, choose how many products to compare, fill the slots, and get a table with a ranking and verdict per spec.

## Run it locally

```sh
git clone https://github.com/clemensjl/TechCompare.git
cd TechCompare
npm install && npm run dev
```

Other commands:

```sh
npm run typecheck   # tsc --noEmit
npm run build       # typecheck + production build to dist/ (single index.html)
npm run preview     # serve the production build
```

## Stack

React 19, TypeScript, Vite, Tailwind CSS 4. The build is inlined into one `index.html` with `vite-plugin-singlefile`. There is no backend; all product data lives in `src/data/products.ts`.

Deploy: Vercel.

## Contributing

Corrections to specs and new products are welcome, see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE) © 2026 Clemens Jele
