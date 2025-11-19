import { getCategorizedDomains } from "./getCategorizedDomains.js";

/**
 * Generate HTML for the collapsible domains section
 * @returns {string} HTML content for the domains section
 */

export function generateDomainsHTML() {
  const categories = getCategorizedDomains();
  let html = "";

  for (const [category, domains] of Object.entries(categories)) {
    const domainList = Object.entries(domains)
      .map(
        ([name, domain]) =>
          `<li><span class="domain-name">${name}</span><code class="domain-url">${domain}</code></li>`
      )
      .join("");

    html += `
      <div class="domain-category">
        <h4 class="category-title">${category}</h4>
        <ul class="domain-list">
          ${domainList}
        </ul>
      </div>
    `;
  }

  return html;
}
