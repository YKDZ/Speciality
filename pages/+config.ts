import type { Config } from "vike/types";

import vikePhoton from "vike-photon/config";
import vikeVue from "vike-vue/config";

// Default config (can be overridden by pages)
// https://vike.dev/config

export default {
  title: "家庭食谱",
  description: "全栈家庭食谱维护应用",

  extends: [vikeVue, vikePhoton],

  photon: {
    server: "../server/entry.ts",
  },
} as Config;
