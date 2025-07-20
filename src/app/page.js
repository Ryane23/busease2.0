import Link from "next/link";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <div className="min-h-screen w-full bg-gradient-to-b from-blue-50 via-white to-blue-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-2xl font-bold animate-gradient-text">BusEase</span>
              </div>
              <div className="hidden md:flex items-center space-x-8">
                <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors duration-300 hover:scale-105 transform">Home</Link>
                <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors duration-300 hover:scale-105 transform">About</Link>
                <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition-colors duration-300 hover:scale-105 transform">Contact</Link>
                {/* Stations Dropdown */}
                <div className="relative group">
                  <button className="text-gray-700 hover:text-blue-600 transition-colors duration-300 hover:scale-105 transform focus:outline-none">Stations</button>
                  <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 group-hover:visible invisible transition-opacity duration-200 z-20">
                    <ul className="py-2">
                      <li><span className="block px-4 py-2 text-gray-700 hover:bg-blue-50 cursor-pointer">Yaounde Station</span></li>
                      <li><span className="block px-4 py-2 text-gray-700 hover:bg-blue-50 cursor-pointer">Douala Station</span></li>
                      <li><span className="block px-4 py-2 text-gray-700 hover:bg-blue-50 cursor-pointer">Buea Station</span></li>
                      <li><span className="block px-4 py-2 text-gray-700 hover:bg-blue-50 cursor-pointer">Bamenda Station</span></li>
                    </ul>
                  </div>
                </div>
                <Link href="/login" className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-300 hover:shadow-lg hover:scale-105 transform hover:border-blue-400">Login</Link>
                <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 hover:shadow-lg hover:scale-105 transform animate-pulse hover:animate-none">Sign Up</Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="relative h-[600px] bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/20"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-6">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-text-fade-up stagger-1">
                Discover Your Next Journey
              </h1>
              <p className="text-xl mb-8 animate-text-fade-up stagger-2">
                Book bus tickets to your favorite destinations
              </p>
              
              {/* Search Box */}
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto backdrop-blur-sm bg-white/90">
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="col-span-1">
                    <input type="text" placeholder="From" className="w-full p-3 border rounded text-gray-700" />
                  </div>
                  <div className="col-span-1">
                    <input type="text" placeholder="To" className="w-full p-3 border rounded text-gray-700" />
                  </div>
                  <div className="col-span-1">
                    <input type="date" className="w-full p-3 border rounded text-gray-700" />
                  </div>
                  <button className="col-span-1 bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition-all duration-300 hover:shadow-xl hover:scale-105 transform animate-bounce hover:animate-none">
                    Search Buses
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Destinations */}
        <div className="container mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold text-center mb-12 animate-fade-in">Popular Destinations</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Yaounde', color: 'from-emerald-400 to-teal-500', delay: 'delay-0' },
              { name: 'Douala', color: 'from-orange-400 to-pink-500', delay: 'delay-150' },
              { name: 'Buea', color: 'from-blue-400 to-indigo-500', delay: 'delay-300' }
            ].map((city) => (
              <div 
                key={city.name} 
                className={`relative h-64 rounded-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-500 hover:shadow-2xl ${city.delay} animate-slide-up`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${city.color} transform transition-transform duration-500 hover:rotate-1`}>
                  <div className="absolute inset-0 bg-black/10 hover:bg-black/0 transition-colors duration-300"></div>
                  <div className="flex items-end h-full p-6 transform hover:translate-y-[-5px] transition-transform duration-300">
                    <div>
                      <h3 className="text-2xl font-bold text-white">{city.name}</h3>
                      <p className="text-white/90 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">From $29</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bus Schedules */}
        <div className="container mx-auto px-6 py-16 bus-schedule-container">
          <h2 className="text-3xl font-bold text-center mb-8 bus-schedule-title">Available Buses</h2>
          <div className="grid gap-6">
            {[
              {
                from: "Yaounde",
                to: "Buea",
                departure: "08:00 AM",
                arrival: "2:30 PM",
                type: "VIP",
                seats: { available: 28, total: 36 },
                driver: "John Doe",
                price: "10000Fcfa"
              },
              {
                from: "Chicago",
                to: "Detroit",
                departure: "09:30 AM",
                arrival: "02:00 PM",
                type: "Normal",
                seats: { available: 15, total: 45 },
                driver: "Jane Smith",
                price: "$35"
              },
            ].map((bus, index) => (
              <div 
                key={index}
                className="bus-item bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="grid md:grid-cols-5 gap-4 items-center bus-content">
                  {/* Route Info */}
                  <div className="space-y-2 relative">
                    <div className="absolute left-0 top-0 w-full h-full bg-gradient-to-r from-blue-50 to-transparent opacity-20 rounded-lg"></div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <p className="font-medium">{bus.from}</p>
                    </div>
                    <div className="h-10 border-l-2 border-dashed border-gray-300 ml-1.5"></div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <p className="font-medium">{bus.to}</p>
                    </div>
                  </div>

                  {/* Time Info with enhanced styling */}
                  <div className="text-center relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-transparent opacity-10 rounded-lg"></div>
                    <p className="text-sm text-gray-600">Departure</p>
                    <p className="font-semibold">{bus.departure}</p>
                    <p className="text-sm text-gray-600 mt-2">Arrival</p>
                    <p className="font-semibold">{bus.arrival}</p>
                  </div>

                  {/* Bus Type & Seats */}
                  <div className="text-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      bus.type === 'VIP' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {bus.type}
                    </span>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Available Seats</p>
                      <p className="font-semibold">{bus.seats.available}/{bus.seats.total}</p>
                    </div>
                  </div>

                  {/* Driver Info */}
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Driver</p>
                    <p className="font-semibold">{bus.driver}</p>
                  </div>

                  {/* Price & Book Button */}
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600 mb-2">{bus.price}</p>
                    <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 transform hover:scale-105">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="bg-gradient-to-b from-white via-blue-50 to-white py-16">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { title: "24/7 Support", desc: "Round the clock assistance", gradient: "from-blue-500 to-cyan-500" },
                { title: "Instant Booking", desc: "Quick & easy process", gradient: "from-purple-500 to-pink-500" },
                { title: "Best Prices", desc: "Guaranteed low fares", gradient: "from-green-500 to-emerald-500" },
                { title: "Secure Payments", desc: "100% secure transactions", gradient: "from-orange-500 to-yellow-500" }
              ].map((feature) => (
                <div key={feature.title} className="text-center p-6 rounded-xl bg-white shadow-xl hover:shadow-2xl transition-shadow duration-300">
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r ${feature.gradient}`}></div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
