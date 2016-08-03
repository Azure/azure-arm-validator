# Contributing

Contributions are always welcome! Be sure to follow the [github workflow](https://guides.github.com/introduction/flow/) when contributing to this project:

* Create an issue, or comment on an issue to indicate what you are working on. This avoids work duplication.
* Fork the repository and clone to your local machine
* You should already be on the default branch `master` - if not, check it out (`git checkout master`)
* Create a new branch for your feature/fix `git checkout -b my-new-feature`)
* Write your feature/fix
* Stage the changed files for a commit (`git add .`)
* Commit your files with a *useful* commit message ([example](https://github.com/Azure/azure-quickstart-templates/commit/53699fed9983d4adead63d9182566dec4b8430d4)) (`git commit`)
* Push your new branch to your GitHub Fork (`git push origin my-new-feature`)
* Visit this repository in GitHub and create a Pull Request.

# Running the Tests

Tests are written in the [`./test`](./test) folder, with mocks for Azure and MongoDB in [`./test/mocks`](./test/mocks). To run the tests you'll need to install [`grunt-cli`](https://npmjs.org/grunt-cli) and [`mocha-cli`](https://npmjs.org/mocha). After running `npm install` on this repository, run:

```
grunt test
```

These are the same tests that are ran in Travis CI. Happy coding!

# Adding a New Replacement Scheme

To add a new replacement scheme (e.g. `GEN-SSH-PUB-KEY`), create a new file in the replacementSchemes directory that exports a `replacementScheme` object with keys `indicator` and `value`. If you want, you can add a configuration key to the .example.conf file (and the .conf.json file based on it) and read it using the conf.get function. See `replacementScheme/genSshPubKey.js` for an example.