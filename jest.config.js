export default { 
  transform: {}, 
  testEnvironment: "node",
  testPathIgnorePatterns: [
    "/node_modules/",
    "/__tests__/load",
    "/__tests__/config/",
    "coverage",
    "fixtures",
    "/load/"
  ],
  setupFiles: [
    "./__tests__/config/setup.js"
  ],
  coverageDirectory: "./__tests__/coverage/",
  coveragePathIgnorePatterns: [
    "/__tests__/"
  ],
  verbose: true,
} ;
