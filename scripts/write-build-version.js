const fs = require("fs")
const path = require("path")

const buildVersion = new Date().toISOString()
const outputPath = path.resolve(__dirname, "../public/build-version.json")

const payload = {
  version: buildVersion,
}

fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2))
console.log(`Build version written to ${outputPath}: ${buildVersion}`)
