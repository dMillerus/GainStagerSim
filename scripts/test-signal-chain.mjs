#!/usr/bin/env node
/**
 * Test script for signal chain calculations
 * Run with: node scripts/test-signal-chain.mjs
 */

import { calculateSignalChain } from '../src/js/core/signal-chain.js';
import { defaultState } from '../src/js/config/amp-config.js';

console.log('=== Signal Chain Calculation Tests ===\n');

// Test with default settings
console.log('1. Default Settings:');
const defaultResult = calculateSignalChain(defaultState);
console.log('   Input:', defaultResult.stages[0]?.level, 'dBV');
console.log('   Preamp output:', defaultResult.preampOutput.toFixed(1), 'dBV');
console.log('   Final output:', defaultResult.finalOutput.toFixed(1), 'dBV');
console.log('   Total stages:', defaultResult.stages.length);
console.log('\n   Stage breakdown:');
defaultResult.stages.forEach(s => {
    const driveStr = s.drive > 0 ? ` (drive: ${s.drive.toFixed(1)})` : '';
    console.log(`     ${s.name.padEnd(10)}: ${s.level >= 0 ? '+' : ''}${s.level.toFixed(1)} dBV${driveStr}`);
});

// Test with max gain settings
console.log('\n2. Maximum Gain Settings:');
const maxGainState = {
    ...defaultState,
    guitarVolume: 10,
    gain1: 10,
    gain2: 10,
    master: 10,
    pussyTrimmer: 10
};
const maxResult = calculateSignalChain(maxGainState);
console.log('   Input:', maxResult.stages[0]?.level, 'dBV');
console.log('   Preamp output:', maxResult.preampOutput.toFixed(1), 'dBV');
console.log('   Final output:', maxResult.finalOutput.toFixed(1), 'dBV');

const clipping = maxResult.stages.filter(s => s.drive > 0);
console.log('   Clipping stages:', clipping.length);
clipping.forEach(s => {
    console.log(`     ${s.name}: drive ${s.drive.toFixed(1)} dB`);
});

// Test with clean settings
console.log('\n3. Clean Settings:');
const cleanState = {
    ...defaultState,
    guitarVolume: 5,
    gain1: 2,
    gain2: 2,
    master: 1,
    loopEnabled: false
};
const cleanResult = calculateSignalChain(cleanState);
console.log('   Input:', cleanResult.stages[0]?.level, 'dBV');
console.log('   Preamp output:', cleanResult.preampOutput.toFixed(1), 'dBV');
console.log('   Final output:', cleanResult.finalOutput.toFixed(1), 'dBV');

const cleanClipping = cleanResult.stages.filter(s => s.drive > 0);
console.log('   Clipping stages:', cleanClipping.length);
if (cleanClipping.length === 0) {
    console.log('   (Clean signal path - no saturation)');
}

// Test with loop disabled
console.log('\n4. FX Loop Disabled:');
const noLoopState = { ...defaultState, loopEnabled: false };
const noLoopResult = calculateSignalChain(noLoopState);
console.log('   Total stages:', noLoopResult.stages.length, '(vs', defaultResult.stages.length, 'with loop)');
console.log('   FX loop stages removed:', defaultResult.stages.length - noLoopResult.stages.length);

// Test ERA switch effect
console.log('\n5. ERA Switch Effect:');
['plexi', '80s', 'modern'].forEach(era => {
    const eraState = { ...defaultState, era };
    const eraResult = calculateSignalChain(eraState);
    const tonestack = eraResult.stages.find(s => s.name === 'Tonestack');
    console.log(`   ${era.padEnd(7)}: Tonestack ${tonestack?.level >= 0 ? '+' : ''}${tonestack?.level.toFixed(1)} dBV (loss: ${tonestack?.gain.toFixed(1)} dB)`);
});

console.log('\n=== All signal chain tests completed ===');
