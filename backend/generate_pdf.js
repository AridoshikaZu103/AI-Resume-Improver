// backend/generate_pdf.js
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

console.log('\n' + '='.repeat(60));
console.log('🔄 PDF GENERATION SCRIPT (Fixed)');
console.log('='.repeat(60) + '\n');

const uploadsDir = path.join(__dirname, 'uploads');
const inputTxt = path.join(uploadsDir, 'REsume.txt');
const outputPdf = path.join(uploadsDir, 'test_resume.pdf');

// Create uploads directory
if (!fs.existsSync(uploadsDir)) {
  console.log('📁 Creating uploads directory...');
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Check input file
if (!fs.existsSync(inputTxt)) {
  console.error('❌ ERROR: REsume.txt not found');
  console.log('   Expected at:', inputTxt);
  process.exit(1);
}

// Read text
const text = fs.readFileSync(inputTxt, 'utf8');
console.log(`📄 Input file: REsume.txt (${text.length} characters)`);

// Delete old PDF
if (fs.existsSync(outputPdf)) {
  console.log('🗑️  Removing old PDF...');
  fs.unlinkSync(outputPdf);
}

// Create PDF with proper structure
console.log('\n📋 Creating PDF document...');

const doc = new PDFDocument({
  size: 'A4',
  margin: 50,
  bufferPages: false,  // IMPORTANT: Don't buffer
  autoFirstPage: true,
  compress: false      // IMPORTANT: Don't compress (keeps structure clean)
});

const writeStream = fs.createWriteStream(outputPdf);

// ERROR HANDLERS
doc.on('error', (err) => {
  console.error('❌ Document error:', err.message);
  process.exit(1);
});

writeStream.on('error', (err) => {
  console.error('❌ Write stream error:', err.message);
  process.exit(1);
});

// Pipe to file
doc.pipe(writeStream);

// Add content - SIMPLE AND CLEAN
doc.fontSize(16)
   .font('Helvetica-Bold')
   .text('RESUME', { align: 'center' })
   .moveDown(0.5);

doc.fontSize(10)
   .font('Helvetica')
   .text(text, {
     align: 'left',
     lineGap: 3,
     width: 495,
     continued: false
   });

// Finalize
console.log('✍️  Writing to PDF file...');
doc.end();

// Handle completion
writeStream.on('finish', () => {
  try {
    const stats = fs.statSync(outputPdf);
    console.log('\n✅ PDF GENERATED SUCCESSFULLY!');
    console.log('-'.repeat(60));
    console.log(`   📦 File: test_resume.pdf`);
    console.log(`   📊 Size: ${stats.size} bytes (${(stats.size / 1024).toFixed(2)} KB)`);
    console.log(`   📅 Created: ${new Date().toLocaleString()}`);
    console.log('-'.repeat(60));
    console.log('\n🔍 Next step: Run "node verify_pdf.js" to validate\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error reading generated file:', err.message);
    process.exit(1);
  }
});

// Timeout safety
setTimeout(() => {
  console.error('\n❌ TIMEOUT: PDF generation took too long');
  process.exit(1);
}, 15000);