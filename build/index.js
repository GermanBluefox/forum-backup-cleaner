"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Read all files in directory /backup
const node_fs_1 = require("node:fs");
function getDate(name) {
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
const list = (0, node_fs_1.readdirSync)('/backup');
const now = new Date();
// delete all backups oder than 30 days
for (const file of list) {
    const date = getDate(file);
    if (date) {
        const diff = now.getTime() - date.getTime();
        const days = diff / (1000 * 60 * 60 * 24);
        if (days > 30) {
            console.log(`Deleting backup file: ${file} (age: ${Math.floor(days)} days) (date: ${date.toISOString().split('T')[0]})`);
            // uncomment the next line to actually delete the files
            // fs.unlinkSync(`/backup/${file}`);
        }
    }
}
//# sourceMappingURL=index.js.map