# Gaz Kelly website workspace instructions

## CMS-managed content

The files below are the live website's CMS-managed content and must be treated as read-only during normal local development:

- `data/performances.json`
- `data/releases.json`
- `data/notification.json`

Do not edit, reformat, rename, replace, delete, or generate these files unless the user explicitly asked to change the live CMS content itself.

When changing page layouts, rendering logic, styles, or CMS schemas, preserve the existing contents of these files. Use the files under `test/data/` for sample data and local experiments instead.

The `.pages.yml` file defines the Pages CMS interface. It may be edited when the user requests CMS configuration changes, but those changes must not silently alter the live data files.
