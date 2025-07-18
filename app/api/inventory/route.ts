import { NextResponse } from "next/server"

// Mock inventory data
const mockInventory = [
  {
    id: "1",
    name: "iPhone 15 Pro",
    sku: "APPL-IP15P-128",
    category: "Electronics",
    current_stock: 25,
    max_stock: 100,
    reorder_point: 20,
    price: 134999, // ₹1,34,999
    warehouse_id: "550e8400-e29b-41d4-a716-446655440001",
    warehouse_name: "Main Distribution Center",
    demand_forecast_7_days: [5, 6, 4, 7, 5, 8, 6],
    avg_daily_sales: 5.8,
    lead_time_days: 7,
    created_at: "2024-01-10T00:00:00Z",
    updated_at: "2024-01-15T00:00:00Z",
  },
  {
    id: "2",
    name: "Samsung Galaxy S24",
    sku: "SAMS-GS24-256",
    category: "Electronics",
    current_stock: 45,
    max_stock: 80,
    reorder_point: 15,
    price: 89999, // ₹89,999
    warehouse_id: "550e8400-e29b-41d4-a716-446655440002",
    warehouse_name: "West Coast Hub",
    demand_forecast_7_days: [3, 4, 5, 3, 4, 6, 5],
    avg_daily_sales: 4.3,
    lead_time_days: 5,
    created_at: "2024-01-10T00:00:00Z",
    updated_at: "2024-01-15T00:00:00Z",
  },
  {
    id: "3",
    name: "MacBook Air M3",
    sku: "APPL-MBA-M3-512",
    category: "Electronics",
    current_stock: 8,
    max_stock: 30,
    reorder_point: 10,
    price: 114999, // ₹1,14,999
    warehouse_id: "550e8400-e29b-41d4-a716-446655440001",
    warehouse_name: "Main Distribution Center",
    demand_forecast_7_days: [2, 3, 2, 4, 3, 3, 2],
    avg_daily_sales: 2.7,
    lead_time_days: 10,
    created_at: "2024-01-10T00:00:00Z",
    updated_at: "2024-01-15T00:00:00Z",
  },
  {
    id: "4",
    name: "Sony WH-1000XM5",
    sku: "SONY-WH1000XM5",
    category: "Electronics",
    current_stock: 120,
    max_stock: 100,
    reorder_point: 25,
    price: 29999, // ₹29,999
    warehouse_id: "550e8400-e29b-41d4-a716-446655440003",
    warehouse_name: "East Coast Facility",
    demand_forecast_7_days: [8, 9, 7, 10, 8, 12, 9],
    avg_daily_sales: 9.0,
    lead_time_days: 3,
    created_at: "2024-01-10T00:00:00Z",
    updated_at: "2024-01-15T00:00:00Z",
  },
  {
    id: "5",
    name: "Nike Air Max 270",
    sku: "NIKE-AM270-BLK-10",
    category: "Footwear",
    current_stock: 0,
    max_stock: 60,
    reorder_point: 15,
    price: 12999, // ₹12,999
    warehouse_id: "550e8400-e29b-41d4-a716-446655440004",
    warehouse_name: "Midwest Center",
    demand_forecast_7_days: [4, 5, 3, 6, 4, 7, 5],
    avg_daily_sales: 4.9,
    lead_time_days: 5,
    created_at: "2024-01-10T00:00:00Z",
    updated_at: "2024-01-15T00:00:00Z",
  },
  {
    id: "6",
    name: "Levi's 501 Jeans",
    sku: "LEVI-501-32-BLU",
    category: "Clothing",
    current_stock: 85,
    max_stock: 100,
    reorder_point: 20,
    price: 4999, // ₹4,999
    warehouse_id: "550e8400-e29b-41d4-a716-446655440002",
    warehouse_name: "West Coast Hub",
    demand_forecast_7_days: [6, 7, 5, 8, 6, 9, 7],
    avg_daily_sales: 6.9,
    lead_time_days: 4,
    created_at: "2024-01-10T00:00:00Z",
    updated_at: "2024-01-15T00:00:00Z",
  },
]

function calculateItemMetrics(item: any) {
  const stockLevel = Math.round((item.current_stock / item.max_stock) * 100)
  const totalForecastedDemand = item.demand_forecast_7_days.reduce((sum: number, demand: number) => sum + demand, 0)
  const daysRemaining = item.avg_daily_sales > 0 ? Math.floor(item.current_stock / item.avg_daily_sales) : 999

  let status = "healthy"
  if (item.current_stock === 0) {
    status = "critical"
  } else if (item.current_stock <= item.reorder_point) {
    status = "low"
  } else if (item.current_stock > item.max_stock * 0.9) {
    status = "overstock"
  }

  return {
    ...item,
    stock_level: stockLevel,
    total_forecasted_demand: totalForecastedDemand,
    days_remaining: daysRemaining,
    status,
  }
}

function getWarehouseName(warehouseId: string): string {
  const warehouses: { [key: string]: string } = {
    "550e8400-e29b-41d4-a716-446655440001": "Main Distribution Center",
    "550e8400-e29b-41d4-a716-446655440002": "West Coast Hub",
    "550e8400-e29b-41d4-a716-446655440003": "East Coast Facility",
    "550e8400-e29b-41d4-a716-446655440004": "Midwest Center",
    "550e8400-e29b-41d4-a716-446655440005": "North Hub",
  }
  return warehouses[warehouseId] || "Unknown Warehouse"
}

export async function GET() {
  try {
    const inventoryWithMetrics = mockInventory.map(calculateItemMetrics)
    return NextResponse.json(inventoryWithMetrics)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const newItem = {
      id: (mockInventory.length + 1).toString(),
      ...body,
      warehouse_name: getWarehouseName(body.warehouse_id),
      avg_daily_sales: 0,
      lead_time_days: 7,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    mockInventory.push(newItem)

    return NextResponse.json(calculateItemMetrics(newItem))
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
