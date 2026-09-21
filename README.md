# Sort & Search Visualizer

An interactive, front-end-only web app for visualizing sorting and searching algorithms, core data structures, a Caesar cipher, and Big-O growth. It runs entirely in the browser, with no backend and no build step.

## Features

- **Sorting:** Selection Sort, Bubble Sort (step-by-step animation)
- **Searching:** Linear Search, Binary Search, DFS, BFS
- **Data structures:** Array, Stack, Queue, Linked List, and a Tree editor
- **Caesar cipher wheel:** encrypt and decrypt visually
- **Big-O visualizer:** compare how common complexities grow with input size
- **Interactive controls:** adjust array size, speed, and algorithm

## Tech Stack

- React 18 (loaded from a CDN, UMD build)
- JavaScript ES modules
- HTML5 and CSS3
- No backend, no bundler

## Project Structure

```
project/
├── index.html
├── src/
│   ├── app.js
│   ├── algorithms.js
│   ├── data_Structures.js
│   ├── complexityVisualizer.js
│   ├── bigO.js
│   └── cryptogarphy.js
├── styles/
│   └── styles.css
└── .gitignore
```

> Update the paths above so they match the actual folders.

## Getting Started

```bash
git clone https://github.com/bassameastro/project.git
cd project
```

Because the app uses ES modules, opening `index.html` directly may be blocked by the browser. Serve it locally instead:

```bash
# Python 3
python -m http.server 8000

# or Node.js
npx http-server
```

Then open `http://localhost:8000`.

## Usage

1. Pick a sorting or searching algorithm, or a data structure.
2. Set the array size and animation speed.
3. Press start and watch the steps play out.
4. Use the Big-O and cipher tabs to explore complexity and encryption.

## Contributing

1. Fork the repository
2. Create a branch: `git checkout -b feature/my-feature`
3. Commit and push your changes
4. Open a Pull Request

## License

MIT. Add a `LICENSE` file to the repo, or remove this section.

## Author

**Bassam**: [@bassameastro](https://github.com/bassameastro)
