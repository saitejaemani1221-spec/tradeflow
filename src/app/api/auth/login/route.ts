import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, generateToken } from '@/lib/auth'
import { loginSchema } from '@/lib/validation/schemas'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input safely
    const validation = loginSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            validation.error.issues[0]?.message ||
            'Email and password are required',
        },
        { status: 400 }
      )
    }

    const { email, password } = validation.data

    // Authenticate user
    const user = await authenticateUser(email, password)

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password',
        },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = generateToken(user.id)

    return NextResponse.json(
      {
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
          },
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Login error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}