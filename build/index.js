"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Read all files in directory /backup
const node_fs_1 = require("node:fs");
const config_json_1 = __importDefault(require("./config.json"));
const config = config_json_1.default;
let path = config.directory || '/backup';
if (path.endsWith('/')) {
    path = path.slice(0, -1);
}
config.maxDays || (config.maxDays = 30);
if (config.maxSize) {
    if (typeof config.maxSize === 'string') {
        if (config.maxSize.endsWith('MB')) {
            config.maxSize = parseInt(config.maxSize.slice(0, -2), 10) * 1024 * 1024;
        }
        else if (config.maxSize.endsWith('GB')) {
            config.maxSize = parseInt(config.maxSize.slice(0, -2), 10) * 1024 * 1024 * 1024;
        }
        else if (config.maxSize.endsWith('KB')) {
            config.maxSize = parseInt(config.maxSize.slice(0, -2), 10) * 1024;
        }
        else {
            config.maxSize = parseInt(config.maxSize, 10);
        }
    }
    // Make configSize in MB
    config.maxSize = Math.round(config.maxSize / (1024 * 1024));
}
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
const list = (0, node_fs_1.readdirSync)(path);
list.sort();
list.reverse();
const now = new Date();
// delete all backups oder than 30 days
let size = 0;
for (let i = list.length - 1; i >= 0; i--) {
    const file = list[i];
    const date = getDate(file);
    if (date) {
        const diff = now.getTime() - date.getTime();
        const days = diff / (3600000 * 24);
        if (days > config.maxDays) {
            console.log(`Deleting backup file: ${file} (age: ${Math.floor(days)} days) (date: ${date.toISOString().split('T')[0]})`);
            if (!config.dryRun) {
                (0, node_fs_1.unlinkSync)(`${path}/${file}`);
            }
        }
    }
    const stat = (0, node_fs_1.lstatSync)(`${path}/${file}`);
    size += Math.round(stat.size / (1024 * 1024));
    let deleteFollowing = false;
    if (config.maxSize && (deleteFollowing || size > config.maxSize)) {
        console.log(`Deleting backup file: ${file} (total size exceeded: ${Math.round(size / (1024 * 1024))} MB)`);
        if (!config.dryRun) {
            (0, node_fs_1.unlinkSync)(`${path}/${file}`);
        }
        deleteFollowing = true;
    }
}
//# sourceMappingURL=index.js.map