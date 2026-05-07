'use client'
import { useState, useEffect, useRef } from 'react'
import styles from './Contact.module.css'

export default function Contact() {
  const sectionRef = useRef(null)
  const [form, setForm] = useState({ name: '', email: '', interest: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible')
        })
      },
      { threshold: 0.1 }
    )
    const reveals = sectionRef.current?.querySelectorAll('.reveal')
    reveals?.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        setSubmitted(true)
      } else {
        alert(data.error || '寄送失敗，請稍後再試')
      }
    } catch {
      alert('網路錯誤，請檢查網路連線後再試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contact" className={`${styles.contact} section`} ref={sectionRef} aria-label="聯絡我們">
      <div className="container">
        <div className={styles.grid}>
          {/* Left Info */}
          <div className={styles.infoSide}>
            <span className={`section-label reveal`}>聯絡我們</span>
            <h2 className={`${styles.heading} reveal reveal-delay-1`}>
              帶著你的問題
              <br />
              <em>我們在這裡等你</em>
            </h2>
            <span className="gold-line" style={{ margin: '28px 0' }} aria-hidden="true" />
            <p className={`${styles.intro} reveal reveal-delay-2`}>
              無論你對哪項服務感到好奇，或者只是想聊聊自己最近的狀態，歡迎傳訊給我們。
              <br />
              <em>沒有標準答案，只有真誠的回應</em>
            </p>

            <div className={`${styles.contactItems} reveal reveal-delay-3`}>
              <div className={styles.contactItem}>
                <span className={styles.contactItemIcon}>✉</span>
                <div>
                  <span className={styles.contactItemLabel}>電子信箱</span>
                  <a href="mailto:hello@xinguanghui.com" className={styles.contactItemValue}>
                    hello@xinguanghui.com
                  </a>
                </div>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactItemIcon}>☏</span>
                <div>
                  <span className={styles.contactItemLabel}>服務時間</span>
                  <span className={styles.contactItemValue}>週一至週五，上午 10:00 — 下午 6:00</span>
                </div>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactItemIcon}>◎</span>
                <div>
                  <span className={styles.contactItemLabel}>社群媒體</span>
                  <span className={styles.contactItemValue}>Instagram · Facebook · LINE</span>
                </div>
              </div>
            </div>

            {/* Gentle note */}
            <div className={`${styles.gentleNote} reveal reveal-delay-3`}>
              <p>每一個問題都值得被好好對待</p>
              <p>我們通常在<span> 1-2 </span>個工作天內回覆</p>
            </div>
          </div>

          {/* Form */}
          <div className={`${styles.formSide} reveal reveal-delay-2`}>
            {!submitted ? (
              <form
                className={styles.form}
                onSubmit={handleSubmit}
                aria-label="聯絡表單"
                noValidate
              >
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.label}>您的稱呼</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className={styles.input}
                    placeholder="請輸入您的名字"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>電子信箱</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className={styles.input}
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="interest" className={styles.label}>您對什麼感興趣？</label>
                  <select
                    id="interest"
                    name="interest"
                    className={styles.select}
                    value={form.interest}
                    onChange={handleChange}
                  >
                    <option value="">請選擇服務項目（選填）</option>
                    <option value="india">印度課程</option>
                    <option value="university">寶老師課程</option>
                    <option value="flower">花波精油諮詢</option>
                    <option value="other">其他 / 只是想聊聊</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="message" className={styles.label}>您想說的話</label>
                  <textarea
                    id="message"
                    name="message"
                    className={styles.textarea}
                    placeholder="不需要整理，想到什麼就說什麼…"
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button
                  type="submit"
                  id="contact-submit-btn"
                  className={styles.submitBtn}
                  disabled={loading}
                >
                  {loading ? (
                    <span className={styles.btnLoading}>傳送中…</span>
                  ) : (
                    <>
                      <span>送出訊息</span>
                      <span className={styles.btnArrow}>→</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className={styles.successCard} role="alert">
                <span className={styles.successIcon}>✦</span>
                <h3 className={styles.successTitle}>訊息已送出</h3>
                <p className={styles.successText}>
                  謝謝你的信任。我們會在 1-2 個工作天內回覆。
                  <br />
                  先好好休息，讓自己輕鬆一下。
                </p>
                <button
                  className={styles.successReset}
                  onClick={() => { setSubmitted(false); setForm({ name: '', email: '', interest: '', message: '' }) }}
                >
                  再次傳訊
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
