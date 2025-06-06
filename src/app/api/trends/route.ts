// import { NextRequest, NextResponse } from 'next/server';

// interface HistoricalDataPoint {
//   date: string;
//   ChatGPT: number;
//   Gemini: number;
//   Llama: number;
//   timestamp: number;
// }

// // Mock data generator for fallback
// function generateMockHistoricalData(): HistoricalDataPoint[] {
//   const data: HistoricalDataPoint[] = [];
//   const now = new Date();
  
//   // Generate 30 days of historical data
//   for (let i = 29; i >= 0; i--) {
//     const date = new Date(now);
//     date.setDate(date.getDate() - i);
    
//     // Simulate realistic trends with some randomness
//     const baseDay = 29 - i;
//     const chatGPTBase = 0.75 + (Math.sin(baseDay * 0.1) * 0.1) + (baseDay * 0.003);
//     const geminiBase = 0.70 + (Math.cos(baseDay * 0.12) * 0.08) + (baseDay * 0.004);
//     const llamaBase = 0.65 + (Math.sin(baseDay * 0.08) * 0.07) + (baseDay * 0.005);
    
//     data.push({
//       date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
//       ChatGPT: Math.min(1, Math.max(0, chatGPTBase + (Math.random() - 0.5) * 0.05)),
//       Gemini: Math.min(1, Math.max(0, geminiBase + (Math.random() - 0.5) * 0.05)),
//       Llama: Math.min(1, Math.max(0, llamaBase + (Math.random() - 0.5) * 0.05)),
//       timestamp: date.getTime()
//     });
//   }
  
//   return data;
// }

// export async function GET(request: NextRequest) {
//   try {
//     console.log('🔍 API: Fetching trends data from Flask backend...');
    
//     // Try to fetch from Flask backend
//     const backendUrl = process.env.FLASK_BACKEND_URL || 'http://localhost:5000';
    
//     try {
//       const response = await fetch(`${backendUrl}/api/trends`, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         // Add timeout to prevent hanging
//         signal: AbortSignal.timeout(5000), // 5 second timeout
//       });

//       if (!response.ok) {
//         throw new Error(`Flask backend responded with status: ${response.status}`);
//       }

//       const data = await response.json();
      
//       // Validate the data format
//       if (Array.isArray(data) && data.length > 0) {
//         const isValidFormat = data.every(item => 
//           item && 
//           typeof item.date === 'string' &&
//           typeof item.ChatGPT === 'number' &&
//           typeof item.Gemini === 'number' &&
//           typeof item.Llama === 'number'
//         );

//         if (isValidFormat) {
//           console.log('✅ API: Successfully fetched trends data from Flask backend');
//           return NextResponse.json(data);
//         } else {
//           console.warn('⚠️ API: Invalid data format from Flask backend, using mock data');
//         }
//       }
//     } catch (fetchError) {
//       console.warn('⚠️ API: Failed to fetch from Flask backend:', fetchError);
//     }

//     // Fallback to mock data
//     console.log('📊 API: Using mock trends data as fallback');
//     const mockData = generateMockHistoricalData();
    
//     return NextResponse.json(mockData, {
//       headers: {
//         'Cache-Control': 'no-cache, no-store, must-revalidate',
//         'Pragma': 'no-cache',
//         'Expires': '0',
//       },
//     });

//   } catch (error) {
//     console.error('❌ API: Error in trends route:', error);
    
//     return NextResponse.json(
//       { 
//         error: 'Failed to fetch trends data',
//         message: error instanceof Error ? error.message : 'Unknown error',
//         fallbackData: generateMockHistoricalData()
//       },
//       { status: 500 }
//     );
//   }
// }

// // Optional: Add POST method if you need to update trends data
// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
    
//     // Forward to Flask backend
//     const backendUrl = process.env.FLASK_BACKEND_URL || 'http://localhost:5000';
//     const response = await fetch(`${backendUrl}/api/trends`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(body),
//       signal: AbortSignal.timeout(10000), // 10 second timeout for POST
//     });

//     if (!response.ok) {
//       throw new Error(`Flask backend responded with status: ${response.status}`);
//     }

//     const data = await response.json();
//     return NextResponse.json(data);

//   } catch (error) {
//     console.error('❌ API: Error in trends POST route:', error);
//     return NextResponse.json(
//       { error: 'Failed to update trends data' },
//       { status: 500 }
//     );
//   }
// }