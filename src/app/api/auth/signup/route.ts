import { NextRequest, NextResponse } from 'next/server'
import { createUser, generateToken } from '@/lib/auth'
import { signupSchema } from '@/lib/validation/schemas'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validation = signupSchema.safeParse(body)

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

    const user = await createUser(email, password)

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User already exists',
        },
        { status: 400 }
      )
    }

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
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}