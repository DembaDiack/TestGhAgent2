import axios from 'axios';
import * as cheerio from 'cheerio';

export interface CourseSection {
  title: string;
  lectures: string[];
}

export class UdemyScraper {
  private async fetchPage(url: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch page: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async scrapeCourse(url: string): Promise<CourseSection[]> {
    const html = await this.fetchPage(url);
    const $ = cheerio.load(html);
    const sections: CourseSection[] = [];

    // Udemy's actual HTML structure (based on real page analysis)
    // Uses class names like: section--panel--qYPjj, section--section-title--svpHP, section--course-lecture-title--lH1Wi
    
    // Approach 1: Look for section panels (most reliable for current Udemy structure)
    $('[class*="section--panel"]').each((_, element) => {
      let sectionTitle = $(element).find('[class*="section--section-title"], [class*="section-title"]').first().text().trim();
      
      // Clean up section title - remove lecture count and duration info (e.g., "6 lectures • 15min")
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

    // Approach 2: Try data-purpose attributes (for older Udemy pages or logged-in views)
    if (sections.length === 0) {
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
    }

    // Approach 3: Generic fallback for other variations
    if (sections.length === 0) {
      $('section[class*="curriculum"], div[class*="curriculum"]').each((_, element) => {
        const sectionTitle = $(element).find('[class*="section-title"], h3, h4').first().text().trim();
        const lectures: string[] = [];

        $(element).find('li, div[class*="lecture"]').each((_, lecture) => {
          const lectureTitle = $(lecture).text().trim();
          if (lectureTitle && lectureTitle !== sectionTitle) {
            lectures.push(lectureTitle);
          }
        });

        if (sectionTitle && lectures.length > 0) {
          sections.push({ title: sectionTitle, lectures });
        }
      });
    }

    return sections;
  }

  public formatCurriculum(sections: CourseSection[]): string {
    let output = '';
    
    sections.forEach((section, sectionIndex) => {
      const sectionNumber = String(sectionIndex + 1).padStart(2, '0');
      output += `- [ ] ${sectionNumber}. ${section.title}\n`;
      
      section.lectures.forEach((lecture, lectureIndex) => {
        const lectureNumber = lectureIndex + 1;
        output += `    - [ ] ${lectureNumber}. ${lecture}\n`;
      });
      
      output += '\n';
    });

    return output;
  }
}
