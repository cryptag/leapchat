'use strict';

require('babel-register')();

const jsdom = require("jsdom");
const { JSDOM } = jsdom;


global.document = new JSDOM(`<!DOCTYPE html><html></html>`);

global.window = document.window;

global.navigator = window.navigator;

