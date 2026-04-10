import { NextRequest, NextResponse } from 'next/server';
import { createUser, hashPassword } from '@/lib/auth';
import { signupSchema } from '@/lib/validation/schemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = signupSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: validation.error.issues[0]?.message || 'Validation failed'
      }, { status: 400 });
    }

    const { email, password, name } = validation.data;

    const user = await createUser(email, password, name);

    return NextResponse.json({
      success: true,
      data: { user }
    }, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({
        success: false,
        error: 'Email already exists'
      }, { status: 409 });
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
