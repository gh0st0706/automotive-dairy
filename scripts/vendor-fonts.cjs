// Keep the desktop UI fully usable without third-party font requests.
const fs = require("node:fs/promises");
const path = require("node:path");
(async () => {
  const endpoint =
    "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=DM+Sans:wght@400;450;500;550;600;650;700&family=IBM+Plex+Mono:wght@400;450;500;600&display=swap";
  const response = await fetch(endpoint, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    },
  });
  if (!response.ok) throw new Error(`Font stylesheet: ${response.status}`);
  const css = await response.text();
  const blocks = [
    ...css.matchAll(/\/\* latin \*\/\s*(@font-face\s*\{[\s\S]*?\})/g),
  ].map((match) => match[1]);
  if (!blocks.length)
    throw new Error(`No Latin font subsets found: ${css.slice(0, 2000)}`);
  const directory = path.join(__dirname, "../src/assets/fonts");
  const licenseDirectory = path.join(__dirname, "../public/licenses");
  await fs.mkdir(directory, { recursive: true });
  await fs.mkdir(licenseDirectory, { recursive: true });
  const urls = new Map();
  const output = [];
  for (const block of blocks) {
    const url = block.match(/url\(([^)]+)\)/)[1];
    if (!urls.has(url)) {
      const filename = `workbench-${urls.size + 1}.woff2`;
      const font = await fetch(url);
      if (!font.ok) throw new Error(`Font file: ${font.status}`);
      await fs.writeFile(
        path.join(directory, filename),
        Buffer.from(await font.arrayBuffer()),
      );
      urls.set(url, filename);
    }
    output.push(block.replace(url, `./assets/fonts/${urls.get(url)}`));
  }
  await fs.writeFile(
    path.join(__dirname, "../src/fonts.css"),
    output.join("\n\n") + "\n",
  );
  for (const family of ["barlowcondensed", "dmsans", "ibmplexmono"]) {
    const license = await fetch(
      `https://raw.githubusercontent.com/google/fonts/main/ofl/${family}/OFL.txt`,
    );
    if (!license.ok)
      throw new Error(`Font license ${family}: ${license.status}`);
    await fs.writeFile(
      path.join(licenseDirectory, `${family}-OFL.txt`),
      await license.text(),
    );
  }
  console.log(`Saved ${urls.size} local font assets.`);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
