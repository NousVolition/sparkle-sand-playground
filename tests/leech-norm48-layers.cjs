'use strict';

const countShellLayers = require('./leech-shell-layers.cjs');
module.exports = (words, weights) => countShellLayers(words, weights, 48);
