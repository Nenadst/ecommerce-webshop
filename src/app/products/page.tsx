import HeaderBottom from '@/components/layouts/HeaderBottom'
import HeaderTop from '@/components/layouts/HeaderTop'
import Footer from '@/components/layouts/Footer'
import { Broadcum } from '@/components/layouts/Broadcrum'
import Products from '@/features/products'

export default function CategoriesPage() {
    return (
        <main className="bg-white">
            <HeaderTop />
            <HeaderBottom />
            <Broadcum />
            <Products />
            <Footer />
        </main>
    )
}
