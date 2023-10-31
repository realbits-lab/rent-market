const path = require("path");
const fs = require("fs");
const {
  render,
  Build,
  buildSite,
  Config,
  defaults,
  loadTemplates,
} = require("solidity-docgen");
const {
  CompileFailedError,
  CompileResult,
  compileSol,
  ASTReader,
} = require("solc-typed-ast");

const docgen = async (builds, userConfig) => {
  const config = { ...defaults, ...userConfig };

  const templates = await loadTemplates(
    config.theme,
    config.root,
    config.templates
  );
  const site = buildSite(builds, config, templates.properties ?? {});
  const renderedSite = render(site, templates, config.collapseNewlines);

  for (const [index, { id, contents }] of renderedSite.entries()) {
    const outputFile = path.resolve(config.root, config.outputDir, id);
    fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    const filename = path.parse(outputFile).name;
    const patchedContents = `---\ntitle: ${filename}\npagenum: ${
      index + 1
    }\n---\n${contents}`;
    fs.writeFileSync(outputFile, patchedContents);
  }
};

const main = async () => {
  let result;
  try {
    result = await compileSol("contracts/rentNFT.sol", "auto");
  } catch (e) {
    if (e instanceof CompileFailedError) {
      console.error("Compile errors encountered:");

      for (const failure of e.failures) {
        console.error(`Solc ${failure.compilerVersion}:`);

        for (const error of failure.errors) {
          console.error(error);
        }
      }
    } else {
      console.error(e.message);
    }
  }

  // console.log("typeof result: ", typeof result);

  const reader = new ASTReader();
  const sourceUnits = reader.read(result.data);
  // console.log("Used compiler version: " + result.compilerVersion);
  // for (let i = 0; i < sourceUnits.length; i++) {
  //   console.log(sourceUnits[i].print());
  // }

  const config = {
    root: process.cwd(),
    sourcesDir: "contracts",
    // 'single' | 'items' | 'files'
    outputDir: "../realbits-doc.github.io/_collections/_chapters/solidity",
    pages: "files",
    exclude: [],
    theme: "markdown",
    collapseNewlines: true,
    pageExtension: ".md",
    // templates: "./docs",
  };

  // console.log("result.data.sources: ", result.data.sources);
  const output = JSON.parse(JSON.stringify(result.data));
  await docgen([{ output: output }], config);
};

main();
