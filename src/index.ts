// Read all files in directory /backup
import { readdirSync } from 'node:fs';

function getDate(name: string): Date | null {
    // nodebb-25-10-22.tar.gz
    const parts = name.split('-');
    if (parts.length >= 4) {
        const day = 2000 + parseInt(parts[1], 10);
        const month = parseInt(parts[2], 10) - 1;
        const year = parseInt(parts[3].split('.')[0], 10);
        return new Date(year, month, day);
    }
    return null;
}

const list = readdirSync('/backup');
// delete all backups oder than 30 days
for (const file of list) {
    const date = getDate(file);
    if (date) {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = diff / (1000 * 60 * 60 * 24);
        if (days > 30) {
            console.log(`Deleting backup file: ${file}`);
            // uncomment the next line to actually delete the files
            // fs.unlinkSync(`/backup/${file}`);
        }
    }
}