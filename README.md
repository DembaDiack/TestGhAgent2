# Udemy Course Scraper

A CLI tool to scrape and extract curriculum from Udemy courses.

## Installation

```bash
npm install
npm run build
```

## Usage

```bash
npm run dev -- <url> -o <output>
```

Or after building:

```bash
node dist/cli.js <url> -o <output>
```

### Examples

```bash
# Scrape AWS Solutions Architect course
npm run dev -- https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03 -o aws-course.txt

# Using built version
node dist/cli.js https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03 -o curriculum.txt
```

### Options

- `<url>` - Udemy course URL (required)
- `-o, --output <file>` - Output file path (default: curriculum.txt)

## Output Format

The scraper generates a checklist format:

```
- [ ] 01. Section Title
    - [ ] 1. Lecture Title 1
    - [ ] 2. Lecture Title 2
    
- [ ] 02. Another Section
    - [ ] 1. Another Lecture
```

## Technologies

- Node.js
- TypeScript
- Cheerio (HTML parsing)
- Axios (HTTP requests)
- Commander (CLI framework)
