import { NextRequest, NextResponse } from 'next/server';
import { medusaClient } from '@/lib/medusa-client';

export async function GET() {
  try {
    // Test połączenia z Medusa
    const response = await medusaClient.products.list({ limit: 1 });
    
    return NextResponse.json({
      status: 'success',
      message: 'Medusa API connected',
      productCount: response.products?.length || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Medusa API test failed:', error);
    
    return NextResponse.json({
      status: 'error',
      message: error.message || 'Failed to connect to Medusa API',
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}
