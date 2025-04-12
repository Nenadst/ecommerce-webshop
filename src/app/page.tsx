import HeaderBottom from '@/components/layouts/HeaderBottom'
import HeaderTop from '@/components/layouts/HeaderTop'
import Footer from '@/components/layouts/Footer'
import Homepage from '@/features/homepage'

export default function Home() {
  return (
    <main className="bg-white">
      <HeaderTop />
      <HeaderBottom />
      <Homepage />
      <Footer />
    </main>
  )
}