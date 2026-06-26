export interface Engineer {
  name: string;
  email: string;
  region: string;
  designation: string;
}

export const engineersData: Engineer[] = [
  { name: 'KANCHERLA MURALIKRISHNA', email: 'muralikancherla7032@gmail.com', region: 'Chattisgarh, Madhya Pradesh', designation: 'Embedded Engineer' },
  { name: 'Usharani Gade', email: 'gadeusharani6@gmail.com', region: 'South (Karnataka, Kerala, Telangana, AP, Tamil Nadu)', designation: 'Embedded Engineer' },
  { name: 'Vangara Bhavana', email: 'vangarabhavana.resume@gmail.com', region: 'North-East (Rajasthan, West Bengal, Assam, Meghalaya)', designation: 'Embedded Engineer' },
  { name: 'Vinayak Nath', email: 'northeast@snenviro.in', region: 'North-East (Assam, Meghalaya)', designation: 'Regional Head' },
  { name: 'Pittu Narendra Reddy', email: 'central1@snenviro.in', region: 'Central (Indore)', designation: 'Regional Head' },
  { name: 'Saiteja Vuduthala', email: 'saitejavudathala@gmail.com', region: 'Telangana & Andhra Pradesh', designation: 'Field Application Engineer' },
  { name: 'Praveen Brahmasani', email: 'praveenbrahmasani602@gmail.com', region: 'South (Hyderabad)', designation: 'Field Application Engineer' },
  { name: 'Ashok Lingappagari', email: 'ashoklingappagari@gmail.com', region: 'Central (Indore)', designation: 'Field Application Engineer' },
  { name: 'BOMMERA PRAVEEN BABU', email: 'bommerapraveen2@gmail.com', region: 'Telangana & Andhra Pradesh', designation: 'Field Application Engineer' },
  { name: 'EDULAKANTI SATHWIK REDDY', email: 'sathwikreddy169@gmail.com', region: 'Central', designation: 'Field Application Engineer' },
  { name: 'Gowtham Lanke', email: 'east@snenviro.in', region: 'East (Kolkata)', designation: 'Regional Head' },
  { name: 'Jyothi Boppudi', email: 'jyothiboppudi08@gmail.com', region: 'North (Delhi, NCR, Haryana, Punjab)', designation: 'Embedded Engineer' },
  { name: 'N Rajesh', email: 'nethalarajesh17@gmail.com', region: 'East', designation: 'Field Application Engineer' },
  { name: 'Tasmin Shaik', email: 'shaiktasmin802@gmail.com', region: 'West (Maharashtra, Gujarat, Goa)', designation: 'Embedded Engineer' },
  { name: 'Teja poodari', email: 'tejapoodari@gmail.com', region: 'South', designation: 'Field Application Engineer' },
  { name: 'N L N Vachaspathi', email: 'south2@snenviro.in', region: 'South2 (Bangalore)', designation: 'Regional Head' },
  { name: 'Siva Kishore', email: 'west@snenvio.in', region: 'West Head', designation: 'Regional Head' },
  { name: 'Sachin', email: 'north@snenviro.in', region: 'North', designation: 'Regional Head' },
  { name: 'Vinit', email: 'central2@snenviro.in', region: 'Central2', designation: 'Regional Head' }
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
