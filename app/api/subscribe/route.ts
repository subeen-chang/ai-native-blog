import { NextRequest, NextResponse } from 'next/server'

// Mock API endpoint for testing purposes
// TODO: Implement actual subscription logic with database and email service

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: '올바른 이메일 형식을 입력해주세요.' },
        { status: 400 }
      )
    }

    // Email length validation
    if (email.length > 254) {
      return NextResponse.json(
        { success: false, message: '이메일 주소가 너무 깁니다.' },
        { status: 400 }
      )
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Mock success response
    return NextResponse.json({
      success: true,
      message: '인증 이메일이 발송되었습니다. 이메일을 확인해주세요.',
    })
  } catch (error) {
    console.error('Subscribe error:', error)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    )
  }
}
