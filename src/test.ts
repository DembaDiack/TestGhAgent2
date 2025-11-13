import { UdemyScraper } from './scraper';
import * as cheerio from 'cheerio';

// Mock scraper for testing
class MockUdemyScraper extends UdemyScraper {
  public async scrapeCourseFromHTML(html: string) {
    const $ = cheerio.load(html);
    const sections: any[] = [];

    // Same parsing logic as parent class
    $('div[data-purpose="curriculum-section-container"]').each((_, element) => {
      const sectionTitle = $(element).find('span[data-purpose="curriculum-section-title"]').text().trim();
      const lectures: string[] = [];

      $(element).find('div[data-purpose="curriculum-item-container"]').each((_, lecture) => {
        const lectureTitle = $(lecture).find('span[data-purpose="item-title"]').text().trim();
        if (lectureTitle) {
          lectures.push(lectureTitle);
        }
      });

      if (sectionTitle) {
        sections.push({ title: sectionTitle, lectures });
      }
    });

    return sections;
  }
}

// Example HTML that mimics Udemy's structure
const sampleHTML = `
<div class="course-curriculum">
  <div data-purpose="curriculum-section-container">
    <span data-purpose="curriculum-section-title">Introduction - AWS Certified Solutions Architect Associate</span>
    <div data-purpose="curriculum-item-container">
      <span data-purpose="item-title">Course Introduction - AWS Certified Solutions</span>
    </div>
    <div data-purpose="curriculum-item-container">
      <span data-purpose="item-title">About the Instructor</span>
    </div>
  </div>
  <div data-purpose="curriculum-section-container">
    <span data-purpose="curriculum-section-title">AWS Fundamentals</span>
    <div data-purpose="curriculum-item-container">
      <span data-purpose="item-title">What is Cloud Computing?</span>
    </div>
    <div data-purpose="curriculum-item-container">
      <span data-purpose="item-title">AWS Global Infrastructure</span>
    </div>
    <div data-purpose="curriculum-item-container">
      <span data-purpose="item-title">AWS Services Overview</span>
    </div>
  </div>
</div>
`;

async function test() {
  const scraper = new MockUdemyScraper();
  const sections = await scraper.scrapeCourseFromHTML(sampleHTML);
  
  console.log(`Found ${sections.length} sections:`);
  sections.forEach((section, i) => {
    console.log(`\nSection ${i + 1}: ${section.title}`);
    section.lectures.forEach((lecture: string, j: number) => {
      console.log(`  ${j + 1}. ${lecture}`);
    });
  });
  
  console.log('\n--- Formatted Output ---\n');
  const formatted = scraper.formatCurriculum(sections);
  console.log(formatted);
}

test().catch(console.error);
