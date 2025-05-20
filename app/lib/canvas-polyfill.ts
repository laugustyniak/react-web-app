// This file provides browser-compatible implementations for Node.js canvas
// To fix the "Cannot find module 'canvas'" error in browser environments

// Create an empty module to satisfy imports from Konva
// This ensures that any code trying to import 'canvas' will receive an object
// instead of throwing an error
const canvas = {};

export default canvas;
