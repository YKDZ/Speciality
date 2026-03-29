import type { Config } from "vike/types";

import vikePhoton from "vike-photon/config";
import vikeVue from "vike-vue/config";

export default {
  description: "Full stack recipe manager app",

  extends: [vikeVue, vikePhoton],

  passToClient: [
    "title",
    "locale",
    "localePreference",
    "colorSchemePreference",
  ],

  headHtmlBegin: `<script>!function(){try{var m=document.cookie.match(/(?:^|;\\s*)theme=(light|dark|auto)/),v=m&&m[1],d=document.documentElement;if(v==="dark")d.classList.add("dark");else if(!v||v==="auto"){if(window.matchMedia("(prefers-color-scheme:dark)").matches)d.classList.add("dark")}}catch(e){}}()</script>`,

  photon: {
    server: "../server/entry.ts",
  },
} as Config;
