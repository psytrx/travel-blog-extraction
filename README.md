# Travel Blog Extraction

This script extracts structured data from an outdated Ghost instance and parses it into structured JSON.

- Raw (manually downloaded) HTML files are placed in `./data/blog`
- Files starting with an underscore are ignored
- Metadata is extracted from `application/ld+json` script tags
- Post body/content is extracted and parsed into structured JSON objects
- Image galleries are being extracted and parsed into structured JSON objects
- JSON data is saved to `./output/data.json`
- Images are saved to `./output/img/*`
