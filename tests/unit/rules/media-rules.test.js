#!/usr/bin/env node
/**
 * Test Suite for Media Accessibility Rules (Phase 7 - Wave 1)
 *
 * Tests 2 media accessibility rules:
 * - media-captions: Video elements should provide captions/subtitles
 * - audio-transcript: Audio elements should provide transcripts
 *
 * Run: node tests/unit/rules/media-rules.test.js
 */

const { fullSetup, resetDOM } = require('../../helpers/jsdom-setup');
const { fixtures, createTestElement } = require('../../helpers/dom-fixtures');
const { assertHasViolation, assertNoFindings, assertWCAGCriteria } = require('../../helpers/assertions');

// Setup environment once
fullSetup();

console.log('🎯 Testing Media Accessibility Rules (Phase 7 - Wave 1)\n');
console.log('='.repeat(70));

const tests = [];
let passed = 0;
let failed = 0;

function test(name, fn) {
  tests.push({ name, fn });
}

// =============================================================================
// RULE: media-captions (SIMPLE)
// WCAG 1.2.2 - Captions (Prerecorded)
// =============================================================================
// Implementation: Checks video elements for track[kind="captions"] or track[kind="subtitles"]
// Limitations:
// - Cannot verify track file exists or loads successfully
// - Cannot verify track has actual caption content
// - Cannot distinguish video-only content (which doesn't need captions)
// - Doesn't check track src attribute validity
// - Cannot detect captions provided by external players (YouTube, Vimeo)

test('media-captions: detects video without captions', () => {
  resetDOM();
  const video = fixtures.videoWithoutCaptions();
  document.body.appendChild(video);

  const findings = window.__a11yEngine.run(['media-captions']);

  const finding = assertHasViolation(findings, 'media-captions', 'Video without captions should be flagged');
  assertWCAGCriteria(finding, ['1.2.2'], 'Should reference WCAG 1.2.2');
});

test('media-captions: passes video with captions track', () => {
  resetDOM();
  const video = fixtures.videoWithCaptions();
  document.body.appendChild(video);

  const findings = window.__a11yEngine.run(['media-captions']);

  assertNoFindings(findings, 'Video with kind="captions" track should pass');
});

test('media-captions: passes video with subtitles track', () => {
  resetDOM();
  const video = fixtures.videoWithSubtitles();
  document.body.appendChild(video);

  const findings = window.__a11yEngine.run(['media-captions']);

  assertNoFindings(findings, 'Video with kind="subtitles" track should pass');
});

test('media-captions: detects video with descriptions track only', () => {
  resetDOM();
  const video = fixtures.videoWithDescriptionsOnly();
  document.body.appendChild(video);

  const findings = window.__a11yEngine.run(['media-captions']);

  assertHasViolation(findings, 'media-captions', 'Video with only kind="descriptions" should be flagged');
});

test('media-captions: passes video with multiple tracks including captions', () => {
  resetDOM();
  const video = fixtures.videoWithMultipleTracks();
  document.body.appendChild(video);

  const findings = window.__a11yEngine.run(['media-captions']);

  assertNoFindings(findings, 'Video with captions among multiple tracks should pass');
});

test('media-captions: skips hidden video elements', () => {
  resetDOM();
  const video = fixtures.hiddenVideo();
  document.body.appendChild(video);

  const findings = window.__a11yEngine.run(['media-captions']);

  assertNoFindings(findings, 'Hidden video (display:none) should be skipped by visibility check');
});

// =============================================================================
// RULE: audio-transcript (SIMPLE)
// WCAG 1.2.1 - Audio-only and Video-only (Prerecorded)
// =============================================================================
// Implementation: Checks for aria-describedby attribute OR any element with text matching /transcript/i
// Limitations:
// - Very loose heuristic - any "transcript" text anywhere on page counts
// - Cannot verify transcript matches audio content
// - Cannot validate aria-describedby points to valid element
// - May miss transcripts labeled differently
// - Doesn't check if transcript is actually accessible/visible
// - Cannot distinguish decorative audio that doesn't need transcript

test('audio-transcript: detects audio without transcript', () => {
  resetDOM();
  const audio = fixtures.audioWithoutTranscript();
  document.body.appendChild(audio);

  const findings = window.__a11yEngine.run(['audio-transcript']);

  const finding = assertHasViolation(findings, 'audio-transcript', 'Audio without transcript should be flagged');
  assertWCAGCriteria(finding, ['1.2.1'], 'Should reference WCAG 1.2.1');
});

test('audio-transcript: passes audio with aria-describedby', () => {
  resetDOM();
  const audio = fixtures.audioWithAriaDescribedby();
  document.body.appendChild(audio);

  const findings = window.__a11yEngine.run(['audio-transcript']);

  assertNoFindings(findings, 'Audio with aria-describedby should pass');
});

test('audio-transcript: passes audio with transcript link', () => {
  resetDOM();
  const container = fixtures.audioWithTranscriptLink();
  document.body.appendChild(container);

  const findings = window.__a11yEngine.run(['audio-transcript']);

  assertNoFindings(findings, 'Audio with "Transcript" link text should pass (pattern match /transcript/i)');
});

test('audio-transcript: passes audio with transcript text', () => {
  resetDOM();
  const container = fixtures.audioWithTranscriptText();
  document.body.appendChild(container);

  const findings = window.__a11yEngine.run(['audio-transcript']);

  assertNoFindings(findings, 'Audio with "transcript" in nearby text should pass');
});

test('audio-transcript: passes multiple audio with single transcript', () => {
  resetDOM();
  const container = fixtures.multipleAudioWithTranscript();
  document.body.appendChild(container);

  const findings = window.__a11yEngine.run(['audio-transcript']);

  // Note: Engine's loose heuristic means ANY "transcript" text on page helps ALL audio elements
  assertNoFindings(findings, 'All audio elements pass when any "transcript" text exists on page');
});

test('audio-transcript: detects audio with "script" text only (no pattern match)', () => {
  resetDOM();
  const container = fixtures.audioWithScriptText();
  document.body.appendChild(container);

  const findings = window.__a11yEngine.run(['audio-transcript']);

  // "script" doesn't match /transcript/i pattern
  assertHasViolation(findings, 'audio-transcript', 'Audio with only "script" text should be flagged (pattern requires "transcript")');
});

test('audio-transcript: skips hidden audio elements', () => {
  resetDOM();
  const audio = fixtures.hiddenAudio();
  document.body.appendChild(audio);

  const findings = window.__a11yEngine.run(['audio-transcript']);

  assertNoFindings(findings, 'Hidden audio (display:none) should be skipped by visibility check');
});

// =============================================================================
// Run All Tests
// =============================================================================

console.log('');
tests.forEach(({ name, fn }) => {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (err) {
    console.error(`❌ FAIL: ${name}`);
    console.error(`   ${err.message}`);
    failed++;
  }
});

console.log('');
console.log('='.repeat(70));
console.log('');
console.log(`📊 Results: ${passed} passed, ${failed} failed`);
console.log(`   Total tests: ${tests.length}`);

if (failed === 0) {
  console.log('');
  console.log('✨ All media rules tests passing!');
  console.log('');
  console.log('🎯 Coverage: 2 media accessibility rules tested with 13 test cases');
  console.log('');
  console.log('📈 Wave 1 complete - Ready for Wave 2');
  process.exit(0);
} else {
  console.log('');
  console.error('💥 Some tests failed. Please review.');
  process.exit(1);
}
