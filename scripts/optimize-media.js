#!/usr/bin/env node

/**
 * Media Optimization Script
 * Optimizes images and videos for web delivery
 *
 * Usage: node scripts/optimize-media.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const MEDIA_DIR = path.join(__dirname, '../media');
const OUTPUT_DIR = path.join(__dirname, '../media/optimized');

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('🎨 Starting media optimization...\n');

/**
 * Check if required tools are installed
 */
function checkDependencies() {
    const tools = {
        sharp: 'npm package for image optimization',
        ffmpeg: 'command-line tool for video optimization'
    };

    try {
        require('sharp');
        console.log('✓ sharp is installed');
    } catch (e) {
        console.log('⚠️  sharp not found. Run: npm install sharp');
    }

    try {
        execSync('ffmpeg -version', { stdio: 'ignore' });
        console.log('✓ ffmpeg is installed');
    } catch (e) {
        console.log('⚠️  ffmpeg not found. Install from: https://ffmpeg.org/');
    }
}

/**
 * Optimize images using sharp
 */
async function optimizeImages() {
    const sharp = require('sharp');
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

    const files = fs.readdirSync(MEDIA_DIR).filter(file => {
        const ext = path.extname(file).toLowerCase();
        return imageExtensions.includes(ext);
    });

    console.log(`\n📸 Optimizing ${files.length} images...`);

    for (const file of files) {
        const inputPath = path.join(MEDIA_DIR, file);
        const outputName = path.parse(file).name + '.webp';
        const outputPath = path.join(OUTPUT_DIR, outputName);

        try {
            await sharp(inputPath)
                .webp({ quality: 85, effort: 6 })
                .resize(2400, null, { withoutEnlargement: true })
                .toFile(outputPath);

            const inputSize = fs.statSync(inputPath).size;
            const outputSize = fs.statSync(outputPath).size;
            const savings = ((1 - outputSize / inputSize) * 100).toFixed(1);

            console.log(`  ✓ ${file} → ${outputName} (${savings}% smaller)`);
        } catch (error) {
            console.log(`  ✗ Failed to optimize ${file}: ${error.message}`);
        }
    }
}

/**
 * Optimize videos using ffmpeg
 */
function optimizeVideos() {
    const videoExtensions = ['.mp4', '.mov', '.avi', '.webm'];

    const files = fs.readdirSync(MEDIA_DIR).filter(file => {
        const ext = path.extname(file).toLowerCase();
        return videoExtensions.includes(ext);
    });

    if (files.length === 0) {
        console.log('\n🎬 No videos to optimize');
        return;
    }

    console.log(`\n🎬 Optimizing ${files.length} videos...`);

    for (const file of files) {
        const inputPath = path.join(MEDIA_DIR, file);
        const outputName = path.parse(file).name + '-optimized.mp4';
        const outputPath = path.join(OUTPUT_DIR, outputName);

        try {
            // Optimize video: H.264 codec, CRF 23, scale to max 1920px width
            execSync(
                `ffmpeg -i "${inputPath}" -c:v libx264 -crf 23 -preset slow -vf "scale='min(1920,iw)':'-2'" -c:a aac -b:a 128k -movflags +faststart "${outputPath}" -y`,
                { stdio: 'inherit' }
            );

            const inputSize = fs.statSync(inputPath).size;
            const outputSize = fs.statSync(outputPath).size;
            const savings = ((1 - outputSize / inputSize) * 100).toFixed(1);

            console.log(`  ✓ ${file} → ${outputName} (${savings}% smaller)`);
        } catch (error) {
            console.log(`  ✗ Failed to optimize ${file}`);
        }
    }
}

/**
 * Main execution
 */
async function main() {
    checkDependencies();

    try {
        await optimizeImages();
        optimizeVideos();
        console.log('\n✨ Media optimization complete!\n');
        console.log(`📁 Optimized files saved to: ${OUTPUT_DIR}\n`);
    } catch (error) {
        console.error('Error during optimization:', error);
        process.exit(1);
    }
}

main();
