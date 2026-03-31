<script setup lang="ts">
import { Menu, Monitor, Moon, Plus, Sun, X, Upload } from "lucide-vue-next";
import { usePageContext } from "vike-vue/usePageContext";
import { navigate } from "vike/client/router";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { toast } from "vue-sonner";

import logoUrl from "@/assets/logo.svg";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/composables/useLanguage";
import { useTheme } from "@/composables/useTheme";

import Button from "./ui/button/Button.vue";

const { t } = useI18n();
const { preference: themePref, isDark, setTheme } = useTheme();
const {
  preference: localePref,
  setPreference: setLocalePref,
  supportedLocales,
  showLanguageSwitcher,
} = useLanguage();
const pageContext = usePageContext();
const mobileOpen = ref(false);

const navLinks = computed(() => [
  { href: "/", label: t("食谱") },
  { href: "/combos", label: t("搭配") },
  { href: "/admin", label: t("控制面板") },
]);

const cycleTheme = () => {
  const order = ["auto", "light", "dark"] as const;
  const idx = order.indexOf(themePref.value as "auto" | "light" | "dark");
  setTheme(order[(idx + 1) % order.length]);
};

const themeIcon = computed(() => {
  if (themePref.value === "auto") return "auto";
  return themePref.value === "dark" ? "moon" : "sun";
});

const themeTitle = computed(() => {
  if (themePref.value === "auto") return t("跟随系统");
  return themePref.value === "dark" ? t("黑夜模式") : t("白天模式");
});

const selectedLocaleLabel = computed(() => {
  if (localePref.value === "auto") return t("跟随系统");
  const entry = supportedLocales.find((l) => l.id === localePref.value);
  return entry?.label ?? localePref.value;
});

const isActive = (href: string) => {
  const { urlPathname } = pageContext;
  return href === "/" ? urlPathname === href : urlPathname.startsWith(href);
};

const importDialogOpen = ref(false);

const handleImportFile = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/recipes/import", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    toast(t("导入失败：{reason}", { reason: res.statusText }));
    return;
  }
  const { recipeId } = await res.json();
  toast(t("导入成功"));
  importDialogOpen.value = false;
  await navigate(`/recipe/${recipeId}`);
};
</script>

<template>
  <header
    class="sticky top-0 z-50 border-b border-(--color-border) bg-surface/95 backdrop-blur-sm"
  >
    <div
      class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8"
    >
      <!-- Logo & Title -->
      <Button
        as="a"
        href="/"
        variant="ghost"
        class="text-lg font-bold tracking-tight"
      >
        <img :src="logoUrl" alt="Logo" class="size-7" />
        <span>{{ pageContext.globalContext.title }}</span>
      </Button>

      <!-- Desktop Nav -->
      <nav class="hidden items-center gap-6 text-sm font-medium md:flex">
        <Button
          v-for="link in navLinks"
          :key="link.href"
          as="a"
          :href="link.href"
          variant="ghost"
          size="sm"
          :class="
            isActive(link.href)
              ? 'font-semibold text-(--color-primary)'
              : 'text-(--color-on-surface-muted)'
          "
        >
          {{ link.label }}
        </Button>
      </nav>

      <!-- Actions (desktop) -->
      <div class="hidden items-center gap-3 md:flex">
        <!-- New Recipe button -->
        <Button variant="outline" @click="navigate('/recipe/new')">
          <Plus class="size-4" />
          {{ t("新建食谱") }}
        </Button>

        <!-- Import Dialog -->
        <Button
          variant="outline"
          :title="t('从 Markdown 导入')"
          @click="importDialogOpen = true"
        >
          <Upload class="h-4 w-4" />
        </Button>

        <!-- Language select -->
        <Select
          v-if="showLanguageSwitcher"
          :model-value="localePref"
          @update:model-value="
            (v) => {
              if (typeof v === 'string') setLocalePref(v);
            }
          "
        >
          <SelectTrigger
            size="sm"
            class="w-auto gap-1.5"
            :title="t('切换语言')"
          >
            <SelectValue :placeholder="selectedLocaleLabel">{{
              selectedLocaleLabel
            }}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">
              {{ t("跟随系统") }}
            </SelectItem>
            <SelectItem
              v-for="locale in supportedLocales"
              :key="locale.id"
              :value="locale.id"
            >
              {{ locale.label }}
            </SelectItem>
          </SelectContent>
        </Select>

        <!-- Dark mode toggle -->
        <Button
          variant="ghost"
          size="icon"
          :title="themeTitle"
          @click="cycleTheme()"
        >
          <Monitor v-if="themeIcon === 'auto'" class="h-5 w-5" />
          <Sun v-else-if="themeIcon === 'sun'" class="h-5 w-5" />
          <Moon v-else class="h-5 w-5" />
        </Button>
      </div>

      <!-- Mobile menu toggle -->
      <Button
        variant="ghost"
        class="md:hidden"
        size="icon"
        @click="mobileOpen = !mobileOpen"
      >
        <Menu v-if="!mobileOpen" class="h-5 w-5" />
        <X v-else class="h-5 w-5" />
      </Button>
    </div>

    <!-- Mobile Nav -->
    <nav
      v-if="mobileOpen"
      class="border-t border-(--color-border) px-4 pt-2 pb-4 md:hidden"
    >
      <Button
        v-for="link in navLinks"
        :key="link.href"
        as="a"
        :href="link.href"
        variant="ghost"
        size="sm"
        class="w-full justify-start"
        :class="
          isActive(link.href)
            ? 'text-(--color-primary)'
            : 'text-(--color-on-surface-muted)'
        "
        @click="mobileOpen = false"
      >
        {{ link.label }}
      </Button>

      <div class="my-2 border-t border-(--color-border)" />

      <Button
        variant="secondary"
        @click="
          mobileOpen = false;
          navigate('/recipe/new');
        "
      >
        <Plus class="size-4" />
        {{ t("新建食谱") }}
      </Button>
      <Button
        variant="outline"
        @click="
          mobileOpen = false;
          importDialogOpen = true;
        "
      >
        <Upload class="size-4" />
        {{ t("从 Markdown 导入") }}
      </Button>

      <div class="my-2 border-t border-(--color-border)" />

      <div class="flex items-center gap-3 px-3 py-2">
        <Select
          v-if="showLanguageSwitcher"
          :model-value="localePref"
          @update:model-value="
            (v) => {
              if (typeof v === 'string') setLocalePref(v);
            }
          "
        >
          <SelectTrigger
            size="sm"
            class="w-auto gap-1.5"
            :title="t('切换语言')"
          >
            <SelectValue :placeholder="selectedLocaleLabel">{{
              selectedLocaleLabel
            }}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">
              {{ t("跟随系统") }}
            </SelectItem>
            <SelectItem
              v-for="locale in supportedLocales"
              :key="locale.id"
              :value="locale.id"
            >
              {{ locale.label }}
            </SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="icon"
          :title="themeTitle"
          @click="cycleTheme()"
        >
          <Monitor v-if="themeIcon === 'auto'" class="h-5 w-5" />
          <Sun v-else-if="themeIcon === 'sun'" class="h-5 w-5" />
          <Moon v-else class="h-5 w-5" />
        </Button>
      </div>
    </nav>

    <!-- Import Dialog (shared) -->
    <Dialog v-model:open="importDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ t("从 Markdown 导入") }}</DialogTitle>
        </DialogHeader>
        <p class="text-sm text-(--color-on-surface-muted)">
          {{ t("支持 .zip 或 .md 文件") }}
        </p>
        <Input type="file" accept=".zip,.md" @change="handleImportFile" />
      </DialogContent>
    </Dialog>
  </header>
</template>
