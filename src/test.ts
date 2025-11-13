import { UdemyScraper } from './scraper';
import * as cheerio from 'cheerio';
import * as fs from 'fs';

// Test scraper with actual Udemy HTML
class TestUdemyScraper extends UdemyScraper {
  public async scrapeFromFile(filePath: string) {
    const html = fs.readFileSync(filePath, 'utf-8');
    const $ = cheerio.load(html);
    const sections: any[] = [];

    // Use the actual Udemy structure
    $('[class*="section--panel"]').each((_, element) => {
      let sectionTitle = $(element).find('[class*="section--section-title"], [class*="section-title"]').first().text().trim();
      
      // Clean up section title - remove lecture count and duration info
      sectionTitle = sectionTitle.replace(/\d+\s*lectures?\s*•\s*\d+\s*(?:min|hr|hours?)/gi, '').trim();
      
      const lectures: string[] = [];

      $(element).find('[class*="course-lecture-title"], [class*="lecture-title"]').each((_, lecture) => {
        const lectureTitle = $(lecture).text().trim();
        if (lectureTitle) {
          lectures.push(lectureTitle);
        }
      });

      if (sectionTitle && lectures.length > 0) {
        sections.push({ title: sectionTitle, lectures });
      }
    });

    return sections;
  }
}

async function test() {
  const scraper = new TestUdemyScraper();
  
  // Check if actual HTML file exists
  const htmlPath = '/tmp/page.html';
  if (fs.existsSync(htmlPath)) {
    console.log('Testing with actual Udemy HTML...\n');
    const sections = await scraper.scrapeFromFile(htmlPath);
    
    console.log(`Found ${sections.length} sections:\n`);
    
    // Show first 3 sections
    sections.slice(0, 3).forEach((section, i) => {
      console.log(`Section ${i + 1}: ${section.title}`);
      section.lectures.slice(0, 3).forEach((lecture: string, j: number) => {
        console.log(`  ${j + 1}. ${lecture}`);
      });
      if (section.lectures.length > 3) {
        console.log(`  ... and ${section.lectures.length - 3} more lectures`);
      }
      console.log('');
    });
    
    if (sections.length > 3) {
      console.log(`... and ${sections.length - 3} more sections\n`);
    }
    
    console.log('--- Formatted Output (first 3 sections) ---\n');
    const formatted = scraper.formatCurriculum(sections.slice(0, 3));
    console.log(formatted);
  } else {
    // Fallback to mock HTML
    console.log('No actual HTML found, using mock data...\n');
    
    const mockSections = [
      {
        title: 'Introduction - AWS Certified Solutions Architect Associate',
        lectures: [
          'Course Introduction - AWS Certified Solutions',
          'About the Instructor'
        ]
      },
      {
        title: 'AWS Fundamentals',
        lectures: [
          'What is Cloud Computing?',
          'AWS Global Infrastructure',
          'AWS Services Overview'
        ]
      }
    ];
    
    console.log('--- Formatted Output ---\n');
    const formatted = scraper.formatCurriculum(mockSections);
    console.log(formatted);
  }
}

test().catch(console.error);
