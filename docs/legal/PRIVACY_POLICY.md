# Privacy Policy for AccessInsight

**Effective Date**: 2025-11-07
**Last Updated**: 2025-11-07
**Version**: 1.0.0

---

## Overview

AccessInsight is committed to protecting your privacy. This Privacy Policy explains how AccessInsight ("we", "our", or "the extension") handles information when you use our browser extension.

**The short version**: AccessInsight processes all data locally in your browser. We do not collect, transmit, or store any personal information or browsing data on external servers.

---

## Information We Do NOT Collect

AccessInsight does **NOT** collect, transmit, or store:

- ❌ Personal information (name, email, address, phone number)
- ❌ Browsing history
- ❌ Website URLs you visit
- ❌ Page content or screenshots
- ❌ Accessibility scan results
- ❌ Cookies or tracking data
- ❌ IP addresses
- ❌ Device information
- ❌ Location data
- ❌ Any identifiable information

---

## How AccessInsight Works

### Local Processing Only

All accessibility scanning happens entirely **in your browser**:

1. You navigate to a webpage
2. You activate AccessInsight (click icon or keyboard shortcut)
3. AccessInsight **scans the DOM locally** within your browser
4. Results are displayed **only to you** in the extension panel
5. **No data leaves your device**

### Data Storage

AccessInsight uses browser local storage **only** for:

**User Preferences** (stored locally on your device):
- Selected rule preset (e.g., "Default", "Axe Core")
- Enabled/disabled rules
- UI preferences (sort order, group by, advanced mode state)
- Per-site ignores (selectors and rules you've chosen to ignore)

**This data**:
- ✅ Stays on your device
- ✅ Is never transmitted to any server
- ✅ Can be cleared by removing the extension or clearing browser data
- ✅ Is not shared with any third party

---

## Permissions Explained

AccessInsight requests the following permissions to function:

### activeTab
**Why we need it**: To scan the current webpage for accessibility issues
**What we do**: Read the DOM structure and computed styles of the active tab
**What we DON'T do**: Track which websites you visit or store page content

### tabs
**Why we need it**: To determine which tab is being scanned
**What we do**: Identify the tab ID for messaging between extension components
**What we DON'T do**: Read your tab history or track navigation

### storage
**Why we need it**: To save your preferences locally
**What we do**: Store your rule selections and UI preferences on your device
**What we DON'T do**: Send data to external servers or share with third parties

### scripting
**Why we need it**: To inject the scanning engine into webpages
**What we do**: Run accessibility analysis code in the context of the page
**What we DON'T do**: Modify page content or extract personal information

### webNavigation
**Why we need it**: To reinitialize scanning when pages reload
**What we do**: Detect page navigation events to reset state
**What we DON'T do**: Track your browsing or store navigation history

### host_permissions: <all_urls>
**Why we need it**: To scan any webpage you choose
**What we do**: Allow you to test accessibility on any site
**What we DON'T do**: Scan pages without your explicit action or track visited URLs

---

## Third-Party Services

AccessInsight does **NOT** use any third-party services, analytics, or tracking tools.

There are **no**:
- ❌ Analytics platforms (Google Analytics, Mixpanel, etc.)
- ❌ Crash reporting tools
- ❌ Advertising networks
- ❌ Social media integrations
- ❌ External APIs
- ❌ CDNs for loading code

All code runs locally from the extension package.

---

## Data Exports

AccessInsight allows you to **export** scan results in multiple formats (JSON, SARIF, HTML, CSV). These exports:

- ✅ Are generated locally in your browser
- ✅ Are saved to your device only (via browser download)
- ✅ Contain only the accessibility findings from your scan
- ✅ Are under your control - you choose where to save them

We have no access to these files. They are yours to keep, share, or delete as you see fit.

---

## Cookies

AccessInsight does **NOT** use cookies or any similar tracking technologies.

---

## Children's Privacy

AccessInsight does not knowingly collect information from anyone, including children under 13. Our extension does not collect any personal information from any users.

---

## Your Rights

Since AccessInsight does not collect any personal data, there is no data to:
- Request access to
- Request deletion of
- Request correction of
- Opt out of collection of

Your preferences stored locally can be cleared by:
1. Uninstalling the extension, or
2. Clearing browser extension data via Chrome settings

---

## Changes to This Policy

We may update this Privacy Policy from time to time. Changes will be:
- Reflected in the "Last Updated" date at the top
- Communicated via extension update notes (for major changes)
- Posted on our GitHub repository

Continued use of AccessInsight after changes constitutes acceptance of the updated policy.

---

## Security

We take security seriously:

- ✅ No data transmission = no network security risks
- ✅ No external dependencies = no supply chain attacks
- ✅ Content Security Policy enforced in manifest
- ✅ No eval() or unsafe code execution
- ✅ All innerHTML assignments are HTML-escaped (v1.0.0+)
- ✅ Isolated world injection prevents page script interference

---

## Compliance

### GDPR (General Data Protection Regulation)

AccessInsight is GDPR-compliant because:
- We do not collect personal data
- We do not process personal data
- We do not store personal data on servers
- We do not share data with third parties

### CCPA (California Consumer Privacy Act)

AccessInsight does not "sell" personal information because:
- We do not collect personal information
- We do not have access to user data
- We do not monetize user data

### Other Privacy Laws

AccessInsight complies with privacy laws worldwide by design, as we do not collect or process personal data.

---

## Open Source

AccessInsight is committed to transparency. Our source code is available at:
**[GitHub Repository URL]** (to be added)

You can audit our privacy practices by reviewing the source code.

---

## Contact Us

If you have questions about this Privacy Policy:

**GitHub Issues**: https://github.com/[username]/accessinsight-mv3-extension-v2/issues
**Email**: privacy@accessinsight.example.com (if available)

For general support, see our [User Guide](USER_GUIDE.md).

---

## Summary

**What AccessInsight does**:
- ✅ Scans webpages locally for accessibility issues
- ✅ Stores your preferences locally on your device
- ✅ Respects your privacy completely

**What AccessInsight does NOT do**:
- ❌ Collect personal information
- ❌ Track your browsing
- ❌ Send data to external servers
- ❌ Use analytics or tracking tools
- ❌ Share data with third parties

---

**Your privacy is paramount. AccessInsight is a tool for developers, by developers, with your privacy built-in from day one.**
