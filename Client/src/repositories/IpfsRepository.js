// import fs from "fs";

import { create } from "ipfs-http-client";

export default {

  getFileURL (id) {
    return "https://node-ipfs.centreeasy.com/ipfs/"+ id;
  },

  uploadFile(file) {
    const ipfs = create('https://node-ipfs.centreeasy.com')
    return ipfs.add(file)
  },

};
