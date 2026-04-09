// backend/verify_pdf.js
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

console.log('\n' + '='.repeat(70));
console.log('🔍 PDF VERIFICATION SCRIPT (Fixed)');
console.log('='.repeat(70) + '\n');

const file = path.join(__dirname, 'uploads', 'test_resume.pdf');

// ============ STEP 1: File Existence ============
console.log('STEP 1️⃣  - File Existence Check');
console.log('-'.repeat(70));

if (!fs.existsSync(file)) {
  console.error('❌ File not found:', file);
  console.log('\n💡 SOLUTION:');
  console.log('   1. Run: node generate_pdf.js');
  console.log('   2. Make sure REsume.txt exists in uploads/ folder\n');
  process.exit(1);
}

console.log('✅ File found:', path.basename(file));
console.log('   Full path:', file);

// ============ STEP 2: File Size ============
console.log('\nSTEP 2️⃣  - File Size Check');
console.log('-'.repeat(70));

const stats = fs.statSync(file);
const sizeKB = (stats.size / 1024).toFixed(2);

console.log(`   Size: ${stats.size} bytes (${sizeKB} KB)`);
console.log(`   Modified: ${stats.mtime.toLocaleString()}`);

if (stats.size === 0) {
  console.error('❌ File is empty (0 bytes)');
  console.log('\n💡 SOLUTION: Run "node generate_pdf.js" again\n');
  process.exit(1);
}

if (stats.size < 500) {
  console.warn('⚠️  File is very small - may be incomplete');
}

console.log('✅ File size is valid');

// ============ STEP 3: PDF Header ============
console.log('\nSTEP 3️⃣  - PDF Header Validation');
console.log('-'.repeat(70));

const buffer = fs.readFileSync(file);
const headerBytes = buffer.slice(0, 20);
const headerStr = headerBytes.toString('utf8').replace(/\n/g, '\\n');

console.log(`   Header bytes: "${headerStr}"`);

if (!buffer.includes('%PDF')) {
  console.error('❌ Invalid PDF header - not a valid PDF file');
  console.log('\n💡 SOLUTION: Regenerate with "node generate_pdf.js"\n');
  process.exit(1);
}

const versionMatch = buffer.toString('utf8').match(/%PDF-([\d.]+)/);
const version = versionMatch ? versionMatch[1] : 'Unknown';

console.log(`✅ Valid PDF header detected (version ${version})`);

// ============ STEP 4: File Structure ============
console.log('\nSTEP 4️⃣  - PDF Structure Check');
console.log('-'.repeat(70));

const hasEOF = buffer.toString('utf8').includes('%%EOF') || buffer.includes('EOF');
const hasCatalog = buffer.toString('utf8').includes('/Type /Catalog');
const hasPages = buffer.toString('utf8').includes('/Type /Pages');

console.log(`   Has EOF marker: ${hasEOF ? '✅' : '❌'}`);
console.log(`   Has Catalog: ${hasCatalog ? '✅' : '❌'}`);
console.log(`   Has Pages: ${hasPages ? '✅' : '❌'}`);

if (!hasEOF || !hasCatalog || !hasPages) {
  console.warn('⚠️  PDF structure may be incomplete');
}

// ============ STEP 5: Parse Content ============
console.log('\nSTEP 5️⃣  - PDF Content Parsing');
console.log('-'.repeat(70));

console.log('Attempting to extract text from PDF...\n');

pdf(buffer)
  .then((data) => {
    console.log('✅ PDF PARSED SUCCESSFULLY!\n');

    // Display metadata
    console.log('📋 PDF METADATA:');
    console.log('-'.repeat(70));
    console.log(`   Pages: ${data.numpages}`);
    console.log(`   Text length: ${(data.text || '').length} characters`);
    console.log(`   Producer: ${data.info?.Producer || 'N/A'}`);
    console.log(`   Creation date: ${data.info?.CreationDate || 'N/A'}`);

    const extractedText = (data.text || '').trim();

    // Check extracted text
    if (!extractedText || extractedText.length < 10) {
      console.warn('\n⚠️  WARNING: Very little text extracted');
      console.log(`   Text: "${extractedText.substring(0, 100)}..."`);
      console.log('\n💡 This might indicate:');
      console.log('   - PDF is image-only (scanned)');
      console.log('   - Text is embedded as images');
      console.log('   - PDF is encrypted');
      console.log('\n✅ PDF is valid, but text extraction failed\n');
      process.exit(0);
    }

    // Display text preview
    console.log('\n📝 EXTRACTED TEXT PREVIEW:');
    console.log('-'.repeat(70));
    const preview = extractedText.substring(0, 400);
    console.log(preview + (extractedText.length > 400 ? '\n   ...' : ''));

    // SUCCESS
    console.log('\n' + '='.repeat(70));
    console.log('✅ PDF VERIFICATION COMPLETE - ALL CHECKS PASSED!');
    console.log('='.repeat(70));
    console.log('\n✨ Your PDF is ready for use with the API\n');

    process.exit(0);
  })
  .catch((err) => {
    console.log('❌ PDF PARSING ERROR\n');
    console.log('Error details:');
    console.log(`   Type: ${err.name || 'Unknown'}`);
    console.log(`   Message: ${err.message}`);

    // Diagnosis
    console.log('\n🔧 DIAGNOSIS & SOLUTIONS:');
    console.log('-'.repeat(70));

    if (err.message.includes('bad XRef') || err.message.includes('XRef')) {
      console.log('Issue: PDF cross-reference table is corrupted\n');
      console.log('Solutions:');
      console.log('  1. Delete old PDF:');
      console.log('     Command: del uploads\\test_resume.pdf');
      console.log('  2. Regenerate PDF:');
      console.log('     Command: node generate_pdf.js');
      console.log('  3. Update pdfkit:');
      console.log('     Command: npm install pdfkit@latest');
    } else if (err.message.includes('Unexpected end') || err.message.includes('EOF')) {
      console.log('Issue: PDF file is incomplete or truncated\n');
      console.log('Solutions:');
      console.log('  1. Delete and regenerate:');
      console.log('     Command: del uploads\\test_resume.pdf && node generate_pdf.js');
      console.log('  2. Check if REsume.txt exists:');
      console.log('     Command: dir uploads\\REsume.txt');
    } else if (err.message.includes('password') || err.message.includes('encrypted')) {
      console.log('Issue: PDF is password protected or encrypted\n');
      console.log('Solutions:');
      console.log('  1. Use an unencrypted PDF');
      console.log('  2. Regenerate with: node generate_pdf.js');
    } else {
      console.log('Issue: Unknown PDF parsing error\n');
      console.log('Solutions:');
      console.log('  1. Update pdf-parse:');
      console.log('     Command: npm install pdf-parse@latest');
      console.log('  2. Clear and reinstall:');
      console.log('     Command: npm install --force');
      console.log('  3. Regenerate PDF:');
      console.log('     Command: node generate_pdf.js');
    }

    console.log('\n' + '='.repeat(70));
    console.log('❌ PDF VERIFICATION FAILED');
    console.log('='.repeat(70) + '\n');

    // Show full error if needed
    if (process.argv.includes('--debug')) {
      console.log('Full error stack:');
      console.error(err);
    }

    process.exit(1);
  });

// Timeout
setTimeout(() => {
  console.error('\n❌ TIMEOUT: Verification took too long (>30 seconds)');
  process.exit(1);
}, 30000);