/**
 * ============================================================================
 * Xget URL Converter - Main JavaScript Application
 *
 * A modern web application for converting URLs from supported platforms
 * to the accelerated Xget format. Dynamically loads platform configuration
 * from the official Xget repository.
 *
 * @author Xi Xu
 * @version 1.0.0
 * @since 2025
 * ============================================================================
 */

"use strict";

import { createSampleUrl } from "./createSampleUrl.js";

if (!localStorage.getItem("dontShowSponsorModal")) {
  localStorage.setItem("dontShowSponsorModal", "true");
}
if (!localStorage.getItem("xgetDomain")) {
  localStorage.setItem(
    "xgetDomain",
    "https://xget.a1u06h9fe9y5bozbmgz3.qzz.io"
  );
}
// ============================================================================
// Global State Management
// ============================================================================

/**
 * Platform configuration data loaded from GitHub
 * @type {Object.<string, string>}
 */
let platformsData = {};

/**
 * Loading state indicator
 * @type {boolean}
 */
let isLoading = false;

// ============================================================================
// DOM Element References
// ============================================================================

/** @type {HTMLInputElement} Xget domain input field */
const xgetDomainInput = document.getElementById("xget-domain");

/** @type {HTMLInputElement} Original URL input field */
const originalUrlInput = document.getElementById("original-url");

/** @type {HTMLElement} Result section container */
const resultSection = document.getElementById("result-section");

/** @type {HTMLInputElement} Converted URL output field */
const convertedUrlInput = document.getElementById("converted-url");

/** @type {HTMLButtonElement} Copy to clipboard button */
const copyBtn = document.getElementById("copy-btn");

/** @type {HTMLElement} Error message container */
const errorMessage = document.getElementById("error-message");

/** @type {HTMLElement} Platform name display */
const platformName = document.getElementById("platform-name");

/** @type {HTMLElement} Platform detection indicator dot */
const platformDot = document.querySelector(".platform-dot");

/** @type {HTMLElement} Main converter section */
const converterSection = document.querySelector(".converter-section");

// ============================================================================
// Application Initialization
// ============================================================================

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener("DOMContentLoaded", async () => {
  await loadPlatforms();
  loadSavedDomain();
  setupEventListeners();
  setupDomainsSection();

  // Check if the user has chosen not to show the modal again
  const dontShowAgain = localStorage.getItem("dontShowSponsorModal");

  if (!dontShowAgain) {
    // Show the modal after a short delay
    setTimeout(showSponsorModal, 1000);
  }

  // Set up event listeners for modal elements
  setupModalEventListeners();
});

// ============================================================================
// Event Listeners Setup
// ============================================================================

/**
 * Set up all event listeners for the application
 */
function setupEventListeners() {
  xgetDomainInput.addEventListener("input", handleDomainInput);
  xgetDomainInput.addEventListener("blur", saveDomain);
  originalUrlInput.addEventListener("input", handleUrlInput);
  copyBtn.addEventListener("click", copyToClipboard);

  // Handle paste events with slight delay for processing
  originalUrlInput.addEventListener("paste", (e) => {
    setTimeout(() => handleUrlInput(), 10);
  });
}

// ============================================================================
// Domain Management
// ============================================================================

/**
 * Load saved Xget domain from localStorage
 */
function loadSavedDomain() {
  const savedDomain = localStorage.getItem("xgetDomain");
  if (savedDomain) {
    xgetDomainInput.value = savedDomain;
  }
}

/**
 * Save Xget domain to localStorage
 */
function saveDomain() {
  const domain = xgetDomainInput.value.trim();
  if (domain) {
    localStorage.setItem("xgetDomain", domain);
  }
}

/**
 * Handle domain input changes
 * Re-convert URL if one is already entered
 */
function handleDomainInput() {
  const domain = xgetDomainInput.value.trim();

  // Validate domain format
  if (domain && !isValidUrl(domain)) {
    xgetDomainInput.classList.add("error");
    return;
  } else {
    xgetDomainInput.classList.remove("error");
  }

  // If there's already a URL converted, re-convert it with the new domain
  const currentUrl = originalUrlInput.value.trim();
  if (currentUrl && !resultSection.classList.contains("hidden")) {
    handleUrlInput();
  }
}

/**
 * Get the current Xget domain
 * Returns the user-specified domain or falls back to default
 * @returns {string} Xget domain URL
 */
function getXgetDomain() {
  const domain = xgetDomainInput.value.trim();

  // Validate the domain
  if (domain && isValidUrl(domain)) {
    // Remove trailing slash if present
    return domain.replace(/\/$/, "");
  }

  // Fallback to default domain
  return "https://xget.a1u06h9fe9y5bozbmgz3.qzz.io";
}

// ============================================================================
// Platform Data Management
// ============================================================================

/**
 * Load platform configuration from the official Xget repository on Gitee
 * @async
 * @function loadPlatforms
 * @returns {Promise<void>}
 */
async function loadPlatforms() {
  try {
    showLoading("正在加载平台配置...");

    // // Fetch platforms.js
    // const response = await fetch(
    //   "https://cdn.jsdelivr.net/gh/masx200/Xget@main/src/config/platforms.js",
    // );

    // if (!response.ok) {
    //   throw new Error(
    //     `获取平台数据失败: ${response.status} ${response.statusText}`,
    //   );
    // }

    // const fileContent = await response.text();

    // Parse the platform data from the JavaScript file
    const module = await import("./platforms.js");
    platformsData = parsePlatformsData(module);

    if (Object.keys(platformsData).length === 0) {
      throw new Error("在配置文件中未找到平台数据");
    }

    hideError();
  } catch (error) {
    console.error("加载平台失败:", error);
    showError(`加载平台配置失败: ${error.message}`);
  }
}

/**
 * Parse platform data from JavaScript file content
 * Extracts the PLATFORMS object using improved regex and parsing logic
 * @param {string} fileContent - Raw JavaScript file content
 * @returns {Object.<string, string>} Parsed platform mappings
 * @throws {Error} When platform data cannot be parsed
 */
function parsePlatformsData(module) {
  if (!module || !module.PLATFORMS) {
    throw new Error("无法在模块中找到 PLATFORMS 对象");
  }
  return JSON.parse(JSON.stringify(module.PLATFORMS));
  // try {
  //   // First, try to find the PLATFORMS export
  //   const platformsMatch = fileContent.match(
  //     /export\s+const\s+PLATFORMS\s*=\s*{([\s\S]*?)};/,
  //   );

  //   if (!platformsMatch) {
  //     throw new Error("无法在文件中找到 PLATFORMS 对象");
  //   }

  //   // Extract the content between the braces
  //   const platformsContent = platformsMatch[1];

  //   // Parse the object content more carefully
  //   const platforms = {};

  //   // Split by lines and process each line
  //   const lines = platformsContent.split("\n");

  //   for (const line of lines) {
  //     const trimmed = line.trim();

  //     // Skip empty lines, comments, and other non-key-value content
  //     if (
  //       !trimmed ||
  //       trimmed.startsWith("//") ||
  //       trimmed.startsWith("/*") ||
  //       trimmed.startsWith("*") ||
  //       trimmed === "{" ||
  //       trimmed === "}" ||
  //       trimmed === "," ||
  //       !trimmed.includes(":")
  //     ) {
  //       continue;
  //     }

  //     // Match various key-value patterns
  //     // Handles: 'key': 'value', "key": "value", key: 'value', key: "value"
  //     const keyValueMatch = trimmed.match(
  //       /^['"]?([^'":\s,]+)['"]?\s*:\s*['"]([^'"]+)['"][\s,]*$/,
  //     );

  //     if (keyValueMatch) {
  //       const [, key, value] = keyValueMatch;
  //       // Clean up the key and value
  //       const cleanKey = key.trim();
  //       const cleanValue = value.trim();

  //       // Only add valid HTTP/HTTPS URLs
  //       if (cleanValue.startsWith("http")) {
  //         platforms[cleanKey] = cleanValue;
  //       }
  //     }
  //   }

  //   // Validate that we found some platforms
  //   if (Object.keys(platforms).length === 0) {
  //     throw new Error("未能解析出任何平台数据");
  //   }

  //   console.log(`成功解析 ${Object.keys(platforms).length} 个平台配置`);
  //   return platforms;
  // } catch (error) {
  //   console.error("解析平台数据出错:", error);
  //   throw new Error(`解析平台配置失败: ${error.message}`);
  // }
}

/**
 * Get display name for platform (simplified version)
 * Currently returns the platform key as the display name
 * @param {string} key - Platform key identifier
 * @param {string} url - Platform base URL
 * @returns {string} Display name for the platform
 */
function getPlatformDisplayName(key, url) {
  return key;
}

// ============================================================================
// URL Processing and Validation
// ============================================================================

/**
 * Handle URL input changes with real-time validation and conversion
 * Validates URL format, detects platform, and performs conversion
 * @function handleUrlInput
 */
function handleUrlInput() {
  const url = originalUrlInput.value.trim();

  if (!url) {
    resetPlatformStatus();
    hideError();
    hideResult();
    return;
  }

  if (!isValidUrl(url)) {
    showPlatformError("URL 格式无效");
    hideResult();
    return;
  }

  // Detect platform from URL
  const detectedPlatform = detectPlatform(url);

  if (detectedPlatform) {
    showPlatformDetected(detectedPlatform.key, detectedPlatform.name);
    hideError();
    // Automatically convert the URL in real-time
    performUrlConversion(url, detectedPlatform);
  } else {
    showPlatformError("平台不受支持或无法识别");
    hideResult();
  }
}

/**
 * Validate URL format using the URL constructor
 * @param {string} string - URL string to validate
 * @returns {boolean} True if valid URL format
 */
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

/**
 * Detect platform from URL using priority-based matching
 * Priority order: exact hostname → path-based routing → subdomain → base domain
 * @param {string} url - URL to analyze
 * @returns {Object|null} Platform object with key, name, and baseUrl or null if not found
 */
function detectPlatform(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const pathname = urlObj.pathname;

    // Priority 1: Exact hostname match (handles subdomain conflicts automatically)
    for (const [key, baseUrl] of Object.entries(platformsData)) {
      try {
        const baseUrlObj = new URL(baseUrl);
        if (hostname === baseUrlObj.hostname) {
          return {
            key,
            name: getPlatformDisplayName(key, baseUrl),
            baseUrl,
          };
        }
      } catch (e) {
        // Skip invalid base URLs
        continue;
      }
    }

    // Priority 2: Special path-based routing for platforms sharing the same hostname

    // ghcr.io - route based on pathname
    if (hostname === "ghcr.io") {
      // Check if it's a homebrew bottles path (contains /v2/homebrew/)
      if (pathname.includes("/v2/homebrew/")) {
        return {
          key: "homebrew-bottles",
          name: getPlatformDisplayName("homebrew-bottles", "https://ghcr.io"),
          baseUrl: "https://ghcr.io",
        };
      } else {
        // Default to cr-ghcr for standard container registry usage
        return {
          key: "cr-ghcr",
          name: getPlatformDisplayName("cr-ghcr", "https://ghcr.io"),
          baseUrl: "https://ghcr.io",
        };
      }
    }

    // github.com - route based on pathname
    if (hostname === "github.com") {
      // Check if it's a Homebrew organization path (starts with /Homebrew or /homebrew/, case-insensitive)
      if (pathname.toLowerCase().startsWith("/homebrew/")) {
        return {
          key: "homebrew",
          name: getPlatformDisplayName(
            "homebrew",
            "https://github.com/Homebrew"
          ),
          baseUrl: "https://github.com/Homebrew",
        };
      } else {
        // Default to gh for standard GitHub usage
        return {
          key: "gh",
          name: getPlatformDisplayName("gh", "https://github.com"),
          baseUrl: "https://github.com",
        };
      }
    }

    // Priority 3: Subdomain match (e.g., registry.npmjs.org matches npmjs.org)
    for (const [key, baseUrl] of Object.entries(platformsData)) {
      try {
        const baseUrlObj = new URL(baseUrl);
        if (hostname.endsWith("." + baseUrlObj.hostname)) {
          return {
            key,
            name: getPlatformDisplayName(key, baseUrl),
            baseUrl,
          };
        }
      } catch (e) {
        continue;
      }
    }

    // Priority 4: Base domain match (e.g., different subdomains on same base domain)
    for (const [key, baseUrl] of Object.entries(platformsData)) {
      try {
        const baseUrlObj = new URL(baseUrl);
        const baseDomain = baseUrlObj.hostname.split(".").slice(-2).join(".");
        const urlDomain = hostname.split(".").slice(-2).join(".");

        if (baseDomain === urlDomain && baseDomain.includes(".")) {
          return {
            key,
            name: getPlatformDisplayName(key, baseUrl),
            baseUrl,
          };
        }
      } catch (e) {
        continue;
      }
    }

    return null;
  } catch {
    return null;
  }
}

// ============================================================================
// URL Conversion Functions
// ============================================================================

/**
 * Convert URL to Xget format with real-time processing
 * Extracts the path from the original URL and constructs the Xget URL
 * Special handling for GitHub blob URLs: automatically converts them to raw URLs
 * Example: /owner/repo/blob/branch/file → /owner/repo/raw/refs/heads/branch/file
 * @param {string} url - Original URL to convert
 * @param {Object} detectedPlatform - Platform object with key, name, and baseUrl
 */
function performUrlConversion(url, detectedPlatform) {
  try {
    const urlObj = new URL(url);

    // Extract the path after the base URL
    let path = urlObj.pathname;

    // For some platforms, we might need to include search params
    if (urlObj.search) {
      path += urlObj.search;
    }

    // Handle special cases where the path might need adjustment
    path = adjustPathForPlatform(path, detectedPlatform.key, urlObj);

    // Use platform key as-is without any character replacement
    // This preserves both dots and hyphens in the platform prefix
    const platformPrefix = detectedPlatform.key;

    // Get the configured Xget domain
    const xgetDomain = getXgetDomain();

    // Construct the Xget URL
    const xgetUrl = `${xgetDomain}/${platformPrefix}${path}`;

    // Display the result
    convertedUrlInput.value = xgetUrl;
    showResult();
    hideError();

    // Reset copy button state
    resetCopyButton();
  } catch (error) {
    console.error("转换错误:", error);
    showError(`URL 转换失败: ${error.message}`);
  }
}

/**
 * Adjust path for specific platforms if needed
 * Most platforms can use the path as-is, but special handling can be added
 * @param {string} path - URL path to adjust
 * @param {string} platformKey - Platform key identifier
 * @param {URL} urlObj - Original URL object
 * @returns {string} Adjusted path
 */
function adjustPathForPlatform(path, platformKey, urlObj) {
  // Special handling for GitHub platform - convert blob URLs to raw URLs
  if (platformKey === "gh") {
    // Check if this is a blob URL pattern: /owner/repo/blob/branch/file
    const blobMatch = path.match(/^\/([^\/]+)\/([^\/]+)\/blob\/(.+)$/);
    if (blobMatch) {
      const [, owner, repo, branchAndFile] = blobMatch;

      // Split branch and file path
      // We need to be careful here because branch names can contain slashes
      // For simplicity, we'll assume the first segment is the branch name
      // This works for most common cases like "main", "master", "dev", etc.
      const parts = branchAndFile.split("/");

      if (parts.length >= 2) {
        const branch = parts[0];
        const filePath = parts.slice(1).join("/");

        // Convert to raw URL format: /owner/repo/raw/refs/heads/branch/file
        path = `/${owner}/${repo}/raw/refs/heads/${branch}/${filePath}`;
      } else if (parts.length === 1) {
        // Edge case: only branch name, no file path
        const branch = parts[0];
        path = `/${owner}/${repo}/raw/refs/heads/${branch}/`;
      }
    }
  }

  // Special handling for homebrew platform
  if (platformKey === "homebrew") {
    // Remove /Homebrew or /homebrew from the path (case-insensitive)
    path = path.replace(/^\/[Hh]omebrew/i, "");

    // If path becomes empty, set it to root
    if (!path || path === "/") {
      path = "";
    }
  }

  // Special handling for homebrew-api platform
  if (platformKey === "homebrew-api") {
    // Remove /api from the beginning of the path to avoid duplication
    path = path.replace(/^\/api/i, "");

    // If path becomes empty, set it to root
    if (!path || path === "/") {
      path = "";
    }
  }

  // Ensure path starts with / (except for homebrew and homebrew-api when it should be empty)
  if (!path.startsWith("/") && path !== "") {
    path = "/" + path;
  }

  return path;
}

// ============================================================================
// Clipboard Operations
// ============================================================================

/**
 * Copy converted URL to clipboard with fallback support
 * Uses modern Clipboard API with fallback to document.execCommand
 * @async
 * @function copyToClipboard
 */
async function copyToClipboard() {
  const textToCopy = convertedUrlInput.value;

  if (!textToCopy) {
    return;
  }

  try {
    await navigator.clipboard.writeText(textToCopy);
    showCopySuccess();
  } catch (error) {
    // Fallback for older browsers
    try {
      convertedUrlInput.select();
      document.execCommand("copy");
      showCopySuccess();
    } catch (fallbackError) {
      showError("复制到剪贴板失败。请手动复制。");
    }
  }
}

// ============================================================================
// UI Helper Functions
// ============================================================================

/**
 * Show loading state indicator
 * @param {string} message - Loading message to display
 */
function showLoading(message) {
  isLoading = true;
  // Loading message is handled by platform status indicators
}

/**
 * Reset platform status to initial state
 */
function resetPlatformStatus() {
  platformName.textContent = "将自动检测平台";
  platformDot.className = "platform-dot";
}

/**
 * Show platform detection success state
 * @param {string} key - Platform key identifier
 * @param {string} name - Platform display name
 */
function showPlatformDetected(key, name) {
  platformName.textContent = `已检测到 ${key}`;
  platformDot.className = "platform-dot detected";
}

/**
 * Show platform detection error state
 * @param {string} message - Error message to display
 */
function showPlatformError(message) {
  platformName.textContent = message;
  platformDot.className = "platform-dot error";
}

/**
 * Show the conversion result section
 */
function showResult() {
  resultSection.classList.remove("hidden");
  converterSection.classList.add("has-content");
}

/**
 * Hide the conversion result section
 */
function hideResult() {
  resultSection.classList.add("hidden");
  // Check if there are other content elements (like error messages)
  if (errorMessage.classList.contains("hidden")) {
    converterSection.classList.remove("has-content");
  }
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
  converterSection.classList.add("has-content");
}

/**
 * Hide error message
 */
function hideError() {
  errorMessage.classList.add("hidden");
  // Check if there are other content elements (like results)
  if (resultSection.classList.contains("hidden")) {
    converterSection.classList.remove("has-content");
  }
}

/**
 * Show copy success feedback with temporary state change
 */
function showCopySuccess() {
  const originalText = copyBtn.querySelector(".copy-text").textContent;
  const originalIcon = copyBtn.querySelector(".copy-icon").textContent;

  copyBtn.classList.add("copied");
  copyBtn.querySelector(".copy-text").textContent = "已复制!";
  copyBtn.querySelector(".copy-icon").textContent = "✓";

  setTimeout(() => {
    resetCopyButton();
  }, 2000);
}

/**
 * Reset copy button to original state
 */
function resetCopyButton() {
  copyBtn.classList.remove("copied");
  copyBtn.querySelector(".copy-text").textContent = "复制";
  copyBtn.querySelector(".copy-icon").textContent = "📋";
}

// ============================================================================
// Sponsor Popup Modal
// ============================================================================

/**
 * Set up event listeners for the sponsor modal
 */
function setupModalEventListeners() {
  const modal = document.getElementById("sponsor-modal");
  const closeModalButton = document.getElementById("close-modal");
  const dontShowAgainCheckbox = document.getElementById("dont-show-again");

  // Close modal when clicking the X button
  if (closeModalButton) {
    closeModalButton.addEventListener("click", () => {
      closeSponsorModal();
    });
  }

  // Close modal when clicking outside the modal content
  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeSponsorModal();
      }
    });
  }

  // Handle "Don't show again" checkbox
  if (dontShowAgainCheckbox) {
    dontShowAgainCheckbox.addEventListener("change", (event) => {
      if (event.target.checked) {
        localStorage.setItem("dontShowSponsorModal", "true");
      } else {
        localStorage.removeItem("dontShowSponsorModal");
      }
    });
  }
}

/**
 * Show the sponsor modal
 */
function showSponsorModal() {
  const modal = document.getElementById("sponsor-modal");
  if (modal) {
    modal.classList.remove("hidden");
  }
}

/**
 * Close the sponsor modal
 */
function closeSponsorModal() {
  const modal = document.getElementById("sponsor-modal");
  if (modal) {
    modal.classList.add("hidden");
  }
}

// ============================================================================
// Global Error Handling
// ============================================================================

/**
 * Handle unhandled promise rejections globally
 * Provides fallback error handling for async operations
 */
window.addEventListener("unhandledrejection", (event) => {
  console.error("未处理的 promise 拒绝:", event.reason);
  if (!isLoading) {
    showError("发生意外错误。请重试。");
  }
});

// ============================================================================
// Domains Section
// ============================================================================

/** @type {HTMLElement} Domains section container */
const domainsSection = document.querySelector(".domains-section");

/** @type {HTMLElement} Domains toggle header */
const domainsToggle = document.getElementById("domains-toggle");

/** @type {HTMLButtonElement} Domains toggle button */
const domainsToggleBtn = document.getElementById("domains-toggle-btn");

/** @type {HTMLElement} Domains content container */
const domainsContent = document.getElementById("domains-content");

/** @type {HTMLElement} Domains grid container */
const domainsGrid = document.getElementById("domains-grid");

/** @type {HTMLElement} Domains count display */
const domainsCount = document.getElementById("domains-count");

/**
 * Set up the domains section with collapsible functionality
 */
async function setupDomainsSection() {
  if (
    !domainsSection ||
    !domainsToggle ||
    !domainsToggleBtn ||
    !domainsContent ||
    !domainsGrid
  ) {
    console.warn("Domains section elements not found");
    return;
  }

  // Load domains data
  await loadDomainsData();

  // Set up toggle functionality
  domainsToggle.addEventListener("click", toggleDomainsSection);
  domainsToggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleDomainsSection();
  });

  // Add click handlers for domain items
  setupDomainClickHandlers();
}

/**
 * Load domains data and populate the domains grid
 */
async function loadDomainsData() {
  try {
    const { generateDomainsHTML } = await import("./generateDomainsHTML.js");
    const domainsHTML = generateDomainsHTML();

    domainsGrid.innerHTML = domainsHTML;

    // Update domain count
    updateDomainsCount();
  } catch (error) {
    console.error("加载域名数据失败:", error);
    domainsGrid.innerHTML = '<p class="error-message">加载域名数据失败</p>';
  }
}

/**
 * Toggle the domains section expanded/collapsed state
 */
function toggleDomainsSection() {
  const isExpanded = domainsSection.classList.contains("expanded");

  if (isExpanded) {
    // Collapse
    domainsSection.classList.remove("expanded");
    domainsToggleBtn.querySelector(".toggle-text").textContent = "展开";
    domainsContent.style.maxHeight = "0";
  } else {
    // Expand
    domainsSection.classList.add("expanded");
    domainsToggleBtn.querySelector(".toggle-text").textContent = "收起";
    domainsContent.style.maxHeight = "80vh";
  }
}

/**
 * Update the domains count display
 */
function updateDomainsCount() {
  const domainItems = domainsGrid.querySelectorAll(".domain-list li");
  const count = domainItems.length;

  if (domainsCount) {
    domainsCount.textContent = `${count}+`;
  }
}

/**
 * Set up click handlers for domain items
 */
function setupDomainClickHandlers() {
  // Use event delegation for better performance
  domainsGrid.addEventListener("click", (e) => {
    const domainItem = e.target.closest(".domain-list li");

    if (domainItem) {
      const domainUrlElement = domainItem.querySelector(".domain-url");
      if (domainUrlElement) {
        const domainUrl = domainUrlElement.textContent.trim();

        // Create a sample URL for this domain
        const sampleUrl = createSampleUrl(domainUrl);

        if (sampleUrl) {
          // Populate the URL input with the sample URL
          originalUrlInput.value = sampleUrl;

          // Trigger URL processing
          handleUrlInput();

          // Scroll to the converter section
          converterSection.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });

          // Highlight the input field
          originalUrlInput.focus();
          originalUrlInput.select();
        }
      }
    }
  });
}
