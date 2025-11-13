#!/usr/bin/env node

import { Command } from 'commander';
import { UdemyScraper } from './scraper';
import * as fs from 'fs';
import * as path from 'path';

const program = new Command();

program
  .name('udemy-scraper')
  .description('Scrape Udemy course curriculum')
  .version('1.0.0');

program
  .argument('<url>', 'Udemy course URL')
  .option('-o, --output <file>', 'Output file path', 'curriculum.txt')
  .action(async (url: string, options: { output: string }) => {
    try {
      console.log(`Fetching course from: ${url}`);
      
      const scraper = new UdemyScraper();
      const sections = await scraper.scrapeCourse(url);
      
      if (sections.length === 0) {
        console.error('Warning: No curriculum sections found. The page structure may have changed or the URL is invalid.');
        console.log('Attempting to scrape with alternative methods...');
      }
      
      const formattedContent = scraper.formatCurriculum(sections);
      
      // Write to file
      const outputPath = path.resolve(options.output);
      fs.writeFileSync(outputPath, formattedContent, 'utf-8');
      
      console.log(`\nSuccessfully scraped ${sections.length} section(s)`);
      console.log(`Output written to: ${outputPath}`);
      
      // Preview first few lines
      const lines = formattedContent.split('\n').slice(0, 10);
      console.log('\nPreview:');
      console.log(lines.join('\n'));
      if (formattedContent.split('\n').length > 10) {
        console.log('...');
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

program.parse();
