import nodemailer from 'nodemailer'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { name, email, interest, message } = await request.json()

    // 驗證必填欄位
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: '請填寫必填欄位' },
        { status: 400 }
      )
    }

    // 服務項目對照
    const interestMap = {
      india: '印度課程',
      university: '寶老師課程',
      flower: '彩光花波諮詢',
      other: '其他 / 只是想聊聊',
    }

    const interestLabel = interestMap[interest] || '未選擇'

    // 建立 Gmail SMTP transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })

    // 寄信給自己
    await transporter.sendMail({
      from: `"心光卉網站" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      replyTo: email,
      subject: `【心光卉】新訊息：${name} — ${interestLabel}`,
      html: `
        <div style="font-family: 'Microsoft JhengHei', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #FAF7F0; border-radius: 12px;">
          <h2 style="color: #3D3830; font-size: 1.3rem; margin-bottom: 24px; border-bottom: 2px solid #C9A96E; padding-bottom: 12px;">
            ✦ 心光卉 — 新的網站訊息
          </h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr>
              <td style="padding: 10px 0; color: #7A7060; font-size: 0.85rem; width: 100px;">稱呼</td>
              <td style="padding: 10px 0; color: #3D3830; font-weight: 500;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #7A7060; font-size: 0.85rem;">Email</td>
              <td style="padding: 10px 0; color: #3D3830;"><a href="mailto:${email}" style="color: #C9A96E;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #7A7060; font-size: 0.85rem;">感興趣的</td>
              <td style="padding: 10px 0; color: #3D3830;">${interestLabel}</td>
            </tr>
          </table>
          <div style="background: white; padding: 20px 24px; border-radius: 8px; border-left: 3px solid #C9A96E;">
            <p style="color: #7A7060; font-size: 0.78rem; margin: 0 0 8px;">訊息內容</p>
            <p style="color: #3D3830; line-height: 1.8; margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
          <p style="color: #A8B5A0; font-size: 0.75rem; margin-top: 24px; text-align: center;">
            此信件由心光卉網站聯絡表單自動寄出
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Email send error:', error)
    return NextResponse.json(
      { error: '寄送失敗，請稍後再試' },
      { status: 500 }
    )
  }
}
