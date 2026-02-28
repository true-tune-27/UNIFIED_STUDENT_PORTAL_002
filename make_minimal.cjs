const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = {
    // Dark blues -> Slate Dark to Mid
    '#1a237e': '#0f172a',
    '#283593': '#1e293b',
    '#1565c0': '#334155',
    '#3949ab': '#475569',
    '#5c6bc0': '#64748b',
    '#9fa8da': '#94a3b8',
    '#c5cae9': '#cbd5e1',
    '#e8eaf6': '#f1f5f9',

    // Backgrounds -> Slate Light
    '#f0f4ff': '#f8fafc',
    '#f5f7ff': '#ffffff',

    // Text colors -> Slate
    '#1e2a4a': '#0f172a',
    '#546e7a': '#475569',
    '#90a4ae': '#94a3b8',

    // Cyan -> Sky
    '#00acc1': '#0284c7',
    '#80d8ff': '#7dd3fc',
    '#26c6da': '#38bdf8',
    '#e0f7fa': '#f0f9ff',
    '#00838f': '#0369a1',
    '#0288d1': '#0369a1',

    // Teal
    '#00897b': '#0f766e',
    '#26a69a': '#14b8a6',
    '#e0f2f1': '#f0fdfa',
    '#00695c': '#115e59',

    // Orange -> Amber
    '#f57c00': '#d97706',
    '#ffb300': '#f59e0b',
    '#fff3e0': '#fffbeb',

    // Purple
    '#7b1fa2': '#7e22ce',
    '#9c27b0': '#9333ea',

    // Other specific replacements
    'rgba\\(26, 35, 126': 'rgba(15, 23, 42',
    'rgba\\(92, 107, 192': 'rgba(100, 116, 139',
    'rgba\\(0, 172, 193': 'rgba(2, 132, 199',
    'rgba\\(57, 73, 171': 'rgba(71, 85, 105',
    'rgba\\(0, 137, 123': 'rgba(15, 118, 110'
};

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            processDir(filePath);
        } else if (file.endsWith('.css') || file.endsWith('.jsx') || file.endsWith('.js')) {
            let content = fs.readFileSync(filePath, 'utf8');
            let newContent = content;

            for (const [key, value] of Object.entries(replacements)) {
                const regex = new RegExp(key, 'gi');
                newContent = newContent.replace(regex, value);
            }

            if (newContent !== content) {
                fs.writeFileSync(filePath, newContent, 'utf8');
                console.log(`Updated ${file}`);
            }
        }
    }
}

processDir(srcDir);
console.log('Color replacements complete.');
