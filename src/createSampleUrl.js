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
/**
 * Create a sample URL for a given domain
 * @param {string} domain - The domain to create a sample URL for
 * @returns {string|null} Sample URL or null if unable to create
 */
export function createSampleUrl(domain) {
  // Map of common domains to sample URLs
  const sampleUrls = {
    "github.com": "https://github.com/microsoft/vscode",
    "gitlab.com": "https://gitlab.com/gitlab-org/gitlab-ce",
    "gitea.com": "https://gitea.com/gitea/gitea",
    "codeberg.org": "https://codeberg.org/Codeberg/Community",
    "sourceforge.net": "https://sourceforge.net/projects/sevenzip/",
    "android.googlesource.com":
      "https://android.googlesource.com/platform/frameworks/base",
    "huggingface.co": "https://huggingface.co/facebook/opt-350m",
    "civitai.com": "https://civitai.com/models/12345/example-model",
    "registry.npmjs.org": "https://registry.npmjs.org/react",
    "pypi.org": "https://pypi.org/project/django/",
    "files.pythonhosted.org":
      "https://files.pythonhosted.org/packages/source/d/django/django-4.2.0.tar.gz",
    "repo.anaconda.com":
      "https://repo.anaconda.com/archive/Anaconda3-2023.09-1-Windows-x86_64.exe",
    "conda.anaconda.org": "https://conda.anaconda.org/conda-forge/linux-64",
    "repo1.maven.org":
      "https://repo1.maven.org/maven2/org/springframework/spring-core/5.3.23/spring-core-5.3.23.jar",
    "downloads.apache.org":
      "https://downloads.apache.org/tomcat/tomcat-9/v9.0.80/bin/apache-tomcat-9.0.80-windows-x64.zip",
    "plugins.gradle.org":
      "https://plugins.gradle.org/plugin/org.springframework.boot",
    "rubygems.org": "https://rubygems.org/gems/rails",
    "cran.r-project.org":
      "https://cran.r-project.org/web/packages/ggplot2/index.html",
    "www.cpan.org": "https://www.cpan.org/modules/by-module/DBI/DBI.pm",
    "tug.ctan.org": "https://tug.ctan.org/macros/latex/base/",
    "proxy.golang.org":
      "https://proxy.golang.org/github.com/gin-gonic/gin/@v/v1.9.0.mod",
    "api.nuget.org":
      "https://api.nuget.org/v3-flatcontainer/microsoft.extensions.hosting.abstractions/6.0.0/microsoft.extensions.hosting.abstractions.6.0.0.nupkg",
    "crates.io": "https://crates.io/crates/serde",
    "repo.packagist.org": "https://repo.packagist.org/p/laravel/laravel.json",
    "deb.debian.org":
      "https://deb.debian.org/debian/dists/stable/main/binary-amd64/Packages.gz",
    "archive.ubuntu.com":
      "https://archive.ubuntu.com/ubuntu/dists/jammy/main/binary-amd64/",
    "dl.fedoraproject.org":
      "https://dl.fedoraproject.org/pub/fedora/linux/releases/38/Everything/x86_64/os/",
    "download.rockylinux.org":
      "https://download.rockylinux.org/pub/rocky/9.1/BaseOS/x86_64/os/",
    "download.opensuse.org":
      "https://download.opensuse.org/distribution/leap/15.4/repo/oss/",
    "geo.mirror.pkgbuild.com":
      "https://geo.mirror.pkgbuild.com/core/os/x86_64/",
    "arxiv.org": "https://arxiv.org/abs/2301.07041",
    "f-droid.org": "https://f-droid.org/repo/com.github.libretube_726.apk",
    "updates.jenkins.io":
      "https://updates.jenkins.io/download/plugins/warnings-ng/",
    "api.openai.com": "https://api.openai.com/v1/chat/completions",
    "api.anthropic.com": "https://api.anthropic.com/v1/messages",
    "registry-1.docker.io":
      "https://registry-1.docker.io/v2/library/ubuntu/tags/list",
    "quay.io": "https://quay.io/repository/prometheus/prometheus",
    "gcr.io": "https://gcr.io/google-containers/busybox",
    "mcr.microsoft.com": "https://mcr.microsoft.com/v2/mssql/server/tags/list",
    "public.ecr.aws": "https://public.ecr.aws/nginx/nginx",
    "release-assets.githubusercontent.com":
      "https://release-assets.githubusercontent.com/12345678/releases/download/v1.0.0/file.zip",
    "raw.githubusercontent.com":
      "https://raw.githubusercontent.com/github/github/main/README.md",
    "cloudflare-dns.com": "https://cloudflare-dns.com/dns-query",
    "dns.google": "https://dns.google/resolve?name=example.com",
    "dns.quad9.net": "https://dns.quad9.net:5053/dns-query",
    "dns.nextdns.io": "https://dns.nextdns.io/resolve",
  };

  // Return sample URL if found for this domain
  if (sampleUrls[domain]) {
    return sampleUrls[domain];
  }

  // Try to find a partial match (for domains with subdomains)
  for (const [key, url] of Object.entries(sampleUrls)) {
    if (domain.includes(key) || key.includes(domain)) {
      return url;
    }
  }

  // Create a generic URL as fallback
  if (domain.startsWith("http")) {
    return `${domain}/example/path`;
  }

  return `https://${domain}/example/path`;
}
