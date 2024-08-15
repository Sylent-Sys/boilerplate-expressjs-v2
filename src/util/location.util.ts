import { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs-extra";
import path from "path";

export default class LocationUtil {
  fs: typeof fs;
  path: typeof path;
  importMeta: string;
  constructor() {
    this.fs = fs;
    this.path = path;
    this.importMeta = fileURLToPath(import.meta.url);
  }
  getFolderPath({
    folderName = "",
    stepBack = 1,
    createIfNotExist = false,
  }: {
    folderName?: string | string[];
    stepBack?: number;
    createIfNotExist?: boolean;
  } = {}) {
    let path =
      dirname(this.importMeta)
        .split(this.path.sep)
        .slice(0, -stepBack)
        .join(this.path.sep) + this.path.sep;
    if (folderName) {
      if (Array.isArray(folderName)) {
        folderName.forEach((folder) => {
          path += folder + this.path.sep;
        });
      } else {
        path += folderName + this.path.sep;
      }
    }
    if (createIfNotExist) {
      fs.ensureDirSync(path);
    }
    return path;
  }
  getOuterFolderPath({
    folderName = "",
    createIfNotExist = false,
  }: {
    folderName?: string | string[];
    createIfNotExist?: boolean;
  } = {}) {
    let path =
      dirname(this.importMeta)
        .split(this.path.sep)
        .slice(0, -2)
        .join(this.path.sep) + this.path.sep;
    if (folderName) {
      if (Array.isArray(folderName)) {
        folderName.forEach((folder) => {
          path += folder + this.path.sep;
        });
      } else {
        path += folderName + this.path.sep;
      }
    }
    if (createIfNotExist) {
      fs.ensureDirSync(path);
    }
    return path;
  }
  getPublicFolderPath({
    folderName = "",
    createIfNotExist = false,
  }: {
    folderName?: string | string[];
    createIfNotExist?: boolean;
  } = {}) {
    let path =
      dirname(this.importMeta)
        .split(this.path.sep)
        .slice(0, -2)
        .join(this.path.sep) +
      this.path.sep +
      "public" +
      this.path.sep;
    if (folderName) {
      if (Array.isArray(folderName)) {
        folderName.forEach((folder) => {
          path += folder + this.path.sep;
        });
      } else {
        path += folderName + this.path.sep;
      }
    }
    if (createIfNotExist) {
      fs.ensureDirSync(path);
    }
    return path;
  }
}
