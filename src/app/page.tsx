import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-sm sticky top-0 z-50">
        <div className="text-2xl font-bold text-orange-600">TableTap</div>
        <div className="flex gap-4">
          <Link href="/login" className="text-gray-600 hover:text-orange-600 font-medium">Login</Link>
          <Link href="/signup" className="text-white bg-orange-600 px-4 py-2 rounded-full font-medium hover:bg-orange-700 transition">Signup</Link>
          <Link href="/r/demo-restaurant" className="text-gray-800 border border-gray-300 px-4 py-2 rounded-full font-medium hover:bg-gray-100 transition">Demo Restaurant</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative py-24 px-6 text-center bg-gradient-to-br from-white to-orange-50">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
          Smart QR Ordering for <span className="text-orange-600">Modern Restaurants</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Manage tables, menus, payments, kitchen and waiters from one platform.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/signup" className="bg-orange-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-orange-700 transition shadow-lg hover:shadow-xl">
            Get Started
          </Link>
          <Link href="/r/demo-restaurant" className="bg-white text-gray-800 border border-gray-300 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition shadow-lg hover:shadow-xl">
            View Demo
          </Link>
        </div>
      </header>

      {/* Features */}
      <section className="py-20 px-6">
        <h2 className="text-4xl font-bold text-center mb-16">Everything You Need to Run Your Restaurant</h2>
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
          {[
            { title: 'Seamless QR Ordering', description: 'Customers scan, view, and order instantly from their smartphones.' },
            { title: 'Kitchen Display System', description: 'Real-time order management for efficient kitchen workflows.' },
            { title: 'Powerful Analytics', description: 'Actionable insights into sales, popular items, and staff performance.' },
          ].map((feature, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
              <h3 className="text-2xl font-semibold mb-4 text-orange-600">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-gray-900 text-white">
        <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-10">
          {['1. Setup Menu', '2. Generate QR Codes', '3. Start Taking Orders'].map((step, i) => (
            <div key={i} className="text-center">
              <div className="w-16 h-16 bg-orange-600 text-white text-2xl font-bold flex items-center justify-center rounded-full mx-auto mb-6">
                {i + 1}
              </div>
              <h3 className="text-xl font-semibold">{step}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-6">
        <h2 className="text-4xl font-bold text-center mb-16">Why Restaurants Love TableTap</h2>
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {[
            'Increased Table Turnover',
            'Reduced Order Errors',
            'Higher Average Order Value',
            'Happier Staff & Customers',
          ].map((benefit, i) => (
            <div key={i} className="flex items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <span className="text-orange-500 text-2xl">✓</span>
              <span className="text-lg font-medium">{benefit}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Demo CTA */}
      <section className="py-20 px-6 bg-orange-600 text-white text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Restaurant?</h2>
        <p className="text-xl mb-10 opacity-90">Experience the future of dining today.</p>
        <Link href="/signup" className="bg-white text-orange-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition shadow-lg">
          Get Started Now
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 text-center text-gray-500 border-t">
        <p>&copy; {new Date().getFullYear()} TableTap. All rights reserved.</p>
      </footer>
    </div>
  );
}
