# ts-node-template

A simple template for running TypeScript on node.

Includes:

- [prettier](https://github.com/prettier/prettier) for formatting
- [nodemon](https://github.com/remy/nodemon) for watching file changes
- [dotenv](https://github.com/motdotla/dotenv) for loading environment variables

## Getting started

```sh
# Clone this repo
git clone https://github.com/fjdumont/ts-node-template
cd ts-node-template

# Install dependencies
npm i

# Start dev mode
npm run dev

# Alternatively, dev mode with debug support:
# npm run dev:debug
```

Nodemon watches your source files in ./src and re-runs the application on any file change.

## npm scripts

- `npm run format` formats your code
- `npm run dev` starts the dev mode
- `npm run dev:debug` starts the dev mode with debug support
- `npm run clean` removes build artifacts
- `npm run build` cleans and builds your project
- `npm run start` starts the built project

## Debugging

If you are running the application with debug support (`npm run dev:debug`), you can attach the node debugger to the running process. In vscode, use the supplied launch configuration.
