import { Banner } from '../components/Banner'
import { SearchBar } from '../components/SearchBar'
import { CategoryGrid } from '../components/CategoryGrid'

export const Home = () => {
  const categories = [
    { name: 'Burger', image: '/burgerfeast.webp' },
    { name: 'Rice items', image: '/pizzaparty.jpg' },
    { name: 'Popular', image: '/pizzaparty.jpg' },
    { name: 'Deals', image: '/pizzaparty.jpg' },
    { name: 'Wraps', image: '/pizzaparty.jpg' },
    { name: 'Pizza', image: '/pizzaparty.jpg' },
  ]
  const banners = [
    {
      title: "Pizza Party",
      description: "Enjoy pizza from Johnny and get upto 30% off",
      price: "₹100",
      image: "/pizzaparty.jpg"
    },
    {
      title: "Burger Fest",
      description: "Get your favorite burgers with special sauce",
      price: "₹80",
      image: "/burgerfeast.webp"
    },
    // Add more banners as needed
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="m-4">
      <Banner banners={banners} />

        <div className="mt-4">
          <SearchBar />
        </div>

        <CategoryGrid categories={categories} />
      </div>
    </div>
  )
}
