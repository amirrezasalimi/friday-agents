import stripJsonComments from 'strip-json-comments';

export const cleanJson = (text: string) => {
  // Use a regular expression to match text between ```json and ``` (if it exists)
  const match = text.match(/```(json|)([\s\S]*?)```/);

  // If a match is found, return the extracted JSON part trimmed of whitespace, otherwise return the original text
  return stripJsonComments(match ? match[2].trim() : text);
};


export function extractFirstJson(content: string): string | null {
  content = cleanJson(content);
  content = content.replace(new RegExp("```json", "g"), "")
  content = content.replace(new RegExp("```", "g"), "")
  // Find the first '{' and the last '}'
  const firstOpenBrace = content.indexOf('{');
  const lastCloseBrace = content.lastIndexOf('}');

  // Check if braces exist
  if (firstOpenBrace !== -1 && lastCloseBrace !== -1 && lastCloseBrace > firstOpenBrace) {
    const jsonString = content.substring(firstOpenBrace, lastCloseBrace + 1);

    try {
      // Try parsing to ensure it's valid JSON
      const parsedJson = JSON.parse(jsonString);
      return JSON.stringify(parsedJson, null, 2); // Return pretty-printed JSON string
    } catch (error) {
      console.error('Invalid JSON:', error);
      return null;
    }
  }

  return null;
}

export function extractCodeBlocks(text: string): string {
  // First try to find typescript/javascript block
  const langRegex = /```(?:typescript|javascript)([\s\S]*?)```/i;
  const langMatch = text.match(langRegex);

  if (langMatch) {
    return langMatch[1].trim();
  }

  // If no typescript/javascript block found, look for plain block
  const plainRegex = /```([\s\S]*?)```/;
  const plainMatch = text.match(plainRegex);

  // Return the code block content or original text
  return plainMatch ? plainMatch[1].trim() : text.trim();
}