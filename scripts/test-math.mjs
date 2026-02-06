#!/usr/bin/env node
/**
 * Test script for gain-math functions
 * Run with: node scripts/test-math.mjs
 */

import { logTaper, linearTaper, softClip, getClipState, nfbGain, tonestackMod } from '../src/js/core/gain-math.js';

console.log('=== Gain Math Function Tests ===\n');

// Test logTaper
console.log('logTaper tests:');
console.log(`  logTaper(0):  ${logTaper(0)} (expected: -60)`);
console.log(`  logTaper(5):  ${logTaper(5).toFixed(2)} (expected: ~-12)`);
console.log(`  logTaper(10): ${logTaper(10).toFixed(2)} (expected: 0)`);
console.log();

// Test linearTaper
console.log('linearTaper tests:');
console.log(`  linearTaper(0):  ${linearTaper(0)} (expected: -10)`);
console.log(`  linearTaper(5):  ${linearTaper(5)} (expected: 0)`);
console.log(`  linearTaper(10): ${linearTaper(10)} (expected: 10)`);
console.log();

// Test softClip
console.log('softClip tests:');
const clip1 = softClip(30, 38, 6);  // Below onset
const clip2 = softClip(36, 38, 6);  // At onset
const clip3 = softClip(45, 38, 6);  // Heavy clipping
console.log(`  softClip(30, 38, 6): clamped=${clip1.clamped}, drive=${clip1.drive} (below onset)`);
console.log(`  softClip(36, 38, 6): clamped=${clip2.clamped.toFixed(2)}, drive=${clip2.drive.toFixed(2)} (at onset)`);
console.log(`  softClip(45, 38, 6): clamped=${clip3.clamped.toFixed(2)}, drive=${clip3.drive.toFixed(2)} (heavy clip)`);
console.log();

// Test getClipState
console.log('getClipState tests:');
console.log(`  getClipState(0, 30, 38):   "${getClipState(0, 30, 38)}" (expected: "")`);
console.log(`  getClipState(0, 30, 38):   "${getClipState(0, 30, 38)}" (expected: "green" for level near threshold)`);
console.log(`  getClipState(1, 35, 38):   "${getClipState(1, 35, 38)}" (expected: "yellow")`);
console.log(`  getClipState(4, 40, 38):   "${getClipState(4, 40, 38)}" (expected: "orange")`);
console.log(`  getClipState(8, 50, 38):   "${getClipState(8, 50, 38)}" (expected: "red")`);
console.log();

// Test nfbGain
console.log('nfbGain tests:');
console.log(`  nfbGain(0):  ${nfbGain(0).toFixed(1)} (expected: -3.0)`);
console.log(`  nfbGain(5):  ${nfbGain(5).toFixed(1)} (expected: 0.0)`);
console.log(`  nfbGain(10): ${nfbGain(10).toFixed(1)} (expected: 3.0)`);
console.log();

// Test tonestackMod
console.log('tonestackMod tests:');
console.log(`  tonestackMod(5, 5, 5): ${tonestackMod(5, 5, 5).toFixed(1)} (expected: 0.0)`);
console.log(`  tonestackMod(10, 10, 10): ${tonestackMod(10, 10, 10).toFixed(1)} (expected: 4.5)`);
console.log(`  tonestackMod(0, 0, 0): ${tonestackMod(0, 0, 0).toFixed(1)} (expected: -4.5)`);
console.log();

console.log('=== All tests completed ===');
