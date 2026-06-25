export interface Engineer {
  name: string;
  email: string;
  region: string;
  designation: string;
}

export const engineersData: Engineer[] = [
  { name: 'Vangara Bhavana', email: 'vangarabhavana.resume@gmail.com', region: 'North-East (Rajasthan, West Bengal, Assam, Meghalaya)', designation: 'Embedded Engineer' },
  { name: 'Vinayak Nath', email: 'vinayaknath16@gmail.com', region: 'North-East (Assam, Meghalaya)', designation: 'Field Application Engineer' },
  { name: 'Pittu Narendra Reddy', email: 'reddynarendra211@gmail.com', region: 'Central (Indore)', designation: 'Field Application Engineer' },
  { name: 'Saiteja Vuduthala', email: 'saitejavudathala@gmail.com', region: 'Telangana & Andhra Pradesh', designation: 'Field Application Engineer' },
  { name: 'Praveen Brahmasani', email: 'praveenbrahmasani602@gmail.com', region: 'South (Hyderabad)', designation: 'Field Application Engineer' },
  { name: 'Ashok Lingappagari', email: 'ashoklingappagari@gmail.com', region: 'Central (Indore)', designation: 'Field Application Engineer' },
  { name: 'BOMMERA PRAVEEN BABU', email: 'bommerapraveen2@gmail.com', region: 'Telangana & Andhra Pradesh', designation: 'Field Application Engineer' },
  { name: 'EDULAKANTI SATHWIK REDDY', email: 'sathwikreddy169@gmail.com', region: 'Central', designation: 'Field Application Engineer' },
  { name: 'Gowtham Lanke', email: 'gowthamlanke4@gmail.com', region: 'East (Kolkata)', designation: 'Field Application Engineer' },
  { name: 'Jyothi Boppudi', email: 'jyothiboppudi08@gmail.com', region: 'North (Delhi, NCR, Haryana, Punjab)', designation: 'Embedded Engineer' },
  { name: 'N Rajesh', email: 'nethalarajesh17@gmail.com', region: 'East', designation: 'Field Application Engineer' },
  { name: 'Tasmin Shaik', email: 'shaiktasmin802@gmail.com', region: 'West (Maharashtra, Gujarat, Goa)', designation: 'Embedded Engineer' },
  { name: 'Teja poodari', email: 'tejapoodari@gmail.com', region: 'South', designation: 'Field Application Engineer' }
];

// Helper function to group engineers by broad region categories for display
export const groupedEngineers = engineersData.reduce((acc, engineer) => {
  // Try to extract a clean region key (e.g., "North-East", "Central", "South", "East", "West", "North", "Telangana & Andhra Pradesh")
  let key = 'Other';
  const regionLower = engineer.region.toLowerCase();
  
  if (regionLower.includes('north-east')) key = 'North-East';
  else if (regionLower.includes('north')) key = 'North';
  else if (regionLower.includes('central')) key = 'Central';
  else if (regionLower.includes('telangana')) key = 'Telangana & AP';
  else if (regionLower.includes('south')) key = 'South';
  else if (regionLower.includes('east')) key = 'East';
  else if (regionLower.includes('west')) key = 'West';
  else key = engineer.region.split('(')[0].trim();

  if (!acc[key]) acc[key] = [];
  acc[key].push(engineer);
  return acc;
}, {} as Record<string, Engineer[]>);
