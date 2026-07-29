import Navbar from './components/Navbar/Navbar'
import Hero from './components/Hero/Hero'
import About from './components/About/About'
import Services from './components/Services/Services'
import Philosophy from './components/Philosophy/Philosophy'
import Contact from './components/Contact/Contact'
import Footer from './components/Footer/Footer'
import ScrollToTop from './components/ScrollToTop/ScrollToTop'
import JsonLd from './components/JsonLd'
import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  SOCIAL_LINKS,
  CONTACT_EMAIL,
  absoluteUrl,
} from './lib/site'

export const metadata = {
  alternates: {
    canonical: '/',
  },
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  alternateName: ['心光卉', 'Fosanthos'],
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: absoluteUrl('/logo_square.png'),
    width: 512,
    height: 512,
  },
  description: SITE_DESCRIPTION,
  email: CONTACT_EMAIL,
  sameAs: SOCIAL_LINKS,
  areaServed: 'TW',
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  inLanguage: 'zh-TW',
  publisher: { '@id': `${SITE_URL}/#organization` },
}

export default function HomePage() {
  return (
    <>
      <JsonLd data={[organizationSchema, websiteSchema]} />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <Philosophy />
        <Contact />
      </main>
      <Footer />
      <ScrollToTop />
    </>
  )
}
