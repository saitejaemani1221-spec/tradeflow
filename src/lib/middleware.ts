import { NextRequest } from 'next/server';
import { verifyToken } from './auth';

export async function getAuthenticatedUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    if (!payload) {
      return null;
    }
    
    return payload;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}
