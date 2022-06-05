function global() {
  return {
    isMobileMenuOpen: false,
    isDarkMode: false,
    async themeInit() {
      if (
        localStorage.theme === "dark" ||
        (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
      ) {
        localStorage.theme = "dark";
        document.documentElement.classList.add("dark");
        this.isDarkMode = true;
      } else {
        localStorage.theme = "light";
        document.documentElement.classList.remove("dark");
        this.isDarkMode = false;
      }
    },

    getPosts() {
      return fetch("/api/posts").then((response) => {
        if (!response.ok) {
          return;
        }
        return response.json();
      });
    },

    getPost(id) {
      return fetch(`/api/posts/${id}`).then((response) => {
        if (!response.ok) {
          return;
        }
        return response.json();
      });
    },

    themeSwitch() {
      if (localStorage.theme === "dark") {
        localStorage.theme = "light";
        document.documentElement.classList.remove("dark");
        this.isDarkMode = false;
      } else {
        localStorage.theme = "dark";
        document.documentElement.classList.add("dark");
        this.isDarkMode = true;
      }
    },
  };
}
