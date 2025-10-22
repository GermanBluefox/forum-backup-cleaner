// Read all files in directory /backup
import { readdirSync, unlinkSync } from 'node:fs';
const path = '/backup';

function getDate(name: string): Date | null {
    // nodebb-25-10-22.tar.gz
    const parts = name.split('-');
    if (parts.length >= 4) {
        const year = 2000 + parseInt(parts[1], 10);
        const month = parseInt(parts[2], 10) - 1;
        const day = parseInt(parts[3].split('.')[0], 10);
        return new Date(year, month, day);
    }
    return null;
}

const list = readdirSync(path);
const now = new Date();
// delete all backups oder than 30 days
for (const file of list) {
    const date = getDate(file);
    if (date) {
        const diff = now.getTime() - date.getTime();
        const days = diff / (1000 * 60 * 60 * 24);
        if (days > 30) {
            console.log(`Deleting backup file: ${file} (age: ${Math.floor(days)} days) (date: ${date.toISOString().split('T')[0]})`);
            unlinkSync(`${path}/${file}`);
        }
    }
}