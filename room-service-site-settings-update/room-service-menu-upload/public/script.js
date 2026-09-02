const fallbackMenu = {
  title: "Room Service Menu",
  service: {
    availability: "24-hour room service",
    dial: "Dial 17",
    waitTime: "Approximately 30–45 minutes",
  },
  categories: [],
};

const fallbackSettings = {
  headingFont: "georgia",
  bodyFont: "arial",
  darkGreen: "#0b2e27",
  primaryGreen: "#123f34",
  accentGreen: "#28715c",
  gold: "#b9934b",
  background: "#f8f5ee",
  paper: "#fffdf8",
  text: "#18211e",
  mutedText: "#66706c",
};

const fontOptions = {
  georgia: 'Georgia, "Times New Roman", serif',
  times: '"Times New Roman", Times, serif',
  arial: "Arial, Helvetica, sans-serif",
  trebuchet: '"Trebuchet MS", Arial, sans-serif',
  verdana: "Verdana, Geneva, sans-serif",
};

const isColour = (value) => /^#[0-9a-f]{6}$/i.test(value || "");

const applySettings = (settings) => {
  const root = document.documentElement;
  const values = { ...fallbackSettings, ...settings };
  const colours = {
    "--green-950": values.darkGreen,
    "--green-900": values.primaryGreen,
    "--green-700": values.accentGreen,
    "--gold": values.gold,
    "--cream": values.background,
    "--paper": values.paper,
    "--ink": values.text,
    "--muted": values.mutedText,
  };

  Object.entries(colours).forEach(([property, value]) => {
    if (isColour(value)) root.style.setProperty(property, value);
  });

  root.style.setProperty("--heading-font", fontOptions[values.headingFont] || fontOptions.georgia);
  root.style.setProperty("--body-font", fontOptions[values.bodyFont] || fontOptions.arial);

  const themeColour = isColour(values.primaryGreen)
    ? values.primaryGreen
    : fallbackSettings.primaryGreen;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", themeColour);
};

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const makeElement = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
};

const renderServiceDetails = (menu) => {
  document.getElementById("menu-title").textContent = menu.title || fallbackMenu.title;
  document.getElementById("availability").textContent =
    menu.service?.availability || fallbackMenu.service.availability;
  document.getElementById("dial").textContent = menu.service?.dial || fallbackMenu.service.dial;
  document.getElementById("wait-time").textContent =
    menu.service?.waitTime || fallbackMenu.service.waitTime;
};

const renderNavigation = (categories) => {
  const nav = document.getElementById("category-nav");
  nav.replaceChildren();

  categories.forEach((category) => {
    const link = makeElement("a", "category-link", category.name);
    link.href = `#${slugify(category.name)}`;
    nav.appendChild(link);
  });
};

const renderTag = (tagName) => {
  const label = tagName.charAt(0).toUpperCase() + tagName.slice(1);
  return makeElement("span", `tag${tagName === "spicy" ? " tag--spicy" : ""}`, label);
};

const renderItem = (item) => {
  const article = makeElement("article", "menu-item");
  const topLine = makeElement("div", "menu-item__topline");
  topLine.appendChild(makeElement("h3", "", item.name));
  topLine.appendChild(makeElement("span", "menu-item__price", item.price));
  article.appendChild(topLine);

  if (item.description) {
    article.appendChild(makeElement("p", "menu-item__description", item.description));
  }

  if (Array.isArray(item.dietary) && item.dietary.length) {
    const tags = makeElement("div", "tags");
    item.dietary.forEach((tag) => tags.appendChild(renderTag(tag)));
    article.appendChild(tags);
  }

  return article;
};

const renderMenu = (menu) => {
  const categories = Array.isArray(menu.categories) ? menu.categories : [];
  renderServiceDetails(menu);
  renderNavigation(categories);

  const content = document.getElementById("menu-content");
  content.replaceChildren();

  categories.forEach((category) => {
    const section = makeElement("section", "menu-section");
    section.id = slugify(category.name);

    const heading = makeElement("div", "section-heading");
    heading.appendChild(makeElement("h2", "", category.name));
    section.appendChild(heading);

    if (category.note) {
      section.appendChild(makeElement("p", "section-note", category.note));
    }

    (category.items || []).forEach((item) => section.appendChild(renderItem(item)));
    content.appendChild(section);
  });
};

const loadMenu = async () => {
  try {
    const response = await fetch(`/content/menu.json?v=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error("Menu could not be loaded");
    renderMenu(await response.json());
  } catch (error) {
    renderServiceDetails(fallbackMenu);
    const content = document.getElementById("menu-content");
    content.replaceChildren(
      makeElement("p", "error-message", "The menu is temporarily unavailable. Please dial 17 for assistance."),
    );
  }
};

const loadSettings = async () => {
  try {
    const response = await fetch(`/content/settings.json?v=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error("Settings could not be loaded");
    applySettings(await response.json());
  } catch (error) {
    applySettings(fallbackSettings);
  }
};

Promise.all([loadSettings(), loadMenu()]);
