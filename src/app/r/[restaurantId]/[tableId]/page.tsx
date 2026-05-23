import { getMenu } from '@/services/menuService'

interface Props {
  params: Promise<{
    restaurantId: string
    tableId: string
  }>
}

export default async function RestaurantPage({
  params,
}: Props) {
  const {
    restaurantId,
    tableId,
  } = await params

  const menu = await getMenu(
    restaurantId
  )

  return (
    <main className="min-h-screen bg-[#f5f5f5] py-8 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-400 rounded-3xl p-8 text-white shadow-xl mb-8">
          <h1 className="text-5xl font-bold mb-2">
            TableTap
          </h1>

          <p className="text-lg opacity-90">
            Premium QR Dining Experience
          </p>

          <div className="mt-6 flex gap-4">
            <div className="bg-white/20 px-4 py-2 rounded-xl">
              Restaurant: {restaurantId}
            </div>

            <div className="bg-white/20 px-4 py-2 rounded-xl">
              Table: {tableId}
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="grid md:grid-cols-2 gap-6">
          {menu.map((item: any) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl shadow-lg overflow-hidden hover:scale-[1.02] transition-all duration-300"
            >
              <div className="h-56 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                <span className="text-6xl">
                  🍽️
                </span>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {item.name}
                    </h2>

                    <p className="text-gray-500 mt-1">
                      {item.description}
                    </p>
                  </div>

                  <div
                    className={`w-4 h-4 rounded-full ${
                      item.isVeg
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    }`}
                  />
                </div>

                <div className="flex items-center justify-between mt-6">
                  <p className="text-3xl font-bold text-orange-500">
                    ₹{item.price}
                  </p>

                  <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl font-semibold transition-all">
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  )
}