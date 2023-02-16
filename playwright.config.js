const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: "./test/playwright",
  expect: {
    timout: 5000
  },
  fullyParallel: true,
  reporter: 'html',
  use: {
    // does not work, wtf?
    // baseUrl: "http://localhost:8080/",
    timeout: 5 * 1000,
    headless: true  // change to 'false' if you want to see a browser open
  },
  projects: [
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    }  //,
    // {
    //   name: 'chromium',
    //   use: { ...devices['Desktop Chrome'] },
    // },
    
  ]
});