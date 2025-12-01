// Read all files in directory /backup
import { readdirSync, unlinkSync, lstatSync } from 'node:fs';
import _config from './config.json';
const config = _config as {
    directory?: string;
    maxSize?: string | number;
    maxDays?: number;
    dryRun?: boolean;
    patterns?: string[];
};
let path = config.directory || '/backup';
if (path.endsWith('/')) {
    path = path.slice(0, -1);
}

config.maxDays ||= 30;
if (config.maxSize) {
    if (typeof config.maxSize === 'string') {
        if (config.maxSize.endsWith('MB')) {
            config.maxSize = parseInt(config.maxSize.slice(0, -2), 10) * 1024 * 1024;
        } else if (config.maxSize.endsWith('GB')) {
            config.maxSize = parseInt(config.maxSize.slice(0, -2), 10) * 1024 * 1024 * 1024;
        } else if (config.maxSize.endsWith('KB')) {
            config.maxSize = parseInt(config.maxSize.slice(0, -2), 10) * 1024;
        } else {
            config.maxSize = parseInt(config.maxSize, 10);
        }
    }
// Make configSize in MB
    config.maxSize = Math.round(config.maxSize / (1024 * 1024));
}

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

let list = readdirSync(path);
list.sort();
const now = new Date();

// delete all backups oder than 30 days
for (let i = list.length - 1; i >= 0; i--) {
    const file = list[i];
    const date = getDate(file);
    if (date) {
        const diff = now.getTime() - date.getTime();
        const days = diff / (3_600_000 * 24);
        if (days > config.maxDays) {
            console.log(`Deleting backup file: ${file} (age: ${Math.floor(days)} days) (date: ${date.toISOString().split('T')[0]})`);
            if (!config.dryRun) {
                unlinkSync(`${path}/${file}`);
            }
        }
    }
}
function getDirSizeMB(path: string): number {
    let totalSize = 0;
    const files = readdirSync(path);
    for (const file of files) {
        const stat = lstatSync(`${path}/${file}`);
        totalSize += Math.round(stat.size / (1024 * 1024));
    }
    return totalSize;
}

list = readdirSync(path);
list.sort();
let size = 0;

if (config.patterns) {
    const regs = config.patterns.map(pattern => new RegExp(pattern.replace(/\./g, '\\.').replace(/\*/g, '.*')));
    for (let i = 0; i < list.length; i++) {
        if (getDirSizeMB(path) <= (config.maxSize as number)) {
            break;
        }
        const file = list[i];
        if (!regs[0].test(file)) {
            continue;
        }
        // extract date from file name: mongo-25-11-18.gz
        let date = file.match(/\d\d-\d\d-\d\d/);
        // Find all files with this date
        if (date) {
            const dateStr = date[0];
            const filesToDelete = list.filter(f => f.includes(dateStr));
            for (const f of filesToDelete) {
                const stat = lstatSync(`${path}/${f}`);
                const fileSize = Math.round(stat.size / (1024 * 1024)); // convert to megabytes
                console.log(`Deleting backup file: ${f} (total size exceeded: ${fileSize} MB)`);
                // Delete all files with this date
                if (!config.dryRun) {
                    unlinkSync(`${path}/${f}`);
                }
            }
        }
    }
} else {
    for (let i = list.length - 1; i >= 0; i--) {
        const file = list[i];
        const stat = lstatSync(`${path}/${file}`);
        size += Math.round(stat.size / (1024 * 1024));
        let deleteFollowing = false;
        if (config.maxSize && (deleteFollowing || size > (config.maxSize as number))) {
            console.log(`Deleting backup file: ${file} (total size exceeded: ${size} MB)`);
            if (!config.dryRun) {
                unlinkSync(`${path}/${file}`);
            }
            deleteFollowing = true;
        }
    }
}
