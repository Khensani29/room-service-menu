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
  font: "montserrat",
  .logo: "",
  hotelName: "Holiday Inn Johannesburg Sunnyside Park",
  welcomeText: "Enjoy a relaxed meal from the comfort of your room.",
  footerText: "To place an order, dial 17 on your room telephone.",
  headerImage: "",
  footerImage: "",
  darkColour: "#0b2e27",
  mainColour: "#123f34",
  highlightColour: "#28715c",
  goldColour: "#b9934b",
  backgroundColour: "#f8f5ee",
  textColour: "#18211e",
};

const fonts = {
  montserrat: '"Montserrat", Arial, sans-serif',
  georgia: 'Georgia, "Times New Roman", serif',
  arial: "Arial, Helvetica, sans-serif",
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

const addImage = (container, imagePath, altText) => {
  if (!imagePath) {
    container.classList.add("image-placeholder");
    container.setAttribute("aria-hidden", "true");
    return;
  }

  const image = makeElement("img");
  image.src = imagePath;
  image.alt = altText;
  image.loading = "lazy";
  container.appendChild(image);
};

const renderSiteBanners = (settings) => {
  const headerBanner = makeElement(
    "div",
    "site-banner site-banner--header",
  );
  addImage(
    headerBanner,
    settings.headerImage,
    "Room service presentation",
  );
  document.querySelector("main").prepend(headerBanner);

  const footerBanner = makeElement(
    "div",
    "site-banner site-banner--footer",
  );
  addImage(
    footerBanner,
    settings.footerImage,
    "Room service presentation",
  );
  document.querySelector("footer").before(footerBanner);
};

const applySettings = (settings) => {
  const values = { ...fallbackSettings, ...settings };
  const root = document.documentElement;

  const logo = document.getElementById("site-logo");

  if (values.logo) {
    logo.src = values.logo;
    logo.hidden = false;
  } else {
    logo.hidden = true;
  }

  document.querySelector(".property-name").textContent =
    values.hotelName;

  document.querySelector(".welcome-copy").textContent =
    values.welcomeText;

  document.querySelector("footer p").textContent =
    values.footerText;
  const colourPattern = /^#[0-9a-f]{6}$/i;

  const colours = {
    "--green-950": values.darkColour,
    "--green-900": values.mainColour,
    "--green-700": values.highlightColour,
    "--gold": values.goldColour,
    "--cream": values.backgroundColour,
    "--ink": values.textColour,
  };

  Object.entries(colours).forEach(([property, value]) => {
    if (colourPattern.test(value || "")) {
      root.style.setProperty(property, value);
    }
  });

  if (
    values.font === "montserrat" &&
    !document.getElementById("montserrat-font")
  ) {
    const fontLink = makeElement("link");
    fontLink.id = "montserrat-font";
    fontLink.rel = "stylesheet";
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap";
    document.head.appendChild(fontLink);
  }

  root.style.setProperty(
    "--site-font",
    fonts[values.font] || fonts.montserrat,
  );

  renderSiteBanners(values);
};

const renderServiceDetails = (menu) => {
  document.getElementById("menu-title").textContent =
    menu.title || fallbackMenu.title;

  document.getElementById("availability").textContent =
    menu.service?.availability ||
    fallbackMenu.service.availability;

  document.getElementById("dial").textContent =
    menu.service?.dial || fallbackMenu.service.dial;

  document.getElementById("wait-time").textContent =
    menu.service?.waitTime || fallbackMenu.service.waitTime;
};

const renderNavigation = (categories) => {
  const nav = document.getElementById("category-nav");
  nav.replaceChildren();

  categories.forEach((category) => {
    const link = makeElement(
      "a",
      "category-link",
      category.name,
    );
    link.href = `#${slugify(category.name)}`;
    nav.appendChild(link);
  });
};

const renderTag = (tagName) => {
  const label =
    tagName.charAt(0).toUpperCase() + tagName.slice(1);

  return makeElement(
    "span",
    `tag${tagName === "spicy" ? " tag--spicy" : ""}`,
    label,
  );
};

const renderItem = (item) => {
  const article = makeElement("article", "menu-item");
  const topLine = makeElement("div", "menu-item__topline");

  topLine.appendChild(makeElement("h3", "", item.name));
  topLine.appendChild(
    makeElement("span", "menu-item__price", item.price),
  );

  article.appendChild(topLine);

  if (item.description) {
    article.appendChild(
      makeElement(
        "p",
        "menu-item__description",
        item.description,
      ),
    );
  }

  if (
    Array.isArray(item.dietary) &&
    item.dietary.length
  ) {
    const tags = makeElement("div", "tags");

    item.dietary.forEach((tag) =>
      tags.appendChild(renderTag(tag)),
    );

    article.appendChild(tags);
  }

  return article;
};

const renderMenu = (menu) => {
  const categories = Array.isArray(menu.categories)
    ? menu.categories
    : [];

  renderServiceDetails(menu);
  renderNavigation(categories);

  const content = document.getElementById("menu-content");
  content.replaceChildren();

  categories.forEach((category) => {
    const section = makeElement("section", "menu-section");
    section.id = slugify(category.name);

    const heading = makeElement("div", "section-heading");
    heading.appendChild(
      makeElement("h2", "", category.name),
    );
    section.appendChild(heading);

    const banner = makeElement("div", "section-banner");
    addImage(
      banner,
      category.bannerImage,
      `${category.name} selection`,
    );
    section.appendChild(banner);

    if (category.note) {
      section.appendChild(
        makeElement("p", "section-note", category.note),
      );
    }

    (category.items || []).forEach((item) =>
      section.appendChild(renderItem(item)),
    );

    content.appendChild(section);
  });
};

const loadSettings = async () => {
  try {
    const response = await fetch(
      `/content/settings.json?v=${Date.now()}`,
      { cache: "no-store" },
    );

    if (!response.ok) {
      throw new Error("Settings could not be loaded");
    }

    applySettings(await response.json());
  } catch (error) {
    applySettings(fallbackSettings);
  }
};

const loadMenu = async () => {
  try {
    const response = await fetch(
      `/content/menu.json?v=${Date.now()}`,
      { cache: "no-store" },
    );

    if (!response.ok) {
      throw new Error("Menu could not be loaded");
    }

    renderMenu(await response.json());
  } catch (error) {
    renderServiceDetails(fallbackMenu);

    const content =
      document.getElementById("menu-content");

    content.replaceChildren(
      makeElement(
        "p",
        "error-message",
        "The menu is temporarily unavailable. Please dial 17 for assistance.",
      ),
    );
  }
};

Promise.all([loadSettings(), loadMenu()]);
